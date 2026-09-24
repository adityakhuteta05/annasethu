"""
ANNASETU Master FastAPI Application
Complete implementation of the AnnaSetu PRD backend.
Coordinates matching, reservation, delivery marketplace, trust chain,
finance ledger, impact metrics, government verification, and assistive AI.
"""

import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from apps.api.matching.models import (
    UserRole,
    VerificationStatus,
    FoodCategory,
    DietaryType,
    MealPeriod,
    NeedStatus,
    DonationStatus,
    ReservationStatus,
    VehicleClass,
    JobStatus,
    IntegrityVerdict,
    Location,
    FoodDonation,
    NGONeed,
    MatchProposal,
    Reservation,
    Allocation,
    FareQuote,
    DeliveryStop,
    DeliveryJob,
)
from apps.api.matching.eligibility import check_eligibility, haversine_distance_km
from apps.api.matching.scoring import calculate_rescue_priority_score
from apps.api.matching.allocation import AllocationManager
from apps.api.delivery.fare import calculate_fare
from apps.api.delivery.routing import recommend_vehicle_class, optimize_multi_stop_route
from apps.api.delivery.driver_matching import DriverMatchingService, DriverProfile
from apps.api.trust.otp import OTPService
from apps.api.trust.trust_chain import TrustChainService
from apps.api.finance.wallet import FinanceService
from apps.api.impact.calculator import calculate_impact_for_rescue, ImpactRecord, ImpactSummary
from apps.api.gov.gov_verification import GovVerificationAdapter
from apps.api.ai.groq_adapter import GroqAIAdapter
from apps.api.config.config_service import config_service

app = FastAPI(
    title="ANNASETU API",
    description="A verified, need-driven surplus-food rescue and delivery marketplace",
    version="1.0.0",
)

# CORS enabled for web app integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Core Domain Service Singletons
allocation_mgr = AllocationManager()
driver_service = DriverMatchingService()
otp_service = OTPService()
trust_chain = TrustChainService()
finance_service = FinanceService()
ai_adapter = GroqAIAdapter()

# In-Memory Database Stores (Persistent across sessions while server runs)
donations_db: Dict[str, FoodDonation] = {}
needs_db: Dict[str, NGONeed] = {}
jobs_db: Dict[str, DeliveryJob] = {}
users_db: Dict[str, Dict[str, Any]] = {}
verification_queue_db: List[Dict[str, Any]] = []
impact_records_db: List[ImpactRecord] = []
audit_log_db: List[Dict[str, Any]] = []


def log_audit_event(action: str, actor_id: str, role: str, details: Dict[str, Any]):
    audit_log_db.append({
        "id": f"AUD-{uuid.uuid4().hex[:8].upper()}",
        "action": action,
        "actor_id": actor_id,
        "role": role,
        "details": details,
        "timestamp": datetime.utcnow().isoformat(),
    })


