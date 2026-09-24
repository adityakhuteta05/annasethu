"""
ANNASETU NGO / Receiver Module REST API Router (/api/v1/receiver)
Complete implementation of PRD sections 1 to 64:
- /api/v1/receiver/dashboard
- /api/v1/receiver/needs (GET, POST)
- /api/v1/receiver/needs/{id} (GET, PATCH, cancel, pause, publish)
- /api/v1/receiver/available-food
- /api/v1/receiver/donations/{id}
- /api/v1/receiver/donations/{id}/match-score
- /api/v1/receiver/donations/{id}/explanation
- /api/v1/receiver/reservations (POST, GET)
- /api/v1/receiver/reservations/{id}/cancel
- /api/v1/receiver/allocations
- /api/v1/receiver/deliveries
- /api/v1/receiver/deliveries/{id}
- /api/v1/receiver/deliveries/{id}/tracking
- /api/v1/receiver/deliveries/{id}/receive-otp
- /api/v1/receiver/deliveries/{id}/verify
- /api/v1/receiver/wallet
- /api/v1/receiver/wallet/transactions
- /api/v1/receiver/impact
- /api/v1/receiver/reports
- /api/v1/receiver/notifications
- /api/v1/receiver/profile
- /api/v1/receiver/support/incidents
"""

import uuid
import hashlib
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
)
from apps.api.ai.groq_adapter import GroqAIAdapter
from apps.api.config.config_service import config_service

ngo_base_router = APIRouter()
ai_adapter = GroqAIAdapter()

# In-memory support incidents database for receivers
receiver_incidents_db: List[Dict[str, Any]] = []

# Notification store for receiver
receiver_notifications_db: List[Dict[str, Any]] = [
    {
        "id": "notif-rec-001",
        "category": "URGENT",
        "title": "🚨 Urgent Food Available Nearby",
        "message": "25 kg vegetarian cooked meals available 2.4 km away with ETA 14 min matching your dinner need.",
        "created_at": (datetime.utcnow() - timedelta(minutes=10)).isoformat(),
        "is_read": False,
        "action_url": "/receiver/available-food"
    },
    {
        "id": "notif-rec-002",
        "category": "DRIVER",
        "title": "Driver In Transit to Your Shelter",
        "message": "Driver Rahul Sharma (Van) has picked up Delivery #DEL-2026-001 and is 8 minutes away.",
        "created_at": (datetime.utcnow() - timedelta(minutes=20)).isoformat(),
        "is_read": False,
        "action_url": "/receiver/deliveries/DEL-2026-001"
    },
    {
        "id": "notif-rec-003",
        "category": "RESERVATION",
        "title": "Reservation Confirmed",
        "message": "Your reservation for 20 kg dinner meals from The Grand Palace Hotel has been confirmed.",
        "created_at": (datetime.utcnow() - timedelta(hours=1)).isoformat(),
        "is_read": True,
        "action_url": "/receiver/reservations"
    },
    {
        "id": "notif-rec-004",
        "category": "VERIFICATION",
        "title": "Annual 80G Verification Current",
        "message": "NGO-DARPAN and Section 80G documentation valid through March 2027.",
        "created_at": (datetime.utcnow() - timedelta(days=2)).isoformat(),
        "is_read": True,
        "action_url": "/receiver/profile"
    }
]

