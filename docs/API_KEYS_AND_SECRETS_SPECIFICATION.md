# ANNASETU — API KEYS, EXTERNAL SERVICES, ENVIRONMENT VARIABLES & SECRET MANAGEMENT

> **Implementation Specification & PRD Reference Document**  
> *Production-ready API integration, secret classification, boundary segregation, and graceful fallback architecture for AnnaSetu.*

---

## 1. API / SERVICE INVENTORY

| Service Category | Service Name | Purpose | API Base URL / Endpoint | Auth Method | Credentials Required | Env Var Name | Scope | Sensitivity | MVP Req? | Prod Req? | Failure Fallback | Rate Limits | Secret Storage |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **A. Supabase** | Supabase Auth | User identity, cookie sessions, password reset | `https://<proj>.supabase.co/auth/v1` | Bearer JWT / Cookie | Anon key / JWT Secret | `NEXT_PUBLIC_SUPABASE_URL`<br>`NEXT_PUBLIC_SUPABASE_ANON_KEY`<br>`SUPABASE_JWT_SECRET` | Web & Backend | Public / Highly Sensitive | **YES** | **YES** | Local token decode fallback | 30 req/min | Client env & Server vault |
| **A. Supabase** | PostgreSQL + PostGIS | Transactional source of truth, RLS, spatial coordinates | Postgres connection / REST | Service role key / DB pooler | Service role key / DB Password | `SUPABASE_URL`<br>`SUPABASE_SERVICE_ROLE_KEY` | Backend Only | Highly Sensitive | **YES** | **YES** | In-memory safe state cache | Database pool limit | Backend Server Vault |
| **A. Supabase** | Supabase Storage | Tamper-evident seal photos, document evidence | `https://<proj>.supabase.co/storage/v1` | Signed URLs / Bearer | Anon key / Service key | `NEXT_PUBLIC_SUPABASE_URL`<br>`SUPABASE_SERVICE_ROLE_KEY` | Backend & Signed Client | Private | **YES** | **YES** | Local image uploads / placeholders | 100 req/min | Backend Server Vault |
| **B. Groq AI** | Groq Cloud AI | Assistive food vision, seal integrity check, read-only copilot | `https://api.groq.com/openai/v1/chat/completions` | Bearer API Key | API Key (`gsk_...`) | `GROQ_API_KEY` | Backend Only | Private | Optional | Optional | **Deterministic high-accuracy heuristics** | 30 RPM / 6000 TPM | Backend Server Vault |
| **C. Maps & Routing** | Map Provider (Google / Mapbox / OSRM) | Geocoding, reverse geocoding, turn-by-turn routing | `https://api.mapbox.com` / `https://maps.googleapis.com` | API Key / Token | Provider Key | `MAPS_API_KEY` | Backend Only | Private | Optional | Optional | **Stored coordinates + Haversine distance + 22 km/h urban ETA** | 60 req/min | Backend Server Vault |
| **D. Payment** | Razorpay Gateway | Logistics fare collection and 12% platform fee settlement | `https://api.razorpay.com/v1` | Basic Auth (Key ID + Secret) | Key ID & Key Secret | `RAZORPAY_KEY_ID`<br>`RAZORPAY_KEY_SECRET` | Backend Only | Private | Optional | **YES** | **Atomic seeded demo wallet & ledger simulation** | 100 req/min | Backend Server Vault |
| **E. Notifications** | In-App Realtime | Live status alerts, urgent rescue offers | Supabase Realtime WebSocket | WebSocket token | Anon Key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Web & Backend | Public | **YES** | **YES** | In-app pollable notification ledger | Realtime socket limits | Client & Backend |
| **E. Notifications** | Email (Resend / SendGrid) | Transactional emails (CSR certificates, receipts) | Provider REST API | Bearer Token | API Key | `EMAIL_PROVIDER_API_KEY` | Backend Only | Private | Optional | Optional | Simulated local log dispatch | 100/sec | Backend Server Vault |
| **E. Notifications** | SMS / WhatsApp (MSG91 / Twilio) | Driver dispatch alerts & OTP reminders | Provider REST API | API Key / Auth Token | Provider Key | `SMS_API_KEY` | Backend Only | Private | Optional | Optional | In-app notification center | DLT rate rules | Backend Server Vault |
| **F. Gov Verification** | FSSAI FoSCoS | Food hygiene license validation | Official Portal / Authorized GSP | Portal Verification / GSP API | Optional GSP Key | `FSSAI_API_KEY` | Backend Only | Private | Optional | Optional | **MANUAL_LOOKUP_REQUIRED + official FoSCoS link + admin review** | Portal captcha | Backend Server Vault |
| **F. Gov Verification** | GST Portal | Taxpayer entity verification | Official Portal / Authorized GSP | Portal Verification / GSP API | Optional GSP Key | `GST_API_KEY` | Backend Only | Private | Optional | Optional | **MANUAL_LOOKUP_REQUIRED + official GST portal link + admin review** | Portal captcha | Backend Server Vault |
| **F. Gov Verification** | NITI Aayog DARPAN | NGO registration & 80G validation | Official Portal Verification | Portal Verification | Optional API Key | `NGO_VERIFICATION_API_KEY` | Backend Only | Private | Optional | Optional | **MANUAL_LOOKUP_REQUIRED + official DARPAN link + admin review** | Portal captcha | Backend Server Vault |
| **F. Gov Verification** | Parivahan Sewa | Commercial Driving Licence & RC verification | Official Portal Verification | Portal Verification | Optional API Key | `VEHICLE_VERIFICATION_API_KEY` | Backend Only | Private | Optional | Optional | **MANUAL_LOOKUP_REQUIRED + official Parivahan link + admin review** | Portal captcha | Backend Server Vault |

