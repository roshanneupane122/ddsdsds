from typing import Sequence

from fastapi import APIRouter, Query, status

from app.api.dependencies import DBSession, CurrentUser
from app.schemas.saved_recommendation import (
    SavedRecommendationCreate,
    SavedRecommendationDetail,
    SavedRecommendationRead,
)
from app.services.saved_recommendation import (
    create_new_saved_recommendation,
    get_saved,
    list_saved_recommendations,
    remove_saved_recommendation,
)

router = APIRouter()


# ==========================================================
# Create Saved Recommendation
# ==========================================================

@router.post(
    "/",
    response_model=SavedRecommendationDetail,
    status_code=status.HTTP_201_CREATED,
    summary="Save Recommendation",
)
async def create_saved(
    saved_in: SavedRecommendationCreate,
    db: DBSession,
    current_user: CurrentUser,
):
    """
    Save an AI recommendation for the authenticated user.
    """

    return await create_new_saved_recommendation(
        db=db,
        user_id=current_user.id,
        saved_in=saved_in,
    )


# ==========================================================
# List Saved Recommendations
# ==========================================================

@router.get(
    "/",
    response_model=Sequence[SavedRecommendationDetail],
    summary="List Saved Recommendations",
)
async def get_saved_list(
    db: DBSession,
    current_user: CurrentUser,
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
    Retrieve all saved recommendations for the authenticated user.
    """

    return await list_saved_recommendations(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        load_relations=True,
    )


# ==========================================================
# Get Saved Recommendation
# ==========================================================

@router.get(
    "/{recommendation_id}",
    response_model=SavedRecommendationDetail,
    summary="Get Saved Recommendation",
)
async def get_saved_recommendation(
    recommendation_id: str,
    db: DBSession,
    current_user: CurrentUser,
):
    """
    Retrieve a single saved recommendation for the authenticated user.
    """

    return await get_saved(
        db=db,
        user_id=current_user.id,
        recommendation_id=recommendation_id,
        load_relations=True,
    )


# ==========================================================
# Delete Saved Recommendation
# ==========================================================

@router.delete(
    "/{recommendation_id}",
    response_model=SavedRecommendationRead,
    summary="Delete Saved Recommendation",
)
async def delete_saved(
    recommendation_id: str,
    db: DBSession,
    current_user: CurrentUser,
):
    """
    Remove a saved recommendation for the authenticated user.
    """

    return await remove_saved_recommendation(
        db=db,
        user_id=current_user.id,
        recommendation_id=recommendation_id,
    )