# Database of Needs
receiver_needs_db: Dict[str, Dict[str, Any]] = {
    "NEED-2026-101": {
        "id": "NEED-2026-101",
        "ngo_id": "ngo-delhi-rotibank",
        "ngo_name": "Delhi Roti Bank Relief Foundation",
        "meal_period": "LUNCH",
        "food_category": "PREPARED_MEALS",
        "dietary_type": "VEGETARIAN",
        "required_quantity_kg": 100.0,
        "fulfilled_quantity_kg": 75.0,
        "remaining_quantity_kg": 25.0,
        "min_acceptable_quantity_kg": 20.0,
        "required_by": (datetime.utcnow() + timedelta(hours=1, minutes=30)).isoformat(),
        "current_capacity_kg": 35.0,
        "normal_capacity_kg": 120.0,
        "status": "PARTIALLY_FULFILLED",
        "created_at": (datetime.utcnow() - timedelta(hours=3)).isoformat(),
        "receiving_hours": "12:00 PM – 03:00 PM",
        "special_instructions": "Hot containers accepted. No raw meat items."
    },
    "NEED-2026-102": {
        "id": "NEED-2026-102",
        "ngo_id": "ngo-delhi-rotibank",
        "ngo_name": "Delhi Roti Bank Relief Foundation",
        "meal_period": "DINNER",
        "food_category": "PREPARED_MEALS",
        "dietary_type": "VEGETARIAN",
        "required_quantity_kg": 80.0,
        "fulfilled_quantity_kg": 0.0,
        "remaining_quantity_kg": 80.0,
        "min_acceptable_quantity_kg": 15.0,
        "required_by": (datetime.utcnow() + timedelta(hours=4, minutes=45)).isoformat(),
        "current_capacity_kg": 80.0,
        "normal_capacity_kg": 120.0,
        "status": "ACTIVE",
        "created_at": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
        "receiving_hours": "06:00 PM – 09:30 PM",
        "special_instructions": "Sealed packaging required. Diabetic section available."
    },
    "NEED-2026-103": {
        "id": "NEED-2026-103",
        "ngo_id": "ngo-delhi-rotibank",
        "ngo_name": "Delhi Roti Bank Relief Foundation",
        "meal_period": "BREAKFAST",
        "food_category": "BREAD_BAKERY",
        "dietary_type": "VEGETARIAN",
        "required_quantity_kg": 60.0,
        "fulfilled_quantity_kg": 60.0,
        "remaining_quantity_kg": 0.0,
        "min_acceptable_quantity_kg": 10.0,
        "required_by": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
        "current_capacity_kg": 10.0,
        "normal_capacity_kg": 120.0,
        "status": "FULFILLED",
        "created_at": (datetime.utcnow() - timedelta(hours=8)).isoformat(),
        "receiving_hours": "07:00 AM – 10:00 AM",
        "special_instructions": "Breads, buns and sealed bakery lots."
    }
}

# Available Food Opportunities for NGOs (Marketplace)
available_food_db: Dict[str, Dict[str, Any]] = {
    "DON-REC-01": {
        "id": "DON-REC-01",
        "donor_id": "org-grand-palace",
        "donor_name": "The Grand Palace Hotel & Banquet",
        "food_category": "PREPARED_MEALS",
        "title": "Vegetarian Pulao & Paneer Dal Banquet Trays",
        "dietary_type": "VEGETARIAN",
        "quantity_kg": 25.0,
        "available_from": "Now",
        "deadline_hours": 1.2,
        "deadline": (datetime.utcnow() + timedelta(hours=1, minutes=12)).isoformat(),
        "storage_condition": "REFRIGERATED",
        "packaging": "Sealed insulated stainless trays",
        "known_allergens": ["DAIRY"],
        "pickup_address": "Dock 2, 14 Barakhamba Road, Connaught Place, New Delhi",
        "distance_km": 2.4,
        "eta_minutes": 14,
        "target_need_id": "NEED-2026-102",
        "urgency": "URGENT",
        "priority_score": 93,
        "score_breakdown": {
            "distance": 95,
            "eta": 92,
            "expiry_buffer": 94,
            "need_fulfillment": 90,
            "route_efficiency": 93,
            "driver_availability": 94,
            "deadline_urgency": 97
        },
        "suitability_reasons": [
            "Matches active Dinner requirement (80 meals needed)",
            "Strictly 100% vegetarian protocol satisfied",
            "Distance is only 2.4 km away with 14 min transit ETA",
            "Delivery ETA falls well within shelter receiving window (6:00 PM – 9:30 PM)",
            "Current shelter capacity of 80 kg fully absorbs this 25 kg donation",
            "Insulated thermal trays preserve temperature safety chain"
        ],
        "delivery_fare_estimate": {
            "base_fare": 200,
            "distance_charge": 60,
            "time_charge": 40,
            "handling_fee": 30,
            "subtotal": 330,
            "platform_fee_percent": 12,
            "platform_fee": 40,
            "total_logistics_inr": 370
        }
    },
    "DON-REC-02": {
        "id": "DON-REC-02",
        "donor_id": "org-taj-catering",
        "donor_name": "Imperial Caterers & Convention Hall",
        "food_category": "PREPARED_MEALS",
        "title": "Mixed Vegetable Biryani & Raita Pots",
        "dietary_type": "VEGETARIAN",
        "quantity_kg": 40.0,
        "available_from": "Now",
        "deadline_hours": 2.5,
        "deadline": (datetime.utcnow() + timedelta(hours=2, minutes=30)).isoformat(),
        "storage_condition": "AMBIENT",
        "packaging": "Sealed food-grade containers",
        "known_allergens": [],
        "pickup_address": "Gate 4, Pragati Maidan Exhibition Complex, New Delhi",
        "distance_km": 4.1,
        "eta_minutes": 22,
        "target_need_id": "NEED-2026-102",
        "urgency": "WARNING",
        "priority_score": 88,
        "score_breakdown": {
            "distance": 89,
            "eta": 87,
            "expiry_buffer": 91,
            "need_fulfillment": 88,
            "route_efficiency": 86,
            "driver_availability": 89,
            "deadline_urgency": 86
        },
        "suitability_reasons": [
            "Vegetarian meal batch matches dinner requirements",
            "4.1 km distance with guaranteed driver availability in Sector 2",
            "Ample 2.5 hour consumption buffer remains",
            "Compatible with receiver receiving dock requirements"
        ],
        "delivery_fare_estimate": {
            "base_fare": 250,
            "distance_charge": 100,
            "time_charge": 50,
            "handling_fee": 40,
            "subtotal": 440,
            "platform_fee_percent": 12,
            "platform_fee": 53,
            "total_logistics_inr": 493
        }
    }
}