# -------------------------------------------------------------
# SEED DATA INITIALIZER
# -------------------------------------------------------------
def initialize_seed_data():
    global donations_db, needs_db, jobs_db, users_db, verification_queue_db, impact_records_db, audit_log_db

    now = datetime.utcnow()

    # 1. Users & Organizations
    users_db.clear()
    users_db["donor-oberoi"] = {
        "id": "donor-oberoi",
        "name": "The Oberoi Grand Kitchens",
        "role": UserRole.DONOR.value,
        "email": "chef@oberoi-delhi.com",
        "phone": "+91-98110-12345",
        "verification_status": VerificationStatus.VERIFIED.value,
        "gstin": "07AAAAO1234A1Z5",
        "fssai_licence": "10019011005891",
        "business_type": "5-Star Hotel & Banquet",
        "authorized_person": "Chef Vikramaditya Roy",
        "location": Location(
            address="Dr Zakir Hussain Marg, Delhi Golf Club Area, New Delhi",
            latitude=28.5996,
            longitude=77.2373,
            contact_person="Chef Roy",
            contact_phone="+91-98110-12345",
        ).model_dump(),
    }

    users_db["donor-haldiram"] = {
        "id": "donor-haldiram",
        "name": "Haldiram's Central Production Unit",
        "role": UserRole.DONOR.value,
        "email": "dispatch@haldirams.com",
        "phone": "+91-98220-54321",
        "verification_status": VerificationStatus.VERIFIED.value,
        "gstin": "07AAACH4321B1Z9",
        "fssai_licence": "10018011002345",
        "business_type": "Commercial Cloud Kitchen & Sweets",
        "authorized_person": "Manish Sharma",
        "location": Location(
            address="Connaught Place Outer Circle, New Delhi",
            latitude=28.6315,
            longitude=77.2167,
            contact_person="Manish Sharma",
            contact_phone="+91-98220-54321",
        ).model_dump(),
    }

    users_db["donor-greengrocer"] = {
        "id": "donor-greengrocer",
        "name": "FreshFare Gourmet Mart",
        "role": UserRole.DONOR.value,
        "email": "ops@freshfare.in",
        "phone": "+91-98991-99882",
        "verification_status": VerificationStatus.DOCUMENTS_SUBMITTED.value,
        "gstin": "07AAAGF9988C1Z2",
        "fssai_licence": "10020011009988",
        "business_type": "Supermarket & Deli",
        "authorized_person": "Sunita Rao",
        "location": Location(
            address="Saket District Centre, New Delhi",
            latitude=28.5284,
            longitude=77.2185,
            contact_person="Sunita Rao",
            contact_phone="+91-98991-99882",
        ).model_dump(),
    }

    # NGOs
    users_db["ngo-rotibank"] = {
        "id": "ngo-rotibank",
        "name": "Delhi Roti Bank Foundation",
        "role": UserRole.NGO.value,
        "email": "coordinator@rotibankdelhi.org",
        "phone": "+91-98101-77889",
        "verification_status": VerificationStatus.VERIFIED.value,
        "pan": "AAATD1234C",
        "ngo_darpan_id": "DL/2021/0291456",
        "registration_no": "REG-DL-8874-2018",
        "is_80g_certified": True,
        "authorized_rep": "Dr. Arvind Swaminathan",
        "location": Location(
            address="Kashmere Gate Community Center, Delhi",
            latitude=28.6679,
            longitude=77.2285,
            contact_person="Dr. Swaminathan",
            contact_phone="+91-98101-77889",
        ).model_dump(),
    }

    users_db["ngo-ashadeep"] = {
        "id": "ngo-ashadeep",
        "name": "Asha Deep Shelter & Children Home",
        "role": UserRole.NGO.value,
        "email": "care@ashadeepshelter.org",
        "phone": "+91-98711-22334",
        "verification_status": VerificationStatus.VERIFIED.value,
        "pan": "AAATA5678K",
        "ngo_darpan_id": "DL/2019/0187654",
        "registration_no": "REG-DL-4412-2015",
        "is_80g_certified": True,
        "authorized_rep": "Sister Clara D'Souza",
        "location": Location(
            address="Lajpat Nagar IV Shelter Home, New Delhi",
            latitude=28.5678,
            longitude=77.2433,
            contact_person="Sister Clara",
            contact_phone="+91-98711-22334",
        ).model_dump(),
    }

    users_db["ngo-robinfood"] = {
        "id": "ngo-robinfood",
        "name": "Robin Food Relief Collective",
        "role": UserRole.NGO.value,
        "email": "delhi@robinfoodrelief.org",
        "phone": "+91-98112-99001",
        "verification_status": VerificationStatus.VERIFIED.value,
        "pan": "AAATR9988M",
        "ngo_darpan_id": "DL/2022/0339911",
        "registration_no": "REG-DL-9912-2020",
        "is_80g_certified": True,
        "authorized_rep": "Gaurav Malhotra",
        "location": Location(
            address="Nizamuddin Basti Relief Center, New Delhi",
            latitude=28.5910,
            longitude=77.2490,
            contact_person="Gaurav Malhotra",
            contact_phone="+91-98112-99001",
        ).model_dump(),
    }

    # Funded NGO Wallets
    finance_service.create_wallet("ngo-rotibank", "Delhi Roti Bank Foundation", "NGO", initial_balance=8500.0)
    finance_service.create_wallet("ngo-ashadeep", "Asha Deep Shelter & Children Home", "NGO", initial_balance=4200.0)
    finance_service.create_wallet("ngo-robinfood", "Robin Food Relief Collective", "NGO", initial_balance=6000.0)

    # Drivers
    d1 = DriverProfile(
        id="drv-rajesh",
        name="Rajesh Kumar",
        phone="+91-98188-11223",
        vehicle_class=VehicleClass.MOTORCYCLE,
        verification_status=VerificationStatus.VERIFIED,
        is_compliant=True,
        is_available=True,
        current_location=Location(
            address="Near India Gate, New Delhi",
            latitude=28.6129,
            longitude=77.2295,
        ),
        completed_deliveries=52,
        total_earnings=14200.0,
    )
    d2 = DriverProfile(
        id="drv-amit",
        name="Amit Singh",
        phone="+91-98733-44556",
        vehicle_class=VehicleClass.VAN,
        verification_status=VerificationStatus.VERIFIED,
        is_compliant=True,
        is_available=True,
        current_location=Location(
            address="Near Pragati Maidan, New Delhi",
            latitude=28.6180,
            longitude=77.2420,
        ),
        completed_deliveries=98,
        total_earnings=38500.0,
    )
    d3 = DriverProfile(
        id="drv-pooja",
        name="Pooja Sharma",
        phone="+91-98911-77889",
        vehicle_class=VehicleClass.SCOOTER,
        verification_status=VerificationStatus.VERIFIED,
        is_compliant=True,
        is_available=True,
        current_location=Location(
            address="Near Lodhi Colony, New Delhi",
            latitude=28.5833,
            longitude=77.2222,
        ),
        completed_deliveries=45,
        total_earnings=9800.0,
    )
    driver_service.register_driver(d1)
    driver_service.register_driver(d2)
    driver_service.register_driver(d3)
    finance_service.create_wallet("drv-rajesh", "Rajesh Kumar", "DRIVER", initial_balance=14200.0)
    finance_service.create_wallet("drv-amit", "Amit Singh", "DRIVER", initial_balance=38500.0)
    finance_service.create_wallet("drv-pooja", "Pooja Sharma", "DRIVER", initial_balance=9800.0)

    # 2. Seed Needs
    needs_db.clear()
    n1 = NGONeed(
        id="need-101",
        ngo_id="ngo-rotibank",
        ngo_name="Delhi Roti Bank Foundation",
        title="Dinner Packaged Meals for Shelter Inmates",
        meal_period=MealPeriod.DINNER,
        food_category=FoodCategory.PACKAGED_MEALS,
        dietary_requirement=DietaryType.VEG,
        required_quantity_kg=35.0,
        minimum_acceptable_kg=10.0,
        fulfilled_quantity_kg=0.0,
        required_by=now + timedelta(hours=4),
        receiving_location=Location(
            address="Kashmere Gate Community Center, Delhi",
            latitude=28.6679,
            longitude=77.2285,
        ),
        available_capacity_kg=80.0,
        receiving_hours_start="18:00",
        receiving_hours_end="22:30",
        special_requirements="Temperature preserved food containers preferred.",
        status=NeedStatus.ACTIVE,
    )
    n2 = NGONeed(
        id="need-102",
        ngo_id="ngo-ashadeep",
        ngo_name="Asha Deep Shelter & Children Home",
        title="Lunch Fresh Dal, Rice & Roti for 60 Kids",
        meal_period=MealPeriod.LUNCH,
        food_category=FoodCategory.GRAINS_RICE,
        dietary_requirement=DietaryType.VEG,
        required_quantity_kg=25.0,
        minimum_acceptable_kg=8.0,
        fulfilled_quantity_kg=0.0,
        required_by=now + timedelta(hours=2, minutes=30),
        receiving_location=Location(
            address="Lajpat Nagar IV Shelter Home, New Delhi",
            latitude=28.5678,
            longitude=77.2433,
        ),
        available_capacity_kg=50.0,
        receiving_hours_start="11:30",
        receiving_hours_end="15:30",
        special_requirements="Mild spices suitable for young children.",
        status=NeedStatus.ACTIVE,
    )
    n3 = NGONeed(
        id="need-103",
        ngo_id="ngo-robinfood",
        ngo_name="Robin Food Relief Collective",
        title="Immediate Cooked Curries & Bread Supplies",
        meal_period=MealPeriod.DINNER,
        food_category=FoodCategory.CURRIES_GRAVIES,
        dietary_requirement=DietaryType.ANY,
        required_quantity_kg=20.0,
        minimum_acceptable_kg=5.0,
        fulfilled_quantity_kg=0.0,
        required_by=now + timedelta(hours=3),
        receiving_location=Location(
            address="Nizamuddin Basti Relief Center, New Delhi",
            latitude=28.5910,
            longitude=77.2490,
        ),
        available_capacity_kg=60.0,
        receiving_hours_start="17:00",
        receiving_hours_end="22:00",
        status=NeedStatus.ACTIVE,
    )
    needs_db[n1.id] = n1
    needs_db[n2.id] = n2
    needs_db[n3.id] = n3

    # 3. Seed Surplus Food Donations
    donations_db.clear()
    d_obj1 = FoodDonation(
        id="don-201",
        donor_id="donor-oberoi",
        donor_name="The Oberoi Grand Kitchens",
        title="Surplus Premium Dal Makhani & Jeera Rice (Banquet Excess)",
        food_category=FoodCategory.GRAINS_RICE,
        dietary_type=DietaryType.VEG,
        quantity_kg=30.0,
        remaining_kg=30.0,
        prepared_at=now - timedelta(hours=1),
        available_from=now,
        deadline=now + timedelta(hours=3, minutes=30),
        storage_condition="Thermal hot-case maintained (>65°C)",
        packaging_type="Food-grade sealed thermal carriers",
        is_sealed=True,
        seal_id="AS-SEAL-8891",
        pickup_location=Location(
            address="The Oberoi Banquet Loading Dock, Dr Zakir Hussain Marg, New Delhi",
            latitude=28.5996,
            longitude=77.2373,
            contact_person="Chef Roy",
            contact_phone="+91-98110-12345",
        ),
        status=DonationStatus.POSTED,
    )
    d_obj2 = FoodDonation(
        id="don-202",
        donor_id="donor-haldiram",
        donor_name="Haldiram's Central Production Unit",
        title="Fresh Paneer Curry, Pulao & Roti Meal Boxes",
        food_category=FoodCategory.PACKAGED_MEALS,
        dietary_type=DietaryType.VEG,
        quantity_kg=40.0,
        remaining_kg=40.0,
        prepared_at=now - timedelta(minutes=45),
        available_from=now,
        deadline=now + timedelta(hours=4),
        storage_condition="Ambient dry packaging",
        packaging_type="Individual tamper-sealed CPET trays",
        is_sealed=True,
        seal_id="AS-SEAL-9024",
        pickup_location=Location(
            address="Connaught Place Outer Circle, New Delhi",
            latitude=28.6315,
            longitude=77.2167,
            contact_person="Manish Sharma",
            contact_phone="+91-98220-54321",
        ),
        status=DonationStatus.POSTED,
    )
    donations_db[d_obj1.id] = d_obj1
    donations_db[d_obj2.id] = d_obj2

    # 4. Seed Historical Completed Rescue (to demonstrate trust chain, financial settlement, and impact certificate)
    hist_job_id = "JOB-HIST-8812"
    hist_quote = calculate_fare(VehicleClass.SMALL_VAN, distance_km=5.4, duration_minutes=22, stop_count=1)
    hist_stop = DeliveryStop(
        stop_number=1,
        need_id="need-hist-01",
        ngo_id="ngo-ashadeep",
        ngo_name="Asha Deep Shelter & Children Home",
        location=Location(
            address="Lajpat Nagar IV Shelter Home, New Delhi",
            latitude=28.5678,
            longitude=77.2433,
        ),
        quantity_kg=24.0,
        delivery_otp_hash="HASHED_OTP_7719",
        status="DELIVERED",
        arrived_at=now - timedelta(hours=5),
        delivered_at=now - timedelta(hours=4, minutes=45),
    )
    hist_job = DeliveryJob(
        id=hist_job_id,
        donation_id="don-hist-01",
        donor_id="donor-oberoi",
        donor_name="The Oberoi Grand Kitchens",
        pickup_location=Location(
            address="Dr Zakir Hussain Marg, New Delhi",
            latitude=28.5996,
            longitude=77.2373,
        ),
        pickup_seal_id="AS-SEAL-6610",
        pickup_otp_hash="HASHED_PICKUP_OTP",
        required_vehicle_class=VehicleClass.SMALL_VAN,
        total_quantity_kg=24.0,
        stops=[hist_stop],
        fare_quote=hist_quote,
        driver_id="drv-amit",
        driver_name="Amit Singh",
        status=JobStatus.DELIVERED,
        integrity_verdict=IntegrityVerdict.NO_VISIBLE_DISCREPANCY,
        integrity_reason="Automated cross-check: Container contours and tamper-evident seal AS-SEAL-6610 intact.",
        accepted_at=now - timedelta(hours=5, minutes=30),
        picked_up_at=now - timedelta(hours=5, minutes=10),
        delivered_at=now - timedelta(hours=4, minutes=45),
    )
    jobs_db[hist_job.id] = hist_job
    driver_service.jobs[hist_job.id] = hist_job

    # Record historical impact
    hist_impact = calculate_impact_for_rescue(
        job_id=hist_job_id,
        donation_id="don-hist-01",
        donor_id="donor-oberoi",
        donor_name="The Oberoi Grand Kitchens",
        ngo_id="ngo-ashadeep",
        ngo_name="Asha Deep Shelter & Children Home",
        driver_id="drv-amit",
        driver_name="Amit Singh",
        food_category="GRAINS_RICE",
        quantity_kg=24.0,
    )
    impact_records_db.append(hist_impact)

    # Seed Admin Verification Queue with pending review item
    verification_queue_db.clear()
    verification_queue_db.append({
        "id": "VER-901",
        "entity_id": "donor-greengrocer",
        "entity_name": "FreshFare Gourmet Mart",
        "role": UserRole.DONOR.value,
        "submitted_at": (now - timedelta(hours=6)).isoformat(),
        "status": VerificationStatus.DOCUMENTS_SUBMITTED.value,
        "documents": [
            {"type": "GSTIN", "value": "07AAAGF9988C1Z2"},
            {"type": "FSSAI_LICENSE", "value": "10020011009988"},
        ],
        "lookup_guidance": GovVerificationAdapter.check_gstin("07AAAGF9988C1Z2"),
    })


