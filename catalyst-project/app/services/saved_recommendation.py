from typing import Sequence

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.recommendation import get_recommendation_by_id
from app.crud.saved_recommendation import (
    create_saved_recommendation,
    delete_saved_recommendation,
    get_saved_recommendation,
    get_saved_recommendations,
)
from app.models.saved_recommendation import SavedRecommendation
from app.schemas.saved_recommendation import SavedRecommendationCreate


# ==========================================================
# Internal Helper
# ==========================================================

async def _get_existing_saved_recommendation(
    db: AsyncSession,
    *,
    user_id: str,
    recommendation_id: str,
    load_relations: bool = False,
) -> SavedRecommendation:
    """
    Retrieve a saved recommendation or raise 404.
    """

    db_saved = await get_saved_recommendation(
        db=db,
        user_id=user_id,
        recommendation_id=recommendation_id,
        load_relations=load_relations,
    )

    if db_saved is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved recommendation not found.",
        )

    return db_saved


# ==========================================================
# Create
# ==========================================================

async def create_new_saved_recommendation(
    db: AsyncSession,
    *,
    user_id: str,
    saved_in: SavedRecommendationCreate,
) -> SavedRecommendation:
    """
    Save (bookmark) an AI recommendation.

    Business Rules
    --------------
    • User cannot save the same recommendation twice.
    • Recommendation must exist.
    """

    # Check recommendation exists
    recommendation = await get_recommendation_by_id(
        db=db,
        recommendation_id=saved_in.recommendation_id,
    )

    if recommendation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AI recommendation not found.",
        )

    # Check duplicate bookmark
    existing = await get_saved_recommendation(
        db=db,
        user_id=user_id,
        recommendation_id=saved_in.recommendation_id,
    )

    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Recommendation already saved.",
        )

    return await create_saved_recommendation(
        db=db,
        user_id=user_id,
        recommendation_id=saved_in.recommendation_id,
    )


# ==========================================================
# Read One
# ==========================================================

async def get_saved(
    db: AsyncSession,
    *,
    user_id: str,
    recommendation_id: str,
    load_relations: bool = True,
) -> SavedRecommendation:
    """
    Retrieve a saved recommendation.
    """

    return await _get_existing_saved_recommendation(
        db=db,
        user_id=user_id,
        recommendation_id=recommendation_id,
        load_relations=load_relations,
    )


# ==========================================================
# Read Many
# ==========================================================

async def list_saved_recommendations(
    db: AsyncSession,
    *,
    user_id: str,
    skip: int = 0,
    limit: int = 20,
    load_relations: bool = True,
) -> Sequence[SavedRecommendation]:
    """
    Retrieve all saved recommendations for a user.
    """

    return await get_saved_recommendations(
        db=db,
        user_id=user_id,
        skip=skip,
        limit=limit,
        load_relations=load_relations,
    )


# ==========================================================
# Delete
# ==========================================================

async def remove_saved_recommendation(
    db: AsyncSession,
    *,
    user_id: str,
    recommendation_id: str,
) -> SavedRecommendation:
    """
    Remove a bookmarked recommendation.
    """

    db_saved = await _get_existing_saved_recommendation(
        db=db,
        user_id=user_id,
        recommendation_id=recommendation_id,
    )

    await delete_saved_recommendation(
        db=db,
        db_saved=db_saved,
    )

    return db_saved