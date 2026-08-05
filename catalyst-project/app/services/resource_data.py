from typing import Any, Optional, Sequence

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.resource_data import (
    bulk_create_resource_data,
    create_resource_data,
    delete_resource_data,
    get_existing_composite_keys,
    get_resource_data,
    get_resource_data_by_id,
    get_resource_data_by_unique_fields,
    update_resource_data,
)
from app.models.resource_data import ResourceData
from app.schemas.resource_data import (
    ResourceDataCreate,
    ResourceDataUpdate,
)


# ==========================================================
# Internal Helper
# ==========================================================

async def _get_existing_resource_data(
    db: AsyncSession,
    data_id: str,
) -> ResourceData:
    """
    Retrieve a resource data record by UUID.
    """

    db_resource = await get_resource_data_by_id(
        db=db,
        data_id=data_id,
    )

    if db_resource is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resource data not found.",
        )

    return db_resource


# ==========================================================
# Create Resource Data
# ==========================================================

async def create_new_resource_data(
    db: AsyncSession,
    *,
    resource_data_in: ResourceDataCreate,
) -> ResourceData:
    """
    Create a new resource data record.
    """

    existing = await get_resource_data_by_unique_fields(
        db=db,
        municipality_id=resource_data_in.municipality_id,
        category=resource_data_in.category,
        indicator_name=resource_data_in.indicator_name,
        year=resource_data_in.year,
    )

    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Resource data already exists for this municipality, "
                "category, indicator and year."
            ),
        )

    return await create_resource_data(
        db=db,
        resource_data_in=resource_data_in,
    )


# ==========================================================
# Bulk Create Resource Data
# ==========================================================

async def create_bulk_resource_data(
    db: AsyncSession,
    *,
    resource_data_list: list[ResourceDataCreate],
) -> Sequence[ResourceData]:
    """
    Bulk create resource data.

    - Removes duplicates inside the uploaded batch.
    - Skips records already existing in the database.
    - Safe for repeated ETL imports.
    """

    if not resource_data_list:
        return []

    unique_items: list[ResourceDataCreate] = []
    keys: set[tuple[str, str, str, int]] = set()

    for item in resource_data_list:
        key = (
            item.municipality_id,
            item.category,
            item.indicator_name,
            item.year,
        )

        if key not in keys:
            keys.add(key)
            unique_items.append(item)

    existing_keys = await get_existing_composite_keys(
        db=db,
        keys=keys,
    )

    new_records = [
        item
        for item in unique_items
        if (
            item.municipality_id,
            item.category,
            item.indicator_name,
            item.year,
        )
        not in existing_keys
    ]

    if not new_records:
        return []

    return await bulk_create_resource_data(
        db=db,
        resource_data_list=new_records,
    )


# ==========================================================
# Get Resource Data
# ==========================================================

async def get_resource(
    db: AsyncSession,
    *,
    data_id: str,
) -> ResourceData:
    """
    Retrieve a resource data record by UUID.
    """

    return await _get_existing_resource_data(
        db=db,
        data_id=data_id,
    )


# ==========================================================
# List Resource Data
# ==========================================================

async def list_resource_data(
    db: AsyncSession,
    *,
    municipality_id: Optional[str] = None,
    category: Optional[str] = None,
    indicator_name: Optional[str] = None,
    year: Optional[int] = None,
    skip: int = 0,
    limit: int = 20,
) -> Sequence[ResourceData]:
    """
    Retrieve paginated resource data with optional filters.
    """

    return await get_resource_data(
        db=db,
        municipality_id=municipality_id,
        category=category,
        indicator_name=indicator_name,
        year=year,
        skip=skip,
        limit=limit,
    )


# ==========================================================
# Update Resource Data
# ==========================================================

async def update_existing_resource_data(
    db: AsyncSession,
    *,
    data_id: str,
    resource_data_in: ResourceDataUpdate,
) -> ResourceData:
    """
    Update an existing resource data record.
    """

    db_resource = await _get_existing_resource_data(
        db=db,
        data_id=data_id,
    )

    update_data: dict[str, Any] = resource_data_in.model_dump(
        exclude_unset=True,
    )

    if any(
        field in update_data
        for field in (
            "category",
            "indicator_name",
            "year",
        )
    ):
        category = update_data.get(
            "category",
            db_resource.category,
        )

        indicator_name = update_data.get(
            "indicator_name",
            db_resource.indicator_name,
        )

        year = update_data.get(
            "year",
            db_resource.year,
        )

        duplicate = await get_resource_data_by_unique_fields(
            db=db,
            municipality_id=db_resource.municipality_id,
            category=category,
            indicator_name=indicator_name,
            year=year,
        )

        if (
            duplicate is not None
            and duplicate.data_id != db_resource.data_id
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "Resource data already exists for this municipality, "
                    "category, indicator and year."
                ),
            )

    return await update_resource_data(
        db=db,
        db_resource_data=db_resource,
        update_data=update_data,
    )


# ==========================================================
# Delete Resource Data
# ==========================================================

async def remove_resource_data(
    db: AsyncSession,
    *,
    data_id: str,
) -> ResourceData:
    """
    Delete an existing resource data record.
    """

    db_resource = await _get_existing_resource_data(
        db=db,
        data_id=data_id,
    )

    await delete_resource_data(
        db=db,
        db_resource_data=db_resource,
    )

    return db_resource