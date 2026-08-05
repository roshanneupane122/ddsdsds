from typing import Any, Optional, Sequence

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.recommendation import (
    bulk_create_recommendations,
    create_recommendation,
    delete_recommendation,
    get_recommendation_by_id,
    get_recommendation_by_pair,
    get_recommendations,
    update_recommendation,
)
from app.models.recommendation import AIRecommendation
from app.schemas.recommendation import (
    AIRecommendationCreate,
    AIRecommendationUpdate,
)


# ==========================================================
# Internal Helper
# ==========================================================

async def _get_existing_recommendation(
    db: AsyncSession,
    recommendation_id: str,
) -> AIRecommendation:
    """
    Retrieve a recommendation by UUID.

    Raises:
        HTTPException(404): Recommendation not found.
    """
    db_recommendation = await get_recommendation_by_id(
        db=db,
        recommendation_id=recommendation_id,
    )

    if db_recommendation is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AI recommendation not found.",
        )

    return db_recommendation


# ==========================================================
# Create Recommendation
# ==========================================================

async def create_new_recommendation(
    db: AsyncSession,
    *,
    recommendation_in: AIRecommendationCreate,
) -> AIRecommendation:
    """
    Create a new AI recommendation.

    Business Rules
    --------------
    - Municipality + Opportunity + Model Version must be unique.
    """

    existing = await get_recommendation_by_pair(
        db=db,
        municipality_id=recommendation_in.municipality_id,
        opportunity_id=recommendation_in.opportunity_id,
        model_version=recommendation_in.model_version,
    )

    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "A recommendation already exists for this "
                "municipality, opportunity and model version."
            ),
        )

    created = await create_recommendation(
        db=db,
        recommendation_in=recommendation_in,
    )

    return await get_recommendation_by_id(
        db=db,
        recommendation_id=created.recommendation_id,
    ) or created


# ==========================================================
# Bulk Create Recommendations
# ==========================================================

async def create_bulk_recommendations(
    db: AsyncSession,
    *,
    recommendations_in: list[AIRecommendationCreate],
) -> Sequence[AIRecommendation]:
    """
    Bulk insert AI recommendations.

    Intended for ML batch prediction pipelines.
    """

    created = await bulk_create_recommendations(
        db=db,
        recommendations_in=recommendations_in,
    )

    loaded: list[AIRecommendation] = []
    for item in created:
        loaded_item = await get_recommendation_by_id(
            db=db,
            recommendation_id=item.recommendation_id,
        )
        if loaded_item is not None:
            loaded.append(loaded_item)

    return loaded


# ==========================================================
# Get Recommendation
# ==========================================================

async def get_recommendation(
    db: AsyncSession,
    *,
    recommendation_id: str,
) -> AIRecommendation:
    """
    Retrieve a recommendation by UUID.
    """

    return await _get_existing_recommendation(
        db=db,
        recommendation_id=recommendation_id,
    )


# ==========================================================
# List Recommendations
# ==========================================================

async def list_recommendations(
    db: AsyncSession,
    *,
    municipality_id: Optional[str] = None,
    opportunity_id: Optional[str] = None,
    min_score: Optional[float] = None,
    model_version: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
) -> Sequence[AIRecommendation]:
    """
    Retrieve recommendations with optional filters.
    """

    return await get_recommendations(
        db=db,
        municipality_id=municipality_id,
        opportunity_id=opportunity_id,
        min_score=min_score,
        model_version=model_version,
        skip=skip,
        limit=limit,
    )


# ==========================================================
# Update Recommendation
# ==========================================================

async def update_existing_recommendation(
    db: AsyncSession,
    *,
    recommendation_id: str,
    recommendation_in: AIRecommendationUpdate,
) -> AIRecommendation:
    """
    Update an existing AI recommendation.

    Business Rules
    --------------
    - Recommendation must exist.
    - Municipality + Opportunity + Model Version
      combination must remain unique.
    """

    db_recommendation = await _get_existing_recommendation(
        db=db,
        recommendation_id=recommendation_id,
    )

    update_data: dict[str, Any] = recommendation_in.model_dump(
        exclude_unset=True,
        exclude={
            "recommendation_id",
            "created_at",
        },
    )

    if (
        "municipality_id" in update_data
        or "opportunity_id" in update_data
        or "model_version" in update_data
    ):

        municipality_id = update_data.get(
            "municipality_id",
            db_recommendation.municipality_id,
        )

        opportunity_id = update_data.get(
            "opportunity_id",
            db_recommendation.opportunity_id,
        )

        model_version = update_data.get(
            "model_version",
            db_recommendation.model_version,
        )

        existing = await get_recommendation_by_pair(
            db=db,
            municipality_id=municipality_id,
            opportunity_id=opportunity_id,
            model_version=model_version,
        )

        if (
            existing is not None
            and existing.recommendation_id
            != db_recommendation.recommendation_id
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "A recommendation already exists for this "
                    "municipality, opportunity and model version."
                ),
            )

    updated = await update_recommendation(
        db=db,
        db_recommendation=db_recommendation,
        update_data=update_data,
    )

    return await get_recommendation_by_id(
        db=db,
        recommendation_id=updated.recommendation_id,
    ) or updated


# ==========================================================
# Delete Recommendation
# ==========================================================

async def remove_recommendation(
    db: AsyncSession,
    *,
    recommendation_id: str,
) -> AIRecommendation:
    """
    Delete an existing AI recommendation.
    """

    db_recommendation = await _get_existing_recommendation(
        db=db,
        recommendation_id=recommendation_id,
    )

    await delete_recommendation(
        db=db,
        db_recommendation=db_recommendation,
    )

    return db_recommendation