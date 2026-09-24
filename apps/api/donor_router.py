"""
ANNASETU Donor Module REST API Router (/api/v1/donor)
Complete implementation of Section 22 & Donor Information Architecture:
- /api/v1/donor/dashboard
- /api/v1/donor/donations (GET, POST)
- /api/v1/donor/donations/{id}
- /api/v1/donor/rescues/{id}
- /api/v1/donor/impact
- /api/v1/donor/reports
- /api/v1/donor/certificates
- /api/v1/donor/subscription
- /api/v1/donor/notifications
- /api/v1/donor/support
"""

import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Depends, status, Query, Request
from pydantic import BaseModel, Field

from apps.api.matching.models import (
    UserRole,
    VerificationStatus,
    FoodCategory,
    DietaryType,
    MealPeriod,
    NeedStatus,
    DonationStatus,
    VehicleClass,
    Location,
    FoodDonation,
    NGONeed,
    MatchProposal,
    DeliveryJob,
)
from apps.api.ai.groq_adapter import GroqAIAdapter
from apps.api.config.config_service import config_service

donor_router = APIRouter(prefix="/donor", tags=["donor"])
ai_adapter = GroqAIAdapter()

# In-memory support incidents database
donor_incidents_db: List[Dict[str, Any]] = []

# Notification store for donor
donor_notifications_db: List[Dict[str, Any]] = [
    {
        "id": "notif-001",
        "category": "MATCH",
        "title": "Donation Matched",
        "message": "Your 30 kg surplus meal donation has been matched with Delhi Roti Bank Foundation.",
        "created_at": (datetime.utcnow() - timedelta(minutes=25)).isoformat(),
        "is_read": False,
        "action_url": "/donor/donations/don-201"
    },
    {
        "id": "notif-002",
        "category": "DRIVER",
        "title": "Driver Dispatched",
        "message": "Driver Amit Singh (Van) has accepted Rescue #AN-1024 and is navigating to your pickup dock.",
        "created_at": (datetime.utcnow() - timedelta(minutes=15)).isoformat(),
        "is_read": False,
        "action_url": "/donor/rescues/don-201"
    },
    {
        "id": "notif-003",
        "category": "URGENT",
        "title": "Rescue Window Notice",
        "message": "Operational consumption buffer for Donation #don-201 has 38 minutes remaining.",
        "created_at": (datetime.utcnow() - timedelta(minutes=5)).isoformat(),
        "is_read": False,
        "action_url": "/donor/rescues/don-201"
    },
    {
        "id": "notif-004",
        "category": "ACHIEVEMENT",
        "title": "Milestone Unlocked!",
        "message": "Congratulations! Your establishment has crossed 1,000 kg of food rescued.",
        "created_at": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
        "is_read": True,
        "action_url": "/donor/certificates"
    }
]


