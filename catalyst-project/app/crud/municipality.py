from typing import Any, Optional, Sequence
import json

from geoalchemy2.functions import ST_AsGeoJSON, ST_Contains, ST_Point, ST_SetSRID
from geoalchemy2.shape import from_shape
from shapely.geometry import shape

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.municipality import Municipality
from app.schemas.municipality import MunicipalityCreate


# ==========================================================
# Read
# ==========================================================

async def get_municipality_by_id(
    db: AsyncSession,
    municipality_id: str,
) -> Optional[Municipality]:
    result = await db.execute(
        select(Municipality).where(
            Municipality.municipality_id == municipality_id
        )
    )
    return result.scalar_one_or_none()


async def get_municipality_by_name(
    db: AsyncSession,
    name: str,
) -> Optional[Municipality]:
    result = await db.execute(
        select(Municipality).where(
            Municipality.name == name
        )
    )
    return result.scalar_one_or_none()


async def get_municipalities(
    db: AsyncSession,
    *,
    district: Optional[str] = None,
    province: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
) -> Sequence[Municipality]:

    query = select(Municipality)

    if district:
        query = query.where(Municipality.district == district)

    if province:
        query = query.where(Municipality.province == province)

    query = (
        query.order_by(Municipality.name.asc())
        .offset(skip)
        .limit(limit)
    )

    result = await db.execute(query)

    return result.scalars().all()


async def get_municipality_by_point(
    db: AsyncSession,
    *,
    longitude: float,
    latitude: float,
    srid: int = 4326,
) -> Optional[Municipality]:

    point = ST_SetSRID(
        ST_Point(longitude, latitude),
        srid,
    )

    result = await db.execute(
        select(Municipality).where(
            ST_Contains(Municipality.geom, point)
        )
    )

    return result.scalar_one_or_none()


async def get_municipality_geojson(
    db: AsyncSession,
    municipality_id: str,
):

    result = await db.execute(
        select(
            ST_AsGeoJSON(Municipality.geom)
        ).where(
            Municipality.municipality_id == municipality_id
        )
    )

    geojson = result.scalar_one_or_none()

    return json.loads(geojson) if geojson else None


# ==========================================================
# Create
# ==========================================================

async def create_municipality(
    db: AsyncSession,
    *,
    municipality_in: MunicipalityCreate,
) -> Municipality:

    geometry = from_shape(
        shape(municipality_in.geom.model_dump()),
        srid=4326,
    )

    db_obj = Municipality(
        name=municipality_in.name,
        district=municipality_in.district,
        province=municipality_in.province,
        total_population=municipality_in.total_population,
        geom=geometry,
    )

    db.add(db_obj)

    await db.flush()
    await db.refresh(db_obj)

    return db_obj


# ==========================================================
# Update
# ==========================================================

async def update_municipality(
    db: AsyncSession,
    *,
    db_municipality: Municipality,
    update_data: dict[str, Any],
) -> Municipality:

    geometry = update_data.pop("geom", None)

    if geometry is not None:
        db_municipality.geom = from_shape(
            shape(geometry),
            srid=4326,
        )

    for field, value in update_data.items():
        setattr(db_municipality, field, value)

    await db.flush()
    await db.refresh(db_municipality)

    return db_municipality


# ==========================================================
# Delete
# ==========================================================

async def delete_municipality(
    db: AsyncSession,
    *,
    db_municipality: Municipality,
):

    await db.delete(db_municipality)
    await db.flush()

    return db_municipality