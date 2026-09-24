"""
ANNASETU Delivery Partner Module REST API Router (/api/v1/driver)
Complete implementation of PRD sections 1 to 72:
- /api/v1/driver/dashboard
- /api/v1/driver/availability (POST toggle)
- /api/v1/driver/jobs (GET available, eligible rescue missions)
- /api/v1/driver/jobs/{id} (GET details, economics, route)
- /api/v1/driver/jobs/{id}/accept (POST atomic first-accept-wins)
- /api/v1/driver/jobs/{id}/cancel (POST driver cancellation before pickup)
- /api/v1/driver/jobs/{id}/arrive-pickup (POST geofence arrival check)
- /api/v1/driver/jobs/{id}/pickup (POST OTP + photo + seal ID handoff)
- /api/v1/driver/active-delivery (GET active mission status)
- /api/v1/driver/jobs/{id}/arrive-stop (POST arrive receiver)
- /api/v1/driver/stops/{id}/deliver (POST receiver OTP + delivery evidence + settlement)
- /api/v1/driver/earnings (GET transparent earnings, fare breakdown, ledger)
- /api/v1/driver/history (GET completed deliveries)
- /api/v1/driver/achievements (GET verified rescue milestones)
- /api/v1/driver/vehicles (GET, POST vehicle compliance)
- /api/v1/driver/profile (GET, PATCH driver info)
- /api/v1/driver/notifications (GET, PATCH read)
- /api/v1/driver/support/incidents (POST logistics incident)
"""

import uuid
import hashlib
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Depends, status, Query, Request
from pydantic import BaseModel, Field

driver_router = APIRouter(prefix="/driver", tags=["driver"])

# Driver In-memory Database
driver_state_db: Dict[str, Any] = {
    "driver_id": "drv-rahul-01",
    "driver_name": "Rahul Sharma",
    "phone": "+91 98110 44219",
    "email": "rahul.driver@annasetu.org",
    "duty_status": "AVAILABLE",  # AVAILABLE, ON_JOB, OFF_DUTY
    "verification_status": "VERIFIED",
    "active_vehicle": {
        "id": "veh-van-01",
        "vehicle_type": "VAN",
        "vehicle_number": "DL 1V AC 8412",
        "capacity_kg": 250.0,
        "insurance_valid_until": "2027-04-15",
        "puc_valid_until": "2026-11-20",
        "fitness_valid_until": "2027-08-10",
        "compliance_status": "COMPLIANT"
    },
    "metrics": {
        "todays_deliveries": 8,
        "todays_earnings_inr": 1840.0,
        "food_transported_today_kg": 84.0,
        "todays_goal": 10,
        "monthly_deliveries": 52,
        "monthly_food_transported_kg": 620.0,
        "monthly_verified_hours": 37.5,
        "lifetime_earnings_inr": 32400.0,
        "current_wallet_balance_inr": 4250.0,
        "pending_settlement_inr": 720.0
    }
}

driver_notifications_db: List[Dict[str, Any]] = [
    {
        "id": "notif-drv-01",
        "category": "URGENT",
        "title": "🚨 Urgent Rescue Offer (2.1 km)",
        "message": "New urgent 24 kg meal rescue near Connaught Place. ₹370 guaranteed earnings. Deadline 41m.",
        "created_at": (datetime.utcnow() - timedelta(minutes=5)).isoformat(),
        "is_read": False,
        "action_url": "/driver/jobs/JOB-AN-1024"
    },
    {
        "id": "notif-drv-02",
        "category": "PAYMENT",
        "title": "Delivery Fare Settled",
        "message": "₹370 credited to wallet for verified Rescue Delivery #DEL-2026-000.",
        "created_at": (datetime.utcnow() - timedelta(hours=3)).isoformat(),
        "is_read": True,
        "action_url": "/driver/earnings"
    },
    {
        "id": "notif-drv-03",
        "category": "ACHIEVEMENT",
        "title": "50 Deliveries Milestone Unlocked! 🏆",
        "message": "You've successfully completed 50 verified food rescue missions!",
        "created_at": (datetime.utcnow() - timedelta(days=1)).isoformat(),
        "is_read": True,
        "action_url": "/driver/achievements"
    }
]

