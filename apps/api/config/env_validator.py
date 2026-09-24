"""
ANNASETU Environment Variable Validator & Secret Classifier
Validates environment configuration on startup without crashing on missing optional services.

Secret Classification:
- PUBLIC: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_API_URL
- PRIVATE: GROQ_API_KEY, MAPS_API_KEY, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, EMAIL_PROVIDER_API_KEY, SMS_API_KEY, PUSH_PROVIDER_KEY, PUSH_PROVIDER_SECRET
- HIGHLY SENSITIVE: SUPABASE_SERVICE_ROLE_KEY, SUPABASE_JWT_SECRET
"""

import os
import logging
from typing import Dict, Any, List
from enum import Enum

logger = logging.getLogger("annasetu.config")


class SecretClassification(str, Enum):
    PUBLIC = "PUBLIC"
    PRIVATE = "PRIVATE"
    HIGHLY_SENSITIVE = "HIGHLY_SENSITIVE"


class ServiceStatus(str, Enum):
    AVAILABLE = "AVAILABLE"        # 🟢 Fully connected to live provider
    DEGRADED = "DEGRADED"          # 🟡 Operational via deterministic fallback
    UNAVAILABLE = "UNAVAILABLE"    # 🔴 Configured but failing or unreachable
    DISABLED = "DISABLED"          # ⚪ Intentionally disabled / unconfigured (demo mode)


ENV_SPECIFICATION: Dict[str, Dict[str, Any]] = {
    # Public Client Variables
    "NEXT_PUBLIC_SUPABASE_URL": {
        "classification": SecretClassification.PUBLIC,
        "required_production": True,
        "required_demo": True,
        "description": "Supabase project endpoint URL",
    },
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": {
        "classification": SecretClassification.PUBLIC,
        "required_production": True,
        "required_demo": True,
        "description": "Supabase anonymous public key (protected by RLS)",
    },
    "NEXT_PUBLIC_APP_URL": {
        "classification": SecretClassification.PUBLIC,
        "required_production": True,
        "required_demo": False,
        "description": "Next.js frontend public domain",
    },
    "NEXT_PUBLIC_API_URL": {
        "classification": SecretClassification.PUBLIC,
        "required_production": True,
        "required_demo": False,
        "description": "FastAPI backend public domain",
    },

    # Highly Sensitive Backend Secrets
    "SUPABASE_SERVICE_ROLE_KEY": {
        "classification": SecretClassification.HIGHLY_SENSITIVE,
        "required_production": True,
        "required_demo": False,
        "description": "Administrative database secret for background tasks",
    },
    "SUPABASE_JWT_SECRET": {
        "classification": SecretClassification.HIGHLY_SENSITIVE,
        "required_production": True,
        "required_demo": True,
        "description": "JWT secret for offline signature verification",
    },

    # Private Integration Keys (Optional)
    "GROQ_API_KEY": {
        "classification": SecretClassification.PRIVATE,
        "required_production": False,
        "required_demo": False,
        "description": "Groq Cloud API key for assistive vision and copilot",
    },
    "MAPS_API_KEY": {
        "classification": SecretClassification.PRIVATE,
        "required_production": False,
        "required_demo": False,
        "description": "Geocoding and turn-by-turn routing provider key",
    },
    "RAZORPAY_KEY_ID": {
        "classification": SecretClassification.PRIVATE,
        "required_production": False,
        "required_demo": False,
        "description": "Razorpay payment gateway client ID",
    },
    "RAZORPAY_KEY_SECRET": {
        "classification": SecretClassification.PRIVATE,
        "required_production": False,
        "required_demo": False,
        "description": "Razorpay payment gateway secret",
    },
    "EMAIL_PROVIDER_API_KEY": {
        "classification": SecretClassification.PRIVATE,
        "required_production": False,
        "required_demo": False,
        "description": "Transactional email provider API key",
    },
    "SMS_API_KEY": {
        "classification": SecretClassification.PRIVATE,
        "required_production": False,
        "required_demo": False,
        "description": "SMS/WhatsApp delivery gateway API key",
    },
    "PUSH_PROVIDER_KEY": {
        "classification": SecretClassification.PRIVATE,
        "required_production": False,
        "required_demo": False,
        "description": "Web push notification key",
    },
    "GST_API_KEY": {
        "classification": SecretClassification.PRIVATE,
        "required_production": False,
        "required_demo": False,
        "description": "Authorized GST Suvidha Provider API key",
    },
    "FSSAI_API_KEY": {
        "classification": SecretClassification.PRIVATE,
        "required_production": False,
        "required_demo": False,
        "description": "Authorized FoSCoS inspection API key",
    },
}


def sanitize_secret_for_display(var_name: str, value: str) -> str:
    """Masks secret values so they never appear in logs or public responses."""
    if not value:
        return "[NOT_SET]"
    spec = ENV_SPECIFICATION.get(var_name, {})
    if spec.get("classification") == SecretClassification.PUBLIC:
        return value
    if len(value) <= 8:
        return "********"
    return f"{value[:3]}...{value[-3:]}"


def validate_startup_environment() -> Dict[str, Any]:
    """
    Scans environment on startup. Logs configuration audit safely without leaking secrets.
    Does NOT raise exceptions for optional missing keys; assigns fallback modes instead.
    """
    report: Dict[str, Any] = {
        "environment": os.getenv("APP_ENV", "development"),
        "variables": {},
        "missing_required": [],
        "active_integrations": [],
        "fallback_services": [],
    }

    is_production = os.getenv("APP_ENV", "development").lower() == "production"

    for var_name, spec in ENV_SPECIFICATION.items():
        val = os.getenv(var_name, "").strip()
        is_set = bool(val)
        required = spec["required_production"] if is_production else spec["required_demo"]

        report["variables"][var_name] = {
            "is_set": is_set,
            "classification": spec["classification"].value,
            "masked_preview": sanitize_secret_for_display(var_name, val),
            "required": required,
        }

        if required and not is_set:
            report["missing_required"].append(var_name)
        elif is_set and spec["classification"] != SecretClassification.PUBLIC:
            report["active_integrations"].append(var_name)

    logger.info(
        f"AnnaSetu Environment Loaded: {len(report['active_integrations'])} active integrations, "
        f"{len(report['fallback_services'])} fallback modes active."
    )

    return report
