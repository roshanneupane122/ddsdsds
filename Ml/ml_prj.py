from fastapi import FastAPI
import uvicorn
from schemas import (
    FeasibilityRequest, 
    FeasibilityResponse, 
    RecommendationRequest, 
    RecommendationResponse
)
from services import process_feasibility, process_recommendation

app = FastAPI(
    title="Business Feasibility Evaluator API",
    description="API to evaluate commercial feasibility in Rupandehi using ML and Qwen LLM",
    version="1.0.0"
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Business Feasibility Evaluator API. Go to /docs for the interactive Swagger UI."}

@app.post("/evaluate", response_model=FeasibilityResponse)
def evaluate_business_feasibility(request: FeasibilityRequest):
    return process_feasibility(
        municipality_name=request.municipality_name,
        ward_no=request.ward_no,
        proposed_business=request.proposed_business
    )

@app.post("/recommend", response_model=RecommendationResponse)
def recommend_business(request: RecommendationRequest):
    return process_recommendation(
        municipality_name=request.municipality_name,
        ward_no=request.ward_no
    )

if __name__ == "__main__":
    uvicorn.run("ml_prj:app", host="0.0.0.0", port=8000, reload=True)
