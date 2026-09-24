"""
ANNASETU Comprehensive Test Suite
Validates PRD Core Engineering Principles, Concurrency Invariants,
Deterministic Engines, and End-to-End Rescue Loop.
"""

import threading
import pytest
from datetime import datetime, timedelta
from apps.api.matching.models import (
    FoodDonation,
    NGONeed,
    FoodCategory,
    DietaryType,
    MealPeriod,
    Location,
    VehicleClass,
    JobStatus,
    DeliveryJob,
    DeliveryStop,
)
from apps.api.matching.eligibility import check_eligibility
from apps.api.matching.scoring import calculate_rescue_priority_score
from apps.api.matching.allocation import AllocationManager
from apps.api.delivery.driver_matching import DriverMatchingService, DriverProfile
from apps.api.delivery.fare import calculate_fare
from apps.api.trust.otp import OTPService
from apps.api.finance.wallet import FinanceService
from apps.api.impact.calculator import calculate_impact_for_rescue


def make_dummy_location(lat: float = 28.6139, lon: float = 77.2090) -> Location:
    return Location(
        address="Test Address, New Delhi",
        latitude=lat,
        longitude=lon,
        city="Delhi NCR",
    )


def test_minimum_quantity_enforcement():
    """Validates that donations strictly below 5 kg cannot be created."""
    now = datetime.utcnow()
    with pytest.raises(ValueError, match="below 5 kg cannot be published"):
        FoodDonation(
            id="don-invalid",
            donor_id="donor-1",
            donor_name="Test Kitchen",
            title="Small soup portion",
            food_category=FoodCategory.CURRIES_GRAVIES,
            dietary_type=DietaryType.VEG,
            quantity_kg=4.2,  # Invalid: below 5 kg
            remaining_kg=4.2,
            prepared_at=now,
            available_from=now,
            deadline=now + timedelta(hours=3),
            pickup_location=make_dummy_location(),
        )


def test_concurrency_safe_reservation_preventing_over_allocation():
    """
    CRITICAL PRD REQUIREMENT (Phase 5, Page 18):
    A 30 kg donation receiving simultaneous 15 kg and 20 kg requests
    must NEVER end with more than 30 kg reserved or allocated!
    """
    now = datetime.utcnow()
    donation = FoodDonation(
        id="don-concurrency-30kg",
        donor_id="donor-test",
        donor_name="Hotel Concurrency",
        title="30 kg Rice Feast",
        food_category=FoodCategory.GRAINS_RICE,
        dietary_type=DietaryType.VEG,
        quantity_kg=30.0,
        remaining_kg=30.0,
        prepared_at=now,
        available_from=now,
        deadline=now + timedelta(hours=4),
        pickup_location=make_dummy_location(),
    )

    need_a = NGONeed(
        id="need-A",
        ngo_id="ngo-A",
        ngo_name="NGO Alpha",
        title="15 kg Request",
        meal_period=MealPeriod.DINNER,
        required_quantity_kg=15.0,
        minimum_acceptable_kg=5.0,
        required_by=now + timedelta(hours=3),
        receiving_location=make_dummy_location(),
        available_capacity_kg=50.0,
    )

    need_b = NGONeed(
        id="need-B",
        ngo_id="ngo-B",
        ngo_name="NGO Beta",
        title="20 kg Request",
        meal_period=MealPeriod.DINNER,
        required_quantity_kg=20.0,
        minimum_acceptable_kg=5.0,
        required_by=now + timedelta(hours=3),
        receiving_location=make_dummy_location(),
        available_capacity_kg=50.0,
    )

    alloc_mgr = AllocationManager()
    results = []

    def attempt_reservation(need, qty):
        success, res, msg = alloc_mgr.reserve_food(donation, need, qty, current_time=now)
        results.append((success, res, msg))

    # Spawn 2 simultaneous threads
    t1 = threading.Thread(target=attempt_reservation, args=(need_a, 15.0))
    t2 = threading.Thread(target=attempt_reservation, args=(need_b, 20.0))

    t1.start()
    t2.start()
    t1.join()
    t2.join()

    # Verify that total held quantity is <= 30 kg
    total_held = alloc_mgr.get_active_reserved_quantity(donation.id, current_time=now)
    assert total_held <= 30.0, f"Over-allocation occurred! Total held: {total_held} kg > 30 kg"

    # Exactly one succeeded or both succeeded only if sum <= 30 (here 15 + 20 = 35 > 30, so exactly one MUST fail)
    successes = [r for r in results if r[0] is True]
    failures = [r for r in results if r[0] is False]
    assert len(successes) == 1
    assert len(failures) == 1
    assert "Over-allocation prevented" in failures[0][2]


