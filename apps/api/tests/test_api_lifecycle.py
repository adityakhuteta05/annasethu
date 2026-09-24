"""
ANNASETU Full Lifecycle End-to-End API Integration Test
Tests the complete scenario from Part V (Definition of Done):
Registration -> Verification -> Need -> Donation -> Match -> Reserve -> Allocate
-> Job Dispatch -> Driver Accept -> Pickup OTP -> Delivery OTP -> Settle -> Impact
"""

import pytest
from fastapi.testclient import TestClient
from apps.api.main import app, initialize_seed_data


@pytest.fixture(autouse=True)
def reset_db_before_test():
    initialize_seed_data()


def test_full_rescue_lifecycle():
    client = TestClient(app)

    # 1. Health check
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["service"] == "ANNASETU Master API"

    # 2. Donor registers
    donor_payload = {
        "name": "Hyatt Regency Catering Hub",
        "role": "DONOR",
        "email": "banquet@hyatt-delhi.com",
        "phone": "+91-98100-99881",
        "gstin": "07AAACH7788D1Z4",
        "fssai_licence": "10015011009988",
        "location": {
            "address": "Bhikaji Cama Place, Ring Road, New Delhi",
            "latitude": 28.5684,
            "longitude": 77.1874,
        }
    }
    r_donor = client.post("/api/users/register", json=donor_payload)
    assert r_donor.status_code == 200
    donor_id = r_donor.json()["id"]

    # 3. Admin reviews and verifies Donor
    v_queue = client.get("/api/verification/queue").json()
    donor_case = next(c for c in v_queue if c["entity_id"] == donor_id)
    r_review = client.post("/api/verification/review", json={
        "case_id": donor_case["id"],
        "action": "APPROVE",
        "notes": "Verified against FoSCoS portal.",
    })
    assert r_review.status_code == 200
    assert r_review.json()["case"]["status"] == "VERIFIED"

    # 4. NGO registers
    ngo_payload = {
        "name": "Navjyoti Children Welfare Shelter",
        "role": "NGO",
        "email": "director@navjyotishelter.org",
        "phone": "+91-98777-66554",
        "ngo_darpan_id": "DL/2021/0887766",
        "pan": "AAATN5544R",
        "location": {
            "address": "Sarojini Nagar Welfare Center, New Delhi",
            "latitude": 28.5750,
            "longitude": 77.1950,
        }
    }
    r_ngo = client.post("/api/users/register", json=ngo_payload)
    assert r_ngo.status_code == 200
    ngo_id = r_ngo.json()["id"]

    # 5. NGO creates a 20 kg dinner need
    need_payload = {
        "ngo_id": ngo_id,
        "title": "Evening Nourishing Meals for 45 Children",
        "meal_period": "DINNER",
        "food_category": "PACKAGED_MEALS",
        "dietary_requirement": "VEG",
        "required_quantity_kg": 20.0,
        "minimum_acceptable_kg": 5.0,
        "required_by_hours_from_now": 3.5,
        "available_capacity_kg": 40.0,
        "receiving_hours_start": "17:00",
        "receiving_hours_end": "22:00",
    }
    r_need = client.post("/api/needs", json=need_payload)
    assert r_need.status_code == 200
    need_id = r_need.json()["id"]

    # 6. Donor creates a 20 kg donation
    donation_payload = {
        "donor_id": donor_id,
        "title": "Fresh Paneer Rice Bowls & Dal (Evening Banquet Surplus)",
        "food_category": "PACKAGED_MEALS",
        "dietary_type": "VEG",
        "quantity_kg": 20.0,
        "expiry_hours_from_now": 3.5,
        "storage_condition": "Insulated Thermal Box",
        "packaging_type": "Individual sealed meal containers",
        "seal_id": "AS-SEAL-7712",
    }
    r_don = client.post("/api/donations", json=donation_payload)
    assert r_don.status_code == 200
    donation_id = r_don.json()["id"]

    # 7. Matching engine identifies proposal with Rescue Priority Score & explainability
    r_props = client.get(f"/api/matching/proposals?donation_id={donation_id}&need_id={need_id}")
    assert r_props.status_code == 200
    props = r_props.json()
    assert len(props) > 0
    top_prop = props[0]
    assert top_prop["eligible"] is True
    assert top_prop["score"] >= 70
    assert "breakdown" in top_prop
    assert len(top_prop["breakdown"]["reasons"]) > 0

    # 8. NGO reserves food
    r_res = client.post("/api/matching/reserve", json={
        "donation_id": donation_id,
        "need_id": need_id,
        "requested_quantity_kg": 20.0,
    })
    assert r_res.status_code == 200
    reservation = r_res.json()["reservation"]
    res_id = reservation["id"]

    # 9. Confirm Allocation & Dispatch Delivery Job
    r_alloc = client.post("/api/matching/confirm-allocation", json={
        "donation_id": donation_id,
        "need_id": need_id,
        "reservation_id": res_id,
    })
    assert r_alloc.status_code == 200
    alloc_data = r_alloc.json()
    job = alloc_data["delivery_job"]
    job_id = job["id"]
    pickup_otp = alloc_data["donor_pickup_otp"]
    delivery_otp = alloc_data["ngo_delivery_otp"]

    assert job["fare_quote"]["platform_fee_12_percent"] > 0
    assert job["fare_quote"]["ngo_total"] > job["fare_quote"]["delivery_fare"]

    # 10. Driver accepts (Amit Singh, driver-amit)
    r_accept = client.post(f"/api/delivery/jobs/{job_id}/accept", json={"driver_id": "drv-amit"})
    assert r_accept.status_code == 200
    assert r_accept.json()["job"]["status"] == "ACCEPTED"

    # 11. Driver performs Pickup Handoff
    r_pickup = client.post(f"/api/delivery/jobs/{job_id}/pickup-handoff", json={
        "driver_id": "drv-amit",
        "driver_lat": 28.5684,
        "driver_lon": 77.1874,
        "entered_otp": pickup_otp,
        "seal_id": "AS-SEAL-7712",
        "photo_url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
    })
    assert r_pickup.status_code == 200
    assert r_pickup.json()["job"]["status"] == "IN_TRANSIT"

    # 12. Driver reaches NGO and performs Delivery Handoff
    r_delivery = client.post(f"/api/delivery/jobs/{job_id}/delivery-handoff", json={
        "driver_id": "drv-amit",
        "driver_lat": 28.5750,
        "driver_lon": 77.1950,
        "entered_otp": delivery_otp,
        "seal_id": "AS-SEAL-7712",
        "photo_url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
    })
    assert r_delivery.status_code == 200
    deliv_data = r_delivery.json()
    assert deliv_data["job"]["status"] == "DELIVERED"
    assert deliv_data["ai_integrity"]["verdict"] == "NO_VISIBLE_DISCREPANCY"
    assert deliv_data["impact"]["quantity_kg"] == 20.0
    assert deliv_data["impact"]["meals_supported_estimate"] == 40

    # 13. Verify Impact Certificate
    r_cert = client.get(f"/api/impact/certificate/{job_id}")
    assert r_cert.status_code == 200
    cert = r_cert.json()
    assert "ANNASETU Verified Impact Reporting & Sustainability Documentation" in cert["title"]
    assert cert["rescued_quantity_kg"] == 20.0
    assert cert["meals_supported"] == 40

    # 14. Verify Financial Ledger has double-entry transactions
    r_ledger = client.get("/api/finance/ledger")
    assert r_ledger.status_code == 200
    ledger = r_ledger.json()
    job_entries = [e for e in ledger if e.get("reference_job_id") == job_id]
    entry_types = [e["entry_type"] for e in job_entries]
    assert "RESERVE_HOLD" in entry_types
    assert "RELEASE_HOLD" in entry_types
    assert "FINAL_CHARGE" in entry_types
    assert "DRIVER_PAYOUT" in entry_types
    assert "PLATFORM_FEE" in entry_types
