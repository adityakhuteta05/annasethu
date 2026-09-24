"""
ANNASETU Rescue Priority Scoring Engine
Calculates an explainable 0-100 Rescue Priority Score using normalized factor curves.
Weights are dynamic and configuration-driven.
Fairness Rule: Sponsored or partner status NEVER influences priority score.
"""

from datetime import datetime
from typing import Dict, Any, List
from apps.api.matching.models import FoodDonation, NGONeed, ScoreBreakdown

# Default weights from PRD (Section 12 & Section 6.2)
DEFAULT_WEIGHTS = {
    "expiry_urgency": 0.30,
    "eta_efficiency": 0.25,
    "distance_efficiency": 0.20,
    "need_fulfillment": 0.15,
    "route_efficiency": 0.10,
}


def calculate_rescue_priority_score(
    donation: FoodDonation,
    need: NGONeed,
    distance_km: float,
    eta_minutes: int,
    current_time: datetime = None,
    weights: Dict[str, float] = None
) -> ScoreBreakdown:
    """
    Computes a deterministic 0-100 Rescue Priority Score with factor breakdown and explainable reasons.
    """
    if current_time is None:
        current_time = datetime.utcnow()
    if weights is None:
        weights = DEFAULT_WEIGHTS

    reasons: List[str] = []

    # 1. Expiry Urgency (0-100)
    # Food closer to expiration needs more urgent rescue, but must still have enough buffer
    time_to_deadline_hours = max(0.1, (donation.deadline - current_time).total_seconds() / 3600.0)
    if time_to_deadline_hours <= 1.5:
        expiry_urgency = 98
        reasons.append("Critical expiry window: under 90 minutes remaining")
    elif time_to_deadline_hours <= 3.0:
        expiry_urgency = 90
        reasons.append("High urgency: food expires within 3 hours")
    elif time_to_deadline_hours <= 6.0:
        expiry_urgency = 75
        reasons.append("Moderate urgency: rescue window open for 3-6 hours")
    else:
        expiry_urgency = max(40, int(100 - (time_to_deadline_hours * 5)))

    # 2. ETA Efficiency (0-100)
    # Lower ETA is better. 15 mins -> 95, 30 mins -> 80, 60 mins -> 50
    if eta_minutes <= 15:
        eta_eff = 96
        reasons.append(f"Fast delivery feasible (ETA ~{eta_minutes} mins)")
    elif eta_minutes <= 30:
        eta_eff = max(75, 95 - int((eta_minutes - 15) * 1.3))
        reasons.append(f"Reasonable transit time (ETA ~{eta_minutes} mins)")
    else:
        eta_eff = max(30, 75 - int((eta_minutes - 30) * 1.5))

    # 3. Distance Efficiency (0-100)
    # Shorter distance is better. < 3km -> 95+, 3-10km -> 80+, > 20km -> lower
    if distance_km <= 3.0:
        dist_eff = 95
        reasons.append(f"Highly localized donor ({distance_km} km away)")
    elif distance_km <= 8.0:
        dist_eff = max(75, int(95 - (distance_km - 3.0) * 3.5))
        reasons.append(f"Within neighborhood perimeter ({distance_km} km)")
    else:
        dist_eff = max(35, int(75 - (distance_km - 8.0) * 2.0))

    # 4. Need Fulfillment (0-100)
    # How well does the donation match the remaining needed quantity?
    allocatable = min(donation.remaining_kg, need.remaining_needed_kg, need.available_capacity_kg)
    if need.remaining_needed_kg > 0:
        ratio = allocatable / need.remaining_needed_kg
        if ratio >= 0.8:
            fulfillment_score = min(100, int(85 + (ratio * 15)))
            reasons.append(f"Fulfills {int(min(1.0, ratio) * 100)}% of NGO required quantity")
        elif ratio >= 0.4:
            fulfillment_score = int(60 + (ratio * 25))
            reasons.append(f"Substantial partial fulfillment ({int(ratio * 100)}%)")
        else:
            fulfillment_score = max(40, int(ratio * 100))
            reasons.append(f"Partial batch fulfillment ({allocatable} kg)")
    else:
        fulfillment_score = 50

    # 5. Route Efficiency (0-100)
    # Heuristic based on urban transit speed ratio and ease of vehicle access
    route_eff = min(98, max(50, int((dist_eff + eta_eff) / 2)))

    # Weighted Sum
    total_score = (
        expiry_urgency * weights["expiry_urgency"]
        + eta_eff * weights["eta_efficiency"]
        + dist_eff * weights["distance_efficiency"]
        + fulfillment_score * weights["need_fulfillment"]
        + route_eff * weights["route_efficiency"]
    )
    final_score = int(round(min(100, max(0, total_score))))

    return ScoreBreakdown(
        score=final_score,
        expiry_urgency=expiry_urgency,
        eta_efficiency=eta_eff,
        distance_efficiency=dist_eff,
        need_fulfillment=fulfillment_score,
        route_efficiency=route_eff,
        reasons=reasons[:4],  # Top 4 most relevant explainability bullet points
    )