initialize_seed_data()


# -------------------------------------------------------------
# REST ENDPOINTS
# -------------------------------------------------------------

@app.get("/api/health")
def get_health():
    return {
        "status": "healthy",
        "service": "ANNASETU Master API",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "active_rescues": len([j for j in jobs_db.values() if j.status in [JobStatus.ACCEPTED, JobStatus.ARRIVING_PICKUP, JobStatus.PICKED_UP, JobStatus.IN_TRANSIT]]),
        "total_donations": len(donations_db),
        "total_needs": len(needs_db),
        "groq_ai_configured": ai_adapter.is_configured,
    }


@app.post("/api/demo/reset")
def reset_to_seed():
    """Resets entire in-memory store to pristine seed data for demonstrations."""
    initialize_seed_data()
    return {"message": "AnnaSetu environment successfully reset to pristine seed state."}


@app.get("/api/config")
def get_configuration():
    return config_service.get_config()


@app.put("/api/config")
def update_configuration(updates: Dict[str, Any]):
    updated = config_service.update_config(updates)
    log_audit_event("CONFIG_UPDATE", "admin", "ADMIN", updates)
    return updated


# Users & Authentication Simulation
@app.get("/api/users")
def list_users(role: Optional[str] = None):
    users = list(users_db.values())
    if role:
        users = [u for u in users if u.get("role") == role.upper()]
    return users


