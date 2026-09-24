"""
ANNASETU Secure Hashed OTP Service
Enforces attempt limits, time-based expiration, and cryptographic hashing.
OTPs are NEVER stored in plaintext in the database or logs.
"""

import hashlib
import random
import threading
from datetime import datetime, timedelta
from typing import Dict, Tuple, Optional


class OTPRecord:
    def __init__(self, hashed_otp: str, expires_at: datetime, max_attempts: int = 3):
        self.hashed_otp = hashed_otp
        self.expires_at = expires_at
        self.max_attempts = max_attempts
        self.attempts = 0
        self.is_used = False


class OTPService:
    def __init__(self):
        self._otps: Dict[str, OTPRecord] = {}  # key: reference_id (e.g., job_id or stop_id)
        self._lock = threading.Lock()

    @staticmethod
    def _hash(otp_code: str) -> str:
        return hashlib.sha256(otp_code.strip().encode("utf-8")).hexdigest()

    def generate_otp(
        self,
        reference_id: str,
        expiry_minutes: int = 15,
        length: int = 6
    ) -> Tuple[str, str]:
        """
        Generates a new random numeric OTP.
        Returns:
            (plain_otp_to_show_to_authorized_party, hashed_otp_to_store)
        """
        raw_code = "".join([str(random.randint(0, 9)) for _ in range(length)])
        hashed = self._hash(raw_code)
        expires_at = datetime.utcnow() + timedelta(minutes=expiry_minutes)

        with self._lock:
            self._otps[reference_id] = OTPRecord(
                hashed_otp=hashed,
                expires_at=expires_at,
                max_attempts=3
            )

        return raw_code, hashed

    def verify_otp(
        self,
        reference_id: str,
        provided_code: str,
        current_time: datetime = None
    ) -> Tuple[bool, str]:
        """
        Verifies the provided OTP against the stored hash.
        Checks attempt limits and expiry.
        """
        if current_time is None:
            current_time = datetime.utcnow()

        with self._lock:
            record = self._otps.get(reference_id)
            if not record:
                return False, "No active OTP found for this operation."

            if record.is_used:
                return False, "This OTP has already been used and invalidated."

            if current_time > record.expires_at:
                return False, "OTP has expired. Please request a new verification code."

            if record.attempts >= record.max_attempts:
                return False, f"Maximum verification attempts exceeded ({record.max_attempts}). Locked for security."

            record.attempts += 1

            if self._hash(provided_code) == record.hashed_otp:
                record.is_used = True
                return True, "OTP verified successfully."
            else:
                remaining = record.max_attempts - record.attempts
                return False, f"Invalid OTP code. {remaining} attempt(s) remaining."
