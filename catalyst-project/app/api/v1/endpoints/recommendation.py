from typing import Optional, Sequence

from fastapi import APIRouter, Query, status

from app.api.dependencies import DBSession
from app.schemas.recommendation import (
    AIRecommendationCreate,
    AIRecommendationDetail,
    AIRecommendationRead,
    AIRecommendationUpdate,
)
from app.services.recommendation import (
    create_bulk_recommendations,
    create_new_recommendation,
    get_recommendation,
    list_recommendations,
    remove_recommendation,
    update_existing_recommendation,
)
from app.api.dependencies import CurrentUser,AdminUser
router = APIRouter()


# ==========================================================
# Create Recommendation
# ==========================================================

@router.post(
    "/",
    response_model=AIRecommendationDetail,
    status_code=status.HTTP_201_CREATED,
    summary="Create AI Recommendation",
)
async def create_recommendation(
    recommendation_in: AIRecommendationCreate,
    db: DBSession,
    current_user:AdminUser
):
    """
    Create a new AI recommendation.
    """
    return await create_new_recommendation(
        db=db,
        recommendation_in=recommendation_in,
    )


# ==========================================================
# Bulk Create Recommendations
# ==========================================================

@router.post(
    "/bulk",
    response_model=Sequence[AIRecommendationDetail],
    status_code=status.HTTP_201_CREATED,
    summary="Bulk Create AI Recommendations",
)
async def bulk_create_recommendation(
    recommendations_in: list[AIRecommendationCreate],
    db: DBSession,
    current_user:AdminUser
):
    """
    Bulk create AI recommendations.
    """
    return await create_bulk_recommendations(
        db=db,
        recommendations_in=recommendations_in,
    )


# ==========================================================
# List Recommendations
# ==========================================================

@router.get(
    "/",
    response_model=Sequence[AIRecommendationDetail],
    summary="List AI Recommendations",
)
async def get_all_recommendations(
    db: DBSession,
    current_user:CurrentUser,
    municipality_id: Optional[str] = Query(
        default=None,
        description="Filter by municipality UUID",
    ),
    opportunity_id: Optional[str] = Query(
        default=None,
        description="Filter by opportunity UUID",
    ),
    min_score: Optional[float] = Query(
        default=None,
        ge=0,
        le=100,
        description="Minimum suitability score",
    ),
    model_version: Optional[str] = Query(
        default=None,
        description="Filter by model version",
    ),
    skip: int = Query(
        default=0,
        ge=0,
        description="Records to skip",
    ),
    limit: int = Query(
        default=20,
        ge=1,
        le=100,
        description="Maximum records returned",
    ),
):
    """
    Retrieve AI recommendations with optional filters.
    """
    return await list_recommendations(
        db=db,
        municipality_id=municipality_id,
        opportunity_id=opportunity_id,
        min_score=min_score,
        model_version=model_version,
        skip=skip,
        limit=limit,
    )


# ==========================================================
# Get Recommendation
# ==========================================================

@router.get(
    "/{recommendation_id}",
    response_model=AIRecommendationDetail,
    summary="Get AI Recommendation",
)
async def get_recommendation_by_id(
    recommendation_id: str,
    db: DBSession,
    current_user:CurrentUser
):
    """
    Retrieve an AI recommendation by UUID.
    """
    return await get_recommendation(
        db=db,
        recommendation_id=recommendation_id,
    )


# ==========================================================
# Update Recommendation
# ==========================================================

@router.patch(
    "/{recommendation_id}",
    response_model=AIRecommendationDetail,
    summary="Update AI Recommendation",
)
async def update_recommendation(
    recommendation_id: str,
    recommendation_in: AIRecommendationUpdate,
    db: DBSession,
    current_user:AdminUser
):
    """
    Update an AI recommendation.
    """
    return await update_existing_recommendation(
        db=db,
        recommendation_id=recommendation_id,
        recommendation_in=recommendation_in,
    )


# ==========================================================
# Delete Recommendation
# ==========================================================

@router.delete(
    "/{recommendation_id}",
    response_model=AIRecommendationDetail,
    summary="Delete AI Recommendation",
)
async def delete_recommendation(
    recommendation_id: str,
    db: DBSession,
    current_user:AdminUser
):
    """
    Delete an AI recommendation.
    """
    return await remove_recommendation(
        db=db,
        recommendation_id=recommendation_id,
    )