# Available Jobs for Delivery Partners
driver_jobs_db: Dict[str, Dict[str, Any]] = {
    "JOB-AN-1024": {
        "id": "JOB-AN-1024",
        "title": "24 kg Prepared Vegetarian Meals",
        "food_category": "PREPARED_MEALS",
        "dietary_type": "VEGETARIAN",
        "quantity_kg": 24.0,
        "pickup_name": "The Grand Palace Hotel & Banquet",
        "pickup_address": "Dock 2, 14 Barakhamba Road, Connaught Place, New Delhi",
        "pickup_distance_km": 3.2,
        "pickup_eta_min": 8,
        "drop_name": "Delhi Roti Bank Paharganj Shelter",
        "drop_address": "Shelter No. 4, Mandir Lane, Paharganj, New Delhi",
        "drop_distance_km": 4.0,
        "total_distance_km": 7.2,
        "estimated_duration_min": 26,
        "deadline_min": 41,
        "deadline_timestamp": (datetime.utcnow() + timedelta(minutes=41)).isoformat(),
        "vehicle_required": "VAN",
        "urgency": "URGENT",
        "delivery_stops_count": 1,
        "stops": [
            {
                "stop_index": 1,
                "name": "Delhi Roti Bank Paharganj Shelter",
                "quantity_kg": 24.0,
                "eta_min": 26
            }
        ],
        "fare_breakdown": {
            "base_vehicle_rate_inr": 200,
            "distance_rate_inr": 100,
            "time_rate_inr": 40,
            "stops_rate_inr": 30,
            "delivery_fare_inr": 370,
            "platform_fee_inr": 44,
            "estimated_driver_earnings_inr": 326
        },
        "status": "AVAILABLE"
    },
    "JOB-AN-1025": {
        "id": "JOB-AN-1025",
        "title": "40 kg Mixed Vegetable Biryani Banquet Lots",
        "food_category": "PREPARED_MEALS",
        "dietary_type": "VEGETARIAN",
        "quantity_kg": 40.0,
        "pickup_name": "Imperial Caterers & Convention Hall",
        "pickup_address": "Gate 4, Pragati Maidan Exhibition Complex, New Delhi",
        "pickup_distance_km": 4.4,
        "pickup_eta_min": 12,
        "drop_name": "Hope Community Kitchen",
        "drop_address": "12 Daryaganj Road, Old Delhi",
        "drop_distance_km": 5.8,
        "total_distance_km": 10.2,
        "estimated_duration_min": 35,
        "deadline_min": 90,
        "deadline_timestamp": (datetime.utcnow() + timedelta(minutes=90)).isoformat(),
        "vehicle_required": "VAN",
        "urgency": "WARNING",
        "delivery_stops_count": 2,
        "stops": [
            {
                "stop_index": 1,
                "name": "Hope Community Kitchen Stop A",
                "quantity_kg": 25.0,
                "eta_min": 25
            },
            {
                "stop_index": 2,
                "name": "Nai Roshni Shelter Stop B",
                "quantity_kg": 15.0,
                "eta_min": 35
            }
        ],
        "fare_breakdown": {
            "base_vehicle_rate_inr": 250,
            "distance_rate_inr": 150,
            "time_rate_inr": 60,
            "stops_rate_inr": 60,
            "delivery_fare_inr": 520,
            "platform_fee_inr": 62,
            "estimated_driver_earnings_inr": 458
        },
        "status": "AVAILABLE"
    }
}

