from typing import Sequence

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud.municipality import (
    create_municipality,
    delete_municipality,
    get_municipality_by_id,
    get_municipality_by_name,
    get_municipalities,
    update_municipality,
)

from app.models.municipality import Municipality

from app.schemas.municipality import (
    MunicipalityCreate,
    MunicipalityUpdate,
)


# ==========================================================
# Helper
# ==========================================================

async def _get_municipality_or_404(
    db: AsyncSession,
    municipality_id: str,
) -> Municipality:

    db_obj = await get_municipality_by_id(
        db=db,
        municipality_id=municipality_id,
    )

    if db_obj is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Municipality not found.",
        )

    return db_obj


# ==========================================================
# Create
# ==========================================================

async def create_new_municipality(
    db: AsyncSession,
    *,
    municipality_in: MunicipalityCreate,
) -> Municipality:

    existing = await get_municipality_by_name(
        db=db,
        name=municipality_in.name,
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Municipality already exists.",
        )

    return await create_municipality(
        db=db,
        municipality_in=municipality_in,
    )


# ==========================================================
# Read
# ==========================================================

async def get_municipality(
    db: AsyncSession,
    *,
    municipality_id: str,
) -> Municipality:

    return await _get_municipality_or_404(
        db=db,
        municipality_id=municipality_id,
    )


async def list_municipalities(
    db: AsyncSession,
    *,
    skip: int = 0,
    limit: int = 20,
) -> Sequence[Municipality]:

    return await get_municipalities(
        db=db,
        skip=skip,
        limit=limit,
    )


# ==========================================================
# Update
# ==========================================================

async def update_existing_municipality(
    db: AsyncSession,
    *,
    municipality_id: str,
    municipality_in: MunicipalityUpdate,
) -> Municipality:

    db_obj = await _get_municipality_or_404(
        db=db,
        municipality_id=municipality_id,
    )

    if (
        municipality_in.name
        and municipality_in.name != db_obj.name
    ):
        existing = await get_municipality_by_name(
            db=db,
            name=municipality_in.name,
        )

        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Municipality already exists.",
            )

    update_data = municipality_in.model_dump(
        exclude_unset=True,
    )

    return await update_municipality(
        db=db,
        db_municipality=db_obj,
        update_data=update_data,
    )


# ==========================================================
# Delete
# ==========================================================

async def remove_municipality(
    db: AsyncSession,
    *,
    municipality_id: str,
) -> Municipality:

    db_obj = await _get_municipality_or_404(
        db=db,
        municipality_id=municipality_id,
    )

    await delete_municipality(
        db=db,
        db_municipality=db_obj,
    )

    return db_obj