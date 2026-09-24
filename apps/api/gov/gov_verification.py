"""
ANNASETU Government Verification Architecture & Adapter
Compliant lookup adapter for Indian regulatory portals.
Never scrapes, bypasses CAPTCHA, or accesses unauthorized endpoints.
Exposes official portal lookup links to administrators for manual verification.
"""

from typing import Dict, Any
from apps.api.matching.models import VerificationStatus


class GovVerificationAdapter:
    """
    Adapter implementing regulatory compliance checks per PRD Section 8 & Appendix A.
    Exposes official verification URLs and structured metadata.
    """

    @staticmethod
    def check_gstin(gstin: str) -> Dict[str, Any]:
        """GSTIN search guidance and official portal link."""
        clean_gstin = gstin.strip().upper()
        # Basic GST format check: 2-digit state code + 10-char PAN + 1 entity code + 'Z' + 1 check digit = 15 chars
        is_format_valid = len(clean_gstin) == 15 and clean_gstin[:2].isdigit() and clean_gstin[2:7].isalpha()

        return {
            "identifier": clean_gstin,
            "type": "GSTIN",
            "format_valid": is_format_valid,
            "status": "MANUAL_LOOKUP_REQUIRED",
            "official_portal_url": f"https://services.gst.gov.in/services/searchtp",
            "reference_guide_url": "https://tutorial.gst.gov.in/userguide/taxpayersdashboard/Search_Taxpayer_manual.htm",
            "instructions": f"Verify legal entity name and active status for GSTIN {clean_gstin} on the official GST portal.",
        }

    @staticmethod
    def check_fssai(fssai_licence_number: str) -> Dict[str, Any]:
        """FSSAI / FoSCoS food-safety authorization lookup."""
        clean_num = fssai_licence_number.strip()
        is_format_valid = len(clean_num) == 14 and clean_num.isdigit()

        return {
            "identifier": clean_num,
            "type": "FSSAI_LICENSE",
            "format_valid": is_format_valid,
            "status": "MANUAL_LOOKUP_REQUIRED",
            "official_portal_url": "https://fssai.gov.in/citizen/about-license-verification",
            "reference_guide_url": "https://fssai.gov.in/business/registration",
            "instructions": f"Check FoSCoS database for Food Business Operator validity and hygiene registration ({clean_num}).",
        }

    @staticmethod
    def check_darpan(darpan_id: str) -> Dict[str, Any]:
        """NITI Aayog NGO-DARPAN voluntary action cell verification."""
        clean_id = darpan_id.strip().upper()
        is_format_valid = len(clean_id) >= 6 and "/" in clean_id

        return {
            "identifier": clean_id,
            "type": "NGO_DARPAN_ID",
            "format_valid": is_format_valid,
            "status": "MANUAL_LOOKUP_REQUIRED",
            "official_portal_url": "https://ngodarpan.gov.in/",
            "reference_guide_url": "https://www.niti.gov.in/divisions/cell/voluntary-action-cell",
            "instructions": f"Verify NITI Aayog registration and 80G/12A documentation for NGO {clean_id}.",
        }

    @staticmethod
    def check_rc_dl(rc_number: str, dl_number: str) -> Dict[str, Any]:
        """MoRTH Parivahan vehicle registration and driving licence verification."""
        clean_rc = rc_number.strip().upper()
        clean_dl = dl_number.strip().upper()

        return {
            "rc_number": clean_rc,
            "dl_number": clean_dl,
            "type": "PARIVAHAN_RC_DL",
            "format_valid": len(clean_rc) >= 8 and len(clean_dl) >= 10,
            "status": "MANUAL_LOOKUP_REQUIRED",
            "official_portal_url": "https://parivahan.gov.in/parivahan//en/content/license-registration-details",
            "analytics_url": "https://analytics.parivahan.gov.in/analytics/vehiclestatusreport",
            "instructions": f"Validate driver commercial authorization and vehicle fitness for RC {clean_rc} / DL {clean_dl}.",
        }
