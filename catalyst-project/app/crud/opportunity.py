from typing import Optional, Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.opportunity import BusinessOpportunity
from app.schemas.opportunity import (
    BusinessOpportunityCreate,
)


# ==========================================================
# Read Operations
# ==========================================================

async def get_opportunity_by_id(
    db: AsyncSession,
    opportunity_id: str,
) -> Optional[BusinessOpportunity]:
    """
    Retrieve a business opportunity by UUID.
    """
    result = await db.execute(
        select(BusinessOpportunity).where(
            BusinessOpportunity.opportunity_id == opportunity_id
        )
    )
    return result.scalar_one_or_none()


async def get_opportunity_by_title(
    db: AsyncSession,
    title: str,
) -> Optional[BusinessOpportunity]:
    """
    Retrieve a business opportunity by title.
    Used for uniqueness validation.
    """
    result = await db.execute(
        select(BusinessOpportunity).where(
            BusinessOpportunity.title == title
        )
    )
    return result.scalar_one_or_none()


async def get_opportunities(
    db: AsyncSession,
    *,
    sector: Optional[str] = None,
    min_budget: Optional[float] = None,
    max_budget: Optional[float] = None,
    skip: int = 0,
    limit: int = 20,
) -> Sequence[BusinessOpportunity]:
    """
    Retrieve business opportunities with optional filters.

    Budget filtering returns opportunities whose
    investment range overlaps the user's budget.
    """

    query = select(BusinessOpportunity)

    if sector is not None:
        query = query.where(
            BusinessOpportunity.sector == sector
        )

    if min_budget is not None:
        query = query.where(
            BusinessOpportunity.max_investment >= min_budget
        )

    if max_budget is not None:
        query = query.where(
            BusinessOpportunity.min_investment <= max_budget
        )

    query = (
        query
        .order_by(BusinessOpportunity.created_at.desc())
        .offset(skip)
        .limit(limit)
    )

    result = await db.execute(query)

    return result.scalars().all()


# ==========================================================
# Create Operation
# ==========================================================

async def create_opportunity(
    db: AsyncSession,
    *,
    opportunity_in: BusinessOpportunityCreate,
) -> BusinessOpportunity:
    """
    Create a new business opportunity.
    """

    db_opportunity = BusinessOpportunity(
        **opportunity_in.model_dump()
    )

    db.add(db_opportunity)

    await db.flush()
    await db.refresh(db_opportunity)

    return db_opportunity


# ==========================================================
# Update Operation
# ==========================================================

async def update_opportunity(
    db: AsyncSession,
    *,
    db_opportunity: BusinessOpportunity,
    update_data: dict,
) -> BusinessOpportunity:
    """
    Update an existing business opportunity.
    """

    for field, value in update_data.items():
        setattr(db_opportunity, field, value)

    await db.flush()
    await db.refresh(db_opportunity)

    return db_opportunity


# ==========================================================
# Delete Operation
# ==========================================================

async def delete_opportunity(
    db: AsyncSession,
    *,
    db_opportunity: BusinessOpportunity,
) -> BusinessOpportunity:
    """
    Delete a business opportunity.
    """

    await db.delete(db_opportunity)
    await db.flush()

    return db_opportunity