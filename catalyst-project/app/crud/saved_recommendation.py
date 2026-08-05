from typing import Optional, Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.saved_recommendation import SavedRecommendation


# ==========================================================
# Read Operations
# ==========================================================

async def get_saved_recommendation(
    db: AsyncSession,
    *,
    user_id: str,
    recommendation_id: str,
    load_relations: bool = False,
) -> Optional[SavedRecommendation]:
    """
    Retrieve a saved recommendation using its composite primary key.
    """

    stmt = select(SavedRecommendation).where(
        SavedRecommendation.user_id == user_id,
        SavedRecommendation.recommendation_id == recommendation_id,
    )

    if load_relations:
        stmt = stmt.options(
            selectinload(SavedRecommendation.recommendation),
        )

    result = await db.execute(stmt)

    return result.scalar_one_or_none()


async def get_saved_recommendations(
    db: AsyncSession,
    *,
    user_id: str,
    skip: int = 0,
    limit: int = 20,
    load_relations: bool = True,
) -> Sequence[SavedRecommendation]:
    """
    Retrieve all saved recommendations for a user.

    By default the related recommendation is eagerly loaded
    to support dashboard/detail responses efficiently.
    """

    stmt = (
        select(SavedRecommendation)
        .where(
            SavedRecommendation.user_id == user_id,
        )
        .order_by(
            SavedRecommendation.saved_at.desc(),
        )
        .offset(skip)
        .limit(limit)
    )

    if load_relations:
        stmt = stmt.options(
            selectinload(SavedRecommendation.recommendation),
        )

    result = await db.execute(stmt)

    return result.scalars().all()


# ==========================================================
# Create Operation
# ==========================================================

async def create_saved_recommendation(
    db: AsyncSession,
    *,
    user_id: str,
    recommendation_id: str,
) -> SavedRecommendation:
    """
    Save (bookmark) a recommendation for a user.
    """

    db_saved = SavedRecommendation(
        user_id=user_id,
        recommendation_id=recommendation_id,
    )

    db.add(db_saved)

    await db.flush()

    await db.refresh(
        db_saved,
        attribute_names=["recommendation"],
    )

    return db_saved


# ==========================================================
# Delete Operation
# ==========================================================

async def delete_saved_recommendation(
    db: AsyncSession,
    *,
    db_saved: SavedRecommendation,
) -> SavedRecommendation:
    """
    Remove a saved recommendation.
    """

    await db.delete(db_saved)

    await db.flush()

    return db_saved