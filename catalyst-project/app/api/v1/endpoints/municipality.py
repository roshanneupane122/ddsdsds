from typing import Sequence

from fastapi import APIRouter, Query, status

from app.api.dependencies import DBSession
from app.schemas.municipality import (
    MunicipalityCreate,
    MunicipalityRead,
    MunicipalityUpdate,
)
from app.services.municipality import (
    create_new_municipality,
    get_municipality,
    list_municipalities,
    remove_municipality,
    update_existing_municipality,
)
from app.api.dependencies import AdminUser,CurrentUser
router = APIRouter()


# ==========================================================
# Create Municipality
# ==========================================================

@router.post(
    "/",
    response_model=MunicipalityRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create Municipality",
)
async def create_municipality(
    municipality_in: MunicipalityCreate,
    db: DBSession,
    current_user:AdminUser,
):
    """
    Create a new municipality.
    """
    return await create_new_municipality(
        db=db,
        municipality_in=municipality_in,
    )


# ==========================================================
# List Municipalities
# ==========================================================

@router.get(
    "/",
    response_model=Sequence[MunicipalityRead],
    summary="List Municipalities",
)
async def get_all_municipalities(
    db: DBSession,
    current_user:CurrentUser,
    skip: int = Query(
        default=0,
        ge=0,
        description="Number of municipalities to skip",
    ),
    limit: int = Query(
        default=20,
        ge=1,
        le=100,
        description="Maximum number of municipalities to return",
    ),
):
    """
    Retrieve a paginated list of municipalities.
    """
    return await list_municipalities(
        db=db,
        skip=skip,
        limit=limit,
    )


# ==========================================================
# Get Municipality
# ==========================================================

@router.get(
    "/{municipality_id}",
    response_model=MunicipalityRead,
    summary="Get Municipality",
)
async def get_municipality_by_id(
    municipality_id: str,
    db: DBSession,
    current_user:CurrentUser,
):
    """
    Retrieve a municipality by its UUID.
    """
    return await get_municipality(
        db=db,
        municipality_id=municipality_id,
    )


# ==========================================================
# Update Municipality
# ==========================================================

@router.patch(
    "/{municipality_id}",
    response_model=MunicipalityRead,
    summary="Update Municipality",
)
async def update_municipality(
    municipality_id: str,
    municipality_in: MunicipalityUpdate,
    db: DBSession,
    current_user:AdminUser,
):
    """
    Update an existing municipality.
    """
    return await update_existing_municipality(
        db=db,
        municipality_id=municipality_id,
        municipality_in=municipality_in,
    )


# ==========================================================
# Delete Municipality
# ==========================================================

@router.delete(
    "/{municipality_id}",
    response_model=MunicipalityRead,
    summary="Delete Municipality",
)
async def delete_municipality(
    municipality_id: str,
    db: DBSession,
    current_user:AdminUser,
):
    """
    Delete an existing municipality.
    """
    return await remove_municipality(
        db=db,
        municipality_id=municipality_id,
    )