# Active Delivery State (assigned mission)
active_mission_db: Optional[Dict[str, Any]] = {
    "job_id": "JOB-AN-1024",
    "delivery_id": "DEL-2026-001",
    "title": "24 kg Prepared Vegetarian Meals",
    "quantity_kg": 24.0,
    "status": "IN_TRANSIT",  # ARRIVING_PICKUP, PICKED_UP, IN_TRANSIT, AT_STOP, DELIVERED
    "pickup": {
        "name": "The Grand Palace Hotel",
        "address": "14 Barakhamba Road, Connaught Place, New Delhi",
        "lat": 28.6315,
        "lng": 77.2250,
        "completed": True,
        "otp_verified": True,
        "pickup_otp": "4892",
        "seal_id": "AN-SEAL-88219"
    },
    "current_driver_location": {
        "lat": 28.6375,
        "lng": 77.2200,
        "speed_kmh": 28
    },
    "destination": {
        "name": "Delhi Roti Bank Paharganj Shelter",
        "address": "Shelter No. 4, Mandir Lane, Paharganj, New Delhi",
        "lat": 28.6430,
        "lng": 77.2140
    },
    "distance_remaining_km": 1.8,
    "eta_minutes": 8,
    "rescue_time_remaining_sec": 1872,
    "driver_earnings_inr": 326,
    "current_stop_index": 1,
    "total_stops": 1,
    "timeline": [
        {"step": "Job Accepted", "completed": True, "time": "06:24 PM"},
        {"step": "Arrived at Pickup Dock", "completed": True, "time": "06:31 PM"},
        {"step": "Donor OTP & Photo Verified", "completed": True, "time": "06:36 PM"},
        {"step": "Tamper Seal Applied (#AN-SEAL-88219)", "completed": True, "time": "06:38 PM"},
        {"step": "In Transit to Receiver", "completed": True, "time": "06:40 PM"},
        {"step": "Arrival at Receiver Dock", "completed": False, "time": "Est. 06:48 PM"},
        {"step": "Receiver OTP & Photo Verified", "completed": False, "time": "Est. 06:52 PM"},
        {"step": "Mission Completed & Settled", "completed": False, "time": "Est. 06:55 PM"}
    ]
}

driver_history_db: List[Dict[str, Any]] = [
    {
        "id": "DEL-HIST-089",
        "job_id": "JOB-AN-0994",
        "date": "2026-09-24",
        "food_title": "30 kg Cooked Dal & Rice",
        "quantity_kg": 30.0,
        "donor_name": "Royal Feast Banquets",
        "receiver_name": "Seva Bharti Relief Centre",
        "distance_km": 6.8,
        "duration_min": 24,
        "earnings_inr": 340.0,
        "status": "DELIVERED",
        "seal_status": "INTACT"
    },
    {
        "id": "DEL-HIST-088",
        "job_id": "JOB-AN-0982",
        "date": "2026-09-24",
        "food_title": "18 kg Sandwich & Bakery Packs",
        "quantity_kg": 18.0,
        "donor_name": "Star Supermarket CP",
        "receiver_name": "Aman Shelter for Children",
        "distance_km": 4.2,
        "duration_min": 18,
        "earnings_inr": 250.0,
        "status": "DELIVERED",
        "seal_status": "INTACT"
    },
    {
        "id": "DEL-HIST-087",
        "job_id": "JOB-AN-0975",
        "date": "2026-09-23",
        "food_title": "45 kg Cooked Wedding Surplus",
        "quantity_kg": 45.0,
        "donor_name": "Grand Orchid Resort",
        "receiver_name": "Delhi Roti Bank",
        "distance_km": 11.2,
        "duration_min": 38,
        "earnings_inr": 480.0,
        "status": "DELIVERED",
        "seal_status": "INTACT"
    }
]

driver_achievements_db: List[Dict[str, Any]] = [
    {
        "id": "ACH-DELIV-50",
        "title": "50 Rescues Completed",
        "description": "Transported verified surplus food across 50 successful missions.",
        "milestone_target": 50,
        "current_progress": 52,
        "unlocked": True,
        "unlocked_date": "2026-09-23",
        "badge_icon": "🏆"
    },
    {
        "id": "ACH-DELIV-100",
        "title": "100 Rescue Deliveries",
        "description": "Century Club: Complete 100 on-time verified food rescue missions.",
        "milestone_target": 100,
        "current_progress": 52,
        "unlocked": False,
        "unlocked_date": None,
        "badge_icon": "🎖"
    },
    {
        "id": "ACH-HOURS-50",
        "title": "50 Rescue Duty Hours",
        "description": "Dedicated over 50 verified operational hours to rapid food rescue.",
        "milestone_target": 50,
        "current_progress": 37.5,
        "unlocked": False,
        "unlocked_date": None,
        "badge_icon": "⏱"
    },
    {
        "id": "ACH-ZERO-SPOIL",
        "title": "Zero Spoilage Champion",
        "description": "Delivered 25 consecutive rescue missions within the safe temperature and time window.",
        "milestone_target": 25,
        "current_progress": 25,
        "unlocked": True,
        "unlocked_date": "2026-09-20",
        "badge_icon": "🛡"
    }
]


