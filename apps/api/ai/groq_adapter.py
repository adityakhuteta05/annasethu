"""
ANNASETU Master AI Adapter
Consolidates modular assistive AI services:
- GroqClient (HTTP client with retries and timeout)
- FoodVisionService
- DocumentExtractionService
- IntegrityService
- CopilotService
- ExplanationsService

Guarantees:
- Safe deterministic fallbacks if GROQ_API_KEY is missing or fails.
- Never blocks core rescue operations.
"""

from typing import Dict, Any, Optional
from apps.api.ai.groq_client import GroqClient
from apps.api.ai.food_vision import FoodVisionService
from apps.api.ai.document_extraction import DocumentExtractionService
from apps.api.ai.integrity import IntegrityService
from apps.api.ai.copilot import CopilotService
from apps.api.ai.explanations import ExplanationsService


class GroqAIAdapter:
    def __init__(self, api_key: Optional[str] = None):
        self.client = GroqClient(api_key=api_key)
        self.is_configured = self.client.is_configured
        self.food_vision = FoodVisionService(self.client)
        self.document_extraction = DocumentExtractionService(self.client)
        self.integrity = IntegrityService(self.client)
        self.copilot = CopilotService(self.client)
        self.explanations = ExplanationsService(self.client)

    async def analyze_food_image(self, image_url: str, declared_category: str = "") -> Dict[str, Any]:
        return await self.food_vision.analyze_food_image(image_url, declared_category)

    async def compare_integrity_images(
        self,
        pickup_image_url: str,
        delivery_image_url: str,
        seal_id: str
    ) -> Dict[str, Any]:
        return await self.integrity.compare_integrity_images(pickup_image_url, delivery_image_url, seal_id)

    async def copilot_answer(
        self,
        query: str,
        context_data: Dict[str, Any],
        user_role: str = "DONOR"
    ) -> str:
        return await self.copilot.answer_query(query, context_data, user_role)

    async def explain_score(
        self,
        score: float,
        factors: Dict[str, float],
        donation_summary: str = "",
        need_summary: str = ""
    ) -> str:
        return await self.explanations.explain_rescue_score(score, factors, donation_summary, need_summary)

    async def extract_document_fields(self, document_type: str, document_text: str) -> Dict[str, Any]:
        return await self.document_extraction.extract_document_fields(document_type, document_text)
