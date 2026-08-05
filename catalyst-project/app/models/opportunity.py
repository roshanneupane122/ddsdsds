import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Numeric, String, Text, TIMESTAMP, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.recommendation import AIRecommendation


class BusinessOpportunity(Base):
    __tablename__ = "business_opportunities"

    opportunity_id: Mapped[str] = mapped_column(
        String(36), 
        primary_key=True, 
        default=lambda: str(uuid.uuid4())
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # Categorical sector (e.g., Agriculture, Tourism, Renewable Energy)
    sector: Mapped[Optional[str]] = mapped_column(
        String(150), 
        nullable=True, 
        index=True
    )
    
    # Longer text fields for rich context
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    required_infrastructure: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Quantitative financial bounds for range filtering in queries
    min_investment: Mapped[Optional[float]] = mapped_column(Numeric(14, 2), nullable=True)
    max_investment: Mapped[Optional[float]] = mapped_column(Numeric(14, 2), nullable=True)
    estimated_investment_scale: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    # Standard audit timestamps
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

    # Relationship to junction/recommendation engine
    recommendations: Mapped[List["AIRecommendation"]] = relationship(
        "AIRecommendation", 
        back_populates="opportunity", 
        cascade="all, delete-orphan"
    )