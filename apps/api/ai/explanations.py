"""
ANNASETU AI Explanations & Notification Assistant Module
Generates human-readable explanations of deterministic Rescue Priority Scores (0-100)
and crafts contextual notification wording.
Strict Rule: The deterministic engine computes the score; AI only explains it.
"""

import json
from typing import Dict, Any, Optional
from apps.api.ai.groq_client import GroqClient


class ExplanationsService:
    def __init__(self, client: Optional[GroqClient] = None):
        self.client = client or GroqClient()

    async def explain_rescue_score(
        self,
        score: float,
        factors: Dict[str, float],
        donation_summary: str,
        need_summary: str
    ) -> str:
        """
        Explains why a match received its score based on weights:
        Expiry Urgency (30%), ETA (25%), Distance (20%), Need Fulfillment (15%), Route (10%).
        """
        prompt = (
            f"Rescue Priority Score: {score}/100\n"
            f"Factors: {json.dumps(factors)}\n"
            f"Donation: {donation_summary}\n"
            f"Need: {need_summary}\n"
            f"Generate a concise 2-sentence explanation of why this match was prioritized."
        )
        system_prompt = (
            "You are an explainability assistant for food rescue prioritization. "
            "Explain clearly why the match is optimal based on expiry urgency and transit distance."
        )

        ai_resp = await self.client.call_llm(prompt, system_prompt, json_mode=False)
        if ai_resp:
            return ai_resp.strip()

        # Deterministic Explanation Fallback
        urgency = factors.get("urgency", 0.9)
        distance_km = factors.get("distance_km", 4.2)
        return (
            f"Prioritized with score {int(score)}/100 due to short transit distance ({distance_km:.1f} km) "
            f"and high consumption urgency before preparation deadline. Matches dietary and quantity requirements."
        )

    async def generate_notification_text(
        self,
        event_type: str,
        params: Dict[str, Any]
    ) -> Dict[str, str]:
        """
        Assists with courteous, actionable notification copy.
        """
        prompt = f"Event: {event_type}\nParameters: {json.dumps(params)}"
        system_prompt = (
            "You are a notification copywriter for an urgent food rescue platform. "
            "Return JSON with 'title' (max 6 words) and 'body' (max 20 words)."
        )

        ai_resp = await self.client.call_llm(prompt, system_prompt, json_mode=True)
        if ai_resp:
            try:
                parsed = json.loads(ai_resp)
                return {
                    "title": parsed.get("title", f"Rescue Update: {event_type}"),
                    "body": parsed.get("body", "Please check your AnnaSetu dashboard for details.")
                }
            except Exception:
                pass

        # Deterministic Copy Fallback
        if event_type == "MATCH_FOUND":
            return {
                "title": "Compatible Food Match Available",
                "body": f"A verified donor near you declared {params.get('quantity_kg', 'surplus')} kg matching your meal request."
            }
        elif event_type == "JOB_OFFER":
            return {
                "title": "New Rescue Delivery Job",
                "body": f"Rescue dispatch available: {params.get('distance_km', 'nearby')} km with estimated payout Rs {params.get('payout', 250)}."
            }
        else:
            return {
                "title": f"AnnaSetu Alert: {event_type.replace('_', ' ').title()}",
                "body": "Your food rescue operation has an updated status. Open AnnaSetu to proceed."
            }