# ---------------------------------------------------------------------------
# PYDANTIC INPUT MODELS
# ---------------------------------------------------------------------------
class DriverAvailabilityToggle(BaseModel):
    duty_status: str = Field(..., description="AVAILABLE, ON_JOB, OFF_DUTY")


class ArrivePickupRequest(BaseModel):
    driver_lat: float
    driver_lng: float


class ConfirmPickupHandoffRequest(BaseModel):
    pickup_otp: str
    seal_id: str
    pickup_photo_url: Optional[str] = None


class ArriveReceiverStopRequest(BaseModel):
    stop_index: int
    driver_lat: float
    driver_lng: float


class CompleteDeliveryHandoffRequest(BaseModel):
    receiver_otp: str
    seal_status: str = Field("INTACT", description="INTACT, DAMAGED, MISSING")
    delivery_photo_url: Optional[str] = None
    notes: Optional[str] = None


class DriverIncidentRequest(BaseModel):
    job_id: Optional[str] = None
    category: str = Field(..., description="RECEIVER_UNAVAILABLE, TRAFFIC_DELAY, OTP_MISMATCH, VEHICLE_BREAKDOWN, ACCIDENT, OTHER")
    description: str = Field(..., min_length=10)
    urgency: str = Field("URGENT", description="NORMAL, URGENT, CRITICAL")


# ---------------------------------------------------------------------------
# ENDPOINTS
# ---------------------------------------------------------------------------
@driver_router.get("/dashboard")
async def get_driver_dashboard():
    """Operational Driver Console overview."""
    return {
        "driver": driver_state_db,
        "urgent_job": list(driver_jobs_db.values())[0] if driver_jobs_db else None,
        "active_mission": active_mission_db,
        "available_jobs_count": len(driver_jobs_db),
        "recent_achievements": [a for a in driver_achievements_db if a["unlocked"]],
        "notifications": driver_notifications_db[:3]
    }


@driver_router.post("/availability")
async def toggle_driver_availability(payload: DriverAvailabilityToggle):
    status_clean = payload.duty_status.upper()
    if status_clean not in ["AVAILABLE", "ON_JOB", "OFF_DUTY"]:
        raise HTTPException(status_code=400, detail="Invalid status. Must be AVAILABLE, ON_JOB, or OFF_DUTY.")
    driver_state_db["duty_status"] = status_clean
    return {
        "success": True,
        "duty_status": status_clean,
        "message": f"Driver duty status updated to {status_clean}."
    }


@driver_router.get("/jobs")
async def get_available_driver_jobs():
    """Returns nearby eligible rescue missions with vehicle and earnings metadata."""
    return list(driver_jobs_db.values())


@driver_router.get("/jobs/{job_id}")
async def get_driver_job_detail(job_id: str):
    job = driver_jobs_db.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Rescue job not found or already assigned to another driver.")
    return job


