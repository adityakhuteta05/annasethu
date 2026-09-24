"""
ANNASETU Vehicle Recommendation and Multi-Stop Route Planning Engine
Determines optimal vehicle class from payload and computes nearest-neighbor
routes for up to 3 receiver stops.
"""

from typing import List, Tuple
from apps.api.matching.models import VehicleClass, Location
from apps.api.matching.eligibility import haversine_distance_km, estimate_transit_time_minutes

VEHICLE_CAPACITIES = [
    (15.0, VehicleClass.MOTORCYCLE),
    (20.0, VehicleClass.SCOOTER),
    (100.0, VehicleClass.SMALL_VAN),
    (300.0, VehicleClass.VAN),
    (750.0, VehicleClass.MINI_TRUCK),
    (2000.0, VehicleClass.TRUCK),
]


def recommend_vehicle_class(quantity_kg: float) -> VehicleClass:
    """Selects the smallest compliant vehicle class capable of carrying the payload."""
    for capacity, vehicle in VEHICLE_CAPACITIES:
        if quantity_kg <= capacity:
            return vehicle
    return VehicleClass.TRUCK


def optimize_multi_stop_route(
    pickup_loc: Location,
    drop_locations: List[Tuple[str, Location]]  # [(need_id, location)]
) -> Tuple[List[str], float, int]:
    """
    Greedy nearest-neighbor route ordering starting from pickup location.
    Caps at 3 stops for MVP.
    Returns:
        (ordered_need_ids, total_distance_km, total_duration_minutes)
    """
    if not drop_locations:
        return [], 0.0, 0

    unvisited = drop_locations[:3]  # Enforce PRD MVP 3 stops cap
    current_pos = pickup_loc
    ordered_ids: List[str] = []
    total_distance = 0.0

    while unvisited:
        best_idx = 0
        best_dist = float("inf")
        for idx, (need_id, loc) in enumerate(unvisited):
            d = haversine_distance_km(
                current_pos.latitude, current_pos.longitude, loc.latitude, loc.longitude
            )
            if d < best_dist:
                best_dist = d
                best_idx = idx

        chosen_id, chosen_loc = unvisited.pop(best_idx)
        ordered_ids.append(chosen_id)
        total_distance += best_dist
        current_pos = chosen_loc

    total_duration = estimate_transit_time_minutes(total_distance)
    return ordered_ids, round(total_distance, 2), total_duration
