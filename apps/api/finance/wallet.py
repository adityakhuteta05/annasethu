"""
ANNASETU Financial Ledger and Wallet Settlement Engine
Append-only double-entry financial ledger for reservations, holds, charges,
driver payouts, and 12% platform fee accounting.
"""

import threading
import uuid
from datetime import datetime
from enum import Enum
from typing import List, Dict, Optional, Tuple
from pydantic import BaseModel, Field
from apps.api.matching.models import FareQuote


class TransactionType(str, Enum):
    WALLET_TOPUP = "WALLET_TOPUP"
    RESERVE_HOLD = "RESERVE_HOLD"
    RELEASE_HOLD = "RELEASE_HOLD"
    FINAL_CHARGE = "FINAL_CHARGE"
    DRIVER_PAYOUT = "DRIVER_PAYOUT"
    PLATFORM_FEE = "PLATFORM_FEE"


class LedgerEntry(BaseModel):
    id: str
    wallet_id: str
    account_name: str
    role: str  # "NGO", "DRIVER", "PLATFORM"
    entry_type: TransactionType
    amount: float
    reference_job_id: Optional[str] = None
    balance_after: float
    description: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Wallet(BaseModel):
    id: str
    owner_id: str
    owner_name: str
    role: str  # "NGO", "DRIVER"
    available_balance: float
    reserved_balance: float = 0.0
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    @property
    def total_balance(self) -> float:
        return round(self.available_balance + self.reserved_balance, 2)


class FinanceService:
    def __init__(self):
        self.wallets: Dict[str, Wallet] = {}
        self.ledger: List[LedgerEntry] = []
        self._lock = threading.Lock()

    def create_wallet(self, owner_id: str, owner_name: str, role: str, initial_balance: float = 5000.0) -> Wallet:
        wallet = Wallet(
            id=f"WLT-{owner_id}",
            owner_id=owner_id,
            owner_name=owner_name,
            role=role,
            available_balance=round(initial_balance, 2),
            reserved_balance=0.0
        )
        self.wallets[wallet.id] = wallet
        if initial_balance > 0:
            self._append_entry(
                wallet=wallet,
                entry_type=TransactionType.WALLET_TOPUP,
                amount=initial_balance,
                ref_job_id=None,
                desc=f"Initial seeded demo wallet balance for {owner_name}"
            )
        return wallet

    def get_wallet_by_owner(self, owner_id: str) -> Optional[Wallet]:
        wallet_id = f"WLT-{owner_id}"
        return self.wallets.get(wallet_id)

    def _append_entry(
        self,
        wallet: Wallet,
        entry_type: TransactionType,
        amount: float,
        ref_job_id: Optional[str],
        desc: str
    ) -> LedgerEntry:
        entry = LedgerEntry(
            id=f"LED-{uuid.uuid4().hex[:10].upper()}",
            wallet_id=wallet.id,
            account_name=wallet.owner_name,
            role=wallet.role,
            entry_type=entry_type,
            amount=round(amount, 2),
            reference_job_id=ref_job_id,
            balance_after=round(wallet.available_balance, 2),
            description=desc
        )
        self.ledger.append(entry)
        return entry

    def reserve_funds_for_job(
        self,
        ngo_id: str,
        job_id: str,
        estimated_amount: float
    ) -> Tuple[bool, str]:
        """
        Locks funds in NGO wallet prior to driver acceptance.
        Transfers amount from available_balance -> reserved_balance.
        """
        with self._lock:
            wallet = self.get_wallet_by_owner(ngo_id)
            if not wallet:
                return False, "NGO wallet not found."

            if wallet.available_balance < estimated_amount:
                return (
                    False,
                    f"Insufficient NGO wallet balance (available: ₹{wallet.available_balance}, required: ₹{estimated_amount})."
                )

            wallet.available_balance = round(wallet.available_balance - estimated_amount, 2)
            wallet.reserved_balance = round(wallet.reserved_balance + estimated_amount, 2)
            wallet.updated_at = datetime.utcnow()

            self._append_entry(
                wallet=wallet,
                entry_type=TransactionType.RESERVE_HOLD,
                amount=-estimated_amount,
                ref_job_id=job_id,
                desc=f"Hold reserve for rescue delivery job {job_id}"
            )
            return True, f"Reserved ₹{estimated_amount} for rescue delivery."

    def settle_delivery(
        self,
        job_id: str,
        ngo_id: str,
        driver_id: str,
        fare_quote: FareQuote
    ) -> Tuple[bool, str]:
        """
        Commits final delivery settlement atomically:
        1. Releases the held reserve in NGO wallet.
        2. Deducts the final NGO total (delivery fare + 12% platform fee).
        3. Credits Driver wallet with driver payout.
        4. Logs the 12% AnnaSetu platform coordination fee.
        """
        with self._lock:
            ngo_wallet = self.get_wallet_by_owner(ngo_id)
            driver_wallet = self.get_wallet_by_owner(driver_id)

            if not ngo_wallet:
                return False, "NGO wallet not found."
            if not driver_wallet:
                # If driver doesn't have wallet yet, provision one
                driver_wallet = self.create_wallet(driver_id, f"Driver-{driver_id}", "DRIVER", initial_balance=0.0)

            # 1. Release reserve
            reserve_to_release = min(ngo_wallet.reserved_balance, fare_quote.ngo_total)
            ngo_wallet.reserved_balance = round(ngo_wallet.reserved_balance - reserve_to_release, 2)
            self._append_entry(
                wallet=ngo_wallet,
                entry_type=TransactionType.RELEASE_HOLD,
                amount=reserve_to_release,
                ref_job_id=job_id,
                desc=f"Release reserve hold for completed job {job_id}"
            )

            # 2. Charge NGO final total
            self._append_entry(
                wallet=ngo_wallet,
                entry_type=TransactionType.FINAL_CHARGE,
                amount=-fare_quote.ngo_total,
                ref_job_id=job_id,
                desc=f"Final logistics charge: ₹{fare_quote.delivery_fare} + ₹{fare_quote.platform_fee_12_percent} (12% platform fee)"
            )

            # 3. Credit Driver Payout
            driver_wallet.available_balance = round(driver_wallet.available_balance + fare_quote.driver_payout, 2)
            driver_wallet.updated_at = datetime.utcnow()
            self._append_entry(
                wallet=driver_wallet,
                entry_type=TransactionType.DRIVER_PAYOUT,
                amount=fare_quote.driver_payout,
                ref_job_id=job_id,
                desc=f"Earnings payout credited for rescue delivery {job_id}"
            )

            # 4. Record platform fee
            platform_wallet = Wallet(
                id="WLT-ANNASETU-TREASURY",
                owner_id="ANNASETU",
                owner_name="AnnaSetu Platform Treasury",
                role="PLATFORM",
                available_balance=0.0
            )
            self._append_entry(
                wallet=platform_wallet,
                entry_type=TransactionType.PLATFORM_FEE,
                amount=fare_quote.platform_fee_12_percent,
                ref_job_id=job_id,
                desc=f"12% service fee retained for rescue logistics coordination on {job_id}"
            )

            return True, f"Settlement complete: Driver credited ₹{fare_quote.driver_payout}, Platform fee ₹{fare_quote.platform_fee_12_percent} recorded."
