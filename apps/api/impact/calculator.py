"""
ANNASETU Measurable Impact Calculation & Sustainability Documentation Engine
Calculates verified meals supported, CO2e prevented, and embedded water conserved.
All non-direct metrics are explicitly labeled as operational estimates.
Guardrail: Labeled as 'ANNASETU Verified Impact Reporting & Sustainability Documentation'.
"""

from datetime import datetime
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

# Configurable standard sustainability factors (FAO / UNEP food waste lifecycle factors)
MEALS_PER_KG = 2.0              # 1 kg ≈ 2 standard nutritious meals
CO2E_KG_PER_KG_FOOD = 2.5       # 2.5 kg CO2e emissions prevented per kg surplus rescued
WATER_LITERS_PER_KG_FOOD = 450  # 450 liters embedded agricultural water conserved per kg
METHANE_KG_PER_KG_FOOD = 0.18   # 0.18 kg landfill methane emissions diverted


class ImpactRecord(BaseModel):
    id: str
    job_id: str
    donation_id: str
    donor_id: str
    donor_name: str
    ngo_id: str
    ngo_name: str
    driver_id: str
    driver_name: str
    food_category: str
    quantity_kg: float
    meals_supported_estimate: int
    co2e_prevented_kg_estimate: float
    water_conserved_liters_estimate: float
    methane_diverted_kg_estimate: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    disclaimer: str = (
        "ANNASETU Verified Impact Reporting & Sustainability Documentation: "
        "Environmental and meal values are calculated estimates based on FAO lifecycle assessment data "
        "to support internal CSR and sustainability reporting. This is operational documentation and does "
        "not constitute a government tax deduction guarantee or certified ESG compliance report."
    )


class ImpactSummary(BaseModel):
    total_rescued_kg: float
    total_meals_supported: int
    total_co2e_prevented_kg: float
    total_water_conserved_liters: float
    total_rescues_completed: int
    active_donors_count: int
    active_ngos_count: int


def calculate_impact_for_rescue(
    job_id: str,
    donation_id: str,
    donor_id: str,
    donor_name: str,
    ngo_id: str,
    ngo_name: str,
    driver_id: str,
    driver_name: str,
    food_category: str,
    quantity_kg: float,
    meals_factor: float = MEALS_PER_KG,
    co2_factor: float = CO2E_KG_PER_KG_FOOD,
    water_factor: float = WATER_LITERS_PER_KG_FOOD,
) -> ImpactRecord:
    """
    Creates an immutable impact record for a successfully verified rescue handoff.
    """
    meals = int(round(quantity_kg * meals_factor))
    co2 = round(quantity_kg * co2_factor, 2)
    water = round(quantity_kg * water_factor, 1)
    methane = round(quantity_kg * METHANE_KG_PER_KG_FOOD, 2)

    return ImpactRecord(
        id=f"IMP-{job_id[-8:]}",
        job_id=job_id,
        donation_id=donation_id,
        donor_id=donor_id,
        donor_name=donor_name,
        ngo_id=ngo_id,
        ngo_name=ngo_name,
        driver_id=driver_id,
        driver_name=driver_name,
        food_category=food_category,
        quantity_kg=round(quantity_kg, 2),
        meals_supported_estimate=meals,
        co2e_prevented_kg_estimate=co2,
        water_conserved_liters_estimate=water,
        methane_diverted_kg_estimate=methane,
    )