---

## 2. SUPABASE CREDENTIALS & SECURITY RULES

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_JWT_SECRET=super-secret-jwt-token-with-at-least-32-bytes-long
```

### Critical Security Invariants:
1. `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are safe for the browser client. They are governed by PostgreSQL **Row Level Security (RLS)**.
2. `SUPABASE_SERVICE_ROLE_KEY` is a **backend-only secret**. It must **NEVER** appear in:
   - Client JavaScript bundles or `.env.local` exposed to `NEXT_PUBLIC_*`
   - Browser `localStorage` or `sessionStorage`
   - Public API responses or error traces
   - Git commits, pull requests, or public screenshots
   - Unredacted application log files
3. Supabase Auth cookie-based sessions (`@supabase/ssr`) are refreshed via server middleware.
4. Supabase PostgreSQL functions as the authoritative transactional source of truth.
5. All user-facing tables enforce strict RLS policies (`auth.uid() = id`).
6. PostGIS manages spatial queries for proximity matching.

---

## 3. GROQ AI ADAPTER ARCHITECTURE

Located at: `/apps/api/ai/`

```
apps/api/ai/
├── groq_client.py          # Hardened HTTP client (4s timeout, 2 retries, structured JSON mode)
├── food_vision.py          # Food photo category & storage suggestion (Assistive only)
├── document_extraction.py  # OCR / field extraction suggestions for administrative review
├── integrity.py            # Pickup vs delivery seal comparison (NO_VISIBLE_DISCREPANCY)
├── copilot.py              # Read-only operational copilot (Cannot mutate database records)
└── explanations.py         # Human-readable explanations of 0-100 Rescue Priority Scores
```

### Strict Architectural Boundaries:
Groq is **ASSISTIVE ONLY**. Groq **NEVER** acts as the source of truth for:
- Food matching & eligibility
- Allocation quantities or concurrency locking
- Fare calculation or settlement splits
- OTP verification or delivery confirmation
- Government verification approval
- Driver assignment or dispatch state transitions

### Resilience Fallback:
If `GROQ_API_KEY` is missing or the external API times out:
- Food listings use donor-provided structured fields.
- Document review defaults to manual administrative inspection.
- Package integrity verification cross-checks tamper seal IDs with photo evidence.
- The rescue transaction continues smoothly without delay.

---

## 4. MAP, GEOLOCATION & ROUTING ADAPTER

Located at: `/apps/api/adapters/map_adapter.py`

```
MapService
    ├── GeocodingAdapter     # Landmark & address geocoding
    ├── DistanceAdapter      # Haversine distance calculator
    ├── RoutingAdapter       # Multi-stop waypoint sequencing (up to 3 receiver stops)
    └── ETAAdapter           # 22 km/h urban speed transit estimation + stop buffers
```

- **Primary Provider**: External routing API (`MAPS_API_KEY`).
- **Deterministic Fallback**: Stored latitude/longitude coordinates + Haversine distance calculation + 22 km/h urban speed estimation with 10-minute loading buffers per stop.
- **Resilience Guarantee**: Core rescue matching and dispatch never block if external map APIs fail.

