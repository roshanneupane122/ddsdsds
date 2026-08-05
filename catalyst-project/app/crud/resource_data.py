from typing import Optional, Sequence

from sqlalchemy import select, tuple_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.resource_data import ResourceData
from app.schemas.resource_data import ResourceDataCreate


# ==========================================================
# Read Operations
# ==========================================================

async def get_resource_data_by_id(
    db: AsyncSession,
    data_id: str,
) -> Optional[ResourceData]:
    """
    Retrieve a resource data record by UUID.
    """
    result = await db.execute(
        select(ResourceData).where(
            ResourceData.data_id == data_id
        )
    )
    return result.scalar_one_or_none()


async def get_resource_data_by_unique_fields(
    db: AsyncSession,
    *,
    municipality_id: str,
    category: str,
    indicator_name: str,
    year: int,
) -> Optional[ResourceData]:
    """
    Retrieve a resource data record using its composite unique key.
    """
    result = await db.execute(
        select(ResourceData).where(
            ResourceData.municipality_id == municipality_id,
            ResourceData.category == category,
            ResourceData.indicator_name == indicator_name,
            ResourceData.year == year,
        )
    )

    return result.scalar_one_or_none()


async def get_resource_data(
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
    Retrieve resource data with optional filters.
    """

    query = select(ResourceData)

    if municipality_id is not None:
        query = query.where(
            ResourceData.municipality_id == municipality_id
        )

    if category is not None:
        query = query.where(
            ResourceData.category == category
        )

    if indicator_name is not None:
        query = query.where(
            ResourceData.indicator_name == indicator_name
        )

    if year is not None:
        query = query.where(
            ResourceData.year == year
        )

    query = (
        query
        .order_by(
            ResourceData.year.desc(),
            ResourceData.category.asc(),
            ResourceData.indicator_name.asc(),
        )
        .offset(skip)
        .limit(limit)
    )

    result = await db.execute(query)

    return result.scalars().all()


# ==========================================================
# Bulk Helper (ETL Protection)
# ==========================================================

async def get_existing_composite_keys(
    db: AsyncSession,
    *,
    keys: set[tuple[str, str, str, int]],
) -> set[tuple[str, str, str, int]]:
    """
    Fetch existing composite keys in a single database query.
    Used during bulk import to avoid duplicate inserts.
    """

    if not keys:
        return set()

    stmt = (
        select(
            ResourceData.municipality_id,
            ResourceData.category,
            ResourceData.indicator_name,
            ResourceData.year,
        )
        .where(
            tuple_(
                ResourceData.municipality_id,
                ResourceData.category,
                ResourceData.indicator_name,
                ResourceData.year,
            ).in_(tuple(keys))
        )
    )

    result = await db.execute(stmt)

    return set(result.tuples().all())


# ==========================================================
# Create Operations
# ==========================================================

async def create_resource_data(
    db: AsyncSession,
    *,
    resource_data_in: ResourceDataCreate,
) -> ResourceData:
    """
    Create a single resource data record.
    """

    db_resource = ResourceData(
        **resource_data_in.model_dump()
    )

    db.add(db_resource)

    await db.flush()
    await db.refresh(db_resource)

    return db_resource


async def bulk_create_resource_data(
    db: AsyncSession,
    *,
    resource_data_list: list[ResourceDataCreate],
) -> Sequence[ResourceData]:
    """
    Bulk insert resource data records.

    Transaction-safe:
    Either every record is inserted or none are inserted.
    """

    db_objects = [
        ResourceData(**item.model_dump())
        for item in resource_data_list
    ]

    async with db.begin():

        db.add_all(db_objects)

        await db.flush()

    for obj in db_objects:
        await db.refresh(obj)

    return db_objects


# ==========================================================
# Update Operation
# ==========================================================

async def update_resource_data(
    db: AsyncSession,
    *,
    db_resource_data: ResourceData,
    update_data: dict,
) -> ResourceData:
    """
    Update an existing resource data record.
    """

    for field, value in update_data.items():
        setattr(db_resource_data, field, value)

    await db.flush()
    await db.refresh(db_resource_data)

    return db_resource_data


# ==========================================================
# Delete Operation
# ==========================================================

async def delete_resource_data(
    db: AsyncSession,
    *,
    db_resource_data: ResourceData,
) -> ResourceData:
    """
    Delete a resource data record.
    """

    await db.delete(db_resource_data)

    await db.flush()

    return db_resource_data