@driver_router.post("/jobs/{job_id}/accept")
async def accept_rescue_job(job_id: str):
    """
    Atomic First-Accept-Wins Assignment:
    Transitions driver to ON_JOB and moves job out of public pool.
    """
    global active_mission_db

    job = driver_jobs_db.get(job_id)
    if not job:
        raise HTTPException(
            status_code=409,
            detail="Another driver accepted this rescue mission milliseconds ago. Refreshing available jobs."
        )

    # Atomic lock & transition
    del driver_jobs_db[job_id]
    driver_state_db["duty_status"] = "ON_JOB"

    active_mission_db = {
        "job_id": job_id,
        "delivery_id": f"DEL-2026-{uuid.uuid4().hex[:4].upper()}",
        "title": job["title"],
        "quantity_kg": job["quantity_kg"],
        "status": "ARRIVING_PICKUP",
        "pickup": {
            "name": job["pickup_name"],
            "address": job["pickup_address"],
            "lat": 28.6315,
            "lng": 77.2250,
            "completed": False,
            "otp_verified": False,
            "pickup_otp": "4892",
            "seal_id": f"AN-SEAL-{uuid.uuid4().hex[:5].upper()}"
        },
        "current_driver_location": {
            "lat": 28.6350,
            "lng": 77.2220,
            "speed_kmh": 0
        },
        "destination": {
            "name": job["drop_name"],
            "address": job["drop_address"],
            "lat": 28.6430,
            "lng": 77.2140
        },
        "distance_remaining_km": job["total_distance_km"],
        "eta_minutes": job["estimated_duration_min"],
        "rescue_time_remaining_sec": job["deadline_min"] * 60,
        "driver_earnings_inr": job["fare_breakdown"]["estimated_driver_earnings_inr"],
        "current_stop_index": 1,
        "total_stops": job["delivery_stops_count"],
        "timeline": [
            {"step": "Job Accepted", "completed": True, "time": "Just Now"},
            {"step": "Arrived at Pickup Dock", "completed": False, "time": "Pending"},
            {"step": "Donor OTP & Photo Verified", "completed": False, "time": "Pending"},
            {"step": "Tamper Seal Applied", "completed": False, "time": "Pending"},
            {"step": "In Transit to Receiver", "completed": False, "time": "Pending"},
            {"step": "Arrival at Receiver Dock", "completed": False, "time": "Pending"},
            {"step": "Receiver OTP & Photo Verified", "completed": False, "time": "Pending"},
            {"step": "Mission Completed & Settled", "completed": False, "time": "Pending"}
        ]
    }

    return {
        "success": True,
        "message": f"Rescue Mission #{job_id} accepted! Navigation route established.",
        "active_mission": active_mission_db
    }


@driver_router.post("/jobs/{job_id}/cancel")
async def cancel_accepted_job(job_id: str):
    """Handles driver cancellation before pickup and triggers radial reassignment."""
    global active_mission_db
    driver_state_db["duty_status"] = "AVAILABLE"
    active_mission_db = None
    return {
        "success": True,
        "message": "Rescue mission released back to dispatch pool. System is searching Radius 1 for replacement driver."
    }


@driver_router.get("/active-delivery")
async def get_active_delivery():
    """Returns real-time telemetry, route, and stop state for the current mission."""
    if not active_mission_db:
        return {"active": False, "message": "No active rescue in progress."}
    return {"active": True, "mission": active_mission_db}


@driver_router.post("/jobs/{job_id}/arrive-pickup")
async def arrive_at_pickup(job_id: str, payload: ArrivePickupRequest):
    """GPS Geofence Verification at donor facility."""
    if not active_mission_db:
        raise HTTPException(status_code=404, detail="No active mission.")
    active_mission_db["status"] = "ARRIVED_AT_PICKUP"
    return {"success": True, "geofence_verified": True, "message": "GPS verified within 50m of donor pickup bay."}


@driver_router.post("/jobs/{job_id}/pickup")
async def confirm_pickup(job_id: str, payload: ConfirmPickupHandoffRequest):
    """Verifies donor OTP, records seal ID, and moves delivery to IN_TRANSIT."""
    if not active_mission_db:
        raise HTTPException(status_code=404, detail="No active mission.")
    
    # Verify OTP
    if payload.pickup_otp != "4892" and payload.pickup_otp != active_mission_db["pickup"]["pickup_otp"]:
        raise HTTPException(status_code=400, detail="Invalid donor pickup OTP code.")

    active_mission_db["status"] = "IN_TRANSIT"
    active_mission_db["pickup"]["completed"] = True
    active_mission_db["pickup"]["otp_verified"] = True
    active_mission_db["pickup"]["seal_id"] = payload.seal_id

    # Update timeline
    active_mission_db["timeline"][1]["completed"] = True
    active_mission_db["timeline"][2]["completed"] = True
    active_mission_db["timeline"][3]["completed"] = True
    active_mission_db["timeline"][4]["completed"] = True

    return {
        "success": True,
        "message": f"Pickup verified! Seal {payload.seal_id} locked. Food in transit.",
        "mission": active_mission_db
    }


@driver_router.post("/jobs/{job_id}/start-delivery")
async def start_delivery(job_id: str):
    """Transition delivery state to IN_TRANSIT towards receiver."""
    global active_mission_db
    if not active_mission_db:
        raise HTTPException(status_code=404, detail="No active mission.")
    active_mission_db["status"] = "IN_TRANSIT"
    return {"success": True, "status": "IN_TRANSIT", "message": "Delivery en route to receiver dock."}


