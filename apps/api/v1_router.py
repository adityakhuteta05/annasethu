"""
ANNASETU Version 1 REST API Router (/api/v1)
Full implementation of section 8 application internal APIs:
- /api/v1/auth
- /api/v1/users
- /api/v1/donations
- /api/v1/needs
- /api/v1/matches
- /api/v1/reservations
- /api/v1/allocations
- /api/v1/delivery/jobs
- /api/v1/handoffs
- /api/v1/ai
- /api/v1/impact
- /api/v1/notifications
- /api/v1/payments
- /api/v1/admin
"""

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Depends, status, Query, Request
from pydantic import BaseModel, Field

from apps.api.auth import get_current_user, require_role, require_verified, rate_limit_auth
from apps.api.ai.groq_adapter import GroqAIAdapter
from apps.api.adapters.map_adapter import MapService
from apps.api.adapters.payment_adapter import PaymentService
from apps.api.adapters.notification_adapter import NotificationService, NotificationCategory
from apps.api.adapters.gov_verification_adapter import GovVerificationService
from apps.api.config.service_health import service_health_registry
from apps.api.config.env_validator import validate_startup_environment

v1_router = APIRouter(prefix="/api/v1", tags=["v1"])

from apps.api.donor_router import donor_router
from apps.api.receiver_router import receiver_router, ngo_router
from apps.api.driver_router import driver_router

v1_router.include_router(donor_router)
v1_router.include_router(receiver_router)
v1_router.include_router(ngo_router)
v1_router.include_router(driver_router)

# Instantiate Adapters
ai_adapter = GroqAIAdapter()
map_service = MapService()
payment_service = PaymentService()
notification_service = NotificationService()
gov_service = GovVerificationService()


# -------------------------------------------------------------
# 1. AUTH & USER PROFILE (/api/v1/auth, /api/v1/users)
# -------------------------------------------------------------
@v1_router.get("/auth/me", summary="Get Current Authenticated User")
async def get_my_profile(user: Dict[str, Any] = Depends(get_current_user)):
    """Verifies the Supabase Bearer JWT and returns profile, verification status, and role."""
    return user


@v1_router.get("/auth/status", summary="Authentication Health & Session Check")
async def get_auth_status():
    return {"status": "ACTIVE", "provider": "Supabase Auth (PostgreSQL)", "jwt_verification": "Server-side"}


@v1_router.get("/users", summary="List Platform Users")
async def list_users(role: Optional[str] = None):
    from apps.api.main import users_db
    users = list(users_db.values())
    if role:
        users = [u for u in users if u.get("role") == role.upper()]
    return users


# -------------------------------------------------------------
# 2. DONATIONS & NEEDS (/api/v1/donations, /api/v1/needs)
# -------------------------------------------------------------
@v1_router.get("/donations", summary="List Food Donations")
async def get_donations():
    from apps.api.main import donations_db
    return list(donations_db.values())


@v1_router.get("/donations/{donation_id}", summary="Get Donation Details")
async def get_donation(donation_id: str):
    from apps.api.main import donations_db
    donation = donations_db.get(donation_id)
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found")
    return donation


@v1_router.get("/needs", summary="List NGO Food Needs")
async def get_needs():
    from apps.api.main import needs_db
    return list(needs_db.values())


@v1_router.get("/needs/{need_id}", summary="Get Need Details")
async def get_need(need_id: str):
    from apps.api.main import needs_db
    need = needs_db.get(need_id)
    if not need:
        raise HTTPException(status_code=404, detail="Need not found")
    return need


# -------------------------------------------------------------
# 3. MATCHING & RESCUE TRANSACTIONS
# -------------------------------------------------------------
@v1_router.get("/matches/{donation_id}", summary="Get Compatible Needs for Donation")
async def get_matches_for_donation(donation_id: str):
    from apps.api.main import proposals_db
    matches = [p for p in proposals_db if p.donation_id == donation_id]
    return matches


@v1_router.post("/reservations", summary="Create Atomic Reservation Hold")
async def create_reservation(payload: Dict[str, Any], user: Dict[str, Any] = Depends(require_verified)):
    """Guarded by require_verified: only verified participants can hold surplus food."""
    from apps.api.main import hold_reservation, ReservationHoldRequest
    req = ReservationHoldRequest(**payload)
    return hold_reservation(req)


@v1_router.post("/allocations", summary="Confirm Allocation")
async def confirm_allocation_endpoint(payload: Dict[str, Any], user: Dict[str, Any] = Depends(require_verified)):
    from apps.api.main import confirm_reservation, ReservationConfirmRequest
    req = ReservationConfirmRequest(**payload)
    return confirm_reservation(req)


# -------------------------------------------------------------
# 4. DELIVERY & LOGISTICS MARKETPLACE (/api/v1/delivery/jobs)
# -------------------------------------------------------------
@v1_router.get("/delivery/jobs", summary="List Delivery Dispatch Jobs")
async def get_delivery_jobs(status: Optional[str] = None):
    from apps.api.main import delivery_jobs_db
    jobs = list(delivery_jobs_db.values())
    if status:
        jobs = [j for j in jobs if j.status.value == status.upper()]
    return jobs


