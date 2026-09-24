"""
ANNASETU Driver Matching & Atomic First-Accept-Wins Engine
Manages driver eligibility checks, dynamic radius widening, and concurrency-safe
first-accept-wins job transitions.
"""

import threading
from datetime import datetime
from typing import List, Dict, Optional, Tuple
from pydantic import BaseModel
from apps.api.matching.models import (
    VehicleClass,
    JobStatus,
    DeliveryJob,
    Location,
    VerificationStatus,
)
from apps.api.matching.eligibility import haversine_distance_km

VEHICLE_HIERARCHY = {
    VehicleClass.MOTORCYCLE: 1,
    VehicleClass.SCOOTER: 2,
    VehicleClass.SMALL_VAN: 3,
    VehicleClass.VAN: 4,
    VehicleClass.MINI_TRUCK: 5,
    VehicleClass.TRUCK: 6,
}


class DriverProfile(BaseModel):
    id: str
    name: str
    phone: str
    vehicle_class: VehicleClass
    verification_status: VerificationStatus
    is_compliant: bool = True
    is_available: bool = True
    current_location: Location
    completed_deliveries: int = 0
    total_earnings: float = 0.0


class DriverMatchingService:
    def __init__(self):
        self.drivers: Dict[str, DriverProfile] = {}
        self.jobs: Dict[str, DeliveryJob] = {}
        self._job_locks: Dict[str, threading.Lock] = {}
        self._registry_lock = threading.Lock()

    def get_job_lock(self, job_id: str) -> threading.Lock:
        with self._registry_lock:
            if job_id not in self._job_locks:
                self._job_locks[job_id] = threading.Lock()
            return self._job_locks[job_id]

    def register_driver(self, driver: DriverProfile):
        self.drivers[driver.id] = driver

    def find_eligible_drivers(
        self,
        job: DeliveryJob,
        current_radius_km: float = 8.0
    ) -> List[Tuple[DriverProfile, float]]:
        """
        Finds drivers matching:
        VERIFIED + COMPLIANT + AVAILABLE + CORRECT_VEHICLE + WITHIN_SEARCH_RADIUS
        Returns [(driver, distance_km)] sorted by distance.
        """
        required_rank = VEHICLE_HIERARCHY.get(job.required_vehicle_class, 1)
        eligible: List[Tuple[DriverProfile, float]] = []

        for driver in self.drivers.values():
            if driver.verification_status != VerificationStatus.VERIFIED:
                continue
            if not driver.is_compliant:
                continue
            if not driver.is_available:
                continue

            # Vehicle capacity check: driver's vehicle must meet or exceed required capacity
            driver_rank = VEHICLE_HIERARCHY.get(driver.vehicle_class, 1)
            if driver_rank < required_rank:
                continue

            # Distance check to pickup
            dist = haversine_distance_km(
                driver.current_location.latitude,
                driver.current_location.longitude,
                job.pickup_location.latitude,
                job.pickup_location.longitude,
            )
            if dist <= current_radius_km:
                eligible.append((driver, dist))

        eligible.sort(key=lambda x: x[1])
        return eligible

    def atomic_accept_job(
        self,
        job_id: str,
        driver_id: str,
        current_time: datetime = None
    ) -> Tuple[bool, Optional[DeliveryJob], str]:
        """
        Atomic First-Accept-Wins implementation.
        Only the first valid accept transitions status from AVAILABLE to ACCEPTED.
        Concurrent later attempts fail cleanly with a descriptive message.
        """
        if current_time is None:
            current_time = datetime.utcnow()

        lock = get_job_lock_for_id = self.get_job_lock(job_id)
        with lock:
            job = self.jobs.get(job_id)
            if not job:
                return False, None, "Delivery job not found."

            if job.status != JobStatus.AVAILABLE:
                return (
                    False,
                    None,
                    f"Job is no longer available (already claimed by driver {job.driver_name or job.driver_id}, status: {job.status.value})."
                )

            driver = self.drivers.get(driver_id)
            if not driver:
                return False, None, "Driver profile not found."

            if not driver.is_available:
                return False, None, "Driver is currently on another assignment or marked unavailable."

            # Atomic state transition
            job.status = JobStatus.ACCEPTED
            job.driver_id = driver.id
            job.driver_name = driver.name
            job.accepted_at = current_time

            driver.is_available = False

            return True, job, f"Job {job_id} successfully assigned to {driver.name}."