@app.post("/api/users/register")
def register_user(payload: Dict[str, Any]):
    user_id = f"usr-{uuid.uuid4().hex[:8]}"
    role = payload.get("role", "DONOR").upper()
    user_data = {
        "id": user_id,
        "name": payload.get("name", "New Participant"),
        "role": role,
        "email": payload.get("email", f"{user_id}@annasetu.org"),
        "phone": payload.get("phone", "+91-99999-00000"),
        "verification_status": VerificationStatus.DOCUMENTS_SUBMITTED.value,
        "location": payload.get("location", {
            "address": "Connaught Place, New Delhi",
            "latitude": 28.6304,
            "longitude": 77.2177,
        }),
    }

    # Add role-specific attributes
    if role == "DONOR":
        user_data["gstin"] = payload.get("gstin", "07AABCS1429B1ZB")
        user_data["fssai_licence"] = payload.get("fssai_licence", "10021011001234")
    elif role == "NGO":
        user_data["ngo_darpan_id"] = payload.get("ngo_darpan_id", "DL/2023/0445511")
        user_data["pan"] = payload.get("pan", "AAATN9988P")
        finance_service.create_wallet(user_id, user_data["name"], "NGO", initial_balance=5000.0)
    elif role == "DRIVER":
        drv_prof = DriverProfile(
            id=user_id,
            name=user_data["name"],
            phone=user_data["phone"],
            vehicle_class=VehicleClass(payload.get("vehicle_class", "MOTORCYCLE")),
            verification_status=VerificationStatus.DOCUMENTS_SUBMITTED,
            current_location=Location(**user_data["location"]),
        )
        driver_service.register_driver(drv_prof)
        finance_service.create_wallet(user_id, user_data["name"], "DRIVER", initial_balance=0.0)

    users_db[user_id] = user_data

    # Add to verification queue
    verification_queue_db.append({
        "id": f"VER-{uuid.uuid4().hex[:6].upper()}",
        "entity_id": user_id,
        "entity_name": user_data["name"],
        "role": role,
        "submitted_at": datetime.utcnow().isoformat(),
        "status": VerificationStatus.DOCUMENTS_SUBMITTED.value,
        "documents": [
            {"type": "REGISTRATION", "value": payload.get("gstin") or payload.get("ngo_darpan_id") or "DL/RC"},
        ],
        "lookup_guidance": GovVerificationAdapter.check_gstin(payload.get("gstin", "07AABCS1429B1ZB")),
    })

    log_audit_event("USER_REGISTERED", user_id, role, {"name": user_data["name"]})
    return user_data


# Verification Desk
@app.get("/api/verification/queue")
def get_verification_queue():
    return verification_queue_db


@app.post("/api/verification/review")
def review_verification(payload: Dict[str, Any]):
    case_id = payload.get("case_id")
    action = payload.get("action", "APPROVE").upper()  # "APPROVE" or "REJECT"
    notes = payload.get("notes", "Reviewed against official compliance portal.")

    case = next((c for c in verification_queue_db if c["id"] == case_id), None)
    if not case:
        raise HTTPException(status_code=404, detail="Verification case not found.")

    new_status = VerificationStatus.VERIFIED.value if action == "APPROVE" else VerificationStatus.REJECTED.value
    case["status"] = new_status
    case["reviewed_at"] = datetime.utcnow().isoformat()
    case["admin_notes"] = notes

    # Update actual user record
    entity_id = case["entity_id"]
    if entity_id in users_db:
        users_db[entity_id]["verification_status"] = new_status

    if entity_id in driver_service.drivers:
        driver_service.drivers[entity_id].verification_status = VerificationStatus(new_status)

    log_audit_event("VERIFICATION_DECISION", "admin", "ADMIN", {
        "case_id": case_id,
        "entity_id": entity_id,
        "action": action,
        "notes": notes,
    })
    return {"message": f"Verification status updated to {new_status}.", "case": case}


@app.get("/api/verification/lookup")
def government_portal_lookup(doc_type: str, identifier: str, secondary: Optional[str] = None):
    doc_upper = doc_type.upper()
    if doc_upper == "GSTIN":
        return GovVerificationAdapter.check_gstin(identifier)
    elif doc_upper == "FSSAI":
        return GovVerificationAdapter.check_fssai(identifier)
    elif doc_upper in ["DARPAN", "NGO_DARPAN"]:
        return GovVerificationAdapter.check_darpan(identifier)
    elif doc_upper in ["RC_DL", "VEHICLE"]:
        return GovVerificationAdapter.check_rc_dl(identifier, secondary or identifier)
    else:
        raise HTTPException(status_code=400, detail="Unknown document type for government lookup.")


