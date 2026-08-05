import datetime
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String, TIMESTAMP, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.recommendation import AIRecommendation
    from app.models.user import User


class SavedRecommendation(Base):
    __tablename__ = "saved_recommendations"

    # Composite Primary Key (User ID + Recommendation ID)
    user_id: Mapped[str] = mapped_column(
        String(36), 
        ForeignKey("users.user_id", ondelete="CASCADE"), 
        primary_key=True
    )
    recommendation_id: Mapped[str] = mapped_column(
        String(36), 
        ForeignKey("ai_recommendations.recommendation_id", ondelete="CASCADE"), 
        primary_key=True
    )
    
    # Audit Timestamp
    saved_at: Mapped[datetime.datetime] = mapped_column(
        TIMESTAMP(timezone=True), 
        server_default=func.now(),
        nullable=False
    )

    # Relationships
    user: Mapped["User"] = relationship(
        "User", 
        back_populates="saved_recommendations"
    )
    recommendation: Mapped["AIRecommendation"] = relationship(
        "AIRecommendation", 
        back_populates="saved_by"
    )