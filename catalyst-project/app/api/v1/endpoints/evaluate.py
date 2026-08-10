from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any
from app.services.ml_inference import ml_service
from app.api.dependencies import DBSession, CurrentUser
from sqlalchemy import text

router = APIRouter()

class FeasibilityRequest(BaseModel):
    municipality_name: str
    ward_no: int
    proposed_business: str

class FeasibilityResponse(BaseModel):
    location: str
    proposed_business: str
    recommendation: str
    feasibility_score: str
    top_alternative_if_no: str
    reasoning: str

def generate_llm_explanation(ward_features: Dict[str, Any], evaluation: Dict[str, Any], municipality_name: str, ward_no: int) -> str:
    # TODO: Replace this stub with a real API call to Gemini/OpenAI/Anthropic or a lightweight local LLM API
    # This replaces the heavy Qwen transformers pipeline
    
    proposed = evaluation['proposed_business']
    verdict = evaluation['recommendation']
    score = evaluation['feasibility_score']
    top_alt = evaluation['top_alternative_if_no']
    
    if "YES" in verdict:
        return f"Based on the local economic indicators, {proposed} is highly recommended in {municipality_name} Ward {ward_no}. The model gives it a {score:.1f}% feasibility score, supported by strong local footfall and favorable urbanization rates."
    else:
        return f"Opening a {proposed} in {municipality_name} Ward {ward_no} is not recommended at this time (Score: {score:.1f}%). The area's current economic indicators suggest that a {top_alt} would have a much higher chance of success."

@router.post("/", response_model=FeasibilityResponse, summary="Evaluate Business Feasibility")
async def evaluate_business_feasibility(
    request: FeasibilityRequest,
    db: DBSession,
    current_user: CurrentUser
):
    if not ml_service.is_loaded:
        raise HTTPException(status_code=503, detail="ML Models are not currently loaded.")
        
    # We would ideally fetch the ward_features from the DB (ResourceData). 
    # For now, since the ML model is trained on a specific CSV with 5000 rows, 
    # and the DB might not have the ward-level data yet, we need a way to get the features.
    # In a fully integrated system, the `ResourceData` table holds this.
    # As a bridge, we'll mock the fetching of ward_features for this endpoint or read from CSV if needed.
    # Actually, we can just load the CSV temporarily in memory in the ml_service to serve the ward features, 
    # since the backend DB schema is municipality-level, but the model expects ward-level.
    
    # Let's add a quick helper to ml_service to get ward features
    ward_features = ml_service.get_ward_features(request.municipality_name, request.ward_no)
    
    if not ward_features:
        raise HTTPException(
            status_code=404, 
            detail=f"Location '{request.municipality_name}' Ward {request.ward_no} not found in intelligence database."
        )

    # Run XGBoost Inference
    evaluation = ml_service.evaluate(request.municipality_name, ward_features, request.proposed_business)
    
    # Run Lightweight LLM Explanation (API stub)
    reasoning = generate_llm_explanation(ward_features, evaluation, request.municipality_name, request.ward_no)
    
    return FeasibilityResponse(
        location=f"{request.municipality_name} - Ward {request.ward_no}",
        proposed_business=request.proposed_business,
        recommendation=evaluation['recommendation'],
        feasibility_score=f"{evaluation['feasibility_score']:.1f}%",
        top_alternative_if_no=evaluation['top_alternative_if_no'],
        reasoning=reasoning
    )