# Needs CRUD
@app.get("/api/needs")
def list_needs(ngo_id: Optional[str] = None, status_filter: Optional[str] = None):
    results = list(needs_db.values())
    if ngo_id:
        results = [n for n in results if n.ngo_id == ngo_id]
    if status_filter:
        results = [n for n in results if n.status.value == status_filter.upper()]
    return results


class CreateNeedRequest(BaseModel):
    ngo_id: str
    title: str
    meal_period: MealPeriod
    food_category: Optional[FoodCategory] = None
    dietary_requirement: DietaryType = DietaryType.ANY
    required_quantity_kg: float = Field(..., gt=0)
    minimum_acceptable_kg: float = 5.0
    required_by_hours_from_now: float = 4.0
    available_capacity_kg: float = 50.0
    receiving_hours_start: str = "08:00"
    receiving_hours_end: str = "22:00"
    special_requirements: Optional[str] = None
    receiving_location: Optional[Location] = None


@app.post("/api/needs")
def create_need(req: CreateNeedRequest):
    ngo_user = users_db.get(req.ngo_id)
    if not ngo_user:
        raise HTTPException(status_code=404, detail="NGO not found.")

    loc = req.receiving_location or Location(**ngo_user["location"])

    need_id = f"need-{uuid.uuid4().hex[:6]}"
    need = NGONeed(
        id=need_id,
        ngo_id=req.ngo_id,
        ngo_name=ngo_user["name"],
        title=req.title,
        meal_period=req.meal_period,
        food_category=req.food_category,
        dietary_requirement=req.dietary_requirement,
        required_quantity_kg=req.required_quantity_kg,
        minimum_acceptable_kg=req.minimum_acceptable_kg,
        fulfilled_quantity_kg=0.0,
        required_by=datetime.utcnow() + timedelta(hours=req.required_by_hours_from_now),
        receiving_location=loc,
        available_capacity_kg=req.available_capacity_kg,
        receiving_hours_start=req.receiving_hours_start,
        receiving_hours_end=req.receiving_hours_end,
        special_requirements=req.special_requirements,
        status=NeedStatus.ACTIVE,
    )
    needs_db[need.id] = need
    log_audit_event("NEED_CREATED", req.ngo_id, "NGO", {"need_id": need.id, "quantity_kg": req.required_quantity_kg})
    return need


# Donations CRUD
@app.get("/api/donations")
def list_donations(donor_id: Optional[str] = None, status_filter: Optional[str] = None):
    results = list(donations_db.values())
    if donor_id:
        results = [d for d in results if d.donor_id == donor_id]
    if status_filter:
        results = [d for d in results if d.status.value == status_filter.upper()]
    return results


class CreateDonationRequest(BaseModel):
    donor_id: str
    title: str
    food_category: FoodCategory
    dietary_type: DietaryType
    quantity_kg: float = Field(..., ge=5.0, description="Minimum donation quantity is 5 kg")
    prepared_hours_ago: float = 1.0
    expiry_hours_from_now: float = 4.0
    storage_condition: str = "Thermal insulated container"
    packaging_type: str = "Food-grade sealed containers"
    seal_id: Optional[str] = None
    pickup_location: Optional[Location] = None
    image_url: Optional[str] = None


@app.post("/api/donations")
def create_donation(req: CreateDonationRequest):
    # Server-side 5 kg minimum enforcement per PRD
    if req.quantity_kg < 5.0:
        raise HTTPException(
            status_code=400,
            detail="Donation rejected: Platform minimum standard quantity is 5.0 kg."
        )

    donor_user = users_db.get(req.donor_id)
    if not donor_user:
        raise HTTPException(status_code=404, detail="Donor not found.")

    loc = req.pickup_location or Location(**donor_user["location"])
    seal = req.seal_id or f"AS-SEAL-{uuid.uuid4().hex[:4].upper()}"

    don_id = f"don-{uuid.uuid4().hex[:6]}"
    now = datetime.utcnow()
    donation = FoodDonation(
        id=don_id,
        donor_id=req.donor_id,
        donor_name=donor_user["name"],
        title=req.title,
        food_category=req.food_category,
        dietary_type=req.dietary_type,
        quantity_kg=req.quantity_kg,
        remaining_kg=req.quantity_kg,
        prepared_at=now - timedelta(hours=req.prepared_hours_ago),
        available_from=now,
        deadline=now + timedelta(hours=req.expiry_hours_from_now),
        storage_condition=req.storage_condition,
        packaging_type=req.packaging_type,
        is_sealed=True,
        seal_id=seal,
        pickup_location=loc,
        image_url=req.image_url or "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
        status=DonationStatus.POSTED,
    )
    donations_db[donation.id] = donation
    log_audit_event("DONATION_PUBLISHED", req.donor_id, "DONOR", {
        "donation_id": donation.id,
        "quantity_kg": req.quantity_kg,
        "seal_id": seal
    })
    return donation


@app.post("/api/donations/ai-analyze")
async def ai_analyze_donation_photo(payload: Dict[str, Any]):
    image_url = payload.get("image_url", "")
    category = payload.get("category", "")
    analysis = await ai_adapter.analyze_food_image(image_url, category)
    return analysis


# -------------------------------------------------------------
# MATCHING & ALLOCATION ENDPOINTS
# -------------------------------------------------------------