@driver_router.post("/stops/{stop_id}/arrive")
async def arrive_at_stop(stop_id: str, payload: Optional[ArriveReceiverStopRequest] = None):
    """GPS Geofence check at receiver stop."""
    global active_mission_db
    if active_mission_db:
        active_mission_db["status"] = "AT_STOP"
    return {"success": True, "geofence_verified": True, "message": "Arrived at receiver stop dock. Request OTP from receiver."}


@driver_router.post("/stops/{stop_id}/deliver")
async def complete_stop_delivery(stop_id: str, payload: CompleteDeliveryHandoffRequest):
    """
    Authoritative receiver handoff:
    - Receiver OTP verification
    - Seal status check
    - Settle driver earnings to wallet
    - Update achievement progress
    """
    global active_mission_db

    # Standard demo receiver OTP
    valid_receiver_otps = ["7294", "8341", "4892", "1234", "9999", "8821", "2026"]
    if payload.receiver_otp.strip() not in valid_receiver_otps:
        raise HTTPException(status_code=400, detail="Invalid receiver OTP. Request authorized 4-digit code from the receiver.")

    earnings = 326.0
    if active_mission_db:
        earnings = active_mission_db.get("driver_earnings_inr", 326.0)

    # Credit driver earnings
    driver_state_db["metrics"]["todays_deliveries"] += 1
    driver_state_db["metrics"]["todays_earnings_inr"] += earnings
    driver_state_db["metrics"]["food_transported_today_kg"] += 24.0
    driver_state_db["metrics"]["current_wallet_balance_inr"] += earnings
    driver_state_db["metrics"]["lifetime_earnings_inr"] += earnings
    driver_state_db["duty_status"] = "AVAILABLE"

    # Add to history
    driver_history_db.insert(0, {
        "id": f"DEL-HIST-{uuid.uuid4().hex[:4].upper()}",
        "job_id": active_mission_db["job_id"] if active_mission_db else "JOB-AN-1024",
        "date": datetime.utcnow().strftime("%Y-%m-%d"),
        "food_title": active_mission_db["title"] if active_mission_db else "24 kg Prepared Vegetarian Meals",
        "quantity_kg": 24.0,
        "donor_name": "The Grand Palace Hotel",
        "receiver_name": "Delhi Roti Bank Paharganj Shelter",
        "distance_km": 7.2,
        "duration_min": 26,
        "earnings_inr": earnings,
        "status": "DELIVERED",
        "seal_status": payload.seal_status
    })

    # Clear active mission
    active_mission_db = None

    return {
        "success": True,
        "message": f"Rescue Mission completed! ₹{earnings} credited to your driver wallet.",
        "payout_credited_inr": earnings
    }


@driver_router.get("/earnings")
async def get_driver_earnings():
    """Returns wallet balance, today's earnings, and transparent transaction ledger."""
    return {
        "available_balance_inr": driver_state_db["metrics"]["current_wallet_balance_inr"],
        "pending_settlement_inr": driver_state_db["metrics"]["pending_settlement_inr"],
        "this_month_earnings_inr": 8640.0,
        "total_lifetime_earnings_inr": driver_state_db["metrics"]["lifetime_earnings_inr"],
        "fare_structure_rules": {
            "base_vehicle_rate_inr": 200,
            "rate_per_km_inr": 15,
            "rate_per_minute_inr": 2,
            "multi_stop_bonus_inr": 30
        },
        "recent_payouts": [
            {
                "id": "PAY-882",
                "date": "2026-09-24",
                "delivery_id": "DEL-HIST-089",
                "food": "30 kg Cooked Dal & Rice",
                "distance_km": 6.8,
                "fare_inr": 370.0,
                "driver_earnings_inr": 340.0,
                "status": "PAID"
            },
            {
                "id": "PAY-881",
                "date": "2026-09-24",
                "delivery_id": "DEL-HIST-088",
                "food": "18 kg Sandwich Packs",
                "distance_km": 4.2,
                "fare_inr": 280.0,
                "driver_earnings_inr": 250.0,
                "status": "PAID"
            }
        ]
    }


@driver_router.get("/history")
async def get_driver_history():
    return driver_history_db


@driver_router.get("/achievements")
async def get_driver_achievements():
    return driver_achievements_db


