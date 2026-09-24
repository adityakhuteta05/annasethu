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