@app.get("/api/matching/proposals")
def get_match_proposals(donation_id: Optional[str] = None, need_id: Optional[str] = None):
    """
    Evaluates compatibility between active donations and needs.
    Returns ranked match proposals with explainable factor breakdowns and rejection reasons.
    """
    proposals: List[MatchProposal] = []
    now = datetime.utcnow()
    cfg = config_service.get_config()

    target_donations = [donations_db[donation_id]] if donation_id and donation_id in donations_db else list(donations_db.values())
    target_needs = [needs_db[need_id]] if need_id and need_id in needs_db else list(needs_db.values())

    for donation in target_donations:
        if donation.status not in [DonationStatus.POSTED, DonationStatus.MATCHED]:
            continue
        if donation.remaining_kg < 5.0:
            continue

        for need in target_needs:
            if need.status not in [NeedStatus.ACTIVE, NeedStatus.PARTIALLY_FULFILLED]:
                continue

            is_elig, rejections, dist_km, eta_mins = check_eligibility(donation, need, current_time=now)
            allocatable_qty = min(donation.remaining_kg, need.remaining_needed_kg, need.available_capacity_kg)

            if is_elig:
                breakdown = calculate_rescue_priority_score(
                    donation=donation,
                    need=need,
                    distance_km=dist_km,
                    eta_minutes=eta_mins,
                    current_time=now,
                    weights=cfg.matching_weights,
                )
                proposal = MatchProposal(
                    donation_id=donation.id,
                    need_id=need.id,
                    ngo_id=need.ngo_id,
                    ngo_name=need.ngo_name,
                    donor_id=donation.donor_id,
                    donor_name=donation.donor_name,
                    eligible=True,
                    rejection_reasons=[],
                    score=breakdown.score,
                    breakdown=breakdown,
                    distance_km=dist_km,
                    estimated_eta_minutes=eta_mins,
                    allocatable_quantity_kg=allocatable_qty,
                )
            else:
                proposal = MatchProposal(
                    donation_id=donation.id,
                    need_id=need.id,
                    ngo_id=need.ngo_id,
                    ngo_name=need.ngo_name,
                    donor_id=donation.donor_id,
                    donor_name=donation.donor_name,
                    eligible=False,
                    rejection_reasons=rejections,
                    score=0,
                    breakdown=None,
                    distance_km=dist_km,
                    estimated_eta_minutes=eta_mins,
                    allocatable_quantity_kg=0.0,
                )
            proposals.append(proposal)

    # Sort proposals: eligible first, then by Rescue Priority Score descending
    proposals.sort(key=lambda p: (1 if p.eligible else 0, p.score or 0), reverse=True)
    return proposals


class ReserveRequest(BaseModel):
    donation_id: str
    need_id: str
    requested_quantity_kg: float


@app.post("/api/matching/reserve")
def reserve_food_endpoint(req: ReserveRequest):
    donation = donations_db.get(req.donation_id)
    need = needs_db.get(req.need_id)
    if not donation or not need:
        raise HTTPException(status_code=404, detail="Donation or Need not found.")

    success, reservation, message = allocation_mgr.reserve_food(
        donation=donation,
        need=need,
        requested_quantity_kg=req.requested_quantity_kg,
    )
    if not success:
        raise HTTPException(status_code=400, detail=message)

    log_audit_event("FOOD_RESERVED", need.ngo_id, "NGO", {
        "reservation_id": reservation.id,
        "donation_id": donation.id,
        "quantity_kg": reservation.reserved_quantity_kg,
    })
    return {"message": message, "reservation": reservation}


class ConfirmAllocationRequest(BaseModel):
    donation_id: str
    need_id: str
    reservation_id: str


@app.post("/api/matching/confirm-allocation")
def confirm_allocation_endpoint(req: ConfirmAllocationRequest):
    donation = donations_db.get(req.donation_id)
    need = needs_db.get(req.need_id)
    if not donation or not need:
        raise HTTPException(status_code=404, detail="Donation or Need not found.")

    success, allocation, message = allocation_mgr.confirm_allocation(
        donation=donation,
        need=need,
        reservation_id=req.reservation_id,
    )
    if not success:
        raise HTTPException(status_code=400, detail=message)

    # Automatically create delivery job for this confirmed allocation!
    vehicle_class = recommend_vehicle_class(allocation.allocated_quantity_kg)
    ordered_ids, total_dist, total_mins = optimize_multi_stop_route(
        donation.pickup_location,
        [(need.id, need.receiving_location)]
    )
    quote = calculate_fare(
        vehicle_class=vehicle_class,
        distance_km=total_dist,
        duration_minutes=total_mins,
        stop_count=1,
    )

    # Generate Pickup OTP and Delivery OTP securely
    job_id = f"JOB-{uuid.uuid4().hex[:8].upper()}"
    plain_pickup_otp, pickup_otp_hash = otp_service.generate_otp(f"pickup-{job_id}")
    plain_delivery_otp, delivery_otp_hash = otp_service.generate_otp(f"delivery-{job_id}-stop-1")

    stop = DeliveryStop(
        stop_number=1,
        need_id=need.id,
        ngo_id=need.ngo_id,
        ngo_name=need.ngo_name,
        location=need.receiving_location,
        quantity_kg=allocation.allocated_quantity_kg,
        delivery_otp_hash=delivery_otp_hash,
    )

    delivery_job = DeliveryJob(
        id=job_id,
        donation_id=donation.id,
        donor_id=donation.donor_id,
        donor_name=donation.donor_name,
        pickup_location=donation.pickup_location,
        pickup_seal_id=donation.seal_id or "AS-SEAL-VERIFIED",
        pickup_otp_hash=pickup_otp_hash,
        required_vehicle_class=vehicle_class,
        total_quantity_kg=allocation.allocated_quantity_kg,
        stops=[stop],
        fare_quote=quote,
        status=JobStatus.AVAILABLE,
    )
    jobs_db[job_id] = delivery_job
    driver_service.jobs[job_id] = delivery_job

    # Reserve estimated logistics funds in NGO wallet
    finance_service.reserve_funds_for_job(need.ngo_id, job_id, quote.ngo_total)

    log_audit_event("ALLOCATION_CONFIRMED", need.ngo_id, "NGO", {
        "allocation_id": allocation.id,
        "job_id": job_id,
        "quantity_kg": allocation.allocated_quantity_kg,
        "plain_pickup_otp": plain_pickup_otp,  # Stored only in event for donor UI display
        "plain_delivery_otp": plain_delivery_otp,  # Stored for NGO UI display
    })

    return {
        "message": message,
        "allocation": allocation,
        "delivery_job": delivery_job,
        "donor_pickup_otp": plain_pickup_otp,
        "ngo_delivery_otp": plain_delivery_otp,
    }


# -------------------------------------------------------------
# DELIVERY MARKETPLACE ENDPOINTS
# -------------------------------------------------------------