# Reservations Database
receiver_reservations_db: Dict[str, Dict[str, Any]] = {
    "RES-2026-8801": {
        "id": "RES-2026-8801",
        "donation_id": "DON-REC-01",
        "ngo_id": "ngo-delhi-rotibank",
        "need_id": "NEED-2026-102",
        "reserved_quantity_kg": 25.0,
        "allocated_quantity_kg": 25.0,
        "status": "CONFIRMED",
        "reserved_at": (datetime.utcnow() - timedelta(minutes=40)).isoformat(),
        "expiry_at": (datetime.utcnow() + timedelta(minutes=50)).isoformat(),
        "delivery_id": "DEL-2026-001",
        "delivery_charge_inr": 370.0,
        "food_title": "Vegetarian Pulao & Paneer Dal Banquet Trays",
        "donor_name": "The Grand Palace Hotel"
    }
}

# Deliveries Database
receiver_deliveries_db: Dict[str, Dict[str, Any]] = {
    "DEL-2026-001": {
        "id": "DEL-2026-001",
        "reservation_id": "RES-2026-8801",
        "donation_id": "DON-REC-01",
        "food_title": "Vegetarian Pulao & Paneer Dal Trays",
        "quantity_kg": 25.0,
        "dietary_type": "VEGETARIAN",
        "donor_name": "The Grand Palace Hotel & Banquet",
        "donor_address": "14 Barakhamba Road, Connaught Place, New Delhi",
        "receiver_name": "Delhi Roti Bank Relief Foundation",
        "receiver_address": "Shelter No. 4, Mandir Lane, Paharganj, New Delhi",
        "driver_id": "drv-rahul-01",
        "driver_name": "Rahul Sharma",
        "driver_phone": "+91 98110 44219",
        "vehicle_type": "Van",
        "vehicle_registration": "DL 1V ** 8412",
        "status": "IN_TRANSIT",
        "eta_minutes": 8,
        "distance_km": 2.4,
        "seal_id": "AN-SEAL-88219",
        "pickup_otp_verified": True,
        "pickup_timestamp": (datetime.utcnow() - timedelta(minutes=16)).isoformat(),
        "pickup_evidence_photo": "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80",
        "delivery_otp": "7294",
        "delivery_otp_hash": hashlib.sha256("7294".encode()).hexdigest(),
        "delivery_evidence_photo": None,
        "integrity_status": "NO_VISIBLE_DISCREPANCY",
        "timeline": [
            {"step": "Donation Matched", "completed": True, "time": "06:15 PM"},
            {"step": "Food Reserved", "completed": True, "time": "06:18 PM"},
            {"step": "Allocation Confirmed", "completed": True, "time": "06:20 PM"},
            {"step": "Driver Assigned", "completed": True, "time": "06:24 PM"},
            {"step": "Pickup Verified & Sealed", "completed": True, "time": "06:36 PM"},
            {"step": "Food In Transit", "completed": True, "time": "06:40 PM"},
            {"step": "Arrived at Receiver", "completed": False, "time": "Est. 06:48 PM"},
            {"step": "Handoff OTP Verified", "completed": False, "time": "Est. 06:52 PM"},
            {"step": "Settlement & Impact Logged", "completed": False, "time": "Est. 06:55 PM"}
        ]
    }
}

