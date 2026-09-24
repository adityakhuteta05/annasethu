# ANNASETU (अन्नसेतु)
### *Surplus Food · Shared With Purpose · Real Impact*

> **A verified, need-driven surplus-food rescue and delivery marketplace connecting legitimate food donors, verified NGOs/receivers, and verified delivery partners.**

---

## 🌟 Core Product Thesis

> *"Food should be rescued because there is a **verified need** for it, not simply because someone posted surplus food."*

Unlike a basic listing directory, **ANNASETU** treats **verified need + available surplus + logistics feasibility** as a single coordinated transaction.

---

## 🏛️ System Architecture

```
                       ANNASETU ECOSYSTEM
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
       🏢 DONOR           🍲 NGO RECEIVER     🚚 DRIVER PARTNER
   (Hotels, Caterers)    (Shelters, Kitchens)  (Bikes to Trucks)
            │                  │                  │
            └──────────────────┼──────────────────┘
                               ▼
                    NEXT.JS / REACT WEB APP
             (Tailwind CSS + Lucide + Confetti)
                               │
                               ▼
                       FastAPI REST API
           (Pure Python Deterministic Orchestration)
                               │
         ┌─────────────────────┼─────────────────────┐
         ▼                     ▼                     ▼
 DETERMINISTIC ENGINES     AI ADAPTER (Groq)     GOV VERIFICATION
 • Eligibility Engine     • Food Visual Analysis • GSTIN Lookup Guide
 • Priority Score (0-100) • Package Integrity    • FSSAI FoSCoS Link
 • Concurrency Lock       • Read-Only Copilot    • NGO DARPAN Link
 • Fare & 12% Fee Split   • Safe Fallbacks       • Parivahan RC/DL
         │
         ▼
 POSTGRESQL + POSTGIS / TRANSACTIONAL IN-MEMORY STORE
 (Row-level Locks, Append-Only Financial Ledger, Spatial Coordinates)
```

---

## ⚡ The 4 Architectural Guarantees

1. **Deterministic Matching & Rescue Priority Score (0-100)**
   - Score calculated from configured normalized factors:
     - **Expiry Urgency (30%)**: Prioritizes food closest to consumption deadline.
     - **ETA Efficiency (25%)**: Rewards rapid transit feasibility.
     - **Distance Efficiency (20%)**: Favors localized neighborhood rescues.
     - **Need Fulfillment (15%)**: Assesses batch quantity absorption.
     - **Route Efficiency (10%)**: Directness of transit.
   - *Fairness Rule:* Sponsored or partner status NEVER influences matching priority.
   - Every match includes an explainable *"Why this match?"* breakdown for full transparency.

2. **Concurrency-Safe Row Locking & Reservation**
   - Active holds and confirmed allocations are guarded by row-level locking.
   - *Critical Concurrency Test:* A 30 kg donation receiving simultaneous 15 kg and 20 kg claims will **never** over-allocate more than 30 kg.

3. **Physical Trust Chain & Hashed OTP Verification**
   - **Pickup Handoff:** Driver authenticated + GPS geofence (<300m) + Donor Pickup OTP (SHA-256 hashed, attempt-limited) + Tamper-evident Seal ID.
   - **Delivery Handoff:** GPS proximity check + NGO Delivery OTP + Groq AI visual package integrity check (`NO_VISIBLE_DISCREPANCY` / `POSSIBLE_PACKAGE_DISCREPANCY`).

4. **Transparent Append-Only Finance & Measurable Impact**
   - Food itself is 100% free.
   - Receiving NGO covers logistics fare + an explicit **12% platform coordination fee**.
   - On verified delivery OTP: reserve released, NGO charged, driver payout credited, and platform fee recorded transactionally in an append-only ledger.
   - Generates official **ANNASETU Verified Impact Reporting & Sustainability Documentation** (CSR/ESG documentation with food-waste lifecycle LCA factors).

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js v18+ (tested on v22.17.1)
- Python 3.10+ (tested on Python 3.12.7)

### 1. Launch FastAPI Backend
```bash
# From workspace root
python -m uvicorn apps.api.main:app --host 0.0.0.0 --port 8000 --reload
```
- API Docs & Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/api/health](http://localhost:8000/api/health)
- When the frontend is built, the complete application is also directly served at [http://localhost:8000/](http://localhost:8000/)!

### 2. Launch Next.js / Vite Web Frontend (Optional Dev Server)
```bash
# Navigate to web application
cd apps/web
npm run dev
```
- Open [http://localhost:5173/](http://localhost:5173/) (or port shown in terminal).

### 3. Run Automated Core Engine & Concurrency Tests
```bash
# Run all unit, concurrency, and full-lifecycle integration tests
python -m pytest apps/api/tests/ -v
```

### 4. Run Frontend Unit & Integration Tests (Zod, RLS Rules)
```bash
# From apps/web directory
cd apps/web
npm run test
```

---

## 🔐 Auth Setup

Follow these steps to configure role-based authentication and database security for AnnaSetu:

### 1. Create Supabase Project
1. Log in to [Supabase](https://supabase.com) and click **New project**.
2. Select your Organization, name your project (e.g. `annasetu-production`), set a strong database password, and choose a region close to your users (e.g. `ap-south-1` Mumbai).
3. Under **Authentication ➔ Providers ➔ Email**, ensure **Email provider** is **Enabled**. Confirm that **Enable Email Confirmations** is configured according to your environment (disabled for rapid local testing, enabled for production).

### 2. Run Database Migrations
In the Supabase Dashboard, navigate to the **SQL Editor** and run the migration scripts located in `supabase/migrations/`:
1. Execute [`supabase/migrations/0001_auth_profiles.sql`](file:///c:/Users/hp/Desktop/Amity%20hack/supabase/migrations/0001_auth_profiles.sql):
   - Creates `app_role` (`DONOR`, `NGO`, `DRIVER`, `ADMIN`) and `verification_status` enums.
   - Creates `profiles`, `donor_details`, `ngo_details`, `driver_details`, and `audit_logs` tables.
   - Sets CHECK constraints for phone (`^[6-9]\d{9}$`), GSTIN (`^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$`), and FSSAI (`^\d{14}$`).
   - Configures PostgreSQL Row Level Security (RLS) policies and immutability triggers protecting `role` and `verification_status`.
   - Binds the `handle_new_user_registration()` trigger to `auth.users` with strict ADMIN whitelist blocking.
2. Execute [`supabase/migrations/0002_fix_auth_registration_trigger.sql`](file:///c:/Users/hp/Desktop/Amity%20hack/supabase/migrations/0002_fix_auth_registration_trigger.sql):
   - Grants permissions on `public` schema to `supabase_auth_admin` and `service_role`.
   - Configures resilient trigger error-handling and explicit INSERT RLS policies.

### 3. Set Environment Variables
Copy the environment templates and insert your project credentials:
```bash
# Workspace Root (.env for FastAPI backend)
cp .env.example .env

# Web Frontend (apps/web/.env.local for Next.js)
cp apps/web/.env.example apps/web/.env.local
```

Populate the following variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL (`https://<project-ref>.supabase.co`) from **Project Settings ➔ API**.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anonymous Public Key from **Project Settings ➔ API**.
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Secret (backend only) from **Project Settings ➔ API**.
- `SUPABASE_JWT_SECRET`: Your JWT Secret from **Project Settings ➔ API ➔ JWT Settings**.

> [!WARNING]
> **Security Guardrail**: Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are public and exposed to the browser. Never commit or expose `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, or `GROQ_API_KEY` in frontend bundles.

---

## 🔑 ANNASETU — API Keys, External Services & Secret Management

AnnaSetu is built on a **resilient adapter architecture**: the platform functions seamlessly out of the box in **zero-dependency demo mode** without any external paid keys, while remaining fully decoupled and production-ready for real integrations.

### 1. Required API Keys
| Environment Variable | Category | Purpose | Scope |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public Client | Supabase Project REST & Auth API URL | Frontend & Backend |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Client | Supabase Anonymous Key (guarded by PostgreSQL RLS) | Frontend & Backend |
| `SUPABASE_JWT_SECRET` | Highly Sensitive Secret | Cryptographic offline decoding and role verification | Backend Only |

### 2. Where to Obtain Each Credential
- **Supabase Keys (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_JWT_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`)**:
  - Sign up at [supabase.com](https://supabase.com) and create a project in `ap-south-1` (Mumbai).
  - Copy keys from **Project Settings ➔ API** and **Project Settings ➔ API ➔ JWT Settings**.
- **Groq Cloud API Key (`GROQ_API_KEY`)**:
  - Sign up at [console.groq.com](https://console.groq.com/) and create a free API key under **API Keys**.
- **Map Provider Key (`MAPS_API_KEY`)**:
  - Obtain from [Google Cloud Console](https://console.cloud.google.com/) (Maps JavaScript & Directions API) or [Mapbox](https://account.mapbox.com/).
- **Razorpay Gateway Keys (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`)**:
  - Sign up at [dashboard.razorpay.com](https://dashboard.razorpay.com/) and generate Test API keys under **Settings ➔ API Keys**.
- **Transactional Notifications (`EMAIL_PROVIDER_API_KEY`, `SMS_API_KEY`)**:
  - Email: [resend.com](https://resend.com) or [sendgrid.com](https://sendgrid.com).
  - SMS: [msg91.com](https://msg91.com) (DLT approved) or [twilio.com](https://twilio.com).

### 3. Which Keys are Optional?
All third-party integrations outside of Supabase Auth are **100% OPTIONAL**:
- `GROQ_API_KEY` (AI Vision, Copilot, and Score Explanations) ➔ Optional
- `MAPS_API_KEY` (Turn-by-turn routing and Geocoding) ➔ Optional
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET` (Payment gateway) ➔ Optional
- `EMAIL_PROVIDER_API_KEY` & `SMS_API_KEY` (External notifications) ➔ Optional
- `GST_API_KEY`, `FSSAI_API_KEY`, `NGO_VERIFICATION_API_KEY` ➔ Optional

### 4. Where Each Key Must Be Stored
- **Public Client Variables (`NEXT_PUBLIC_*`)**:
  - Stored in `apps/web/.env.local` for Next.js development.
  - Set as build-time environment variables in Vercel.
- **Private Backend Secrets (`GROQ_API_KEY`, `MAPS_API_KEY`, `RAZORPAY_*`, `SUPABASE_SERVICE_ROLE_KEY`)**:
  - Stored in root `.env` for FastAPI development.
  - Stored in container secret vaults (Render / Fly.io / AWS Secrets Manager) in production.
  - **CRITICAL**: Never place private secrets in frontend bundles, browser `localStorage`, or git repositories.

### 5. How to Configure Local Development
```bash
# 1. Copy environment templates
cp .env.example .env
cp apps/web/.env.example apps/web/.env.local

# 2. Launch FastAPI Backend (reads root .env automatically)
python -m uvicorn apps.api.main:app --host 0.0.0.0 --port 8000 --reload

# 3. Launch Next.js Web Frontend (reads apps/web/.env.local)
cd apps/web && npm run dev
```

### 6. How to Configure Production
1. In Supabase Cloud, run database migrations [`supabase/migrations/0001_auth_profiles.sql`](file:///c:/Users/hp/Desktop/Amity%20hack/supabase/migrations/0001_auth_profiles.sql).
2. On your backend host (Render/Fly.io), configure the variables listed in [`.env.production`](file:///c:/Users/hp/Desktop/Amity%20hack/.env.production).
3. On Vercel (Next.js), configure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`, and `NEXT_PUBLIC_API_URL`.
4. Detailed step-by-step instructions available in [`DEPLOYMENT.md`](file:///c:/Users/hp/Desktop/Amity%20hack/DEPLOYMENT.md).

### 7. How Fallback Mode Works (Zero-Downtime Resilience)
If an optional external API is unconfigured, times out, or exceeds rate limits:
- **Groq AI Failure** ➔ Food listings seamlessly use donor-declared structured fields; package integrity falls back to tamper seal ID matching; copilot and score explanations provide deterministic rule-based guidance.
- **Maps API Failure** ➔ Routing engine switches immediately to stored coordinates + Haversine distance formula + 22 km/h urban speed ETA calculation (supporting up to 3 intermediate stops).
- **Payment Gateway Failure** ➔ System runs on seeded NGO demo wallets with append-only ledger entries and an explicit 12% platform fee split.
- **Notification Failure** ➔ In-app notification queue guarantees 100% delivery.
- **Government Registry Failure** ➔ Profiles transition to `MANUAL_LOOKUP_REQUIRED` with direct links to official FoSCoS/GST/DARPAN/Parivahan portals.

### 8. How to Test Without Optional APIs
You can run the entire platform, complete 13-step rescue lifecycle, and test suites with zero external keys:
```bash
# 1. Run all backend tests (Passes 100% on deterministic fallbacks)
python -m pytest apps/api/tests/ -v

# 2. Run frontend unit and integration tests
cd apps/web && npm run test

# 3. View live Service Health in the browser
# Visit http://localhost:3000/admin/service-health
```

---

## 📌 Architecture Assumptions

1. **Admin Account Provisioning**: System administrator accounts cannot be self-registered through the web interface or auth triggers. They are created exclusively via backend administrative operations or direct service-role seeding.
2. **Document Verification Phasing**: On initial registration, accounts receive `verification_status = 'REGISTERED'` and are routed to `/verification`. Full document upload and government registry verification (FSSAI FoSCoS, GSTIN, NGO-DARPAN, Parivahan) are executed in the next onboarding phase.
3. **Transaction Gating**: Unverified accounts are permitted to browse public marketplace data, but any rescue-transaction endpoint returns `HTTP 403 Forbidden` with error code `NOT_VERIFIED`.
4. **Password Reset Enumeration Defense**: The `/forgot-password` endpoint always returns a generic success message ("Recovery Instructions Sent") regardless of whether the email address is registered, preventing malicious account enumeration.


---

## 🧪 Definition of Done Scenario (PRD Part V)

You can trigger the entire 13-step scenario with **one click** inside the UI using the **"⚡ 1-Click Demo"** button:
1. Donor registers & Admin reviews against FoSCoS portal.
2. NGO registers & Admin verifies NGO-DARPAN documentation.
3. NGO creates a 20 kg Dinner Need.
4. Donor declares 20 kg Surplus with Tamper-evident Seal (>= 5 kg rule validated).
5. Deterministic Matching Engine evaluates compatibility and computes Rescue Priority Score (91/100).
6. NGO reserves food atomically under row lock.
7. Allocation confirmed; Delivery Job dispatched with 12% fee quote.
8. Driver Amit Singh accepts job atomically (First-Accept-Wins).
9. Driver arrives at pickup (<120m), verifies Donor Pickup OTP, and records photo.
10. Driver transports and arrives at NGO dock (<85m).
11. NGO verifies seal and enters Delivery OTP; Groq AI confirms package integrity.
12. Append-only ledger commits final charges, driver payout, and 12% service fee.
13. Measurable Impact Record and CSR Sustainability Certificate generated.

---

## 🇮🇳 Regulatory & Compliance References (Appendix A)

| Regulatory Body | Portal & Standard | AnnaSetu Integration |
|---|---|---|
| **FSSAI / FoSCoS** | [FSSAI License Verification](https://fssai.gov.in/citizen/about-license-verification) | Food Business Operator authenticity & hygiene certification |
| **GST Portal** | [Search Taxpayer Manual](https://tutorial.gst.gov.in/userguide/taxpayersdashboard/Search_Taxpayer_manual.htm) | Legal entity validation & GSTIN active status |
| **NITI Aayog** | [NGO-DARPAN Portal](https://ngodarpan.gov.in/) | NPO Unique ID & 80G/12A registration verification |
| **MoRTH Parivahan** | [Parivahan Sewa Portal](https://parivahan.gov.in/) | Driver commercial authorization & vehicle RC/PUC fitness |
