"""
Qwen ML service for Catalyst AI chat.
Connects to local ML microservice.
"""
import httpx
import os
from typing import Optional

ML_SERVICE_URL = os.environ.get("ML_SERVICE_URL", "http://localhost:8001")
TIMEOUT = 120.0

def generate_chat_response(
    user_message: str,
    municipality_context: Optional[dict] = None
) -> str:
    """
    Generate a grounded AI chat response using the Qwen ML microservice.
    """
    enriched_message = user_message
    if municipality_context and "name" in municipality_context:
        name = municipality_context["name"]
        if name.lower() not in enriched_message.lower():
            enriched_message = f"Context: {name}. {user_message}"

    payload = {
        "user_input": enriched_message
    }

    try:
        with httpx.Client(timeout=TIMEOUT) as client:
            response = client.post(f"{ML_SERVICE_URL}/chat", json=payload)
            response.raise_for_status()
            data = response.json()
            return data.get("response", "No response received from ML model.")
    except httpx.TimeoutException:
        return "The AI analyst is taking longer than expected. Please try again in a moment."
    except Exception as e:
        return f"AI service temporarily unavailable: {str(e)[:100]}"
