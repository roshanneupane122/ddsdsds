from pydantic import BaseModel

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

class RecommendationRequest(BaseModel):
    municipality_name: str
    ward_no: int

class RecommendationResponse(BaseModel):
    location: str
    recommended_business: str
    confidence_score: str
    reasoning: str