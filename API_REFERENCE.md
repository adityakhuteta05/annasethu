# ANNASETU API Reference Manual (v1)

> **FastAPI REST API Specification**  
> Base URL: `http://localhost:8000/api/v1` (Production: `https://api.annasetu.org/api/v1`)  
> Interactive Documentation: [Swagger UI](http://localhost:8000/docs) · [ReDoc](http://localhost:8000/redoc) · [OpenAPI JSON](http://localhost:8000/openapi.json)

---

## Authentication & Authorization

All requests to protected endpoints must include a Supabase Bearer token:
```http
Authorization: Bearer <supabase_jwt_token>
```
Tokens are validated server-side against `SUPABASE_JWT_SECRET`. Roles are enforced via the `require_role(*roles)` dependency, and transaction permissions via `require_verified()`.

---

## 1. Authentication & Profiles (`/auth`, `/users`)

### `GET /api/v1/auth/me`
- **Description**: Returns the current authenticated user's profile and active verification status.
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**:
```json
{
  "id": "usr-oberoi-01",
  "email": "chef@oberoi.com",
  "role": "DONOR",
  "name": "Chef Vikram Singhania",
  "phone": "9810011223",
  "verification_status": "VERIFIED",
  "is_active": true
}
```

### `GET /api/v1/users`
- **Query Params**: `role` (optional: `DONOR`, `NGO`, `DRIVER`, `ADMIN`)
- **Response `200 OK`**: Array of user profiles matching the role filter.

---

## 2. Surplus Food Donations (`/donations`)

### `GET /api/v1/donations`
- **Description**: Lists all active surplus food declarations.
- **Response `200 OK`**: Array of `FoodDonation` objects.

### `GET /api/v1/donations/{id}`
- **Description**: Retrieves detailed information for a specific food declaration.

---

## 3. NGO Meal Requirements (`/needs`)

### `GET /api/v1/needs`
- **Description**: Lists all active NGO meal requests with delivery time windows.
- **Response `200 OK`**: Array of `NGONeed` objects.

### `GET /api/v1/needs/{id}`
- **Description**: Retrieves detailed requirements for a specific meal need.

---

## 4. Matching & Allocation (`/matches`, `/reservations`, `/allocations`)

### `GET /api/v1/matches/{donation_id}`
- **Description**: Returns ranked compatible NGO needs for a donation, complete with 0-100 Rescue Priority Score breakdowns.

### `POST /api/v1/reservations`
- **Guard**: `require_verified` (unverified participants receive `403 NOT_VERIFIED`)
- **Request Body**:
```json
{
  "donation_id": "don-01",
  "need_id": "need-01",
  "reserved_quantity_kg": 20.0
}
```
- **Response `200 OK`**: Atomic reservation hold confirmed with expiry timer.

---

## 5. Delivery Logistics & Physical Trust Chain (`/delivery/jobs`, `/handoffs`)

### `GET /api/v1/delivery/jobs`
- **Query Params**: `status` (optional: `AVAILABLE`, `ACCEPTED`, `IN_TRANSIT`, `DELIVERED`)
- **Response `200 OK`**: Array of dispatch jobs.

### `POST /api/v1/delivery/jobs/{id}/accept`
- **Guard**: `require_verified` (First-Accept-Wins atomic lock)
- **Request Body**: `{"driver_id": "driver-amit"}`

### `POST /api/v1/handoffs/pickup/verify`
- **Description**: Verifies the Donor Pickup OTP (SHA-256 hashed) and geofence (<300m).
- **Request Body**:
```json
{
  "job_id": "job-01",
  "otp": "492811",
  "current_latitude": 28.6304,
  "current_longitude": 77.2177,
  "pickup_photo_url": "https://annasetu.org/evidence/pickup.jpg"
}
```

### `POST /api/v1/handoffs/delivery/verify`
- **Description**: Verifies the NGO Delivery OTP, seal integrity, and AI package check.
- **Request Body**:
```json
{
  "job_id": "job-01",
  "otp": "837192",
  "current_latitude": 28.5684,
  "current_longitude": 77.2201,
  "delivery_photo_url": "https://annasetu.org/evidence/delivery.jpg"
}
```

---

## 6. Assistive AI Endpoints (`/ai`)

### `POST /api/v1/ai/food-analysis`
- **Description**: Proposes description and hygiene storage guidance from a food photo.
- **Request Body**: `{"image_url": "https://...", "declared_category": "CURRIES_GRAVIES"}`

### `POST /api/v1/ai/integrity-check`
- **Description**: Compares pickup and delivery photos to confirm tamper-evident seal is intact.
- **Response**: `{"verdict": "NO_VISIBLE_DISCREPANCY", "reason": "...", "confidence": 0.94}`

### `POST /api/v1/ai/copilot`
- **Description**: Read-only platform copilot answering questions using context data.
- **Request Body**: `{"query": "What is our total food rescued?", "user_role": "DONOR"}`

---

## 7. Payments & Financial Ledger (`/payments`)

### `POST /api/v1/payments/initiate`
- **Description**: Prepares logistics fare payment with explicit 12% platform fee split.
- **Response**:
```json
{
  "order": {"order_id": "order_demo_...", "amount_inr": 280.0},
  "breakdown": {
    "food_cost": 0.0,
    "driver_payout": 250.0,
    "platform_fee_amount": 30.0,
    "total_charged_to_ngo": 280.0
  }
}
```

---

## 8. System Administration & Service Health (`/admin`)

### `GET /api/v1/admin/service-health`
- **Description**: Returns live operational statuses, latencies, failure counters, and fallback modes for all 6 service pillars.
- **Response `200 OK`**:
```json
{
  "timestamp": "2026-09-24T21:40:00Z",
  "overall_status": "HEALTHY",
  "services": [
    {
      "name": "Supabase PostgreSQL & Auth",
      "status": "AVAILABLE",
      "latency_ms": 14,
      "failure_count": 0,
      "fallback_mode": "In-memory safe cache / local replication"
    },
    {
      "name": "Groq AI Assistive Engine",
      "status": "DEGRADED",
      "latency_ms": 0,
      "failure_count": 0,
      "fallback_mode": "Deterministic food description & manual integrity review"
    }
  ]
}
```