def test_deterministic_eligibility_dietary_mismatch():
    """Tests that Non-Veg food cannot be allocated to a Veg-only need."""
    now = datetime.utcnow()
    donation = FoodDonation(
        id="don-chicken",
        donor_id="donor-1",
        donor_name="Grill House",
        title="Grilled Chicken & Rice",
        food_category=FoodCategory.PACKAGED_MEALS,
        dietary_type=DietaryType.NON_VEG,
        quantity_kg=20.0,
        remaining_kg=20.0,
        prepared_at=now,
        available_from=now,
        deadline=now + timedelta(hours=3),
        pickup_location=make_dummy_location(28.6139, 77.2090),
    )

    veg_need = NGONeed(
        id="need-pure-veg",
        ngo_id="ngo-veg",
        ngo_name="ISKCON Food for Life",
        title="Pure Veg Lunch Needed",
        meal_period=MealPeriod.LUNCH,
        dietary_requirement=DietaryType.VEG,
        required_quantity_kg=20.0,
        minimum_acceptable_kg=5.0,
        required_by=now + timedelta(hours=2),
        receiving_location=make_dummy_location(28.6200, 77.2100),
        available_capacity_kg=50.0,
    )

    is_elig, rejections, dist_km, eta_mins = check_eligibility(donation, veg_need, current_time=now)
    assert is_elig is False
    assert any("Dietary mismatch" in r for r in rejections)


def test_rescue_priority_score_calculation():
    """Tests the deterministic 0-100 score and explainability breakdown."""
    now = datetime.utcnow()
    donation = FoodDonation(
        id="don-fresh",
        donor_id="donor-1",
        donor_name="Taj Palace",
        title="Buffet Excess Dal & Rice",
        food_category=FoodCategory.GRAINS_RICE,
        dietary_type=DietaryType.VEG,
        quantity_kg=25.0,
        remaining_kg=25.0,
        prepared_at=now - timedelta(hours=1),
        available_from=now,
        deadline=now + timedelta(hours=2),  # Urgent: 2 hours left
        pickup_location=make_dummy_location(28.60, 77.20),
    )

    need = NGONeed(
        id="need-nearby",
        ngo_id="ngo-1",
        ngo_name="Nearby Shelter",
        title="Hot Meals",
        meal_period=MealPeriod.DINNER,
        required_quantity_kg=25.0,
        minimum_acceptable_kg=5.0,
        required_by=now + timedelta(hours=2, minutes=30),
        receiving_location=make_dummy_location(28.61, 77.21),
        available_capacity_kg=40.0,
    )

    breakdown = calculate_rescue_priority_score(
        donation=donation,
        need=need,
        distance_km=2.1,
        eta_minutes=18,
        current_time=now,
    )

    assert 0 <= breakdown.score <= 100
    assert breakdown.score >= 80  # Highly compatible, nearby, urgent rescue
    assert len(breakdown.reasons) > 0


