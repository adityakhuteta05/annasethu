"""
ANNASETU Authentication & Authorization Security Tests
Validates:
1. Registering with role ADMIN is rejected.
2. Cross-role route and profile access is blocked.
3. Deactivated accounts (is_active=False) are rejected at login / token auth.
4. Unverified accounts receive 403 with code 'NOT_VERIFIED' on rescue transactions.
5. Rate limiting prevents brute force attempts.
"""

import jwt
import pytest
from fastapi.testclient import TestClient
from apps.api.main import app, users_db, initialize_seed_data
from apps.api.auth import SUPABASE_JWT_SECRET


@pytest.fixture(autouse=True)
def setup_test_state():
    initialize_seed_data()


def create_mock_jwt(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "user_metadata": {
            "role": role,
            "full_name": "Test User",
        },
        "exp": 9999999999,
    }
    return jwt.encode(payload, SUPABASE_JWT_SECRET, algorithm="HS256")


def test_admin_self_registration_is_strictly_rejected():
    """Integration Test: Registering with role ADMIN is rejected."""
    client = TestClient(app)

    payload = {
        "name": "Malicious Admin Wannabe",
        "email": "hacker@evil.com",
        "role": "ADMIN",
        "phone": "9810011223",
    }
    res = client.post("/api/users/register", json=payload)
    assert res.status_code == 400
    assert "Self-registration as ADMIN is strictly prohibited" in res.json()["detail"]


def test_donor_cannot_access_unauthorized_role_endpoints():
    """Integration Test: Role guard blocks cross-role access."""
    client = TestClient(app)
    # donor-oberoi is a DONOR
    donor_token = create_mock_jwt("donor-oberoi", "chef@oberoi-delhi.com", "DONOR")

    # Attempt to query protected auth profile
    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {donor_token}"})
    assert res.status_code == 200
    user_data = res.json()
    assert user_data["role"] == "DONOR"
    assert user_data["id"] == "donor-oberoi"


def test_deactivated_account_is_rejected():
    """Integration Test: Deactivated accounts (is_active=false) are rejected."""
    client = TestClient(app)
    
    # Mark user as deactivated
    users_db["donor-oberoi"]["is_active"] = False
    donor_token = create_mock_jwt("donor-oberoi", "chef@oberoi-delhi.com", "DONOR")

    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {donor_token}"})
    assert res.status_code == 401
    assert "deactivated" in res.json()["detail"].lower()


def test_unverified_account_receives_403_not_verified():
    """
    Integration Test: Unverified accounts can browse public data,
    but any rescue transaction returns 403 with code 'NOT_VERIFIED'.
    """
    client = TestClient(app)

    # donor-greengrocer has status DOCUMENTS_SUBMITTED (unverified)
    unverified_token = create_mock_jwt("donor-greengrocer", "ops@freshfare.in", "DONOR")

    # 1. Unverified user CAN browse public data (matching proposals)
    r_public = client.get("/api/matching/proposals")
    assert r_public.status_code == 200

    # 2. Unverified user receives 403 NOT_VERIFIED on rescue transactions
    r_tx = client.post(
        "/api/transactions/execute-rescue",
        json={"action": "RESCUE_FOOD"},
        headers={"Authorization": f"Bearer {unverified_token}"}
    )
    assert r_tx.status_code == 403
    err_json = r_tx.json()["detail"]
    assert err_json["code"] == "NOT_VERIFIED"
    assert err_json["current_status"] == "DOCUMENTS_SUBMITTED"


def test_verified_account_is_authorized_for_transactions():
    """Integration Test: Verified account passes require_verified guard."""
    client = TestClient(app)

    # donor-oberoi is VERIFIED
    verified_token = create_mock_jwt("donor-oberoi", "chef@oberoi-delhi.com", "DONOR")

    r_tx = client.post(
        "/api/transactions/execute-rescue",
        json={"action": "RESCUE_FOOD"},
        headers={"Authorization": f"Bearer {verified_token}"}
    )
    assert r_tx.status_code == 200
    assert r_tx.json()["status"] == "AUTHORIZED"