@app.get("/api/delivery/jobs")
def list_delivery_jobs(driver_id: Optional[str] = None, status_filter: Optional[str] = None):
    jobs = list(jobs_db.values())
    if driver_id:
        jobs = [j for j in jobs if j.driver_id == driver_id]
    if status_filter:
        jobs = [j for j in jobs if j.status.value == status_filter.upper()]
    return jobs


@app.post("/api/delivery/jobs/{job_id}/accept")
def accept_delivery_job(job_id: str, payload: Dict[str, str]):
    driver_id = payload.get("driver_id")
    if not driver_id:
        raise HTTPException(status_code=400, detail="driver_id is required.")

    # Concurrency-safe atomic first-accept-wins check
    success, job, message = driver_service.atomic_accept_job(job_id, driver_id)
    if not success:
        raise HTTPException(status_code=409, detail=message)

    # Keep local jobs_db synchronized
    jobs_db[job_id] = job

    log_audit_event("JOB_ACCEPTED", driver_id, "DRIVER", {"job_id": job_id})
    return {"message": message, "job": job}


class PickupHandoffRequest(BaseModel):
    driver_id: str
    driver_lat: float
    driver_lon: float
    entered_otp: str
    seal_id: str
    photo_url: str = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"


@app.post("/api/delivery/jobs/{job_id}/pickup-handoff")
def complete_pickup_handoff(job_id: str, req: PickupHandoffRequest):
    job = jobs_db.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")

    if job.status not in [JobStatus.ACCEPTED, JobStatus.ARRIVING_PICKUP]:
        raise HTTPException(status_code=400, detail=f"Cannot pickup job in status {job.status.value}.")

    # 1. Verify Driver Pickup OTP against secure hashed record
    otp_ok, otp_msg = otp_service.verify_otp(f"pickup-{job_id}", req.entered_otp)
    if not otp_ok:
        raise HTTPException(status_code=400, detail=f"Pickup OTP failed: {otp_msg}")

    # 2. Record Trust Chain Handoff Evidence + GPS Proximity
    evidence = trust_chain.record_pickup_evidence(
        job_id=job_id,
        driver_id=req.driver_id,
        driver_lat=req.driver_lat,
        driver_lon=req.driver_lon,
        pickup_location=job.pickup_location,
        seal_id=req.seal_id,
        photo_url=req.photo_url,
        otp_verified=True,
    )

    # 3. Transition Job state to IN_TRANSIT
    job.status = JobStatus.IN_TRANSIT
    job.picked_up_at = datetime.utcnow()
    job.pickup_seal_id = req.seal_id
    job.pickup_evidence_url = req.photo_url

    # Update donation state
    if job.donation_id in donations_db:
        donations_db[job.donation_id].status = DonationStatus.PICKED_UP

    log_audit_event("PICKUP_VERIFIED", req.driver_id, "DRIVER", {
        "job_id": job_id,
        "seal_id": req.seal_id,
        "geofence_passed": evidence.geofence_passed,
    })

    return {
        "message": "Pickup handoff successfully verified. Goods are in transit.",
        "job": job,
        "evidence": evidence,
    }


class DeliveryHandoffRequest(BaseModel):
    driver_id: str
    driver_lat: float
    driver_lon: float
    entered_otp: str
    seal_id: str
    photo_url: str = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"


@app.post("/api/delivery/jobs/{job_id}/delivery-handoff")
async def complete_delivery_handoff(job_id: str, req: DeliveryHandoffRequest):
    job = jobs_db.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")

    if job.status != JobStatus.IN_TRANSIT:
        raise HTTPException(status_code=400, detail=f"Cannot deliver job in status {job.status.value}.")

    # 1. Verify NGO Delivery OTP
    otp_ok, otp_msg = otp_service.verify_otp(f"delivery-{job_id}-stop-1", req.entered_otp)
    if not otp_ok:
        raise HTTPException(status_code=400, detail=f"Delivery OTP failed: {otp_msg}")

    stop = job.stops[0]
    # 2. Record Trust Chain Evidence + GPS proximity
    evidence = trust_chain.record_delivery_evidence(
        job_id=job_id,
        driver_id=req.driver_id,
        driver_lat=req.driver_lat,
        driver_lon=req.driver_lon,
        delivery_location=stop.location,
        seal_id=req.seal_id,
        photo_url=req.photo_url,
        otp_verified=True,
    )

    # 3. AI Food Package Integrity Verification (Groq Vision or safe fallback)
    pickup_img = job.pickup_evidence_url or req.photo_url
    ai_check = await ai_adapter.compare_integrity_images(pickup_img, req.photo_url, req.seal_id)

    job.status = JobStatus.DELIVERED
    job.delivered_at = datetime.utcnow()
    job.delivery_evidence_url = req.photo_url
    job.integrity_verdict = IntegrityVerdict(ai_check["verdict"])
    job.integrity_reason = ai_check["reason"]

    stop.status = "DELIVERED"
    stop.delivered_at = datetime.utcnow()

    # Update donation state
    if job.donation_id in donations_db:
        donations_db[job.donation_id].status = DonationStatus.DELIVERED

    # 4. Financial Settlement (Release Reserve -> Post Charge -> Driver Payout -> 12% Platform Fee)
    fin_ok, fin_msg = finance_service.settle_delivery(
        job_id=job_id,
        ngo_id=stop.ngo_id,
        driver_id=req.driver_id,
        fare_quote=job.fare_quote,
    )

    # 5. Driver Milestones & Stats
    if req.driver_id in driver_service.drivers:
        drv = driver_service.drivers[req.driver_id]
        drv.completed_deliveries += 1
        drv.total_earnings += job.fare_quote.driver_payout
        drv.is_available = True

    # 6. Generate Measurable Impact Record
    impact = calculate_impact_for_rescue(
        job_id=job_id,
        donation_id=job.donation_id,
        donor_id=job.donor_id,
        donor_name=job.donor_name,
        ngo_id=stop.ngo_id,
        ngo_name=stop.ngo_name,
        driver_id=req.driver_id,
        driver_name=job.driver_name or "Verified Partner",
        food_category=donations_db.get(job.donation_id, {}).food_category.value if job.donation_id in donations_db else "GRAINS_RICE",
        quantity_kg=job.total_quantity_kg,
    )
    impact_records_db.append(impact)

    log_audit_event("DELIVERY_COMPLETED", req.driver_id, "DRIVER", {
        "job_id": job_id,
        "impact_id": impact.id,
        "settlement": fin_msg,
        "integrity": ai_check,
    })

    return {
        "message": "Delivery completed and verified! Financial settlement and impact record committed.",
        "job": job,
        "impact": impact,
        "settlement_status": fin_msg,
        "ai_integrity": ai_check,
    }