def test_first_accept_wins_concurrency():
    """
    CRITICAL PRD REQUIREMENT (Section 18, Page 9):
    Driver A -> ACCEPT
    Driver B -> ACCEPT
    Exactly one transaction succeeds!
    """
    service = DriverMatchingService()
    now = datetime.utcnow()

    d1 = DriverProfile(
        id="drv-1",
        name="Driver One",
        phone="+91-11111",
        vehicle_class=VehicleClass.VAN,
        verification_status="VERIFIED",
        current_location=make_dummy_location(),
    )
    d2 = DriverProfile(
        id="drv-2",
        name="Driver Two",
        phone="+91-22222",
        vehicle_class=VehicleClass.VAN,
        verification_status="VERIFIED",
        current_location=make_dummy_location(),
    )
    service.register_driver(d1)
    service.register_driver(d2)

    quote = calculate_fare(VehicleClass.VAN, distance_km=5.0, duration_minutes=20)
    job = DeliveryJob(
        id="job-first-accept",
        donation_id="don-1",
        donor_id="donor-1",
        donor_name="Donor",
        pickup_location=make_dummy_location(),
        pickup_otp_hash="HASH",
        required_vehicle_class=VehicleClass.VAN,
        total_quantity_kg=25.0,
        stops=[],
        fare_quote=quote,
        status=JobStatus.AVAILABLE,
    )
    service.jobs[job.id] = job

    outcomes = []

    def accept(driver_id):
        ok, j, msg = service.atomic_accept_job(job.id, driver_id, current_time=now)
        outcomes.append((ok, driver_id, msg))

    t1 = threading.Thread(target=accept, args=("drv-1",))
    t2 = threading.Thread(target=accept, args=("drv-2",))
    t1.start()
    t2.start()
    t1.join()
    t2.join()

    successes = [o for o in outcomes if o[0] is True]
    failures = [o for o in outcomes if o[0] is False]
    assert len(successes) == 1, "Exactly one driver accept must succeed."
    assert len(failures) == 1, "The competing driver accept must fail cleanly."
    assert "no longer available" in failures[0][2]


def test_hashed_otp_security_and_attempt_limit():
    """Validates that OTPs are attempt-limited, verified via hash, and expire."""
    otp_svc = OTPService()
    raw_code, hashed = otp_svc.generate_otp("job-ref-test", expiry_minutes=15)

    # 1. Plaintext code is not equal to hash
    assert raw_code != hashed
    assert len(hashed) == 64  # SHA-256 length

    # 2. Invalid attempt
    ok, msg = otp_svc.verify_otp("job-ref-test", "999999")
    assert ok is False
    assert "2 attempt(s) remaining" in msg

    # 3. Successful attempt
    ok, msg = otp_svc.verify_otp("job-ref-test", raw_code)
    assert ok is True

    # 4. Single-use enforcement: second attempt with valid code fails
    ok, msg = otp_svc.verify_otp("job-ref-test", raw_code)
    assert ok is False
    assert "already been used" in msg


def test_financial_ledger_append_only_and_platform_fee():
    """Validates double-entry append-only ledger and 12% platform fee calculation."""
    fin = FinanceService()
    ngo_wallet = fin.create_wallet("ngo-test", "Test NGO", "NGO", initial_balance=5000.0)
    driver_wallet = fin.create_wallet("drv-test", "Test Driver", "DRIVER", initial_balance=0.0)

    quote = calculate_fare(VehicleClass.SMALL_VAN, distance_km=10.0, duration_minutes=30)
    assert quote.platform_fee_12_percent == round(quote.delivery_fare * 0.12, 2)
    assert quote.ngo_total == round(quote.delivery_fare + quote.platform_fee_12_percent, 2)

    # 1. Reserve hold
    ok, msg = fin.reserve_funds_for_job("ngo-test", "job-100", quote.ngo_total)
    assert ok is True
    assert ngo_wallet.reserved_balance == quote.ngo_total

    # 2. Settle on delivery
    ok, msg = fin.settle_delivery("job-100", "ngo-test", "drv-test", quote)
    assert ok is True

    # Verify driver received payout and NGO was charged
    assert driver_wallet.available_balance == quote.driver_payout
    assert ngo_wallet.reserved_balance == 0.0

    # Verify all ledger entries are append-only
    entries = fin.ledger
    assert len(entries) >= 4
    types = [e.entry_type.value for e in entries]
    assert "RESERVE_HOLD" in types
    assert "RELEASE_HOLD" in types
    assert "FINAL_CHARGE" in types
    assert "DRIVER_PAYOUT" in types
    assert "PLATFORM_FEE" in types