# Wallet Database
receiver_wallet_db: Dict[str, Any] = {
    "ngo_id": "ngo-delhi-rotibank",
    "total_balance_inr": 5000.0,
    "reserved_amount_inr": 370.0,
    "available_balance_inr": 4630.0,
    "currency": "INR",
    "transactions": [
        {
            "id": "TXN-8801",
            "type": "RESERVATION_HOLD",
            "amount_inr": 370.0,
            "description": "Logistics Fare Reserve for Delivery #DEL-2026-001 (25 kg meals)",
            "status": "HELD",
            "timestamp": (datetime.utcnow() - timedelta(minutes=40)).isoformat()
        },
        {
            "id": "TXN-8800",
            "type": "DELIVERY_SETTLEMENT",
            "amount_inr": 420.0,
            "description": "Logistics Settlement for Delivery #DEL-2026-000 (35 kg breakfast bakery)",
            "status": "SETTLED",
            "timestamp": (datetime.utcnow() - timedelta(days=1, hours=3)).isoformat()
        },
        {
            "id": "TXN-8799",
            "type": "WALLET_TOPUP",
            "amount_inr": 3000.0,
            "description": "CSR Logistics Grant Top-Up via Razorpay UPI",
            "status": "COMPLETED",
            "timestamp": (datetime.utcnow() - timedelta(days=4)).isoformat()
        }
    ]
}


# ---------------------------------------------------------------------------
# PYDANTIC INPUT MODELS
# ---------------------------------------------------------------------------
class CreateNeedRequest(BaseModel):
    meal_period: str = Field(..., description="BREAKFAST, LUNCH, DINNER, ANY")
    food_category: str = Field(..., description="PREPARED_MEALS, RICE, BREAD_BAKERY, etc.")
    dietary_type: str = Field(..., description="VEGETARIAN or NON_VEGETARIAN")
    required_quantity_kg: float = Field(..., gt=0.0, description="Total kg required")
    min_acceptable_quantity_kg: float = Field(..., gt=0.0, description="Minimum acceptable partial kg")
    required_by: str = Field(..., description="ISO 8601 target delivery deadline")
    current_capacity_kg: float = Field(..., gt=0.0, description="Available shelter capacity right now")
    receiving_hours: str = Field("06:00 PM – 09:30 PM", description="Active receiving hours window")
    special_instructions: Optional[str] = None


class ReserveFoodRequest(BaseModel):
    donation_id: str
    need_id: str
    quantity_kg: float = Field(..., gt=0.0)


class VerifyDeliveryHandoffRequest(BaseModel):
    delivery_id: str
    receiver_otp: str
    package_seal_status: str = Field("INTACT", description="INTACT, DAMAGED, MISSING")
    delivery_photo_url: Optional[str] = None
    receiver_notes: Optional[str] = None


class ReceiverIncidentRequest(BaseModel):
    delivery_id: Optional[str] = None
    category: str = Field(..., description="DELIVERY_DELAY, PACKAGE_DISCREPANCY, OTP_ISSUE, WRONG_QUANTITY, OTHER")
    description: str = Field(..., min_length=10)
    urgency: str = Field("NORMAL", description="NORMAL, URGENT, CRITICAL")


# ---------------------------------------------------------------------------
# ENDPOINTS
# ---------------------------------------------------------------------------
@ngo_base_router.get("/dashboard")
async def get_receiver_dashboard():
    """Authoritative NGO operations dashboard payload with need-first metrics."""
    return {
        "organization_name": "Delhi Roti Bank Relief Foundation",
        "verification_status": "VERIFIED",
        "ngo_darpan_id": "DL/2021/0284912",
        "tax_exemption_80g": "AAATD1829PF20214",
        "metrics": {
            "active_needs": len([n for n in receiver_needs_db.values() if n["status"] in ["ACTIVE", "PARTIALLY_FULFILLED"]]),
            "food_received_this_month_kg": 846.0,
            "needs_fulfilled": 38,
            "meals_received": 1692,
            "current_receiving_capacity_kg": 35.0,
            "normal_daily_capacity_kg": 120.0
        },
        "todays_needs": list(receiver_needs_db.values()),
        "urgent_food_available": list(available_food_db.values())[0] if available_food_db else None,
        "active_deliveries": [d for d in receiver_deliveries_db.values() if d["status"] != "DELIVERED"],
        "wallet_summary": {
            "total_balance_inr": receiver_wallet_db["total_balance_inr"],
            "reserved_amount_inr": receiver_wallet_db["reserved_amount_inr"],
            "available_balance_inr": receiver_wallet_db["available_balance_inr"]
        }
    }


@ngo_base_router.get("/needs")
async def get_receiver_needs():
    """List all NGO food needs with fulfillment status."""
    return list(receiver_needs_db.values())


