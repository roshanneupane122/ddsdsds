from typing import Optional, Sequence

from fastapi import APIRouter, Query, status

from app.api.dependencies import DBSession
from app.schemas.resource_data import (
    ResourceDataBatchCreate,
    ResourceDataCreate,
    ResourceDataRead,
    ResourceDataUpdate,
)
from app.services.resource_data import (
    create_bulk_resource_data,
    create_new_resource_data,
    get_resource,
    list_resource_data,
    remove_resource_data,
    update_existing_resource_data,
)
from app.api.dependencies import CurrentUser,AdminUser
router = APIRouter()


# ==========================================================
# Create Resource Data
# ==========================================================

@router.post(
    "/",
    response_model=ResourceDataRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create Resource Data",
)
async def create_resource(
    resource_data_in: ResourceDataCreate,
    db: DBSession,
    current_user:AdminUser
):
    """
    Create a new resource data record.
    """
    return await create_new_resource_data(
        db=db,
        resource_data_in=resource_data_in,
    )


# ==========================================================
# Bulk Create Resource Data
# ==========================================================

@router.post(
    "/bulk",
    response_model=Sequence[ResourceDataRead],
    status_code=status.HTTP_201_CREATED,
    summary="Bulk Create Resource Data",
)
async def bulk_create_resource(
    batch: ResourceDataBatchCreate,
    db: DBSession,
    current_user:AdminUser
):
    """
    Bulk insert resource data.

    Automatically:
    - Removes duplicates inside the uploaded batch.
    - Skips records already existing in the database.
    """
    return await create_bulk_resource_data(
        db=db,
        resource_data_list=batch.items,
    )


# ==========================================================
# List Resource Data
# ==========================================================

@router.get(
    "/",
    response_model=Sequence[ResourceDataRead],
    summary="List Resource Data",
)
async def get_all_resource_data(
    db: DBSession,
    current_user:CurrentUser,
    municipality_id: Optional[str] = Query(
        default=None,
        description="Filter by Municipality UUID",
    ),
    category: Optional[str] = Query(
        default=None,
        description="Filter by category",
    ),
    indicator_name: Optional[str] = Query(
        default=None,
        description="Filter by indicator name",
    ),
    year: Optional[int] = Query(
        default=None,
        ge=1900,
        le=2100,
        description="Filter by year",
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
    Retrieve resource data with optional filtering and pagination.
    """
    return await list_resource_data(
        db=db,
        municipality_id=municipality_id,
        category=category,
        indicator_name=indicator_name,
        year=year,
        skip=skip,
        limit=limit,
    )


# ==========================================================
# Get Resource Data
# ==========================================================

@router.get(
    "/{data_id}",
    response_model=ResourceDataRead,
    summary="Get Resource Data",
)
async def get_resource_by_id(
    data_id: str,
    db: DBSession,
    current_user:CurrentUser
):
    """
    Retrieve a single resource data record by UUID.
    """
    return await get_resource(
        db=db,
        data_id=data_id,
    )


# ==========================================================
# Update Resource Data
# ==========================================================

@router.patch(
    "/{data_id}",
    response_model=ResourceDataRead,
    summary="Update Resource Data",
)
async def update_resource(
    data_id: str,
    resource_data_in: ResourceDataUpdate,
    db: DBSession,
    current_user:AdminUser
):
    """
    Update an existing resource data record.
    """
    return await update_existing_resource_data(
        db=db,
        data_id=data_id,
        resource_data_in=resource_data_in,
    )


# ==========================================================
# Delete Resource Data
# ==========================================================

@router.delete(
    "/{data_id}",
    response_model=ResourceDataRead,
    summary="Delete Resource Data",
)
async def delete_resource(
    data_id: str,
    db: DBSession,
    current_user:AdminUser
):
    """
    Delete an existing resource data record.
    """
    return await remove_resource_data(
        db=db,
        data_id=data_id,
    )