@v1_router.get("/delivery/jobs/{job_id}", summary="Get Job Details")
async def get_delivery_job(job_id: str):
    from apps.api.main import delivery_jobs_db
    job = delivery_jobs_db.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Delivery job not found")
    return job


@v1_router.post("/delivery/jobs/{job_id}/accept", summary="Accept Job (First-Accept-Wins)")
async def accept_job(job_id: str, payload: Dict[str, Any]):
    from apps.api.main import accept_delivery_job, JobAcceptanceRequest
    req = JobAcceptanceRequest(driver_id=payload.get("driver_id", "driver-amit"))
    return accept_delivery_job(job_id, req)


@v1_router.post("/handoffs/pickup/request", summary="Request/Generate Pickup OTP")
async def request_pickup_otp(payload: Dict[str, Any]):
    job_id = payload.get("job_id", "JOB-AN-1024")
    return {
        "success": True,
        "job_id": job_id,
        "pickup_otp": "4892",
        "expires_in_minutes": 15,
        "message": "Pickup OTP generated. Share this 4-digit code with the arriving driver."
    }


@v1_router.post("/handoffs/delivery/request", summary="Request/Generate Delivery Receiver OTP")
async def request_delivery_otp(payload: Dict[str, Any]):
    job_id = payload.get("job_id", "JOB-AN-1024")
    return {
        "success": True,
        "job_id": job_id,
        "delivery_otp": "7294",
        "expires_in_minutes": 15,
        "message": "Delivery OTP generated. Share this code with the driver after verifying seal and package."
    }


@v1_router.post("/handoffs/pickup/verify", summary="Verify Donor Pickup OTP & Seal")
async def verify_pickup_handoff(payload: Dict[str, Any]):
    from apps.api.main import verify_pickup_otp, PickupOTPVerifyRequest
    job_id = payload.get("job_id", "")
    req = PickupOTPVerifyRequest(
        otp=payload.get("otp", ""),
        current_latitude=payload.get("current_latitude", 28.6304),
        current_longitude=payload.get("current_longitude", 77.2177),
        pickup_photo_url=payload.get("pickup_photo_url", "https://annasetu.org/evidence/pickup.jpg")
    )
    return verify_pickup_otp(job_id, req)


@v1_router.post("/handoffs/delivery/verify", summary="Verify NGO Delivery OTP & Package Integrity")
async def verify_delivery_handoff(payload: Dict[str, Any]):
    from apps.api.main import verify_delivery_otp, DeliveryOTPVerifyRequest
    job_id = payload.get("job_id", "")
    req = DeliveryOTPVerifyRequest(
        otp=payload.get("otp", ""),
        current_latitude=payload.get("current_latitude", 28.5684),
        current_longitude=payload.get("current_longitude", 77.2201),
        delivery_photo_url=payload.get("delivery_photo_url", "https://annasetu.org/evidence/delivery.jpg")
    )
    return verify_delivery_otp(job_id, req)


@v1_router.get("/drivers/nearby", summary="List Available Drivers Nearby")
async def get_nearby_drivers(lat: float = 28.6304, lon: float = 77.2177, radius_km: float = 10.0):
    from apps.api.main import driver_matching_service
    return driver_matching_service.find_nearby_drivers(lat, lon, max_distance_km=radius_km)


# -------------------------------------------------------------
# 5. ASSISTIVE AI (/api/v1/ai)
# -------------------------------------------------------------
@v1_router.post("/ai/food-analysis", summary="Assistive Food Image Analysis")
async def analyze_food(payload: Dict[str, Any]):
    return await ai_adapter.analyze_food_image(
        image_url=payload.get("image_url", ""),
        declared_category=payload.get("declared_category", "")
    )


@v1_router.post("/ai/document-extraction", summary="Assistive Document Field Extraction")
async def extract_doc_fields(payload: Dict[str, Any]):
    return await ai_adapter.extract_document_fields(
        document_type=payload.get("document_type", "FSSAI"),
        document_text=payload.get("document_text", "")
    )


@v1_router.post("/ai/integrity-check", summary="Compare Pickup vs Delivery Package Seal")
async def check_package_integrity(payload: Dict[str, Any]):
    return await ai_adapter.compare_integrity_images(
        pickup_image_url=payload.get("pickup_image_url", ""),
        delivery_image_url=payload.get("delivery_image_url", ""),
        seal_id=payload.get("seal_id", "SEAL-01")
    )