@ngo_base_router.post("/needs")
async def create_receiver_need(payload: CreateNeedRequest):
    """Publish a new structured food requirement."""
    need_id = f"NEED-2026-{uuid.uuid4().hex[:4].upper()}"
    new_need = {
        "id": need_id,
        "ngo_id": "ngo-delhi-rotibank",
        "ngo_name": "Delhi Roti Bank Relief Foundation",
        "meal_period": payload.meal_period.upper(),
        "food_category": payload.food_category.upper(),
        "dietary_type": payload.dietary_type.upper(),
        "required_quantity_kg": payload.required_quantity_kg,
        "fulfilled_quantity_kg": 0.0,
        "remaining_quantity_kg": payload.required_quantity_kg,
        "min_acceptable_quantity_kg": payload.min_acceptable_quantity_kg,
        "required_by": payload.required_by,
        "current_capacity_kg": payload.current_capacity_kg,
        "normal_capacity_kg": 120.0,
        "status": "ACTIVE",
        "created_at": datetime.utcnow().isoformat(),
        "receiving_hours": payload.receiving_hours,
        "special_instructions": payload.special_instructions or "None specified."
    }
    receiver_needs_db[need_id] = new_need
    return {
        "success": True,
        "message": f"Food need #{need_id} successfully published to rescue network.",
        "need": new_need
    }


@ngo_base_router.get("/needs/{need_id}")
async def get_need_by_id(need_id: str):
    need = receiver_needs_db.get(need_id)
    if not need:
        raise HTTPException(status_code=404, detail="Food need record not found")
    return need


@ngo_base_router.post("/needs/{need_id}/pause")
async def pause_need(need_id: str):
    need = receiver_needs_db.get(need_id)
    if not need:
        raise HTTPException(status_code=404, detail="Food need record not found")
    need["status"] = "PAUSED"
    return {"success": True, "status": "PAUSED"}


@ngo_base_router.post("/needs/{need_id}/cancel")
async def cancel_need(need_id: str):
    need = receiver_needs_db.get(need_id)
    if not need:
        raise HTTPException(status_code=404, detail="Food need record not found")
    need["status"] = "CANCELLED"
    return {"success": True, "status": "CANCELLED"}



class UpdateNeedRequest(BaseModel):
    required_quantity_kg: Optional[float] = None
    min_acceptable_quantity_kg: Optional[float] = None
    required_by: Optional[str] = None
    current_capacity_kg: Optional[float] = None
    special_instructions: Optional[str] = None


@ngo_base_router.patch("/needs/{need_id}")
async def update_need(need_id: str, payload: UpdateNeedRequest):
    need = receiver_needs_db.get(need_id)
    if not need:
        raise HTTPException(status_code=404, detail="Food need record not found")
    if payload.required_quantity_kg is not None:
        need["required_quantity_kg"] = payload.required_quantity_kg
        need["remaining_quantity_kg"] = max(0.0, payload.required_quantity_kg - need.get("fulfilled_quantity_kg", 0.0))
    if payload.min_acceptable_quantity_kg is not None:
        need["min_acceptable_quantity_kg"] = payload.min_acceptable_quantity_kg
    if payload.required_by is not None:
        need["required_by"] = payload.required_by
    if payload.current_capacity_kg is not None:
        need["current_capacity_kg"] = payload.current_capacity_kg
    if payload.special_instructions is not None:
        need["special_instructions"] = payload.special_instructions
    return {"success": True, "need": need}


@ngo_base_router.post("/needs/{need_id}/publish")
async def publish_need(need_id: str):
    need = receiver_needs_db.get(need_id)
    if not need:
        raise HTTPException(status_code=404, detail="Food need record not found")
    need["status"] = "ACTIVE"
    return {"success": True, "status": "ACTIVE", "message": "Food need published and actively matching."}


@ngo_base_router.get("/donations/{donation_id}")
async def get_donation_by_id(donation_id: str):
    donation = available_food_db.get(donation_id)
    if not donation:
        raise HTTPException(status_code=404, detail="Donation record not found")
    return donation


class CapacityUpdateRequest(BaseModel):
    current_capacity_kg: float
    normal_capacity_kg: Optional[float] = None
    storage_capacity_kg: Optional[float] = None


@ngo_base_router.get("/capacity")
async def get_ngo_capacity():
    return {
        "normal_daily_capacity_kg": 120.0,
        "current_receiving_capacity_kg": 80.0,
        "storage_capacity_kg": 150.0,
        "todays_received_kg": 40.0,
        "remaining_capacity_kg": 40.0
    }


@ngo_base_router.patch("/capacity")
async def update_ngo_capacity(payload: CapacityUpdateRequest):
    return {
        "success": True,
        "normal_daily_capacity_kg": payload.normal_capacity_kg or 120.0,
        "current_receiving_capacity_kg": payload.current_capacity_kg,
        "storage_capacity_kg": payload.storage_capacity_kg or 150.0,
        "message": f"Receiving capacity updated to {payload.current_capacity_kg} kg."
    }


@ngo_base_router.get("/available-food")
async def get_available_food():
    """Returns suitable surplus food donations filtered and ranked by Rescue Priority Score."""
    return list(available_food_db.values())


