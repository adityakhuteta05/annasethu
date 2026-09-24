# ANNASETU System Architecture & Authority Matrix

> **Verified, Need-Driven Surplus Food Rescue Marketplace Architecture**

---

## 1. System Architecture Diagram

```
                    ┌─────────────────────────┐
                    │     NEXT.JS WEB APP     │
                    │   (Presentation Only)   │
                    └────────────┬────────────┘
                                 │
                 Calls /api/v1   │ (Bearer JWT / Cookie Sessions)
                                 ▼
                    ┌─────────────────────────┐
                    │     FASTAPI BACKEND     │
                    │  (Business Authority)   │
                    └────────────┬────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ DOMAIN ENGINES   │    │    AI ADAPTER    │    │EXTERNAL ADAPTERS │
│ • Scoring        │    │ • Food Vision    │    │ • Maps (Routing) │
│ • Allocation     │    │ • Integrity      │    │ • Razorpay       │
│ • Trust OTP      │    │ • Copilot        │    │ • Notifications  │
│ • Finance Ledger │    │ (Assistive only) │    │ • Gov Compliance │
└────────┬─────────┘    └──────────────────┘    └──────────────────┘
         │
         ▼
┌──────────────────────────────────────────────┐
│            SUPABASE POSTGRESQL               │
│ • Transactional Source of Truth              │
│ • Row-level Locks (FOR UPDATE)               │
│ • Row Level Security (RLS)                   │
│ • PostGIS Spatial Coordinates                │
│ • Private Storage (Evidence Photos)          │
│ • Realtime WebSocket Engine                  │
└──────────────────────────────────────────────┘
```

---

## 2. Authority Hierarchy

AnnaSetu enforces strict role segregation across architectural tiers:

| System Layer | Primary Authority | What It Owns | What It CANNOT Do |
|---|---|---|---|
| **Database (Supabase PostgreSQL)** | **Source of Truth** | Data persistence, ACID transactions, row-level locking, RLS boundaries, audit logs. | Execute external API calls or business logic. |
| **FastAPI Backend** | **Business Authority** | Matching rules, priority scoring, pricing, OTP validation, verification gates, driver assignment. | Cannot trust unverified client assertions. |
| **Supabase Services** | **Platform Infrastructure** | User identity, cookie sessions, image storage, realtime notification events. | Replace custom business logic. |
| **Assistive AI (Groq)** | **Assistive Only** | Image descriptions, seal comparison suggestions, read-only copilot answers, score explanations. | **NEVER** decides matching, pricing, OTP validity, or transaction execution. |
| **External Adapters** | **Decoupled Providers** | Turn-by-turn routing, payment gateways, SMS/email delivery, GSP compliance queries. | Never block core rescue operations on failure. |
| **Frontend (Next.js)** | **Presentation Only** | Responsive rendering, keyboard accessibility, inline validation, user interaction. | Never calculates fares or decides permissions. |

---

## 3. The 4 Deterministic Core Guarantees

1. **Deterministic Matching & Priority Scoring (0–100)**: Computed using configured weights: Expiry Urgency (30%), ETA (25%), Distance (20%), Need Fulfillment (15%), Route (10%). Sponsored status never influences rankings.
2. **Concurrency-Safe Atomic Holds**: Guarded by PostgreSQL row-level locks. Simultaneous claims cannot over-allocate a food donation batch.
3. **Physical Trust Chain**: Dual OTP handshakes (Donor Pickup OTP + NGO Delivery OTP) with SHA-256 hashing, 3-attempt lockouts, 15-minute TTL, and GPS geofence checks (<300m).
4. **Append-Only Financial Ledger**: Rescued food is 100% free. The receiving NGO covers vehicle logistics fare + an explicit 12% platform fee, recorded immutably in an append-only ledger upon verified delivery OTP completion.
