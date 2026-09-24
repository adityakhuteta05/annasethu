"""
ANNASETU Document Extraction Assistance Module
Assists administrative review with optical/text field extraction suggestions.
Strict Rule: NON-AUTHORITATIVE. Admin review and official portals remain the sole authority.
"""

import json
from typing import Dict, Any, Optional
from apps.api.ai.groq_client import GroqClient


class DocumentExtractionService:
    def __init__(self, client: Optional[GroqClient] = None):
        self.client = client or GroqClient()

    async def extract_document_fields(
        self,
        document_type: str,
        document_text_or_url: str
    ) -> Dict[str, Any]:
        """
        Assists admin review by proposing structured key-value pairs from document text.
        """
        prompt = (
            f"Document Type: {document_type}\n"
            f"Content/Reference: {document_text_or_url}\n"
            f"Extract identified official identifier, legal entity name, validity dates, and address if visible."
        )
        system_prompt = (
            "You are an assistive document reviewer for Indian compliance (GST, FSSAI, NGO-DARPAN, DL, RC). "
            "Return JSON with keys: 'extracted_identifier', 'entity_name', 'valid_until', 'is_legible' (bool), 'notes'."
        )

        ai_resp = await self.client.call_llm(prompt, system_prompt, json_mode=True)
        if ai_resp:
            try:
                parsed = json.loads(ai_resp)
                return {
                    "extracted_identifier": parsed.get("extracted_identifier", ""),
                    "entity_name": parsed.get("entity_name", ""),
                    "valid_until": parsed.get("valid_until", ""),
                    "is_legible": bool(parsed.get("is_legible", True)),
                    "notes": parsed.get("notes", "Assisted extraction completed."),
                    "ai_assisted": True,
                    "requires_admin_review": True,
                }
            except Exception:
                pass

        # Deterministic Safe Fallback
        return {
            "extracted_identifier": "MANUAL_EXTRACTION_REQUIRED",
            "entity_name": "Pending Admin Inspection",
            "valid_until": "Unknown",
            "is_legible": True,
            "notes": "Automated OCR/AI unavailable; manual administrative review required.",
            "ai_assisted": False,
            "requires_admin_review": True,
        }