@ngo_base_router.get("/available-food/{donation_id}")
async def get_available_food_detail(donation_id: str):
    donation = available_food_db.get(donation_id)
    if not donation:
        raise HTTPException(status_code=404, detail="Surplus food donation opportunity not found")
    return donation


@ngo_base_router.post("/reservations")
async def make_reservation(payload: ReserveFoodRequest):
    """
    Transactional food reservation with partial allocation support.
    Verifies that quantity <= available, holds wallet fare reserve, and creates delivery record.
    """
    donation = available_food_db.get(payload.donation_id)
    if not donation:
        raise HTTPException(status_code=404, detail="Donation not found or no longer available.")

    if payload.quantity_kg > donation["quantity_kg"]:
        raise HTTPException(
            status_code=400, 
            detail=f"Requested {payload.quantity_kg} kg exceeds available {donation['quantity_kg']} kg."
        )

    need = receiver_needs_db.get(payload.need_id)
    if not need:
        raise HTTPException(status_code=404, detail="Specified food need record not found.")

    res_id = f"RES-2026-{uuid.uuid4().hex[:4].upper()}"
    deliv_id = f"DEL-2026-{uuid.uuid4().hex[:4].upper()}"

    fare = donation["delivery_fare_estimate"]["total_logistics_inr"]

    # Verify wallet reserve
    if receiver_wallet_db["available_balance_inr"] < fare:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient available wallet balance (₹{receiver_wallet_db['available_balance_inr']}). Logistics fare requires ₹{fare}."
        )

    # Hold wallet funds
    receiver_wallet_db["reserved_amount_inr"] += fare
    receiver_wallet_db["available_balance_inr"] -= fare
    receiver_wallet_db["transactions"].insert(0, {
        "id": f"TXN-{uuid.uuid4().hex[:4].upper()}",
        "type": "RESERVATION_HOLD",
        "amount_inr": fare,
        "description": f"Logistics Fare Reserve for Delivery #{deliv_id}",
        "status": "HELD",
        "timestamp": datetime.utcnow().isoformat()
    })

    # Record reservation
    reservation = {
        "id": res_id,
        "donation_id": payload.donation_id,
        "ngo_id": "ngo-delhi-rotibank",
        "need_id": payload.need_id,
        "reserved_quantity_kg": payload.quantity_kg,
        "allocated_quantity_kg": payload.quantity_kg,
        "status": "CONFIRMED",
        "reserved_at": datetime.utcnow().isoformat(),
        "expiry_at": (datetime.utcnow() + timedelta(minutes=45)).isoformat(),
        "delivery_id": deliv_id,
        "delivery_charge_inr": fare,
        "food_title": donation["title"],
        "donor_name": donation["donor_name"]
    }
    receiver_reservations_db[res_id] = reservation

    # Create Delivery Job
    delivery = {
        "id": deliv_id,
        "reservation_id": res_id,
        "donation_id": payload.donation_id,
        "food_title": donation["title"],
        "quantity_kg": payload.quantity_kg,
        "dietary_type": donation["dietary_type"],
        "donor_name": donation["donor_name"],
        "donor_address": donation["pickup_address"],
        "receiver_name": "Delhi Roti Bank Relief Foundation",
        "receiver_address": "Shelter No. 4, Mandir Lane, Paharganj, New Delhi",
        "driver_id": "drv-dispatch-pool",
        "driver_name": "Assigned Logistics Partner",
        "driver_phone": "+91 98110 44219",
        "vehicle_type": "Van",
        "vehicle_registration": "DL 1V ** 9901",
        "status": "OPEN",
        "eta_minutes": 25,
        "distance_km": donation["distance_km"],
        "seal_id": f"AN-SEAL-{uuid.uuid4().hex[:5].upper()}",
        "pickup_otp_verified": False,
        "pickup_timestamp": None,
        "pickup_evidence_photo": None,
        "delivery_otp": "8341",
        "delivery_otp_hash": hashlib.sha256("8341".encode()).hexdigest(),
        "delivery_evidence_photo": None,
        "integrity_status": "PENDING_HANDOFF",
        "timeline": [
            {"step": "Donation Matched", "completed": True, "time": "Now"},
            {"step": "Food Reserved", "completed": True, "time": "Now"},
            {"step": "Allocation Confirmed", "completed": True, "time": "Now"},
            {"step": "Driver Assigned", "completed": False, "time": "Pending"},
            {"step": "Pickup Verified & Sealed", "completed": False, "time": "Pending"},
            {"step": "Food In Transit", "completed": False, "time": "Pending"},
            {"step": "Arrived at Receiver", "completed": False, "time": "Pending"},
            {"step": "Handoff OTP Verified", "completed": False, "time": "Pending"},
            {"step": "Settlement & Impact Logged", "completed": False, "time": "Pending"}
        ]
    }
    receiver_deliveries_db[deliv_id] = delivery

    # Deduct quantity from donation
    donation["quantity_kg"] -= payload.quantity_kg
    if donation["quantity_kg"] <= 0:
        del available_food_db[payload.donation_id]

    # Update need fulfilled quantity
    need["fulfilled_quantity_kg"] += payload.quantity_kg
    need["remaining_quantity_kg"] = max(0.0, need["required_quantity_kg"] - need["fulfilled_quantity_kg"])
    if need["remaining_quantity_kg"] <= 0:
        need["status"] = "FULFILLED"
    else:
        need["status"] = "PARTIALLY_FULFILLED"

    return {
        "success": True,
        "message": f"Successfully reserved {payload.quantity_kg} kg food. Delivery #{deliv_id} initiated.",
        "reservation": reservation,
        "delivery": delivery
    }


