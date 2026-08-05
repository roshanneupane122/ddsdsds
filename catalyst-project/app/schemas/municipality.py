from datetime import datetime
from typing import Optional, Union

from geojson_pydantic import MultiPolygon, Polygon
from pydantic import BaseModel, ConfigDict, Field


# ==========================================================
# Base Schema
# ==========================================================
class MunicipalityBase(BaseModel):
    name: str = Field(
        ...,
        min_length=1,
        max_length=245,
        description="Municipality name",
        examples=["Tilottama"]
    )

    district: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="District where the municipality is located",
        examples=["Rupandehi"]
    )

    province: str = Field(
        ...,
        min_length=1,
        max_length=250,
        description="Province of the municipality",
        examples=["Lumbini"]
    )

    total_population: int = Field(
        default=0,
        ge=0,
        description="Total population of the municipality",
        examples=[205000]
    )


# Create Schema
class MunicipalityCreate(MunicipalityBase):
    # Accepts both standard Polygon and MultiPolygon geometries from client
    geom: Union[MultiPolygon, Polygon] = Field(
        ...,
        description="Municipality boundary in GeoJSON Polygon or MultiPolygon format"
    )


# Update Schema
class MunicipalityUpdate(BaseModel):
    name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=245,
        description="Municipality name"
    )

    district: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=200,
        description="District"
    )

    province: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=250,
        description="Province"
    )

    total_population: Optional[int] = Field(
        default=None,
        ge=0,
        description="Total population"
    )

    geom: Optional[Union[MultiPolygon, Polygon]] = Field(
        default=None,
        description="Municipality boundary in GeoJSON Polygon or MultiPolygon format"
    )


# Response Schema
class MunicipalityRead(MunicipalityBase):
    municipality_id: str = Field(..., description="Unique UUID for the municipality")

    # Output serialized GeoJSON boundary for frontend GIS rendering (Mapbox/Leaflet)
    geom: Union[MultiPolygon, Polygon] = Field(..., description="GeoJSON Spatial geometry")

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )