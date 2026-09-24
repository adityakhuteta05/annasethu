# ANNASETU External Integrations & Adapters Guide

> **Provider Setup, Decoupling Adapters & Graceful Fallback Strategies**

---

## 1. Supabase Integration (Primary Infrastructure)

- **Role**: PostgreSQL database, PostGIS spatial queries, Supabase Auth, Storage for photos, Realtime updates.
- **Client Configuration**: Uses `@supabase/ssr` with cookie sessions.
- **Server Configuration**: FastAPI verifies Supabase Bearer JWTs using `SUPABASE_JWT_SECRET`.
- **Row Level Security**: Enforced across all tables.

---

## 2. Groq AI Integration (`/apps/api/ai/`)

- **Model**: `llama-3.3-70b-versatile` via Groq Cloud API.
- **Modules**:
  - `groq_client.py`: Base HTTP client with 4-second timeout, 2 retries, and structured JSON parsing.
  - `food_vision.py`: Image analysis for food descriptions and storage guidelines.
  - `document_extraction.py`: OCR assistance for certificate numbers (non-authoritative).
  - `integrity.py`: Visual package comparison (`NO_VISIBLE_DISCREPANCY` vs `POSSIBLE_PACKAGE_DISCREPANCY`).
  - `copilot.py`: Read-only platform assistance.
  - `explanations.py`: Natural language explanations of Rescue Priority Scores.
- **Fallback Strategy**: If `GROQ_API_KEY` is not provided or times out, the system automatically falls back to deterministic food descriptions, tamper-seal ID matching, and rule-based explanations. **Core rescues never fail due to AI outages.**

---

## 3. Maps & Routing Integration (`/apps/api/adapters/map_adapter.py`)

- **Providers**: Google Maps Distance Matrix, Mapbox Directions, or OpenStreetMap OSRM.
- **Capabilities**: Geocoding, reverse geocoding, multi-stop routing (up to 3 receiver stops for MVP).
- **Fallback Strategy**: Stored latitude/longitude coordinates + Haversine distance formula + 22 km/h average urban speed estimation with 10-minute buffer per stop.

---

## 4. Payment Gateway Integration (`/apps/api/adapters/payment_adapter.py`)

- **Provider**: Razorpay API.
- **Split Breakdown**:
  - Rescued food: **Rs 0.0 (100% Free)**
  - Logistics charge: Vehicle fare + distance + duration
  - Platform fee: **12% of logistics charge**
- **Security Rule**: `RAZORPAY_KEY_SECRET` is strictly backend-only. Client claims of payment are never trusted without cryptographic HMAC-SHA256 signature verification.
- **Fallback Strategy**: Seeded NGO demo wallets with append-only ledger entries for zero-dependency hackathons and demonstrations.

---

## 5. Multi-Channel Notifications (`/apps/api/adapters/notification_adapter.py`)

- **Channels**:
  - **In-App Realtime**: Stored persistently in PostgreSQL, delivered via Supabase Realtime or polling.
  - **Email**: Transactional emails via Resend or SendGrid (`EMAIL_PROVIDER_API_KEY`).
  - **SMS**: Critical dispatch SMS via MSG91 DLT or Twilio (`SMS_API_KEY`).
  - **Push**: Web push via FCM / WebPush (`PUSH_PROVIDER_KEY`).
- **Fallback Strategy**: In-app notifications are guaranteed 100% delivery. External channels dispatch asynchronously and fail silently without blocking core workflow.

---

## 6. Government Verification (`/apps/api/adapters/gov_verification_adapter.py`)

- **Domains**:
  - **FSSAI FoSCoS**: Food hygiene license checks.
  - **GST Portal**: Taxpayer active status and legal entity checks.
  - **NITI Aayog NGO-DARPAN**: NPO 80G/12A and registration verification.
  - **MoRTH Parivahan**: Driving Licence and vehicle RC/PUC fitness.
- **Fallback Strategy**: `MANUAL_LOOKUP_REQUIRED` with direct links to official search portals, queued for administrative review. No unauthorized scraping or CAPTCHA bypass.

---

## 7. Complete Failure & Fallback Matrix

| External Service | Failure Trigger | Fallback Behavior | Impact on Rescue Loop |
|---|---|---|---|
| **Groq AI** | Missing key / timeout / rate limit | High-accuracy deterministic heuristics | None (Operations proceed normally) |
| **Map Provider** | Missing key / quota exceeded | Haversine distance + 22 km/h urban ETA | None (Distance and ETA calculated locally) |
| **Payment Gateway** | Missing key / network error | Seeded demo wallet with atomic ledger | None (Handoff proceeds in demo mode) |
| **Government API** | Unconfigured / restricted access | Manual admin review with official portal link | Profile queued for manual review |
| **Email / SMS** | Provider downtime | In-app notification center | None (Delivered in-app) |
| **Supabase Realtime** | WebSocket disconnect | Fallback to HTTP polling | Updates refresh on regular intervals |
