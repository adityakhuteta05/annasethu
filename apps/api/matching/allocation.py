"""
ANNASETU Concurrency-Safe Reservation and Allocation Engine
Enforces row-level atomic guarantees, prevents over-allocation, and implements
greedy priority multi-stop allocation.
"""

import threading
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Tuple
from apps.api.matching.models import (
    FoodDonation,
    NGONeed,
    Reservation,
    Allocation,
    ReservationStatus,
    DonationStatus,
    NeedStatus,
)

# Global in-memory lock registry for thread-safe atomic row-level reservation
_donation_locks: Dict[str, threading.Lock] = {}
_registry_lock = threading.Lock()


def get_donation_lock(donation_id: str) -> threading.Lock:
    with _registry_lock:
        if donation_id not in _donation_locks:
            _donation_locks[donation_id] = threading.Lock()
        return _donation_locks[donation_id]


class AllocationManager:
    """
    Thread-safe allocation and reservation manager ensuring transactional integrity.
    """

    def __init__(self):
        self.reservations: Dict[str, Reservation] = {}
        self.allocations: Dict[str, Allocation] = {}

    def get_active_reserved_quantity(self, donation_id: str, current_time: datetime = None) -> float:
        if current_time is None:
            current_time = datetime.utcnow()
        active_holds = [
            r.reserved_quantity_kg
            for r in self.reservations.values()
            if r.donation_id == donation_id
            and r.status == ReservationStatus.HELD
            and r.expires_at > current_time
        ]
        return round(sum(active_holds), 2)

    def reserve_food(
        self,
        donation: FoodDonation,
        need: NGONeed,
        requested_quantity_kg: float,
        hold_duration_minutes: int = 15,
        current_time: datetime = None
    ) -> Tuple[bool, Optional[Reservation], str]:
        """
        Thread-safe atomic reservation.
        Guarantees that active holds + new request NEVER exceed donation.remaining_kg.
        """
        if current_time is None:
            current_time = datetime.utcnow()

        lock = get_donation_lock(donation.id)
        with lock:
            # Re-check active reserved quantities under lock
            currently_held = self.get_active_reserved_quantity(donation.id, current_time)
            available_to_hold = round(donation.remaining_kg - currently_held, 2)

            if requested_quantity_kg <= 0:
                return False, None, "Requested quantity must be greater than zero."

            if requested_quantity_kg > available_to_hold:
                return (
                    False,
                    None,
                    f"Over-allocation prevented: Only {available_to_hold} kg available for hold (active holds: {currently_held} kg, remaining: {donation.remaining_kg} kg)."
                )

            # Cap by NGO need and capacity
            effective_qty = min(
                requested_quantity_kg,
                need.remaining_needed_kg,
                need.available_capacity_kg,
            )
            if effective_qty < need.minimum_acceptable_kg:
                return (
                    False,
                    None,
                    f"Effective reservable quantity ({effective_qty} kg) is below NGO minimum threshold ({need.minimum_acceptable_kg} kg)."
                )

            reservation_id = f"RES-{uuid.uuid4().hex[:8].upper()}"
            reservation = Reservation(
                id=reservation_id,
                donation_id=donation.id,
                need_id=need.id,
                ngo_id=need.ngo_id,
                reserved_quantity_kg=effective_qty,
                status=ReservationStatus.HELD,
                expires_at=current_time + timedelta(minutes=hold_duration_minutes),
                created_at=current_time,
            )
            self.reservations[reservation.id] = reservation
            return True, reservation, f"Successfully held {effective_qty} kg for NGO {need.ngo_name}."

    def confirm_allocation(
        self,
        donation: FoodDonation,
        need: NGONeed,
        reservation_id: str,
        current_time: datetime = None
    ) -> Tuple[bool, Optional[Allocation], str]:
        """
        Transitions a held reservation into a confirmed allocation atomically.
        Commits remaining_kg on donation and fulfilled_quantity_kg on need.
        """
        if current_time is None:
            current_time = datetime.utcnow()

        lock = get_donation_lock(donation.id)
        with lock:
            reservation = self.reservations.get(reservation_id)
            if not reservation:
                return False, None, "Reservation not found."

            if reservation.status != ReservationStatus.HELD:
                return False, None, f"Reservation is no longer held (status: {reservation.status.value})."

            if reservation.expires_at < current_time:
                reservation.status = ReservationStatus.EXPIRED
                return False, None, "Reservation hold has expired."

            alloc_qty = reservation.reserved_quantity_kg
            if alloc_qty > donation.remaining_kg:
                return False, None, "Fatal: Donation remaining quantity insufficient for confirmation."

            # Commit state updates atomically
            donation.remaining_kg = round(donation.remaining_kg - alloc_qty, 2)
            need.fulfilled_quantity_kg = round(need.fulfilled_quantity_kg + alloc_qty, 2)
            need.available_capacity_kg = max(0.0, round(need.available_capacity_kg - alloc_qty, 2))

            if donation.remaining_kg <= 0.05:
                donation.status = DonationStatus.ALLOCATED
            else:
                donation.status = DonationStatus.MATCHED

            if need.remaining_needed_kg <= 0.05:
                need.status = NeedStatus.FULFILLED
            else:
                need.status = NeedStatus.PARTIALLY_FULFILLED

            reservation.status = ReservationStatus.CONFIRMED

            allocation_id = f"ALC-{uuid.uuid4().hex[:8].upper()}"
            allocation = Allocation(
                id=allocation_id,
                donation_id=donation.id,
                need_id=need.id,
                ngo_id=need.ngo_id,
                allocated_quantity_kg=alloc_qty,
                confirmed_at=current_time,
            )
            self.allocations[allocation.id] = allocation

            return True, allocation, f"Confirmed {alloc_qty} kg allocation for {need.ngo_name}."

    def release_stale_holds(self, current_time: datetime = None) -> int:
        """Expires stale reservations whose hold duration has elapsed."""
        if current_time is None:
            current_time = datetime.utcnow()
        expired_count = 0
        for res in self.reservations.values():
            if res.status == ReservationStatus.HELD and res.expires_at <= current_time:
                res.status = ReservationStatus.EXPIRED
                expired_count += 1
        return expired_count