# -------------------------------------------------------------
# FINANCE & WALLET ENDPOINTS
# -------------------------------------------------------------

@app.get("/api/finance/wallets")
def list_wallets():
    return list(finance_service.wallets.values())


@app.get("/api/finance/wallets/{owner_id}")
def get_user_wallet(owner_id: str):
    wallet = finance_service.get_wallet_by_owner(owner_id)
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found.")
    return wallet


@app.get("/api/finance/ledger")
def get_financial_ledger(wallet_id: Optional[str] = None):
    ledger = finance_service.ledger
    if wallet_id:
        ledger = [e for e in ledger if e.wallet_id == wallet_id]
    return sorted(ledger, key=lambda x: x.created_at, reverse=True)


@app.post("/api/finance/wallet/topup")
def topup_wallet(payload: Dict[str, Any]):
    owner_id = payload.get("owner_id")
    amount = float(payload.get("amount", 2000.0))
    wallet = finance_service.get_wallet_by_owner(owner_id)
    if not wallet:
        raise HTTPException(status_code=404, detail="Wallet not found.")

    wallet.available_balance = round(wallet.available_balance + amount, 2)
    wallet.updated_at = datetime.utcnow()
    finance_service._append_entry(
        wallet=wallet,
        entry_type="WALLET_TOPUP",
        amount=amount,
        ref_job_id=None,
        desc=f"Sandbox simulated top-up: ₹{amount} added."
    )
    return {"message": f"Successfully credited ₹{amount} to {wallet.owner_name} wallet.", "wallet": wallet}


# -------------------------------------------------------------
# IMPACT & DOCUMENTATION ENDPOINTS
# -------------------------------------------------------------

@app.get("/api/impact/summary")
def get_impact_summary() -> ImpactSummary:
    total_kg = sum(r.quantity_kg for r in impact_records_db)
    total_meals = sum(r.meals_supported_estimate for r in impact_records_db)
    total_co2 = round(sum(r.co2e_prevented_kg_estimate for r in impact_records_db), 2)
    total_water = round(sum(r.water_conserved_liters_estimate for r in impact_records_db), 1)

    return ImpactSummary(
        total_rescued_kg=round(total_kg, 2),
        total_meals_supported=total_meals,
        total_co2e_prevented_kg=total_co2,
        total_water_conserved_liters=total_water,
        total_rescues_completed=len(impact_records_db),
        active_donors_count=len([u for u in users_db.values() if u.get("role") == "DONOR"]),
        active_ngos_count=len([u for u in users_db.values() if u.get("role") == "NGO"]),
    )


@app.get("/api/impact/records")
def list_impact_records(donor_id: Optional[str] = None, ngo_id: Optional[str] = None):
    records = impact_records_db
    if donor_id:
        records = [r for r in records if r.donor_id == donor_id]
    if ngo_id:
        records = [r for r in records if r.ngo_id == ngo_id]
    return sorted(records, key=lambda x: x.timestamp, reverse=True)


@app.get("/api/impact/certificate/{job_id}")
def generate_sustainability_certificate(job_id: str):
    record = next((r for r in impact_records_db if r.job_id == job_id), None)
    if not record:
        raise HTTPException(status_code=404, detail="Impact record for this job not found.")

    return {
        "certificate_id": f"CERT-AS-{record.job_id[-6:]}",
        "title": "ANNASETU Verified Impact Reporting & Sustainability Documentation",
        "description": "Factual operational evidence and sustainability documentation to support applicable CSR and ESG reporting.",
        "donor_organization": record.donor_name,
        "ngo_beneficiary": record.ngo_name,
        "rescued_quantity_kg": record.quantity_kg,
        "meals_supported": record.meals_supported_estimate,
        "co2e_avoided_kg": record.co2e_prevented_kg_estimate,
        "water_conserved_liters": record.water_conserved_liters_estimate,
        "delivery_completed_at": record.timestamp.strftime("%d %B %Y, %H:%M UTC"),
        "verification_hash": f"SHA256:{uuid.uuid4().hex}",
        "disclaimer": record.disclaimer,
    }


# -------------------------------------------------------------
# READ-ONLY AI COPILOT
# -------------------------------------------------------------

@app.post("/api/copilot/query")
async def ask_copilot(payload: Dict[str, Any]):
    query = payload.get("query", "")
    user_role = payload.get("role", "DONOR")

    # Assemble contextual read-only operational snapshot
    context_data = {
        "total_rescued_kg": sum(r.quantity_kg for r in impact_records_db),
        "total_meals_supported": sum(r.meals_supported_estimate for r in impact_records_db),
        "active_donations_count": len([d for d in donations_db.values() if d.status == DonationStatus.POSTED]),
        "active_needs_count": len([n for n in needs_db.values() if n.status == NeedStatus.ACTIVE]),
        "active_jobs_count": len([j for j in jobs_db.values() if j.status in [JobStatus.AVAILABLE, JobStatus.ACCEPTED, JobStatus.IN_TRANSIT]]),
    }
    answer = await ai_adapter.copilot_answer(query, context_data, user_role)
    return {"query": query, "answer": answer}


@app.get("/api/audit-logs")
def get_audit_logs():
    return sorted(audit_log_db, key=lambda x: x["timestamp"], reverse=True)


# Mount frontend production build if available
import os
from fastapi.staticfiles import StaticFiles

web_dist_dir = os.path.join(os.path.dirname(__file__), "..", "web", "dist")
if os.path.exists(web_dist_dir):
    app.mount("/", StaticFiles(directory=web_dist_dir, html=True), name="static-web")