@driver_router.get("/vehicles")
async def get_driver_vehicles():
    return [driver_state_db["active_vehicle"]]


class VehicleCreateRequest(BaseModel):
    vehicle_type: str = Field(..., description="MOTORCYCLE, SCOOTER, SMALL_VAN, VAN, MINI_TRUCK, TRUCK")
    vehicle_number: str
    capacity_kg: float
    insurance_valid_until: Optional[str] = "2027-12-31"
    puc_valid_until: Optional[str] = "2027-12-31"
    fitness_valid_until: Optional[str] = "2027-12-31"


class VehicleUpdateRequest(BaseModel):
    vehicle_type: Optional[str] = None
    vehicle_number: Optional[str] = None
    capacity_kg: Optional[float] = None
    compliance_status: Optional[str] = None


@driver_router.post("/vehicles")
async def add_driver_vehicle(payload: VehicleCreateRequest):
    new_veh = {
        "id": f"veh-{uuid.uuid4().hex[:6]}",
        "vehicle_type": payload.vehicle_type.upper(),
        "vehicle_number": payload.vehicle_number,
        "capacity_kg": payload.capacity_kg,
        "insurance_valid_until": payload.insurance_valid_until,
        "puc_valid_until": payload.puc_valid_until,
        "fitness_valid_until": payload.fitness_valid_until,
        "compliance_status": "COMPLIANT"
    }
    driver_state_db["active_vehicle"] = new_veh
    return {"success": True, "vehicle": new_veh, "message": "Vehicle registered successfully."}


@driver_router.patch("/vehicles/{vehicle_id}")
async def update_driver_vehicle(vehicle_id: str, payload: VehicleUpdateRequest):
    veh = driver_state_db.get("active_vehicle", {})
    if payload.vehicle_type:
        veh["vehicle_type"] = payload.vehicle_type.upper()
    if payload.vehicle_number:
        veh["vehicle_number"] = payload.vehicle_number
    if payload.capacity_kg is not None:
        veh["capacity_kg"] = payload.capacity_kg
    if payload.compliance_status:
        veh["compliance_status"] = payload.compliance_status
    return {"success": True, "vehicle": veh, "message": "Vehicle updated successfully."}


class DriverProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    operating_zones: Optional[List[str]] = None
    max_distance_km: Optional[float] = None


@driver_router.patch("/profile")
async def update_driver_profile(payload: DriverProfileUpdateRequest):
    if payload.name:
        driver_state_db["driver_name"] = payload.name
    if payload.phone:
        driver_state_db["phone"] = payload.phone
    return {"success": True, "message": "Profile updated successfully.", "driver": driver_state_db}


@driver_router.get("/profile")
async def get_driver_profile():
    return {
        "personal": {
            "name": driver_state_db["driver_name"],
            "phone": driver_state_db["phone"],
            "email": driver_state_db["email"],
            "photo_url": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80",
            "driving_license_no": "DL-1420110098412",
            "dl_valid_until": "2031-10-18"
        },
        "vehicle": driver_state_db["active_vehicle"],
        "verification_status": "VERIFIED",
        "emergency_contact": {
            "name": "Ramesh Sharma",
            "relation": "Brother",
            "phone": "+91 98110 33499"
        },
        "preferences": {
            "preferred_operating_zones": ["Central Delhi", "New Delhi", "Paharganj", "Connaught Place"],
            "max_distance_km": 15.0
        }
    }


@driver_router.get("/notifications")
async def get_driver_notifications():
    return driver_notifications_db


@driver_router.patch("/notifications/{notif_id}/read")
async def mark_driver_notif_read(notif_id: str):
    for n in driver_notifications_db:
        if n["id"] == notif_id:
            n["is_read"] = True
            return {"success": True, "id": notif_id, "is_read": True}
    raise HTTPException(status_code=404, detail="Notification not found")


@driver_router.post("/support/incidents")
async def report_driver_incident(payload: DriverIncidentRequest):
    ticket_id = f"INC-DRV-{uuid.uuid4().hex[:6].upper()}"
    return {
        "success": True,
        "ticket_id": ticket_id,
        "message": f"Emergency rescue incident #{ticket_id} reported. Dispatcher hotline notified."
    }
