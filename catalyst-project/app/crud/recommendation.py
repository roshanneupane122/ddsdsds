from typing import Optional, Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.recommendation import AIRecommendation
from app.schemas.recommendation import (
    AIRecommendationCreate,
)
from typing import Any

# ==========================================================
# Read Operations
# ==========================================================

async def get_recommendation_by_id(
    db: AsyncSession,
    recommendation_id: str,
) -> Optional[AIRecommendation]:
    """
    Retrieve a single AI recommendation by UUID.
    """
    result = await db.execute(
        select(AIRecommendation).where(
            AIRecommendation.recommendation_id == recommendation_id
        ).options(
            selectinload(AIRecommendation.municipality),
            selectinload(AIRecommendation.opportunity),
        )
    )
    return result.scalar_one_or_none()


async def get_recommendation_by_pair(
    db: AsyncSession,
    *,
    municipality_id: str,
    opportunity_id: str,
    model_version: str = "v1.0",
) -> Optional[AIRecommendation]:
    """
    Retrieve a recommendation by its unique pair constraints.
    Used for duplicate checking before insertion.
    """
    result = await db.execute(
        select(AIRecommendation).where(
            AIRecommendation.municipality_id == municipality_id,
            AIRecommendation.opportunity_id == opportunity_id,
            AIRecommendation.model_version == model_version,
        )
    )
    return result.scalar_one_or_none()


async def get_recommendations(
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
    Retrieve recommendations with optional filters, sorted by highest suitability_score first.
    """
    query = select(AIRecommendation)

    if municipality_id is not None:
        query = query.where(AIRecommendation.municipality_id == municipality_id)

    if opportunity_id is not None:
        query = query.where(AIRecommendation.opportunity_id == opportunity_id)

    if min_score is not None:
        query = query.where(AIRecommendation.suitability_score >= min_score)

    if model_version is not None:
        query = query.where(AIRecommendation.model_version == model_version)

    query = (
        query
        .options(
            selectinload(AIRecommendation.municipality),
            selectinload(AIRecommendation.opportunity),
        )
        .order_by(AIRecommendation.suitability_score.desc())
        .offset(skip)
        .limit(limit)
    )

    result = await db.execute(query)
    return result.scalars().all()


# ==========================================================
# Create Operations
# ==========================================================

async def create_recommendation(
    db: AsyncSession,
    *,
    recommendation_in: AIRecommendationCreate,
) -> AIRecommendation:
    """
    Create a single AI recommendation record.
    """
    db_recommendation = AIRecommendation(
        **recommendation_in.model_dump()
    )

    db.add(db_recommendation)
    await db.flush()
    await db.refresh(db_recommendation)

    return db_recommendation


async def bulk_create_recommendations(
    db: AsyncSession,
    *,
    recommendations_in: list[AIRecommendationCreate],
) -> Sequence[AIRecommendation]:
    """
    Batch insert recommendations generated from an ML pipeline run.
    """
    db_objs = [
        AIRecommendation(**rec.model_dump())
        for rec in recommendations_in
    ]

    db.add_all(db_objs)
    await db.flush()

    for obj in db_objs:
        await db.refresh(obj)

    return db_objs


# ==========================================================
# Update Operation
# ==========================================================

async def update_recommendation(
    db: AsyncSession,
    *,
    db_recommendation: AIRecommendation,
    update_data: dict[str,Any],
) -> AIRecommendation:
    """
    Update an existing recommendation record.
    """
    for field, value in update_data.items():
        setattr(db_recommendation, field, value)

    await db.flush()
    await db.refresh(db_recommendation)

    return db_recommendation


# ==========================================================
# Delete Operation
# ==========================================================

async def delete_recommendation(
    db: AsyncSession,
    *,
    db_recommendation: AIRecommendation,
) -> AIRecommendation:
    """
    Delete a recommendation record.
    """
    await db.delete(db_recommendation)
    await db.flush()

    return db_recommendation