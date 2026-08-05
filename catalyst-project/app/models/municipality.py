import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List

from geoalchemy2 import Geometry, WKBElement
from sqlalchemy import Integer, String, TIMESTAMP, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.recommendation import AIRecommendation
    from app.models.resource_data import ResourceData


class Municipality(Base):
    __tablename__ = "municipalities"

    municipality_id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(
        String(245),
        index=True,
        nullable=False
    )
    district: Mapped[str] = mapped_column(
        String(200),
        index=True,
        nullable=False
    )
    province: Mapped[str] = mapped_column(
        String(250),
        index=True,
        nullable=False
    )
    total_population: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0
    )
    
    # Corrected datetime type annotations
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    # Added spatial indexing for PostGIS optimization
    geom: Mapped[WKBElement] = mapped_column(
        Geometry(geometry_type="MULTIPOLYGON", srid=4326, spatial_index=True),
        nullable=False
    )

    # Relationships
    resource_data: Mapped[List["ResourceData"]] = relationship(
        "ResourceData",
        back_populates="municipality",
        cascade="all, delete-orphan"
    )
    recommendations: Mapped[List["AIRecommendation"]] = relationship(
        "AIRecommendation",
        back_populates="municipality",
        cascade="all, delete-orphan"
    )