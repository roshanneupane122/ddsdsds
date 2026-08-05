"""
Pydantic Schemas Package
Exposes all data validation and serialization schemas for API endpoints.
"""

from app.schemas.recommendation import (
    AIRecommendationBase,
    AIRecommendationCreate,
    AIRecommendationDetail,
    AIRecommendationRead,
    AIRecommendationUpdate,
)
from app.schemas.opportunity import (
    BusinessOpportunityBase,
    BusinessOpportunityCreate,
    BusinessOpportunityRead,
    BusinessOpportunityUpdate,
)
from app.schemas.municipality import (
    MunicipalityBase,
    MunicipalityCreate,
    MunicipalityRead,
    MunicipalityUpdate,
)
from app.schemas.resource_data import (
    ResourceDataBase,
    ResourceDataBatchCreate,
    ResourceDataCreate,
    ResourceDataRead,
    ResourceDataUpdate,
)
from app.schemas.saved_recommendation import (
    SavedRecommendationCreate,
    SavedRecommendationDetail,
    SavedRecommendationRead,
)
from app.schemas.user import (
    UserBase,
    UserCreate,
    UserInDB,
    UserLogin,
    UserRead,
    UserUpdate,
)
from app.schemas.token import Token, TokenData

__all__ = [
    # User & Auth
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "UserRead",
    "UserInDB",
    "UserLogin",
    "Token",
    "TokenData",
    # Municipality & GIS
    "MunicipalityBase",
    "MunicipalityCreate",
    "MunicipalityUpdate",
    "MunicipalityRead",
    # Business Opportunity
    "BusinessOpportunityBase",
    "BusinessOpportunityCreate",
    "BusinessOpportunityUpdate",
    "BusinessOpportunityRead",
    # Resource & Indicator Data
    "ResourceDataBase",
    "ResourceDataCreate",
    "ResourceDataUpdate",
    "ResourceDataRead",
    "ResourceDataBatchCreate",
    # AI Recommendation Engine
    "AIRecommendationBase",
    "AIRecommendationCreate",
    "AIRecommendationUpdate",
    "AIRecommendationRead",
    "AIRecommendationDetail",
    # User Bookmarks
    "SavedRecommendationCreate",
    "SavedRecommendationRead",
    "SavedRecommendationDetail",
    # Token
    "Token",
    "TokenData"
]