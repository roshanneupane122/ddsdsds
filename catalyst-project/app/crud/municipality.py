from typing import Any, Optional, Sequence
import json

from geoalchemy2.functions import ST_AsGeoJSON, ST_Contains, ST_Point, ST_SetSRID
from geoalchemy2.shape import from_shape
from shapely.geometry import MultiPolygon as ShapelyMultiPolygon, shape

from sqlalchemy import select, or_
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
    search: Optional[str] = None,
    q: Optional[str] = None,
    district: Optional[str] = None,
    province: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
) -> Sequence[Municipality]:

    query = select(Municipality)

    term = (search or q or "").strip()
    if term:
        search_pattern = f"%{term}%"
        query = query.where(
            or_(
                Municipality.name.ilike(search_pattern),
                Municipality.district.ilike(search_pattern),
                Municipality.province.ilike(search_pattern),
            )
        )

    if district:
        query = query.where(Municipality.district.ilike(f"%{district.strip()}%"))

    if province:
        query = query.where(Municipality.province.ilike(f"%{province.strip()}%"))

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

    geometry_shape = shape(municipality_in.geom.model_dump())
    if geometry_shape.geom_type == "Polygon":
        geometry_shape = ShapelyMultiPolygon([geometry_shape])

    geometry = from_shape(geometry_shape, srid=4326)

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
        geometry_shape = shape(
            geometry.model_dump() if hasattr(geometry, "model_dump") else geometry
        )
        if geometry_shape.geom_type == "Polygon":
            geometry_shape = ShapelyMultiPolygon([geometry_shape])
        db_municipality.geom = from_shape(
            geometry_shape,
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
