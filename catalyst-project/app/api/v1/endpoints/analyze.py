from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.services.analyze_service import analyze_service
from app.services.ml_inference import ml_service
from app.services.ollama_service import generate_chat_response
from app.api.dependencies import DBSession, CurrentUser


router = APIRouter()

class ScoreRequest(BaseModel):
    municipality_name: str
    ward_no: int
    proposed_business: str

class AlternativeBusiness(BaseModel):
    business: str
    confidence: float

class BreakdownFactors(BaseModel):
    market_demand: int
    purchasing_power: int
    accessibility: int
    infrastructure_readiness: int
    competition: int
    business_risk: int

class DataUsed(BaseModel):
    population: int
    purchasing_power_index: int
    business_density: int
    road_distance_km: float
    market_distance_km: float
    infrastructure_index: int

class ScoreResponse(BaseModel):
    proposed_business: str
    location: str
    opportunity_score: int
    opportunity_level: str
    summary: str
    ml_confidence: int
    alternatives: List[AlternativeBusiness]
    breakdown: BreakdownFactors
    positive_factors: List[str]
    negative_factors: List[str]
    data_used: DataUsed

@router.post("/score", response_model=ScoreResponse, summary="Calculate Deterministic Opportunity Score")
async def calculate_score(
    request: ScoreRequest,
    db: DBSession,
    current_user: CurrentUser
):
    score_result = analyze_service.calculate_opportunity_score(
        request.municipality_name, 
        request.ward_no, 
        request.proposed_business
    )
    
    if not score_result:
        raise HTTPException(status_code=404, detail="Municipality or Ward not found in intelligence database.")
        
    return score_result

@router.get("/similarity", summary="Find Similar Municipalities")
async def find_similarity(
    municipality_name: str = Query(..., description="Name of the municipality to compare against"),
    top_k: int = Query(3, ge=1, le=10, description="Number of similar municipalities to return")
):
    results = analyze_service.find_similar_municipalities(municipality_name, top_k)

    if not results:
        raise HTTPException(status_code=404, detail="Municipality not found or ML service not fully initialized.")

    return {"target": municipality_name, "similar_municipalities": results}

@router.get("/gaps", summary="Identify Infrastructure Gaps")
async def get_gaps(
    municipality_name: str = Query(...),
    ward_no: int = Query(1, ge=1)
):
    results = analyze_service.identify_infrastructure_gaps(municipality_name, ward_no)
    if not results:
        raise HTTPException(status_code=404, detail="Municipality/Ward not found.")
    return results

class ChatRequest(BaseModel):
    message: str
    municipality_name: Optional[str] = None

@router.post("/chat", summary="AI Analyst Chat")
async def ai_chat(
    request: ChatRequest,
    db: DBSession = None,
    current_user: CurrentUser = None
):
    msg_lower = request.message.lower()

    # Determine which municipality to load context for
    found_muni = request.municipality_name
    if not found_muni and analyze_service.municipalities:
        for m in analyze_service.municipalities:
            if m.lower() in msg_lower:
                found_muni = m
                break

    # Load rich municipality context for grounding the LLM
    municipality_context = None
    if found_muni:
        try:
            intel = analyze_service.get_municipality_intelligence(found_muni)
            if intel:
                municipality_context = intel
        except Exception:
            municipality_context = {"name": found_muni}

    # Generate response via Ollama
    reply = generate_chat_response(request.message, municipality_context)

    return {"reply": reply, "municipality_context_used": found_muni}
