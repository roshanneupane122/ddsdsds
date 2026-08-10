from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from app.services.ml_inference import ml_service
from app.api.dependencies import DBSession, CurrentUser

router = APIRouter()

class FeasibilityRequest(BaseModel):
    municipality_name: str
    ward_no: int
    proposed_business: str

class AlternativeBusiness(BaseModel):
    business: str
    confidence: float

class FeasibilityResponse(BaseModel):
    location: str
    proposed_business: str
    recommendation: str
    feasibility_score: str
    top_alternative: str
    reasoning: str
    alternatives: List[AlternativeBusiness]

def generate_explanation(ward_features: Dict[str, Any], evaluation: Dict[str, Any], municipality_name: str, ward_no: int) -> str:
    proposed = evaluation['proposed_business']
    verdict = evaluation['recommendation']
    score = evaluation['feasibility_score']
    alternatives = evaluation.get('alternatives', [])
    top_alt = alternatives[0]['business'] if alternatives else 'an alternative business'

    if "YES" in verdict:
        return (
            f"Based on local economic indicators for {municipality_name} Ward {ward_no}, "
            f"{proposed} is a viable opportunity. The model assigns it a {score:.1f}% feasibility "
            f"score, supported by the area's demographic profile, purchasing power, and market accessibility."
        )
    else:
        return (
            f"Opening a {proposed} in {municipality_name} Ward {ward_no} has limited potential "
            f"at this time (Score: {score:.1f}%). Based on local demographics and market conditions, "
            f"a {top_alt} may have a significantly higher chance of success in this location."
        )

@router.post("/", response_model=FeasibilityResponse, summary="Evaluate Business Feasibility")
async def evaluate_business_feasibility(
    request: FeasibilityRequest,
    db: DBSession,
    current_user: CurrentUser
):
    if not ml_service.is_loaded:
        raise HTTPException(status_code=503, detail="ML Models are not currently loaded.")

    ward_features = ml_service.get_ward_features(request.municipality_name, request.ward_no)

    if not ward_features:
        raise HTTPException(
            status_code=404,
            detail=f"Location '{request.municipality_name}' Ward {request.ward_no} not found in intelligence database."
        )

    # Run XGBoost Inference
    evaluation = ml_service.evaluate(request.municipality_name, ward_features, request.proposed_business)

    # Get top alternative safely
    alternatives = evaluation.get('alternatives', [])
    top_alt = alternatives[0]['business'] if alternatives else 'Agro-Processing'

    # Generate explanation
    reasoning = generate_explanation(ward_features, evaluation, request.municipality_name, request.ward_no)

    return FeasibilityResponse(
        location=f"{request.municipality_name} - Ward {request.ward_no}",
        proposed_business=request.proposed_business,
        recommendation=evaluation['recommendation'],
        feasibility_score=f"{evaluation['feasibility_score']:.1f}%",
        top_alternative=top_alt,
        reasoning=reasoning,
        alternatives=[AlternativeBusiness(**a) for a in alternatives]
    )
