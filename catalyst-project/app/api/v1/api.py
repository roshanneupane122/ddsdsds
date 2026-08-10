from fastapi import APIRouter

from app.api.v1.endpoints import (
    user,
    municipality,
    opportunity,
    recommendation,
    resource_data,
    saved_recommendation,
    auth,

)

api_router = APIRouter()

api_router.include_router(
    user.router,
    prefix="/users",
    tags=["Users"],
)

api_router.include_router(
    municipality.router,
    prefix="/municipalities",
    tags=["Municipalities"],
)

api_router.include_router(
    opportunity.router,
    prefix="/opportunities",
    tags=["Bussiness Opportunities"]
)

api_router.include_router(
    recommendation.router,
    prefix="/recommendations",
    tags=["AI Recommendations"]

)

api_router.include_router(
    resource_data.router,
    prefix="/resource_data",
    tags=["Resource_Data"]
)

api_router.include_router(
    saved_recommendation.router,
    prefix="/saved_recommendation",
    tags=["Saved Recommendation"]
    
)

api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"]
)

from app.api.v1.endpoints import evaluate, analyze, spatial, report
api_router.include_router(
    evaluate.router,
    prefix="/evaluate",
    tags=["AI Recommendations"]
)

api_router.include_router(
    analyze.router,
    prefix="/analyze",
    tags=["AI Analytics"]
)

api_router.include_router(
    spatial.router,
    prefix="/spatial",
    tags=["Spatial Data"]
)

api_router.include_router(
    report.router,
    prefix="/report",
    tags=["Reports"]
)