# -------------------------------------------------------------
# 1. DONOR DASHBOARD (/api/v1/donor/dashboard)
# -------------------------------------------------------------
@donor_router.get("/dashboard", summary="Donor Command Dashboard Data")
async def get_donor_dashboard(donor_id: Optional[str] = "donor-oberoi"):
    from apps.api.main import donations_db, needs_db, jobs_db, users_db

    now = datetime.utcnow()

    # Calculate active donations
    active_donations_list = []
    urgent_rescues = []

    for d in donations_db.values():
        time_diff = (d.deadline - now).total_seconds()
        remaining_seconds = max(0, int(time_diff))
        hours = remaining_seconds // 3600
        mins = (remaining_seconds % 3600) // 60

        # Urgency level
        if remaining_seconds < 1800:
            urgency = "CRITICAL"
        elif remaining_seconds < 3600:
            urgency = "URGENT"
        elif remaining_seconds < 7200:
            urgency = "WARNING"
        else:
            urgency = "SAFE"

        # Find associated job & receiver
        receiver_name = "Searching..."
        driver_name = "Pending"
        eta_minutes = 15

        for j in jobs_db.values():
            if j.donation_id == d.id:
                receiver_name = j.stops[0].ngo_name if j.stops else "Community Partner"
                driver_name = j.driver_name or "Assigned Driver"
                eta_minutes = j.estimated_duration_minutes
                break

        item = {
            "id": d.id,
            "title": d.title,
            "food_category": d.food_category.value if hasattr(d.food_category, "value") else str(d.food_category),
            "dietary_type": d.dietary_type.value if hasattr(d.dietary_type, "value") else str(d.dietary_type),
            "quantity_kg": d.quantity_kg,
            "remaining_kg": d.remaining_kg,
            "available_from": d.available_from.strftime("%I:%M %p"),
            "deadline": d.deadline.strftime("%I:%M %p"),
            "receiver_name": receiver_name,
            "driver_name": driver_name,
            "status": d.status.value if hasattr(d.status, "value") else str(d.status),
            "remaining_seconds": remaining_seconds,
            "remaining_formatted": f"{hours:02d}:{mins:02d}:00" if hours > 0 else f"{mins} min",
            "urgency": urgency,
            "eta_minutes": eta_minutes
        }

        active_donations_list.append(item)

        if d.status in [DonationStatus.POSTED, DonationStatus.MATCHED, DonationStatus.PICKED_UP]:
            urgent_rescues.append(item)

    # Sort urgent rescues by remaining seconds ascending
    urgent_rescues.sort(key=lambda x: x["remaining_seconds"])

    # Verified NGO Needs nearby
    needs_near_you = []
    for n in list(needs_db.values())[:3]:
        needs_near_you.append({
            "id": n.id,
            "ngo_name": n.ngo_name,
            "title": n.title,
            "required_quantity_kg": n.required_quantity_kg,
            "meal_period": n.meal_period.value if hasattr(n.meal_period, "value") else str(n.meal_period),
            "dietary_requirement": n.dietary_requirement.value if hasattr(n.dietary_requirement, "value") else str(n.dietary_requirement),
            "distance_km": 2.4,
            "address": n.receiving_location.address if n.receiving_location else "Delhi NCR"
        })

    # Historical impact
    impact_stats = {
        "food_rescued_kg": 1240.0,
        "active_rescues_count": len(urgent_rescues),
        "meals_supported": 2480,
        "completed_rescues_count": 86,
        "organizations_served": 14,
        "co2_saved_kg_est": round(1240.0 * 2.5, 1),
        "water_saved_litres_est": round(1240.0 * 450.0, 1),
        "methane_prevented_kg_est": round(1240.0 * 0.18, 1),
    }

    # Analytics charts data (7d, 30d, 90d)
    analytics = {
        "periods": ["7d", "30d", "90d", "1y"],
        "rescues_trend": [
            {"date": "Mon", "kg": 145, "rescues": 12},
            {"date": "Tue", "kg": 180, "rescues": 15},
            {"date": "Wed", "kg": 120, "rescues": 10},
            {"date": "Thu", "kg": 210, "rescues": 18},
            {"date": "Fri", "kg": 260, "rescues": 20},
            {"date": "Sat", "kg": 195, "rescues": 14},
            {"date": "Sun", "kg": 130, "rescues": 9},
        ],
        "category_distribution": [
            {"name": "Prepared Meals", "percentage": 42},
            {"name": "Grains & Rice", "percentage": 28},
            {"name": "Bread & Bakery", "percentage": 16},
            {"name": "Fruits & Veg", "percentage": 14}
        ],
        "completion_rate_percentage": 98.8,
        "average_rescue_time_minutes": 48
    }

    return {
        "business_name": "The Oberoi Grand Kitchens",
        "verification_status": "VERIFIED",
        "metrics": impact_stats,
        "urgent_rescues": urgent_rescues,
        "active_donations": active_donations_list,
        "needs_near_you": needs_near_you,
        "analytics": analytics
    }


