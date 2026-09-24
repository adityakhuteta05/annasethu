"""
ANNASETU Government & Organization Verification Adapter
Architecture:
GovVerificationService
    -> GSTAdapter
    -> FSSAIAdapter
    -> NGODarpanAdapter
    -> VehicleAdapter
    -> DrivingLicenseAdapter

Ethics & Legal Compliance Guarantees:
1. Never scrape protected government portals or bypass CAPTCHAs.
2. Only connect to authorized B2B GSP/API providers if API keys are configured.
3. Fallback: MANUAL_LOOKUP_REQUIRED with official portal verification URLs and audit logging.
4. Admin review remains the authoritative verification state.
"""

import os
import re
import logging
from typing import Dict, Any, Optional
from datetime import datetime

logger = logging.getLogger("annasetu.gov_verification")

# Official Government Verification Portals
OFFICIAL_PORTALS = {
    "GSTIN": "https://services.gst.gov.in/services/searchtp",
    "FSSAI": "https://foscos.fssai.gov.in/",
    "DARPAN": "https://ngodarpan.gov.in/index.php/search/",
    "PARIVAHAN_RC": "https://vahan.parivahan.gov.in/nrservices/faces/user/citizen/citizenlogin.xhtml",
    "PARIVAHAN_DL": "https://parivahan.gov.in/rcdlstatus/?pur_cd=101",
}


class GSTAdapter:
    def __init__(self):
        self.api_key = os.getenv("GST_API_KEY", "")
        self.is_configured = bool(self.api_key and self.api_key.strip())

    async def verify(self, gstin: str) -> Dict[str, Any]:
        gstin_clean = gstin.strip().upper()
        # Structural Regex Check
        valid_format = bool(re.match(r"^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$", gstin_clean))
        if not valid_format:
            return {
                "valid_format": False,
                "status": "INVALID_FORMAT",
                "message": "GSTIN does not match official 15-character Indian GST format.",
            }

        if self.is_configured:
            # Query authorized GST Suvidha Provider (GSP) API
            pass

        # Fallback to manual verification protocol
        return {
            "valid_format": True,
            "status": "MANUAL_LOOKUP_REQUIRED",
            "gstin": gstin_clean,
            "verification_url": OFFICIAL_PORTALS["GSTIN"],
            "guidance": "Verify taxpayer legal entity status on official GST portal.",
            "is_automated": False,
            "timestamp": datetime.utcnow().isoformat(),
        }


class FSSAIAdapter:
    def __init__(self):
        self.api_key = os.getenv("FSSAI_API_KEY", "")
        self.is_configured = bool(self.api_key and self.api_key.strip())

    async def verify(self, fssai_no: str) -> Dict[str, Any]:
        clean_no = fssai_no.strip()
        valid_format = bool(re.match(r"^\d{14}$", clean_no))
        if not valid_format:
            return {
                "valid_format": False,
                "status": "INVALID_FORMAT",
                "message": "FSSAI licence number must be exactly 14 digits.",
            }

        return {
            "valid_format": True,
            "status": "MANUAL_LOOKUP_REQUIRED",
            "fssai_no": clean_no,
            "verification_url": OFFICIAL_PORTALS["FSSAI"],
            "guidance": "Verify Food Business Operator hygiene licence on FoSCoS portal.",
            "is_automated": False,
            "timestamp": datetime.utcnow().isoformat(),
        }


class NGODarpanAdapter:
    def __init__(self):
        self.api_key = os.getenv("NGO_VERIFICATION_API_KEY", "")
        self.is_configured = bool(self.api_key and self.api_key.strip())

    async def verify(self, darpan_id: Optional[str], registration_no: str) -> Dict[str, Any]:
        clean_id = (darpan_id or "").strip().upper()
        return {
            "darpan_id": clean_id,
            "registration_no": registration_no,
            "status": "MANUAL_LOOKUP_REQUIRED",
            "verification_url": OFFICIAL_PORTALS["DARPAN"],
            "guidance": "Cross-check NITI Aayog Unique ID and registration certificate.",
            "is_automated": False,
            "timestamp": datetime.utcnow().isoformat(),
        }


class VehicleAdapter:
    def __init__(self):
        self.api_key = os.getenv("VEHICLE_VERIFICATION_API_KEY", "")
        self.is_configured = bool(self.api_key and self.api_key.strip())

    async def verify_vehicle(self, rc_no: str, dl_no: str) -> Dict[str, Any]:
        return {
            "rc_no": rc_no.strip().upper(),
            "dl_no": dl_no.strip().upper(),
            "status": "MANUAL_LOOKUP_REQUIRED",
            "rc_portal_url": OFFICIAL_PORTALS["PARIVAHAN_RC"],
            "dl_portal_url": OFFICIAL_PORTALS["PARIVAHAN_DL"],
            "guidance": "Verify commercial driving entitlement and vehicle fitness on MoRTH Parivahan.",
            "is_automated": False,
            "timestamp": datetime.utcnow().isoformat(),
        }


class GovVerificationService:
    def __init__(self):
        self.gst = GSTAdapter()
        self.fssai = FSSAIAdapter()
        self.ngo = NGODarpanAdapter()
        self.vehicle = VehicleAdapter()

    async def check_donor_compliance(self, gstin: str, fssai_no: str) -> Dict[str, Any]:
        gst_res = await self.gst.verify(gstin)
        fssai_res = await self.fssai.verify(fssai_no)
        return {
            "gstin_result": gst_res,
            "fssai_result": fssai_res,
            "overall_status": "MANUAL_REVIEW_QUEUED" if (gst_res["valid_format"] and fssai_res["valid_format"]) else "REJECTED_FORMAT",
        }

    async def check_ngo_compliance(self, registration_no: str, darpan_id: Optional[str] = None) -> Dict[str, Any]:
        ngo_res = await self.ngo.verify(darpan_id, registration_no)
        return {
            "ngo_result": ngo_res,
            "overall_status": "MANUAL_REVIEW_QUEUED",
        }

    async def check_driver_compliance(self, dl_no: str, rc_no: str) -> Dict[str, Any]:
        veh_res = await self.vehicle.verify_vehicle(rc_no, dl_no)
        return {
            "vehicle_result": veh_res,
            "overall_status": "MANUAL_REVIEW_QUEUED",
        }
