# ANNASETU Production Deployment Guide

> **Cloud Deployment Architecture, Environment Provisioning & Zero-Downtime Operations**

---

## 1. Architecture Overview

```
                      INTERNET
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
┌──────────────┐                  ┌──────────────┐
│    VERCEL    │                  │ RENDER / FLY │
│ Next.js Web  │                  │ FastAPI API  │
│  (Port 3000) │                  │  (Port 8000) │
└───────┬──────┘                  └───────┬──────┘
        │                                 │
        │ Bearer JWT / Cookie             │ Database Pooler
        └────────────────┬────────────────┘
                         ▼
             ┌────────────────────────┐
             │     SUPABASE CLOUD     │
             │ PostgreSQL 15+         │
             │ Supabase Auth          │
             │ Storage Buckets        │
             │ Realtime Engine        │
             └────────────────────────┘
```

---

## 2. Step 1: Provision Supabase Cloud

1. Create a new project in [Supabase Cloud](https://app.supabase.com/) in the **ap-south-1 (Mumbai)** region for lowest latency across India.
2. In the **SQL Editor**, execute:
   - [`supabase/migrations/0001_auth_profiles.sql`](file:///c:/Users/hp/Desktop/Amity%20hack/supabase/migrations/0001_auth_profiles.sql)
   - [`supabase/migrations/20260924_annasetu_schema.sql`](file:///c:/Users/hp/Desktop/Amity%20hack/supabase/migrations/20260924_annasetu_schema.sql)
3. In **Storage**, create a private bucket named `evidence-photos` with RLS restricting uploads to authenticated users.
4. In **Project Settings -> API**, copy:
   - Project URL
   - `anon` / public key
   - `service_role` secret key
   - JWT Secret (under JWT Settings)

---

## 3. Step 2: Deploy FastAPI Backend (Render / Fly.io)

### Docker / Command:
```bash
python -m uvicorn apps.api.main:app --host 0.0.0.0 --port 8000
```

### Environment Variables to Configure:
```ini
APP_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_URL=https://<your-project-id>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
SUPABASE_JWT_SECRET=<your-supabase-jwt-secret>

# Optional Production Integrations (Fallback is active if left empty)
GROQ_API_KEY=gsk_...
MAPS_API_KEY=...
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
```

### Health Check Endpoint:
Configure health monitoring to ping `https://api.annasetu.org/api/health`.

---

## 4. Step 3: Deploy Next.js Web App (Vercel)

1. Connect the GitHub repository to [Vercel](https://vercel.com).
2. Set Root Directory to `apps/web`.
3. Configure Build Settings:
   - Build Command: `next build`
   - Output Directory: `.next`
4. Set Environment Variables:
```ini
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_APP_URL=https://annasetu.org
NEXT_PUBLIC_API_URL=https://api.annasetu.org
```

---

## 5. Monitoring & Operational Verifications

After deployment, log into the Admin portal and open the **Service Health Panel**:
```
https://annasetu.org/admin/service-health
```
Verify that all 6 pillars report `AVAILABLE` or clean `DEGRADED` fallback states.
