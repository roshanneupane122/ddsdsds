from typing import Any, Optional, Sequence

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.opportunity import (
    create_opportunity,
    delete_opportunity,
    get_opportunities,
    get_opportunity_by_id,
    get_opportunity_by_title,
    update_opportunity,
)
from app.models.opportunity import BusinessOpportunity
from app.schemas.opportunity import (
    BusinessOpportunityCreate,
    BusinessOpportunityUpdate,
)


# ==========================================================
# Internal Helper
# ==========================================================

async def _get_existing_opportunity(
    db: AsyncSession,
    opportunity_id: str,
) -> BusinessOpportunity:
    """
    Retrieve a business opportunity by UUID.

    Raises:
        HTTPException(404): If the opportunity does not exist.
    """

    db_opportunity = await get_opportunity_by_id(
        db=db,
        opportunity_id=opportunity_id,
    )

    if db_opportunity is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business opportunity not found.",
        )

    return db_opportunity


# ==========================================================
# Create Opportunity
# ==========================================================

async def create_new_opportunity(
    db: AsyncSession,
    *,
    opportunity_in: BusinessOpportunityCreate,
) -> BusinessOpportunity:
    """
    Create a new business opportunity.

    Business Rules
    --------------
    - Opportunity title must be unique.
    """

    existing = await get_opportunity_by_title(
        db=db,
        title=opportunity_in.title,
    )

    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Business opportunity with this title already exists.",
        )

    return await create_opportunity(
        db=db,
        opportunity_in=opportunity_in,
    )


# ==========================================================
# Get Opportunity
# ==========================================================

async def get_opportunity(
    db: AsyncSession,
    *,
    opportunity_id: str,
) -> BusinessOpportunity:
    """
    Retrieve a business opportunity by UUID.
    """

    return await _get_existing_opportunity(
        db=db,
        opportunity_id=opportunity_id,
    )


# ==========================================================
# List Opportunities
# ==========================================================

async def list_opportunities(
    db: AsyncSession,
    *,
    sector: Optional[str] = None,
    min_budget: Optional[float] = None,
    max_budget: Optional[float] = None,
    skip: int = 0,
    limit: int = 20,
) -> Sequence[BusinessOpportunity]:
    """
    Retrieve business opportunities with optional filtering.
    """

    return await get_opportunities(
        db=db,
        sector=sector,
        min_budget=min_budget,
        max_budget=max_budget,
        skip=skip,
        limit=limit,
    )


# ==========================================================
# Update Opportunity
# ==========================================================

async def update_existing_opportunity(
    db: AsyncSession,
    *,
    opportunity_id: str,
    opportunity_in: BusinessOpportunityUpdate,
) -> BusinessOpportunity:
    """
    Update an existing business opportunity.

    Business Rules
    --------------
    - Opportunity must exist.
    - Updated title must remain unique.
    """

    db_opportunity = await _get_existing_opportunity(
        db=db,
        opportunity_id=opportunity_id,
    )

    update_data: dict[str, Any] = opportunity_in.model_dump(
        exclude_unset=True,
        exclude={"opportunity_id"},
    )

    if (
        "title" in update_data
        and update_data["title"] != db_opportunity.title
    ):
        existing = await get_opportunity_by_title(
            db=db,
            title=update_data["title"],
        )

        if existing is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Business opportunity with this title already exists.",
            )

    return await update_opportunity(
        db=db,
        db_opportunity=db_opportunity,
        update_data=update_data,
    )


# ==========================================================
# Delete Opportunity
# ==========================================================

async def remove_opportunity(
    db: AsyncSession,
    *,
    opportunity_id: str,
) -> BusinessOpportunity:
    """
    Delete an existing business opportunity.
    """

    db_opportunity = await _get_existing_opportunity(
        db=db,
        opportunity_id=opportunity_id,
    )

    await delete_opportunity(
        db=db,
        db_opportunity=db_opportunity,
    )

    return db_opportunity