---

## 5. PAYMENT & FINANCIAL SETTLEMENT ADAPTER

Located at: `/apps/api/adapters/payment_adapter.py`

```
PaymentService
    └── PaymentAdapter
            └── RazorpayAdapter (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)
```

### Financial Rules:
1. **Food Value is Free**: Rescued surplus food is explicitly priced at **Rs 0.0**.
2. **Logistics Cost**: The receiving NGO covers vehicle logistics fare.
3. **Platform Coordination Fee**: Transparent, explicit **12% platform fee** applied to the logistics charge.
4. **Backend Authority**: Frontend never calculates final payment amounts. Backend verifies HMAC-SHA256 signatures before committing wallet transactions.
5. **Hackathon / Demo Fallback**: Seeded NGO demo wallets with append-only ledger entries.

---

## 6. NOTIFICATION ADAPTER

Located at: `/apps/api/adapters/notification_adapter.py`

```
NotificationService
    ├── InAppRealtimeAdapter   # Primary in-app notification center (100% delivered)
    ├── EmailAdapter           # Transactional emails via EMAIL_PROVIDER_API_KEY
    ├── SMSAdapter             # Transactional SMS via SMS_API_KEY
    └── PushAdapter            # Web/Mobile push via PUSH_PROVIDER_KEY
```

- **Supported Categories**: `NEW_MATCH`, `RESERVATION_CONFIRMED`, `RESERVATION_EXPIRING`, `DRIVER_JOB_OFFER`, `DRIVER_ACCEPTED`, `PICKUP_REMINDER`, `DELIVERY_REMINDER`, `VERIFICATION_STATUS`, `PAYMENT_EVENT`, `INTEGRITY_REVIEW`, `ACHIEVEMENT`, `REASSIGNMENT`, `URGENT_RESCUE_ALERT`.
- **Fallback**: In-app notifications are stored persistently and delivered immediately. External email/SMS channels are non-blocking.

---

## 7. GOVERNMENT & ORGANIZATION VERIFICATION ADAPTER

Located at: `/apps/api/adapters/gov_verification_adapter.py`

```
GovVerificationService
    ├── GSTAdapter              # 15-character GSTIN regex & GSP verification
    ├── FSSAIAdapter            # 14-digit FoSCoS licence validation
    ├── NGODarpanAdapter        # NITI Aayog Unique ID validation
    └── VehicleAdapter          # Commercial DL & Parivahan RC verification
```

### Compliance Standards:
1. No unauthorized scraping of government portals.
2. No CAPTCHA bypassing.
3. Verification fallback: `MANUAL_LOOKUP_REQUIRED` with direct links to official search portals + admin review audit trail.
4. Admin review remains the sole authoritative verification gate.

---

## 8. APPLICATION INTERNAL API CATALOG (/api/v1)

FastAPI automatically generates interactive OpenAPI documentation at `/docs` and schema at `/openapi.json`.

