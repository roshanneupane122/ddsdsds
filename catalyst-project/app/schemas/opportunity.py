from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, model_validator


# Base Schema
class BusinessOpportunityBase(BaseModel):
    title: str = Field(
        ...,
        min_length=2,
        max_length=255,
        description="Title of the business or investment opportunity",
        examples=["Cold Storage Facility"],
    )

    sector: Optional[str] = Field(
        default=None,
        max_length=150,
        description="Industry or economic sector",
        examples=["Agriculture & Processing"],
    )

    description: Optional[str] = Field(
        default=None,
        description="Detailed summary of the business opportunity",
        examples=["Large-scale regional cold storage unit for perishable agricultural yield."],
    )

    required_infrastructure: Optional[str] = Field(
        default=None,
        description="Infrastructure dependencies (e.g., 3-phase power grid, highway access)",
        examples=["Reliable electricity grid, proximity to highway, water access"],
    )

    min_investment: Optional[float] = Field(
        default=None,
        ge=0,
        description="Minimum capital required in local currency (NPR)",
        examples=[5000000.00],
    )

    max_investment: Optional[float] = Field(
        default=None,
        ge=0,
        description="Maximum capital required in local currency (NPR)",
        examples=[20000000.00],
    )

    estimated_investment_scale: Optional[str] = Field(
        default=None,
        max_length=100,
        description="Qualitative scale of investment (e.g., Small, Medium, Large, Enterprise)",
        examples=["Medium-Scale"],
    )

    @model_validator(mode="after")
    def validate_investment_range(self) -> "BusinessOpportunityBase":
        if (
            self.min_investment is not None
            and self.max_investment is not None
            and self.min_investment > self.max_investment
        ):
            raise ValueError("min_investment cannot be greater than max_investment")
        return self


# Create Schema
class BusinessOpportunityCreate(BusinessOpportunityBase):
    pass


# Update Schema
class BusinessOpportunityUpdate(BaseModel):
    title: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=255,
        description="Updated title",
    )

    sector: Optional[str] = Field(
        default=None,
        max_length=150,
        description="Updated sector",
    )

    description: Optional[str] = Field(
        default=None,
        description="Updated description",
    )

    required_infrastructure: Optional[str] = Field(
        default=None,
        description="Updated infrastructure dependencies",
    )

    min_investment: Optional[float] = Field(
        default=None,
        ge=0,
        description="Updated minimum investment",
    )

    max_investment: Optional[float] = Field(
        default=None,
        ge=0,
        description="Updated maximum investment",
    )

    estimated_investment_scale: Optional[str] = Field(
        default=None,
        max_length=100,
        description="Updated investment scale",
    )

    @model_validator(mode="after")
    def validate_investment_range(self) -> "BusinessOpportunityUpdate":
        if (
            self.min_investment is not None
            and self.max_investment is not None
            and self.min_investment > self.max_investment
        ):
            raise ValueError("min_investment cannot be greater than max_investment")
        return self


# Response Schema
#
class BusinessOpportunityRead(BusinessOpportunityBase):
    opportunity_id: str = Field(
        ...,
        description="Unique UUID for the business opportunity catalog entry",
    )

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)