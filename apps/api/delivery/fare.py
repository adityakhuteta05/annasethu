"""
ANNASETU Fare & Logistics Pricing Engine
Deterministic transparent fare quotes and 12% platform fee calculations.
Actual rates are configuration-driven.
"""

from typing import Dict, Any
from apps.api.matching.models import VehicleClass, FareQuote

# Default vehicle rate cards
BASE_RATES: Dict[VehicleClass, float] = {
    VehicleClass.MOTORCYCLE: 60.0,
    VehicleClass.SCOOTER: 70.0,
    VehicleClass.SMALL_VAN: 180.0,
    VehicleClass.VAN: 300.0,
    VehicleClass.MINI_TRUCK: 450.0,
    VehicleClass.TRUCK: 800.0,
}

DISTANCE_RATE_PER_KM = 15.0  # ₹15 per km
TIME_RATE_PER_MINUTE = 2.5   # ₹2.5 per min
STOP_RATE = 50.0             # ₹50 per extra stop
SERVICE_FEE_PERCENT = 0.12   # 12% transparent platform fee


def calculate_fare(
    vehicle_class: VehicleClass,
    distance_km: float,
    duration_minutes: int,
    stop_count: int = 1,
    service_fee_rate: float = SERVICE_FEE_PERCENT,
) -> FareQuote:
    """
    Computes deterministic delivery fare breakdown.
    Formula: Base + (dist * dist_rate) + (time * time_rate) + (stops * stop_rate)
    NGO Total = Delivery Fare * 1.12 (with 12% service fee itemized)
    """
    base_fare = BASE_RATES.get(vehicle_class, 150.0)
    distance_fare = round(distance_km * DISTANCE_RATE_PER_KM, 2)
    time_fare = round(duration_minutes * TIME_RATE_PER_MINUTE, 2)
    stops_fare = round(max(0, stop_count - 1) * STOP_RATE, 2)

    delivery_fare = round(base_fare + distance_fare + time_fare + stops_fare, 2)
    platform_fee = round(delivery_fare * service_fee_rate, 2)
    ngo_total = round(delivery_fare + platform_fee, 2)
    driver_payout = delivery_fare  # Driver receives full delivery fare

    return FareQuote(
        base_fare=base_fare,
        distance_fare=distance_fare,
        time_fare=time_fare,
        stops_fare=stops_fare,
        delivery_fare=delivery_fare,
        platform_fee_12_percent=platform_fee,
        ngo_total=ngo_total,
        driver_payout=driver_payout,
        distance_km=round(distance_km, 2),
        duration_minutes=duration_minutes,
    )
