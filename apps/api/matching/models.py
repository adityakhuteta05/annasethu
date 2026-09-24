"""
ANNASETU Domain Models & Data Structures
Pure, strongly typed Pydantic models for the entire AnnaSetu marketplace.
"""

from datetime import datetime
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator


class UserRole(str, Enum):
    DONOR = "DONOR"
    NGO = "NGO"
    DRIVER = "DRIVER"
    ADMIN = "ADMIN"


class VerificationStatus(str, Enum):
    REGISTERED = "REGISTERED"
    DOCUMENTS_SUBMITTED = "DOCUMENTS_SUBMITTED"
    GOVERNMENT_CHECK = "GOVERNMENT_CHECK"
    ADMIN_REVIEW = "ADMIN_REVIEW"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"


class FoodCategory(str, Enum):
    GRAINS_RICE = "GRAINS_RICE"
    CURRIES_GRAVIES = "CURRIES_GRAVIES"
    BREADS_ROTI = "BREADS_ROTI"
    DAIRY_SWEETS = "DAIRY_SWEETS"
    SNACKS_SAVORIES = "SNACKS_SAVORIES"
    FRESH_PRODUCE = "FRESH_PRODUCE"
    PACKAGED_MEALS = "PACKAGED_MEALS"
    BEVERAGES = "BEVERAGES"
    OTHER = "OTHER"


class DietaryType(str, Enum):
    VEG = "VEG"
    NON_VEG = "NON_VEG"
    ANY = "ANY"


class MealPeriod(str, Enum):
    BREAKFAST = "BREAKFAST"
    LUNCH = "LUNCH"
    DINNER = "DINNER"
    OTHER = "OTHER"


class NeedStatus(str, Enum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    PARTIALLY_FULFILLED = "PARTIALLY_FULFILLED"
    FULFILLED = "FULFILLED"
    EXPIRED = "EXPIRED"
    CANCELLED = "CANCELLED"


class DonationStatus(str, Enum):
    DRAFT = "DRAFT"
    POSTED = "POSTED"
    MATCHED = "MATCHED"
    ALLOCATED = "ALLOCATED"
    PICKED_UP = "PICKED_UP"
    IN_TRANSIT = "IN_TRANSIT"
    DELIVERED = "DELIVERED"
    UNMATCHED = "UNMATCHED"
    EXPIRED = "EXPIRED"
    CANCELLED = "CANCELLED"


class ReservationStatus(str, Enum):
    HELD = "HELD"
    CONFIRMED = "CONFIRMED"
    RELEASED = "RELEASED"
    EXPIRED = "EXPIRED"


class VehicleClass(str, Enum):
    MOTORCYCLE = "MOTORCYCLE"  # <= 15 kg
    SCOOTER = "SCOOTER"        # <= 20 kg
    SMALL_VAN = "SMALL_VAN"    # <= 100 kg
    VAN = "VAN"                # <= 300 kg
    MINI_TRUCK = "MINI_TRUCK"  # <= 750 kg
    TRUCK = "TRUCK"            # <= 2000 kg


class JobStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    ACCEPTED = "ACCEPTED"
    ARRIVING_PICKUP = "ARRIVING_PICKUP"
    PICKED_UP = "PICKED_UP"
    IN_TRANSIT = "IN_TRANSIT"
    AT_STOP = "AT_STOP"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"
    FAILED_PICKUP = "FAILED_PICKUP"
    FAILED_DELIVERY = "FAILED_DELIVERY"
    REASSIGNMENT_REQUIRED = "REASSIGNMENT_REQUIRED"


class IntegrityVerdict(str, Enum):
    NO_VISIBLE_DISCREPANCY = "NO_VISIBLE_DISCREPANCY"
    POSSIBLE_PACKAGE_DISCREPANCY = "POSSIBLE_PACKAGE_DISCREPANCY"
    AI_UNAVAILABLE_MANUAL_REVIEW = "AI_UNAVAILABLE_MANUAL_REVIEW"


class Location(BaseModel):
    address: str
    latitude: float
    longitude: float
    city: str = "Delhi NCR"
    contact_phone: Optional[str] = None
    contact_person: Optional[str] = None


class FoodDonation(BaseModel):
    id: str
    donor_id: str
    donor_name: str
    title: str
    food_category: FoodCategory
    dietary_type: DietaryType
    quantity_kg: float = Field(..., description="Weight in kilograms (must be >= 5 kg)")
    remaining_kg: float
    prepared_at: datetime
    available_from: datetime
    deadline: datetime
    storage_condition: str = "Ambient (20-25°C)"
    packaging_type: str = "Insulated stainless containers"
    is_sealed: bool = True
    seal_id: Optional[str] = None
    pickup_location: Location
    pickup_instructions: Optional[str] = None
    image_url: Optional[str] = None
    status: DonationStatus = DonationStatus.POSTED
    created_at: datetime = Field(default_factory=datetime.utcnow)

    @field_validator("quantity_kg")
    @classmethod
    def validate_minimum_quantity(cls, v: float) -> float:
        if v < 5.0:
            raise ValueError("Donations below 5 kg cannot be published. Server-side minimum rule violated.")
        return round(v, 2)


class NGONeed(BaseModel):
    id: str
    ngo_id: str
    ngo_name: str
    title: str
    meal_period: MealPeriod
    food_category: Optional[FoodCategory] = None
    dietary_requirement: DietaryType = DietaryType.ANY
    required_quantity_kg: float
    minimum_acceptable_kg: float = 5.0
    fulfilled_quantity_kg: float = 0.0
    required_by: datetime
    receiving_location: Location
    available_capacity_kg: float
    receiving_hours_start: str = "08:00"
    receiving_hours_end: str = "22:00"
    special_requirements: Optional[str] = None
    status: NeedStatus = NeedStatus.ACTIVE
    created_at: datetime = Field(default_factory=datetime.utcnow)

    @property
    def remaining_needed_kg(self) -> float:
        return max(0.0, round(self.required_quantity_kg - self.fulfilled_quantity_kg, 2))


class ScoreBreakdown(BaseModel):
    score: int = Field(..., ge=0, le=100)
    expiry_urgency: int = Field(..., ge=0, le=100)
    eta_efficiency: int = Field(..., ge=0, le=100)
    distance_efficiency: int = Field(..., ge=0, le=100)
    need_fulfillment: int = Field(..., ge=0, le=100)
    route_efficiency: int = Field(..., ge=0, le=100)
    reasons: List[str] = Field(default_factory=list)


class MatchProposal(BaseModel):
    donation_id: str
    need_id: str
    ngo_id: str
    ngo_name: str
    donor_id: str
    donor_name: str
    eligible: bool
    rejection_reasons: List[str] = Field(default_factory=list)
    score: Optional[int] = None
    breakdown: Optional[ScoreBreakdown] = None
    distance_km: float
    estimated_eta_minutes: int
    allocatable_quantity_kg: float
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Reservation(BaseModel):
    id: str
    donation_id: str
    need_id: str
    ngo_id: str
    reserved_quantity_kg: float
    status: ReservationStatus = ReservationStatus.HELD
    expires_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Allocation(BaseModel):
    id: str
    donation_id: str
    need_id: str
    ngo_id: str
    allocated_quantity_kg: float
    confirmed_at: datetime = Field(default_factory=datetime.utcnow)


class FareQuote(BaseModel):
    base_fare: float
    distance_fare: float
    time_fare: float
    stops_fare: float
    delivery_fare: float
    platform_fee_12_percent: float
    ngo_total: float
    driver_payout: float
    distance_km: float
    duration_minutes: int


class DeliveryStop(BaseModel):
    stop_number: int
    need_id: str
    ngo_id: str
    ngo_name: str
    location: Location
    quantity_kg: float
    delivery_otp_hash: str
    arrived_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    proof_image_url: Optional[str] = None
    status: str = "PENDING"


class DeliveryJob(BaseModel):
    id: str
    donation_id: str
    donor_id: str
    donor_name: str
    pickup_location: Location
    pickup_seal_id: Optional[str] = None
    pickup_otp_hash: str
    required_vehicle_class: VehicleClass
    total_quantity_kg: float
    stops: List[DeliveryStop]
    fare_quote: FareQuote
    driver_id: Optional[str] = None
    driver_name: Optional[str] = None
    status: JobStatus = JobStatus.AVAILABLE
    pickup_evidence_url: Optional[str] = None
    delivery_evidence_url: Optional[str] = None
    integrity_verdict: Optional[IntegrityVerdict] = None
    integrity_reason: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    accepted_at: Optional[datetime] = None
    picked_up_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
