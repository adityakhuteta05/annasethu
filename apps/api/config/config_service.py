"""
ANNASETU Versioned Configuration Management System
Per PRD Section 41: All business rules, weights, thresholds, and fees
are versioned and loaded from dynamic configuration rather than hardcoded.
"""

from datetime import datetime
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field


class SystemConfiguration(BaseModel):
    version: str = "1.0.0"
    min_donation_quantity_kg: float = 5.0
    platform_service_fee_rate: float = 0.12
    geofence_max_radius_meters: float = 300.0
    otp_expiry_minutes: int = 15
    otp_max_attempts: int = 3
    driver_search_radii_km: list[float] = Field(default_factory=lambda: [5.0, 10.0, 20.0])
    matching_weights: Dict[str, float] = Field(
        default_factory=lambda: {
            "expiry_urgency": 0.30,
            "eta_efficiency": 0.25,
            "distance_efficiency": 0.20,
            "need_fulfillment": 0.15,
            "route_efficiency": 0.10,
        }
    )
    vehicle_capacity_limits_kg: Dict[str, float] = Field(
        default_factory=lambda: {
            "MOTORCYCLE": 15.0,
            "SCOOTER": 20.0,
            "SMALL_VAN": 100.0,
            "VAN": 300.0,
            "MINI_TRUCK": 750.0,
            "TRUCK": 2000.0,
        }
    )
    driver_reward_milestones: list[int] = Field(default_factory=lambda: [50, 100, 250, 500, 1000])
    impact_factors: Dict[str, float] = Field(
        default_factory=lambda: {
            "meals_per_kg": 2.0,
            "co2e_kg_per_kg": 2.5,
            "water_liters_per_kg": 450.0,
            "methane_kg_per_kg": 0.18,
        }
    )
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ConfigService:
    def __init__(self):
        self._current_config = SystemConfiguration()

    def get_config(self) -> SystemConfiguration:
        return self._current_config

    def update_config(self, updates: Dict[str, Any]) -> SystemConfiguration:
        data = self._current_config.model_dump()
        data.update(updates)
        data["updated_at"] = datetime.utcnow()
        self._current_config = SystemConfiguration(**data)
        return self._current_config


config_service = ConfigService()