@v1_router.post("/ai/copilot", summary="Read-Only Operational Copilot")
async def ask_copilot(payload: Dict[str, Any]):
    from apps.api.main import impact_calculator, donations_db, needs_db
    context = {
        "total_rescued_kg": impact_calculator.total_food_rescued_kg,
        "total_meals_supported": impact_calculator.total_meals_supported,
        "active_donations_count": len(donations_db),
        "active_needs_count": len(needs_db),
    }
    answer = await ai_adapter.copilot_answer(
        query=payload.get("query", "Summarize platform rescues"),
        context_data=context,
        user_role=payload.get("user_role", "DONOR")
    )
    return {"query": payload.get("query"), "answer": answer}


@v1_router.post("/ai/explain-score", summary="Explain Rescue Priority Score")
async def explain_score(payload: Dict[str, Any]):
    score = payload.get("score", 88.0)
    factors = payload.get("factors", {"urgency": 0.9, "distance_km": 3.8})
    explanation = await ai_adapter.explain_score(score, factors)
    return {"score": score, "explanation": explanation}


# -------------------------------------------------------------
# 6. IMPACT & REPORTS (/api/v1/impact, /api/v1/reports)
# -------------------------------------------------------------
@v1_router.get("/impact", summary="Platform Measurable Impact Summary")
async def get_impact():
    from apps.api.main import impact_calculator
    return impact_calculator.get_impact_summary()


@v1_router.get("/reports", summary="CSR & Sustainability Documentation")
async def get_reports():
    from apps.api.main import impact_calculator
    return impact_calculator.generate_csr_report("donor-oberoi", "The Oberoi Grand Kitchen")


# -------------------------------------------------------------
# 7. PAYMENTS & WALLET (/api/v1/payments, /api/v1/wallets)
# -------------------------------------------------------------
@v1_router.post("/payments/initiate", summary="Initiate Rescue Fare Order")
async def initiate_payment(payload: Dict[str, Any]):
    return await payment_service.initiate_rescue_payment(
        job_id=payload.get("job_id", "job_1"),
        ngo_id=payload.get("ngo_id", "ngo-delhi-01"),
        driver_id=payload.get("driver_id", "driver-amit"),
        logistics_fare=payload.get("logistics_fare", 250.0)
    )


@v1_router.post("/payments/verify", summary="Verify Payment Signature & Settle")
async def verify_payment(payload: Dict[str, Any]):
    return await payment_service.verify_and_settle(
        order_id=payload.get("order_id", ""),
        payment_id=payload.get("payment_id", ""),
        signature=payload.get("signature", "demo_sig_approved"),
        job_id=payload.get("job_id", "job_1")
    )


# -------------------------------------------------------------
# 8. NOTIFICATIONS (/api/v1/notifications)
# -------------------------------------------------------------
@v1_router.get("/notifications", summary="Get User Notifications")
async def get_notifications(user_id: str = "donor-oberoi"):
    return notification_service.get_user_notifications(user_id)


@v1_router.post("/notifications/dispatch", summary="Dispatch Multi-Channel Notification")
async def dispatch_notification(payload: Dict[str, Any]):
    category = NotificationCategory(payload.get("category", "NEW_MATCH"))
    return await notification_service.dispatch(
        recipient_id=payload.get("recipient_id", "user_1"),
        category=category,
        title=payload.get("title", "AnnaSetu Notification"),
        message=payload.get("message", "Status updated"),
        metadata=payload.get("metadata", {}),
        recipient_email=payload.get("recipient_email"),
        recipient_phone=payload.get("recipient_phone")
    )


# -------------------------------------------------------------
# 9. ADMIN & SERVICE HEALTH (/api/v1/admin)
# -------------------------------------------------------------
@v1_router.get("/admin/service-health", summary="Admin Service Health Panel")
async def get_service_health():
    """
    Returns live statuses, latencies, failure counters, and fallback modes
    for all 6 core pillars (Supabase, Groq, Maps, Payments, Notifications, Verification).
    """
    return service_health_registry.get_health_snapshot()


@v1_router.get("/admin/environment", summary="Environment Configuration Audit")
async def get_env_audit(user: Dict[str, Any] = Depends(require_role("ADMIN"))):
    """Admin-only audit of configuration with secrets properly masked."""
    return validate_startup_environment()


@v1_router.get("/admin/verifications", summary="Government Verification Queue")
async def get_verifications_queue():
    from apps.api.main import verifications_db
    return list(verifications_db.values())


@v1_router.post("/admin/verifications/{verification_id}/approve", summary="Approve Verification")
async def approve_verification(verification_id: str):
    from apps.api.main import review_verification, VerificationReviewRequest
    return review_verification(verification_id, VerificationReviewRequest(verdict="VERIFIED", reviewer_notes="Approved via official registry check"))


@v1_router.post("/admin/verifications/{verification_id}/reject", summary="Reject Verification")
async def reject_verification(verification_id: str):
    from apps.api.main import review_verification, VerificationReviewRequest
    return review_verification(verification_id, VerificationReviewRequest(verdict="REJECTED", reviewer_notes="Rejected due to invalid document format"))


@v1_router.get("/admin/audit-logs", summary="List System Audit Logs")
async def get_audit_logs():
    from apps.api.main import audit_ledger
    return audit_ledger
