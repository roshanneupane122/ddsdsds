from typing import Optional

from fastapi import APIRouter, Query, status

from app.api.dependencies import DBSession
from app.schemas.opportunity import (
    BusinessOpportunityCreate,
    BusinessOpportunityRead,
    BusinessOpportunityUpdate,
)
from app.services.opportunity import (
    create_new_opportunity,
    get_opportunity,
    list_opportunities,
    remove_opportunity,
    update_existing_opportunity,
)
from app.api.dependencies import AdminUser,CurrentUser

router = APIRouter()


# ==========================================================
# Create Opportunity
# ==========================================================

@router.post(
    "/",
    response_model=BusinessOpportunityRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create Business Opportunity",
)
async def create_opportunity(
    opportunity_in: BusinessOpportunityCreate,
    db: DBSession,
    current_user:AdminUser
):
    """
    Create a new business opportunity.
    """
    return await create_new_opportunity(
        db=db,
        opportunity_in=opportunity_in,
    )


# ==========================================================
# List Opportunities
# ==========================================================

@router.get(
    "/",
    response_model=list[BusinessOpportunityRead],
    summary="List Business Opportunities",
)
async def get_all_opportunities(
    db: DBSession,
    current_user:CurrentUser,
    sector: Optional[str] = Query(
        default=None,
        description="Filter by business sector",
    ),
    min_budget: Optional[float] = Query(
        default=None,
        ge=0,
        description="Minimum available budget",
    ),
    max_budget: Optional[float] = Query(
        default=None,
        ge=0,
        description="Maximum available budget",
    ),
    skip: int = Query(
        default=0,
        ge=0,
        description="Number of records to skip",
    ),
    limit: int = Query(
        default=20,
        ge=1,
        le=100,
        description="Maximum number of records to return",
    ),
):
    """
    Retrieve business opportunities with optional filters.
    """
    return await list_opportunities(
        db=db,
        sector=sector,
        min_budget=min_budget,
        max_budget=max_budget,
        skip=skip,
        limit=limit,
    )


# ==========================================================
# Get Opportunity
# ==========================================================

@router.get(
    "/{opportunity_id}",
    response_model=BusinessOpportunityRead,
    summary="Get Business Opportunity",
)
async def get_opportunity_by_id(
    opportunity_id: str,
    db: DBSession,
    current_user:CurrentUser,
):
    """
    Retrieve a business opportunity by UUID.
    """
    return await get_opportunity(
        db=db,
        opportunity_id=opportunity_id,
    )


# ==========================================================
# Update Opportunity
# ==========================================================

@router.patch(
    "/{opportunity_id}",
    response_model=BusinessOpportunityRead,
    summary="Update Business Opportunity",
)
async def update_opportunity(
    opportunity_id: str,
    opportunity_in: BusinessOpportunityUpdate,
    db: DBSession,
    current_user:AdminUser
):
    """
    Update an existing business opportunity.
    """
    return await update_existing_opportunity(
        db=db,
        opportunity_id=opportunity_id,
        opportunity_in=opportunity_in,
    )


# ==========================================================
# Delete Opportunity
# ==========================================================

@router.delete(
    "/{opportunity_id}",
    response_model=BusinessOpportunityRead,
    summary="Delete Business Opportunity",
)
async def delete_opportunity(
    opportunity_id: str,
    db: DBSession,
    current_user:AdminUser
):
    """
    Delete a business opportunity.
    """
    return await remove_opportunity(
        db=db,
        opportunity_id=opportunity_id,
    )