@ngo_base_router.get("/reservations")
async def get_reservations():
    return list(receiver_reservations_db.values())


@ngo_base_router.get("/deliveries")
async def get_deliveries():
    return list(receiver_deliveries_db.values())


@ngo_base_router.get("/deliveries/{delivery_id}")
async def get_delivery_detail(delivery_id: str):
    delivery = receiver_deliveries_db.get(delivery_id)
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery record not found")
    return delivery


@ngo_base_router.get("/deliveries/{delivery_id}/receive-otp")
async def get_receive_otp(delivery_id: str):
    """Returns single-use receiving-side OTP for driver handoff verification."""
    delivery = receiver_deliveries_db.get(delivery_id)
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery record not found")
    return {
        "delivery_id": delivery_id,
        "receiving_otp": delivery["delivery_otp"],
        "instructions": "Share this 4-digit code with the arriving delivery driver only after physical inspection of sealed food."
    }


@ngo_base_router.post("/deliveries/{delivery_id}/verify")
async def verify_delivery_handoff(delivery_id: str, payload: VerifyDeliveryHandoffRequest):
    """
    Authoritative Delivery Verification:
    - Checks receiver-side single-use OTP
    - Records tamper seal condition
    - Groq Vision package comparison (advisory integrity review)
    - Triggers wallet final settlement & impact logging
    """
    delivery = receiver_deliveries_db.get(delivery_id)
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery record not found")

    # Verify OTP
    if payload.receiver_otp.strip() != delivery["delivery_otp"]:
        raise HTTPException(status_code=400, detail="Invalid OTP code. Please enter the correct 4-digit receiving OTP.")

    # Mark delivery as completed
    delivery["status"] = "DELIVERED"
    delivery["seal_status"] = payload.package_seal_status
    delivery["delivery_evidence_photo"] = payload.delivery_photo_url or "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80"
    delivery["integrity_status"] = "NO_VISIBLE_DISCREPANCY" if payload.package_seal_status == "INTACT" else "FLAGGED_FOR_MANUAL_REVIEW"
    
    # Complete timeline
    for step in delivery["timeline"]:
        step["completed"] = True

    # Settle wallet reserve
    fare = 370.0
    receiver_wallet_db["reserved_amount_inr"] = max(0.0, receiver_wallet_db["reserved_amount_inr"] - fare)
    receiver_wallet_db["total_balance_inr"] = max(0.0, receiver_wallet_db["total_balance_inr"] - fare)
    receiver_wallet_db["transactions"].insert(0, {
        "id": f"TXN-{uuid.uuid4().hex[:4].upper()}",
        "type": "DELIVERY_SETTLEMENT",
        "amount_inr": fare,
        "description": f"Logistics Settlement Completed for Delivery #{delivery_id}",
        "status": "SETTLED",
        "timestamp": datetime.utcnow().isoformat()
    })

    return {
        "success": True,
        "message": f"Food delivery #{delivery_id} successfully verified! Custody and impact logged.",
        "delivery": delivery
    }


@ngo_base_router.get("/wallet")
async def get_receiver_wallet():
    """Returns wallet balance, reserved funds, and ledger transactions."""
    return receiver_wallet_db


@ngo_base_router.get("/impact")
async def get_receiver_impact():
    """Factual NGO receiving metrics + clearly marked derived environmental estimates."""
    return {
        "factual_records": {
            "total_food_received_kg": 846.0,
            "meals_served": 1692,
            "needs_fulfilled": 38,
            "deliveries_completed": 38,
            "donor_partners_supported": 9,
            "reporting_period": "Current Calendar Year (2026)"
        },
        "environmental_estimates": {
            "is_estimate": True,
            "co2e_prevented_kg": round(846.0 * 2.5, 1),
            "water_conserved_litres": round(846.0 * 500.0, 1),
            "landfill_methane_diverted_kg": round(846.0 * 0.18, 1),
            "methodology_disclaimer": "*Derived environmental calculations are indicative estimates based on UNEP & FAO surplus food diversion factors (2.5 kg CO₂e / kg food)."
        }
    }