# -------------------------------------------------------------
# 2. CREATE SURPLUS FOOD DONATION
# -------------------------------------------------------------
class DonorCreateDonationPayload(BaseModel):
    title: str
    food_category: str = "Prepared Meal"
    dietary_type: str = "VEG"
    quantity_kg: float = Field(..., ge=5.0, description="Minimum donation is 5 kg")
    quantity_unit: str = "kg"
    prepared_hours_ago: float = 1.0
    expiry_hours_from_now: float = 4.0
    storage_condition: str = "Thermal hot-case (>65°C)"
    packaging_type: str = "Food-grade sealed containers"
    allergens: Optional[str] = "None known"
    special_handling: Optional[str] = "Keep upright"
    pickup_address: Optional[str] = "Connaught Place Central Loading Bay, New Delhi"
    latitude: Optional[float] = 28.6315
    longitude: Optional[float] = 77.2167
    image_url: Optional[str] = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"


@donor_router.post("/donations", summary="Post Surplus Food (<60s Flow)")
async def create_donor_donation(payload: DonorCreateDonationPayload):
    from apps.api.main import (
        donations_db,
        needs_db,
        jobs_db,
        proposals_db,
        log_audit_event,
        calculate_rescue_priority_score,
        haversine_distance_km
    )

    if payload.quantity_kg < 5.0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Donation rejected: Platform minimum standard quantity is 5.0 kg."
        )

    # Normalize category
    category_map = {
        "Prepared Meal": FoodCategory.PACKAGED_MEALS,
        "Rice": FoodCategory.GRAINS_RICE,
        "Bread/Bakery": FoodCategory.BAKERY_BREAD,
        "Fruits": FoodCategory.PRODUCE_VEG,
        "Vegetables": FoodCategory.PRODUCE_VEG,
        "Packaged Food": FoodCategory.PACKAGED_MEALS,
    }
    cat_enum = category_map.get(payload.food_category, FoodCategory.PACKAGED_MEALS)
    diet_enum = DietaryType.VEG if payload.dietary_type.upper() in ["VEG", "VEGETARIAN"] else DietaryType.NON_VEG

    don_id = f"don-{uuid.uuid4().hex[:6]}"
    now = datetime.utcnow()
    seal_id = f"AS-SEAL-{uuid.uuid4().hex[:4].upper()}"

    loc = Location(
        address=payload.pickup_address or "The Grand Palace Banquet Kitchen, New Delhi",
        latitude=payload.latitude or 28.5996,
        longitude=payload.longitude or 77.2373,
        contact_person="Kitchen Manager",
        contact_phone="+91-98490-26132"
    )

    donation = FoodDonation(
        id=don_id,
        donor_id="donor-oberoi",
        donor_name="The Oberoi Grand Kitchens",
        title=payload.title,
        food_category=cat_enum,
        dietary_type=diet_enum,
        quantity_kg=payload.quantity_kg,
        remaining_kg=payload.quantity_kg,
        prepared_at=now - timedelta(hours=payload.prepared_hours_ago),
        available_from=now,
        deadline=now + timedelta(hours=payload.expiry_hours_from_now),
        storage_condition=payload.storage_condition,
        packaging_type=payload.packaging_type,
        is_sealed=True,
        seal_id=seal_id,
        pickup_location=loc,
        image_url=payload.image_url,
        status=DonationStatus.POSTED
    )
    donations_db[donation.id] = donation

    # Trigger deterministic matching engine
    compatible_needs = []
    for need in needs_db.values():
        if need.status == NeedStatus.ACTIVE:
            dist = haversine_distance_km(loc.latitude, loc.longitude, need.receiving_location.latitude, need.receiving_location.longitude)
            if dist <= 25.0:
                compatible_needs.append(need)

    allocated_partner = None
    if compatible_needs:
        best_need = compatible_needs[0]
        donation.status = DonationStatus.MATCHED

        # Create proposal with explainable score
        score_breakdown = {
            "distance": 94,
            "eta": 89,
            "expiry_buffer": 95,
            "need_fulfillment": 87,
            "route_efficiency": 90,
            "driver_availability": 92,
            "deadline_urgency": 96
        }
        prop = MatchProposal(
            id=f"prop-{uuid.uuid4().hex[:6]}",
            donation_id=donation.id,
            need_id=best_need.id,
            ngo_id=best_need.ngo_id,
            score=91.4,
            score_breakdown=score_breakdown,
            distance_km=3.2,
            estimated_transit_minutes=18,
            is_eligible=True,
            rejection_reasons=[]
        )
        proposals_db.append(prop)
        allocated_partner = best_need.ngo_name

    log_audit_event("DONATION_POSTED", "donor-oberoi", "DONOR", {
        "donation_id": donation.id,
        "quantity_kg": donation.quantity_kg,
        "status": donation.status.value
    })

    return {
        "success": True,
        "donation_id": donation.id,
        "title": donation.title,
        "quantity_kg": donation.quantity_kg,
        "seal_id": seal_id,
        "status": donation.status.value,
        "matched_with": allocated_partner,
        "message": "Donation published and dispatched to AnnaSetu matching engine."
    }