| Endpoint | Method | Role Guard | Verification Guard | Description |
|---|---|---|---|---|
| `/api/v1/auth/me` | `GET` | Authenticated | None | Returns verified caller profile and active status |
| `/api/v1/auth/status` | `GET` | Public | None | Health check for auth subsystem |
| `/api/v1/users` | `GET` | Authenticated | None | List participants filtered by role |
| `/api/v1/donations` | `GET` | Authenticated | None | List active surplus food declarations |
| `/api/v1/donations/{id}` | `GET` | Authenticated | None | Retrieve specific surplus food details |
| `/api/v1/needs` | `GET` | Authenticated | None | List structured NGO meal requirements |
| `/api/v1/needs/{id}` | `GET` | Authenticated | None | Retrieve specific NGO need details |
| `/api/v1/matches/{id}` | `GET` | Authenticated | None | Ranked compatible needs for donation |
| `/api/v1/reservations` | `POST` | `NGO` | `require_verified` | Atomic reservation hold under row lock |
| `/api/v1/allocations` | `POST` | `NGO` | `require_verified` | Confirm allocation and dispatch job |
| `/api/v1/delivery/jobs` | `GET` | `DRIVER`, `ADMIN` | None | List available delivery jobs |
| `/api/v1/delivery/jobs/{id}/accept` | `POST` | `DRIVER` | `require_verified` | First-Accept-Wins atomic job claim |
| `/api/v1/handoffs/pickup/verify` | `POST` | `DRIVER` | None | Verify Donor Pickup OTP & seal |
| `/api/v1/handoffs/delivery/verify` | `POST` | `DRIVER` | None | Verify NGO Delivery OTP & seal integrity |
| `/api/v1/drivers/nearby` | `GET` | Authenticated | None | Query available drivers by GPS radius |
| `/api/v1/ai/food-analysis` | `POST` | `DONOR`, `ADMIN` | None | AI image analysis and category suggestions |
| `/api/v1/ai/document-extraction` | `POST` | `ADMIN` | None | Extract fields from uploaded certificates |
| `/api/v1/ai/integrity-check` | `POST` | `DRIVER`, `ADMIN` | None | Cross-check pickup vs delivery seal photos |
| `/api/v1/ai/copilot` | `POST` | Authenticated | None | Read-only operational copilot Q&A |
| `/api/v1/ai/explain-score` | `POST` | Authenticated | None | Explain 0-100 Rescue Priority Score |
| `/api/v1/impact` | `GET` | Public | None | Meals rescued, CO2e prevented, water saved |
| `/api/v1/reports` | `GET` | `DONOR`, `ADMIN` | None | Official CSR & ESG sustainability report |
| `/api/v1/payments/initiate` | `POST` | `NGO`, `ADMIN` | None | Create fare escrow order |
| `/api/v1/payments/verify` | `POST` | `NGO`, `ADMIN` | None | Verify HMAC-SHA256 signature |
| `/api/v1/notifications` | `GET` | Authenticated | None | Fetch user notification queue |
| `/api/v1/admin/service-health` | `GET` | `ADMIN` | None | Real-time health status for all 6 pillars |
| `/api/v1/admin/verifications` | `GET` | `ADMIN` | None | Pending compliance verification queue |

---

## 9. SECRET CLASSIFICATION & DATA BOUNDARIES

| Classification | Visibility | Permitted Storage | Examples |
|---|---|---|---|
| **PUBLIC** | Client Browser, Bundles, SSR | `.env`, `.env.local`, Next.js bundles | `NEXT_PUBLIC_SUPABASE_URL`<br>`NEXT_PUBLIC_SUPABASE_ANON_KEY`<br>`NEXT_PUBLIC_APP_URL`<br>`NEXT_PUBLIC_API_URL` |
| **PRIVATE** | Server-Only (FastAPI Backend) | Server `.env`, Vault, Container Secrets | `GROQ_API_KEY`<br>`MAPS_API_KEY`<br>`RAZORPAY_KEY_ID`<br>`RAZORPAY_KEY_SECRET`<br>`EMAIL_PROVIDER_API_KEY`<br>`SMS_API_KEY` |
| **HIGHLY SENSITIVE** | Backend Superuser Only | Encrypted Secret Vault (Never in git) | `SUPABASE_SERVICE_ROLE_KEY`<br>`SUPABASE_JWT_SECRET` |

---

## 10. SYSTEM ARCHITECTURE & DATA FLOW

```
                    ┌─────────────────────────┐
                    │     NEXT.JS WEB APP     │
                    │   (Client UI & SSR)     │
                    └────────────┬────────────┘
                                 │
                 Calls /api/v1   │ (Bearer JWT / Cookie)
                                 ▼
                    ┌─────────────────────────┐
                    │    FASTAPI BACKEND      │
                    │  (Business Authority)   │
                    └────────────┬────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ DOMAIN SERVICES  │    │    AI ADAPTER    │    │EXTERNAL ADAPTERS │
│ • Matching       │    │ • Food Vision    │    │ • Maps (Routing) │
│ • Allocation     │    │ • Integrity      │    │ • Razorpay       │
│ • Trust OTP      │    │ • Copilot        │    │ • Notifications  │
│ • Finance Ledger │    │ (Assistive only) │    │ • Gov Compliance │
└────────┬─────────┘    └──────────────────┘    └──────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│            SUPABASE POSTGRESQL               │
│ • Transactional Tables (Row-level locking)   │
│ • Row Level Security (RLS)                   │
│ • PostGIS Spatial Coordinates                │
│ • Storage (Evidence photos) & Realtime       │
└──────────────────────────────────────────────┘
```
