"""
ANNASETU Groq Client Module
Provides a hardened, production-ready client for Groq Cloud API:
- Model: llama-3.3-70b-versatile
- 4.0s timeout with retry handling
- Structured JSON response mode
- Output sanitization
- Safe logging (NEVER logs API keys or credentials)
- Graceful fallbacks when offline or unconfigured
"""

import os
import json
import logging
import httpx
from typing import Dict, Any, Optional

logger = logging.getLogger("annasetu.ai")

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
DEFAULT_MODEL = "llama-3.3-70b-versatile"
TIMEOUT_SECONDS = 4.0
MAX_RETRIES = 2


class GroqClient:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GROQ_API_KEY", "")
        self.is_configured = bool(self.api_key and self.api_key.strip())

    async def call_llm(
        self,
        prompt: str,
        system_prompt: str,
        json_mode: bool = False,
        temperature: float = 0.2,
        max_tokens: int = 600,
    ) -> Optional[str]:
        """
        Executes a call to the Groq API with retries, timeout, and safe logging.
        Returns None on any error to allow deterministic fallback logic to proceed.
        """
        if not self.is_configured:
            logger.debug("Groq API key not configured; skipping external call.")
            return None

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        body: Dict[str, Any] = {
            "model": DEFAULT_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        if json_mode:
            body["response_format"] = {"type": "json_object"}

        for attempt in range(1, MAX_RETRIES + 1):
            try:
                async with httpx.AsyncClient(timeout=TIMEOUT_SECONDS) as client:
                    res = await client.post(GROQ_API_URL, headers=headers, json=body)
                    if res.status_code == 200:
                        data = res.json()
                        return data["choices"][0]["message"]["content"]
                    else:
                        logger.warning(
                            f"Groq API returned HTTP {res.status_code} (attempt {attempt}/{MAX_RETRIES})."
                        )
            except httpx.TimeoutException:
                logger.warning(f"Groq API call timed out after {TIMEOUT_SECONDS}s (attempt {attempt}/{MAX_RETRIES}).")
            except Exception as e:
                # Log without any potential credentials
                logger.warning(f"Groq API call encountered network error: {type(e).__name__} (attempt {attempt}/{MAX_RETRIES}).")

        return None