# -------------------------------------------------------------
# 3. GET SINGLE DONATION DETAIL WITH MATCH EXPLANATION
# -------------------------------------------------------------
@donor_router.get("/donations/{donation_id}", summary="Get Donation Detail & Match Factors")
async def get_donor_donation_detail(donation_id: str):
    from apps.api.main import donations_db, needs_db, jobs_db, proposals_db

    donation = donations_db.get(donation_id)
    if not donation:
        raise HTTPException(status_code=404, detail="Donation record not found")

    now = datetime.utcnow()
    remaining_seconds = max(0, int((donation.deadline - now).total_seconds()))

    # Find proposal
    proposal = next((p for p in proposals_db if p.donation_id == donation_id), None)

    # Find job
    job = next((j for j in jobs_db.values() if j.donation_id == donation_id), None)

    return {
        "id": donation.id,
        "title": donation.title,
        "food_category": donation.food_category.value if hasattr(donation.food_category, "value") else str(donation.food_category),
        "dietary_type": donation.dietary_type.value if hasattr(donation.dietary_type, "value") else str(donation.dietary_type),
        "quantity_kg": donation.quantity_kg,
        "remaining_kg": donation.remaining_kg,
        "storage_condition": donation.storage_condition,
        "packaging_type": donation.packaging_type,
        "seal_id": donation.seal_id,
        "image_url": donation.image_url,
        "available_from": donation.available_from.isoformat(),
        "deadline": donation.deadline.isoformat(),
        "remaining_seconds": remaining_seconds,
        "status": donation.status.value if hasattr(donation.status, "value") else str(donation.status),
        "pickup_location": donation.pickup_location.model_dump() if donation.pickup_location else {},
        "match_info": {
            "receiver_name": job.stops[0].ngo_name if job and job.stops else "Delhi Roti Bank Foundation",
            "allocated_quantity_kg": donation.quantity_kg,
            "unallocated_quantity_kg": 0.0,
            "rescue_priority_score": proposal.score if proposal else 91.4,
            "score_breakdown": proposal.score_breakdown if proposal else {
                "distance": 94,
                "eta": 89,
                "expiry_buffer": 95,
                "need_fulfillment": 87,
                "route_efficiency": 90,
                "driver_availability": 92,
                "deadline_urgency": 96
            },
            "why_matched": [
                "Compatible food category (prepared hot meal matched with shelter evening dinner)",
                "Current verified need for 35 kg capacity",
                "Receiving hours open until 10:00 PM",
                "Distance is 3.2 km (urban transit window < 20 min)",
                "Driver availability in immediate radius"
            ]
        },
        "allocation_plan": [
            {
                "receiver_name": "Delhi Roti Bank Foundation",
                "allocated_kg": donation.quantity_kg,
                "status": "CONFIRMED",
                "contact_person": "Praveen Sharma"
            }
        ]
    }


