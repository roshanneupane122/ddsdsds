import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import CheckConstraint, ForeignKey, Numeric, String, Text, TIMESTAMP, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.opportunity import BusinessOpportunity
    from app.models.municipality import Municipality
    from app.models.saved_recommendation import SavedRecommendation


class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"
    
    __table_args__ = (
        CheckConstraint("suitability_score BETWEEN 0 AND 100", name="chk_suitability_score_range"),
        # Prevents generating duplicate recommendations for the same pair under a specific model version
        UniqueConstraint(
            "municipality_id", "opportunity_id", "model_version",
            name="uq_muni_opp_model_version"
        ),
    )

    recommendation_id: Mapped[str] = mapped_column(
        String(36), 
        primary_key=True, 
        default=lambda: str(uuid.uuid4())
    )
    
    municipality_id: Mapped[str] = mapped_column(
        String(36), 
        ForeignKey("municipalities.municipality_id", ondelete="CASCADE"), 
        nullable=False, 
        index=True
    )
    
    opportunity_id: Mapped[str] = mapped_column(
        String(36), 
        ForeignKey("business_opportunities.opportunity_id", ondelete="CASCADE"), 
        nullable=False, 
        index=True
    )
    
    # Numeric precision (e.g., 85.50%)
    suitability_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    
    # Use Text for long/unbounded LLM/AI generated explanations
    explanation: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # Tracking model lineage (e.g., "v1.2.0", "xgboost_ranker_v2")
    model_version: Mapped[Optional[str]] = mapped_column(String(50), nullable=True, default="v1.0")

    # Audit timestamps
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

    # Relationships
    municipality: Mapped["Municipality"] = relationship("Municipality", back_populates="recommendations")
    opportunity: Mapped["BusinessOpportunity"] = relationship("BusinessOpportunity", back_populates="recommendations")
    
    saved_by: Mapped[List["SavedRecommendation"]] = relationship(
        "SavedRecommendation", 
        back_populates="recommendation", 
        cascade="all, delete-orphan"
    )