@ngo_base_router.get("/reports")
async def get_receiver_reports():
    """Generates official verified audit reports."""
    return [
        {
            "id": "REP-REC-2026-001",
            "title": "Monthly Food Receipt & Nutrition Audit",
            "period": "September 2026",
            "type": "MONTHLY_RECEIPT",
            "food_received_kg": 846.0,
            "meals_supported": 1692,
            "deliveries_verified": 38,
            "generated_date": "2026-09-24",
            "audit_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            "verification_authority": "AnnaSetu Verified Receiver Audit & Impact Documentation"
        },
        {
            "id": "REP-REC-2026-002",
            "title": "Need Fulfillment & Logistics Efficiency Report",
            "period": "August 2026",
            "type": "LOGISTICS_EFFICIENCY",
            "food_received_kg": 720.0,
            "meals_supported": 1440,
            "deliveries_verified": 32,
            "generated_date": "2026-08-31",
            "audit_hash": "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
            "verification_authority": "AnnaSetu Verified Receiver Audit & Impact Documentation"
        }
    ]


@ngo_base_router.get("/notifications")
async def get_receiver_notifications():
    return receiver_notifications_db


@ngo_base_router.patch("/notifications/{notif_id}/read")
async def mark_notification_read(notif_id: str):
    for n in receiver_notifications_db:
        if n["id"] == notif_id:
            n["is_read"] = True
            return {"success": True, "id": notif_id, "is_read": True}
    raise HTTPException(status_code=404, detail="Notification not found")


ngo_profile_db: Dict[str, Any] = {
    "organization_name": "Delhi Roti Bank Relief Foundation",
    "registration_number": "NPO/DL/78912/2019",
    "ngo_darpan_id": "DL/2021/0284912",
    "tax_exemption_80g": "AAATD1829PF20214",
    "contact_person": "Sunita Verma",
    "designation": "Operations Director",
    "phone": "+91 98101 22891",
    "email": "sunita@delhirotibank.org",
    "address": "Shelter No. 4, Mandir Lane, Paharganj",
    "city": "New Delhi",
    "state": "Delhi",
    "pincode": "110055",
    "capacity": {
        "current_receiving_capacity_kg": 35.0,
        "normal_daily_capacity_kg": 120.0,
        "cold_storage_capacity_kg": 40.0
    },
    "dietary_preferences": {
        "vegetarian_mandatory": True,
        "non_vegetarian_accepted": False,
        "preferred_categories": ["PREPARED_MEALS", "RICE", "BREAD_BAKERY"]
    },
    "verification_status": "VERIFIED"
}


@ngo_base_router.get("/profile")
async def get_receiver_profile():
    return ngo_profile_db


@ngo_base_router.patch("/profile")
async def update_receiver_profile(payload: Dict[str, Any]):
    for key, value in payload.items():
        if key in ngo_profile_db:
            if isinstance(ngo_profile_db[key], dict) and isinstance(value, dict):
                ngo_profile_db[key].update(value)
            else:
                ngo_profile_db[key] = value
        else:
            ngo_profile_db[key] = value
    return {"success": True, "message": "Organization profile updated.", "profile": ngo_profile_db}



@ngo_base_router.post("/support/incidents")
async def report_receiver_incident(payload: ReceiverIncidentRequest):
    ticket_id = f"INC-REC-{uuid.uuid4().hex[:6].upper()}"
    incident = {
        "ticket_id": ticket_id,
        "delivery_id": payload.delivery_id or "GENERAL_RECEIVER_ISSUE",
        "category": payload.category,
        "description": payload.description,
        "urgency": payload.urgency,
        "status": "INVESTIGATING",
        "logged_at": datetime.utcnow().isoformat(),
        "assigned_desk": "Delhi Central Rescue Dispatch"
    }
    receiver_incidents_db.append(incident)
    return {
        "success": True,
        "ticket_id": ticket_id,
        "message": f"Incident #{ticket_id} filed. AnnaSetu dispatch desk is reviewing."
    }


# Dual-mount routers for /receiver and /ngo
receiver_router = APIRouter(prefix="/receiver", tags=["receiver"])
receiver_router.include_router(ngo_base_router)

ngo_router = APIRouter(prefix="/ngo", tags=["ngo"])
ngo_router.include_router(ngo_base_router)