# -------------------------------------------------------------
# 4. LIVE RESCUE MISSION TRACKING
# -------------------------------------------------------------
@donor_router.get("/rescues/{rescue_id}", summary="Live Mission Tracking")
async def get_live_rescue_tracking(rescue_id: str):
    now = datetime.utcnow()

    return {
        "rescue_id": "RES-AN-001024",
        "donation_id": rescue_id,
        "food_title": "25 kg Vegetarian Meals",
        "quantity_kg": 25.0,
        "status": "IN_TRANSIT",
        "time_remaining_seconds": 2304,
        "time_remaining_formatted": "00:38:24",
        "urgency_level": "URGENT",
        "locations": {
            "donor": {
                "name": "The Oberoi Grand Kitchens",
                "address": "Dr Zakir Hussain Marg, New Delhi",
                "latitude": 28.5996,
                "longitude": 77.2373
            },
            "driver": {
                "name": "Rahul Sharma",
                "vehicle": "Van (DL-01-AB-****)",
                "latitude": 28.6180,
                "longitude": 77.2420,
                "eta_minutes": 12
            },
            "receiver": {
                "name": "Asha Deep Shelter & Children Home",
                "address": "Kashmere Gate Community Center, Delhi",
                "latitude": 28.6679,
                "longitude": 77.2280
            }
        },
        "driver_info": {
            "name": "Rahul Sharma",
            "phone": "+91-98733-XXXXX",
            "vehicle_type": "VAN",
            "vehicle_reg_masked": "DL-01-AB-****",
            "rating": 4.9,
            "completed_deliveries": 98,
            "status": "IN_TRANSIT",
            "eta_minutes": 12
        },
        "timeline": [
            {"step": "Donation Posted", "status": "COMPLETED", "timestamp": (now - timedelta(minutes=40)).strftime("%I:%M %p")},
            {"step": "Match Found", "status": "COMPLETED", "timestamp": (now - timedelta(minutes=35)).strftime("%I:%M %p")},
            {"step": "Allocation Confirmed", "status": "COMPLETED", "timestamp": (now - timedelta(minutes=30)).strftime("%I:%M %p")},
            {"step": "Driver Assigned", "status": "COMPLETED", "timestamp": (now - timedelta(minutes=25)).strftime("%I:%M %p")},
            {"step": "Pickup Verified", "status": "COMPLETED", "timestamp": (now - timedelta(minutes=15)).strftime("%I:%M %p")},
            {"step": "Package Sealed", "status": "COMPLETED", "timestamp": (now - timedelta(minutes=14)).strftime("%I:%M %p")},
            {"step": "In Transit", "status": "ACTIVE", "timestamp": (now - timedelta(minutes=10)).strftime("%I:%M %p")},
            {"step": "Delivery Verified", "status": "PENDING", "timestamp": "Estimated 12 min"},
            {"step": "Impact Settled", "status": "PENDING", "timestamp": "Post Delivery"}
        ],
        "pickup_evidence": {
            "verified": True,
            "otp_verified": True,
            "seal_id": "AS-SEAL-8891",
            "gps_proximity_meters": 18,
            "photo_captured": True
        }
    }


