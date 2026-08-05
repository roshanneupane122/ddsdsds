from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

# Nested imports for rich nested API responses
from app.schemas.opportunity import BusinessOpportunityRead
from app.schemas.municipality import MunicipalityRead


# Base Schema
class AIRecommendationBase(BaseModel):
    suitability_score: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Calculated AI suitability score between 0.00 and 100.00",
        examples=[87.50],
    )

    explanation: Optional[str] = Field(
        default=None,
        description="LLM/ML-generated reasoning explaining why this industry suits the municipality",
        examples=[
            "High agricultural yield combined with proximity to major road network makes this ideal for cold storage development."
        ],
    )

    model_version: Optional[str] = Field(
        default="v1.0",
        max_length=50,
        description="Version tag of the prediction model or prompt pipeline used",
        examples=["v1.2-xgboost-llm"],
    )


# Create Schema (AI Pipeline Ingestion)

class AIRecommendationCreate(AIRecommendationBase):
    municipality_id: str = Field(
        ...,
        description="UUID of the municipality being evaluated",
        examples=["550e8400-e29b-41d4-a716-446655440000"],
    )

    opportunity_id: str = Field(
        ...,
        description="UUID of the business opportunity being evaluated",
        examples=["7c9e6679-7425-40de-944b-e07fc1f90ae7"],
    )


# Update Schema
class AIRecommendationUpdate(BaseModel):
    suitability_score: Optional[float] = Field(
        default=None,
        ge=0.0,
        le=100.0,
        description="Updated suitability score",
    )

    explanation: Optional[str] = Field(
        default=None,
        description="Updated reasoning explanation",
    )

    model_version: Optional[str] = Field(
        default=None,
        max_length=50,
        description="Updated model version",
    )


# Standard Response Schema (IDs only)
class AIRecommendationRead(AIRecommendationBase):
    recommendation_id: str = Field(..., description="Unique UUID for the recommendation entry")
    municipality_id: str = Field(..., description="Associated municipality UUID")
    opportunity_id: str = Field(..., description="Associated opportunity UUID")

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Detailed Response Schema (Nested objects for UI Cards/Maps)
class AIRecommendationDetail(AIRecommendationRead):
    municipality: Optional[MunicipalityRead] = Field(
        default=None,
        description="Full municipality details including geographic boundaries",
    )
    opportunity: Optional[BusinessOpportunityRead] = Field(
        default=None,
        description="Full business opportunity details including investment scale",
    )