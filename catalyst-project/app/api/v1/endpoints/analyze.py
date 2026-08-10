from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Dict, Any
from app.services.analyze_service import analyze_service
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
    top_k: int = Query(3, ge=1, le=10, description="Number of similar municipalities to return"),
    db: DBSession = None,
    current_user: CurrentUser = None
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

@router.post("/chat", summary="AI Analyst Chat")
async def ai_chat(
    request: ChatRequest,
    db: DBSession = None,
    current_user: CurrentUser = None
):
    msg = request.message.lower()
    
    # Analyze text for municipalities
    found_muni = None
    if analyze_service.municipalities:
        for m in analyze_service.municipalities:
            if m.lower() in msg:
                found_muni = m
                break
                
    if found_muni:
        # Get gaps
        gaps = analyze_service.identify_infrastructure_gaps(found_muni, 1) # default ward 1
        gap_texts = [g['type'] for g in gaps['gaps'] if g['severity'] == 'High']
        gap_str = f"Critical gaps in {', '.join(gap_texts)}." if gap_texts else "Infrastructure is generally adequate."
        
        # Get ML recommendation (dummy business to get top alternative)
        ward_features = ml_service.get_ward_features(found_muni, 1)
        if ward_features:
            ml_eval = ml_service.evaluate(found_muni, ward_features, "Retail")
            top_rec = ml_eval.get("top_alternative_if_no", "Agro-Processing")
            conf = ml_eval.get("top_confidence", 80)
            
            response = (
                f"Based on our data for {found_muni}, the AI model highly recommends **{top_rec}** "
                f"with {conf:.1f}% confidence. {gap_str} "
                f"Would you like to compare {found_muni} with other regions?"
            )
        else:
            response = f"I found {found_muni} in our records, but ward-level feature data is currently missing. Try another municipality."
            
    elif "infrastructure" in msg or "gap" in msg:
        response = "Infrastructure gaps are analyzed based on local access to electricity, internet, and development indices. Which municipality should I check?"
    else:
        response = "I am the Catalyst AI Analyst. I can help you evaluate business opportunities, identify infrastructure gaps, or find similar municipalities based on our ML datasets. What region in Rupandehi are you interested in?"
        
    return {"reply": response}