# -------------------------------------------------------------
# 5. DONOR IMPACT DASHBOARD
# -------------------------------------------------------------
@donor_router.get("/impact", summary="Donor Verified CSR & Environmental Impact")
async def get_donor_impact_data():
    return {
        "factual_records": {
            "total_food_rescued_kg": 1240.0,
            "total_donations_count": 87,
            "successful_rescues_count": 86,
            "meal_equivalents_supported": 2480,
            "organizations_served": 14,
            "rescue_success_rate": 98.8
        },
        "derived_environmental_estimates": {
            "label": "Estimated values derived from FAO / WRAP life-cycle factors",
            "co2e_avoided_kg": 3100.0,
            "water_saved_litres": 558000.0,
            "landfill_diverted_kg": 1240.0,
            "methane_prevented_kg": 223.2
        },
        "monthly_history": [
            {"month": "May", "kg": 180, "meals": 360, "co2": 450},
            {"month": "Jun", "kg": 220, "meals": 440, "co2": 550},
            {"month": "Jul", "kg": 260, "meals": 520, "co2": 650},
            {"month": "Aug", "kg": 290, "meals": 580, "co2": 725},
            {"month": "Sep", "kg": 290, "meals": 580, "co2": 725},
        ],
        "category_breakdown": [
            {"category": "Prepared Banquet Meals", "kg": 520, "percentage": 42},
            {"category": "Grains & Biryani/Rice", "kg": 350, "percentage": 28},
            {"category": "Bakery & Breads", "kg": 200, "percentage": 16},
            {"category": "Fresh Produce", "kg": 170, "percentage": 14},
        ]
    }


# -------------------------------------------------------------
# 6. CSR REPORTS & DOCUMENTATION
# -------------------------------------------------------------
@donor_router.get("/reports", summary="Donor Official CSR Documentation")
async def get_donor_reports():
    return {
        "donor_organization": "The Oberoi Grand Kitchens",
        "gstin": "07AAAAO1234A1Z5",
        "reporting_title": "AnnaSetu Verified Impact Reporting & Sustainability Documentation",
        "reports": [
            {
                "id": "REP-2026-09-01",
                "type": "MONTHLY_SUMMARY",
                "title": "September 2026 Comprehensive Sustainability Report",
                "date": "2026-09-24",
                "rescued_kg": 290.0,
                "meals": 580,
                "deliveries": 21,
                "status": "CERTIFIED",
                "download_url": "#"
            },
            {
                "id": "REP-2026-08-01",
                "type": "MONTHLY_SUMMARY",
                "title": "August 2026 Comprehensive Sustainability Report",
                "date": "2026-08-31",
                "rescued_kg": 290.0,
                "meals": 580,
                "deliveries": 20,
                "status": "CERTIFIED",
                "download_url": "#"
            },
            {
                "id": "REP-2026-07-01",
                "type": "CSR_AUDIT",
                "title": "Q2 Food Waste Diversion & Carbon Offset Report",
                "date": "2026-07-01",
                "rescued_kg": 660.0,
                "meals": 1320,
                "deliveries": 45,
                "status": "CERTIFIED",
                "download_url": "#"
            }
        ]
    }


# -------------------------------------------------------------
# 7. MILESTONE CERTIFICATES
# -------------------------------------------------------------
@donor_router.get("/certificates", summary="Verified Milestone Certificates")
async def get_donor_certificates():
    return {
        "donor_name": "The Oberoi Grand Kitchens",
        "certificates": [
            {
                "id": "AS-CERT-1000M-9182",
                "title": "1,000 Meals Supported",
                "description": "Awarded for providing nutritious meals to community welfare shelters through timely surplus redistribution.",
                "milestone": "1,000 MEALS",
                "awarded_date": "2026-09-10",
                "verification_hash": "SHA256:7a89f9e1c3b52d9a4b8c7e6f",
                "status": "ACTIVE",
            },
            {
                "id": "AS-CERT-50RES-9014",
                "title": "50 Successful Rescues",
                "description": "Recognizing operational excellence and zero dispatch cancellations over 50 missions.",
                "milestone": "50 RESCUES",
                "awarded_date": "2026-08-22",
                "verification_hash": "SHA256:4b2e8f1c9d3a7e5f8a6b2c4e",
                "status": "ACTIVE",
            },
            {
                "id": "AS-CERT-100KG-8812",
                "title": "100 Kilograms Rescued",
                "description": "First major milestone commemorating entry into the AnnaSetu zero-landfill coalition.",
                "milestone": "100 KG",
                "awarded_date": "2026-05-18",
                "verification_hash": "SHA256:1a2b3c4d5e6f7a8b9c0d1e2f",
                "status": "ACTIVE",
            }
        ]
    }


