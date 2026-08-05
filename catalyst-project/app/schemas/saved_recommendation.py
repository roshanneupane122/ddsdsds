from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.recommendation import AIRecommendationDetail


# ==========================================================
# Create Schema
# ==========================================================

class SavedRecommendationCreate(BaseModel):
    """
    Create a saved recommendation.

    Note:
    user_id is intentionally omitted because it will be
    extracted from the authenticated JWT user context.
    """

    recommendation_id: str = Field(
        ...,
        min_length=36,
        max_length=36,
        description="UUID of the AI recommendation to bookmark/save",
        examples=[
            "8d7f6b5a-4c3b-2a10-9876-543210fedcba",
        ],
    )


# ==========================================================
# Read Schema
# ==========================================================

class SavedRecommendationRead(BaseModel):
    """
    Standard response schema (IDs and Audit metadata).
    """

    user_id: str = Field(
        ...,
        min_length=36,
        max_length=36,
        description="UUID of the user who saved the recommendation",
    )

    recommendation_id: str = Field(
        ...,
        min_length=36,
        max_length=36,
        description="UUID of the saved AI recommendation",
    )

    saved_at: datetime = Field(
        ...,
        description="Timestamp when the recommendation was bookmarked",
    )

    model_config = ConfigDict(
        from_attributes=True,
    )


# ==========================================================
# Detailed Response Schema
# ==========================================================

class SavedRecommendationDetail(SavedRecommendationRead):
    """
    Detailed response used for dashboard views.
    Includes the nested recommendation object.
    """

    recommendation: Optional[AIRecommendationDetail] = Field(
        default=None,
        description=(            "Complete AI recommendation including "
            "municipality and opportunity details"
        ),
    )