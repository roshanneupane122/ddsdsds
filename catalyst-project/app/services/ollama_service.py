"""
Ollama LLM service for Catalyst AI chat.
Connects to local Ollama instance via host.docker.internal.
"""
import httpx
import json
from typing import Optional

OLLAMA_BASE_URL = "http://host.docker.internal:11434"
OLLAMA_MODEL = "llama3.1:8b"
OLLAMA_TIMEOUT = 120.0


def _build_system_prompt() -> str:
    return (
        "You are Catalyst AI, an expert geospatial and business intelligence analyst "
        "specializing in Nepal's municipalities, particularly Rupandehi District in Lumbini Province. "
        "You help users understand economic opportunities, infrastructure gaps, agricultural potential, "
        "and business viability in Nepali municipalities. "
        "Answer concisely and factually. Do NOT invent statistics. "
        "If structured data is provided, use it to ground your answer. "
        "Respond in 2-4 short paragraphs. Use markdown bold for key terms."
    )


def generate_chat_response(
    user_message: str,
    municipality_context: Optional[dict] = None
) -> str:
    """
    Generate a grounded AI chat response using Ollama.
    If municipality_context is provided, it will be injected into the system prompt.
    """
    system_prompt = _build_system_prompt()

    # Build structured context block if data is available
    if municipality_context:
        name = municipality_context.get("name", "Unknown")
        economy = municipality_context.get("economy", {})
        infra = municipality_context.get("infrastructure", {})
        dev = municipality_context.get("development_index", {})
        agri = municipality_context.get("agriculture", {})
        strengths = municipality_context.get("strengths", [])
        challenges = municipality_context.get("challenges", [])
        gaps = municipality_context.get("gaps", [])
        opps = municipality_context.get("opportunities", [])

        context_block = f"""
MUNICIPALITY DATA FOR: {name} (Rupandehi District, Lumbini Province)

Development Index:
- Overall: {dev.get('overall', 'N/A')}/100
- Economic: {dev.get('economic', 'N/A')}/100
- Infrastructure: {dev.get('infrastructure', 'N/A')}/100
- Social: {dev.get('social', 'N/A')}/100
- Digital: {dev.get('digital', 'N/A')}/100

Economy:
- Avg Income: NPR {economy.get('average_income_npr', 'N/A')}
- Business Density: {economy.get('business_density', 'N/A')} per sq km
- Purchasing Power Index: {economy.get('purchasing_power_index', 'N/A')}/100
- Commercial Buildings (avg/ward): {economy.get('commercial_buildings_avg', 'N/A')}
- Industrial Units (avg/ward): {economy.get('industries_avg', 'N/A')}

Agriculture:
- Agricultural Participation: {agri.get('agriculture_pct', 'N/A')}%

Infrastructure:
- Electricity Access: {infra.get('electricity_access_pct', 'N/A')}%
- Internet Access: {infra.get('internet_access_pct', 'N/A')}%
- Water Access: {infra.get('water_access_pct', 'N/A')}%
- Avg Road Distance: {infra.get('road_distance_km', 'N/A')} km
- Avg Market Distance: {infra.get('market_distance_km', 'N/A')} km
- Avg Hospital Distance: {infra.get('hospital_distance_km', 'N/A')} km

Data-Derived Strengths: {'; '.join(strengths[:3]) if strengths else 'N/A'}
Identified Challenges: {'; '.join(challenges[:3]) if challenges else 'N/A'}
Infrastructure Gaps: {'; '.join([g.get('type','') for g in gaps[:3]]) if gaps else 'None significant'}
Top Opportunities (ML-ranked): {', '.join([o.get('business','') for o in opps[:5]]) if opps else 'N/A'}
"""
        system_prompt += f"\n\nUSE THE FOLLOWING DATA TO ANSWER THE USER'S QUESTION:\n{context_block}"

    payload = {
        "model": OLLAMA_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        "stream": False,
        "options": {
            "temperature": 0.4,
            "num_predict": 512
        }
    }

    try:
        with httpx.Client(timeout=OLLAMA_TIMEOUT) as client:
            response = client.post(f"{OLLAMA_BASE_URL}/api/chat", json=payload)
            response.raise_for_status()
            data = response.json()
            return data["message"]["content"]
    except httpx.TimeoutException:
        return "The AI analyst is taking longer than expected. Please try again in a moment."
    except Exception as e:
        return f"AI service temporarily unavailable: {str(e)[:100]}"