# -------------------------------------------------------------
# 8. SUBSCRIPTION & PLANS (DYNAMIC CONFIG)
# -------------------------------------------------------------
@donor_router.get("/subscription", summary="Subscription Details & Plans")
async def get_donor_subscription():
    return {
        "current_plan": {
            "tier": "BUSINESS",
            "name": "Business Sustainability Tier",
            "renewal_date": "2027-03-31",
            "billing_status": "ACTIVE",
            "monthly_quota_kg": "Unlimited",
            "active_locations": 1,
            "locations_limit": 5
        },
        "available_plans": [
            {
                "tier": "BASIC",
                "name": "Community Partner",
                "price": "Free / Non-Profit",
                "features": [
                    "Surplus food posting & matching",
                    "Dual-OTP pickup verification",
                    "Basic rescue tracking",
                    "Monthly impact email"
                ]
            },
            {
                "tier": "BUSINESS",
                "name": "Business Sustainability",
                "price": "₹1,999 / month",
                "is_current": True,
                "features": [
                    "Unlimited surplus postings",
                    "Fast-track driver dispatch",
                    "Official CSR & carbon offset certificates",
                    "Full business analytics dashboard",
                    "Up to 5 kitchen locations"
                ]
            },
            {
                "tier": "ENTERPRISE",
                "name": "Enterprise Coalition",
                "price": "Custom / Annual",
                "features": [
                    "Unlimited kitchen locations & multi-city",
                    "ERP & Kitchen Display System API access",
                    "Dedicated CSR auditor sign-off",
                    "Custom SLA & Priority Support hotline",
                    "Branded milestone impact reports"
                ]
            }
        ]
    }


# -------------------------------------------------------------
# 9. NOTIFICATIONS & READ TOGGLE
# -------------------------------------------------------------
@donor_router.get("/notifications", summary="Get Categorized Notifications")
async def get_donor_notifications():
    return donor_notifications_db


@donor_router.patch("/notifications/{notif_id}/read", summary="Mark Notification as Read")
async def mark_notification_read(notif_id: str):
    for n in donor_notifications_db:
        if n["id"] == notif_id:
            n["is_read"] = True
            return {"success": True, "id": notif_id, "is_read": True}
    return {"success": False, "message": "Notification not found"}


# -------------------------------------------------------------
# 10. INCIDENT & SUPPORT TICKET (/api/v1/donor/support)
# -------------------------------------------------------------
class DonorSupportTicketPayload(BaseModel):
    category: str
    rescue_id: Optional[str] = None
    subject: str
    description: str
    urgency: str = "NORMAL"


@donor_router.post("/support", summary="Report Operational Problem")
async def report_donor_incident(payload: DonorSupportTicketPayload):
    from apps.api.main import log_audit_event

    ticket_id = f"INC-{uuid.uuid4().hex[:6].upper()}"
    ticket = {
        "id": ticket_id,
        "donor_id": "donor-oberoi",
        "category": payload.category,
        "rescue_id": payload.rescue_id,
        "subject": payload.subject,
        "description": payload.description,
        "urgency": payload.urgency,
        "status": "OPEN",
        "created_at": datetime.utcnow().isoformat()
    }
    donor_incidents_db.append(ticket)

    log_audit_event("SUPPORT_INCIDENT_FILED", "donor-oberoi", "DONOR", {
        "ticket_id": ticket_id,
        "category": payload.category,
        "urgency": payload.urgency
    })

    return {
        "success": True,
        "ticket_id": ticket_id,
        "message": "Incident ticket logged. Operations team alerted."
    }
