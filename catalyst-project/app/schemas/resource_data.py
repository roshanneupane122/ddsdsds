from datetime import datetime
from typing import Optional
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field


# Base Schema
class ResourceDataBase(BaseModel):
    category: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Category of indicator (e.g., Agriculture, Infrastructure, Demographics, Tourism)",
        examples=["Agriculture"],
    )

    indicator_name: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Name of the specific metric or indicator",
        examples=["Annual Crop Yield (Metric Tons)"],
    )

    value: Optional[Decimal] = Field(
        default=None,
        description="Numerical metric value recorded for the indicator",
        examples=[12500.50],
    )

    year: int = Field(
        ...,
        ge=1900,
        le=2100,
        description="Four-digit calendar year associated with the dataset metric",
        examples=[2025],
    )

    data_source: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Data provenance / source tracking agency",
        examples=["Central Bureau of Statistics (CBS) Nepal"],
    )



# Create Schema
class ResourceDataCreate(ResourceDataBase):
    municipality_id: str = Field(
        ...,
        description="UUID of the municipality this resource data point belongs to",
        examples=["550e8400-e29b-41d4-a716-446655440000"],
    )


# Update Schema
class ResourceDataUpdate(BaseModel):
    category: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=100,
        description="Updated category",
    )

    indicator_name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=200,
        description="Updated indicator name",
    )

    value: Optional[Decimal] = Field(
        default=None,
        description="Updated numerical value",
    )

    year: Optional[int] = Field(
        default=None,
        ge=1900,
        le=2100,
        description="Updated year",
    )

    data_source: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Updated data source details",
    )


# Response Schema
class ResourceDataRead(ResourceDataBase):
    data_id: str = Field(..., description="Unique UUID for the resource data entry")
    municipality_id: str = Field(..., description="Associated municipality UUID")

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Batch Create Schema (CSV Imports)
class ResourceDataBatchCreate(BaseModel):
    items: list[ResourceDataCreate] = Field(
        ...,
        description="Batch array of resource data points for bulk ingestion",
    )