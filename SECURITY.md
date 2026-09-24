# ANNASETU Security Policy & Secret Management Architecture

> **Security Guarantees, Threat Model & Defensive Implementation**

---

## 1. Secret Classification & Boundary Rules

| Level | Variables | Boundary Rules | Permitted Storage |
|---|---|---|---|
| **PUBLIC** | `NEXT_PUBLIC_SUPABASE_URL`<br>`NEXT_PUBLIC_SUPABASE_ANON_KEY`<br>`NEXT_PUBLIC_APP_URL`<br>`NEXT_PUBLIC_API_URL` | Safe for client browsers and Next.js public bundles. Governed by database RLS. | `.env`, `.env.local`, client bundles |
| **PRIVATE** | `GROQ_API_KEY`<br>`MAPS_API_KEY`<br>`RAZORPAY_KEY_ID`<br>`RAZORPAY_KEY_SECRET`<br>`EMAIL_PROVIDER_API_KEY`<br>`SMS_API_KEY` | Backend server only. Must NEVER be bundled into client JavaScript. | Server `.env`, Docker secrets, cloud vaults |
| **HIGHLY SENSITIVE** | `SUPABASE_SERVICE_ROLE_KEY`<br>`SUPABASE_JWT_SECRET` | Backend superuser execution only. Never exposed in API responses or logs. | Cloud Secret Manager / Server container env |

---

## 2. Frontend / Backend Architectural Key Boundary

AnnaSetu enforces strict architectural segregation:
```
Next.js Client UI ──▶ FastAPI (/api/v1) ──▶ Domain Service ──▶ Adapter ──▶ External API
```

### Absolute Invariants:
1. **Never Call External AI Directly from Client**: The browser client never calls `api.groq.com`. All AI interactions pass through the backend `GroqAIAdapter`.
2. **Never Call Payment Gateways Directly**: Frontend never communicates with Razorpay secret APIs. Order creation and signature validation are performed exclusively server-side.
3. **Never Expose the Service Role Key**: Administrative database privileges are restricted to internal server-side functions.
4. **Never Log Sensitive Credentials**: All loggers automatically redact API keys, tokens, passwords, and OTP plaintexts.

---

## 3. Row Level Security (RLS) & Profile Immutability

Row Level Security is enabled across all Supabase PostgreSQL tables:
- `profiles`: Users can select and update only their own profile (`id = auth.uid()`).
- `donor_details`, `ngo_details`, `driver_details`: Restricted to the owning `profile_id`.
- `audit_logs`: Authenticated users can view only their own actor entries.

### Immutability Trigger (`protect_profile_immutable_fields`):
A PostgreSQL trigger intercepts `UPDATE` queries on `public.profiles`:
- Rejects any attempt to modify `role` (e.g., elevating from `DONOR` to `ADMIN`).
- Rejects client-side attempts to modify `verification_status`. Status changes require backend `service_role` authorization following verified document review.

---

## 4. Hashed OTP Security & Geofence Verification

Physical trust during food handoffs is cryptographically guarded:
1. **SHA-256 Hashing**: One-Time Passwords are never stored as plaintext in the database; only their cryptographic `SHA-256` hash is stored.
2. **Brute-Force Lockout**: Verification attempts are capped at **3 failures**. If exceeded, the OTP is invalidated and requires administrative reassignment.
3. **Time-To-Live (TTL)**: OTPs expire after **15 minutes**.
4. **GPS Geofence Validation**: Delivery drivers must be within **300 meters** of the pickup or delivery coordinates before the system permits OTP verification.

---

## 5. Account Enumeration Defense

The `/forgot-password` endpoint always outputs a generic success notification (*"If an account exists, a recovery link has been dispatched"*). It never confirms or denies whether an email address is registered on the platform, preventing user enumeration attacks.

---

## 6. Rate Limiting & Input Validation

1. **Sliding-Window Rate Limiting**: Auth routes enforce a strict limit of **10 requests per minute** per IP address.
2. **Pydantic Validation**: All FastAPI inputs are strictly typed and sanitized using Pydantic models.
3. **Database CHECK Constraints**: Regex constraints on `phone` (`^[6-9]\d{9}$`), `gstin` (`^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$`), and `fssai_no` (`^\d{14}$`) guard the schema at the PostgreSQL layer.
