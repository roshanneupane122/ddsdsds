import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Enum as SQLEnum, String, TIMESTAMP, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.saved_recommendation import SavedRecommendation


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    MUNICIPAL_OFFICIAL = "municipal_official"
    CITIZEN = "citizen"


class User(Base):
    __tablename__ = "users"

    user_id: Mapped[str] = mapped_column(
        String(36), 
        primary_key=True, 
        default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(
        String(255), 
        unique=True, 
        index=True, 
        nullable=False
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # Enum-restricted role field
    role: Mapped[UserRole] = mapped_column(
        SQLEnum(UserRole, native_enum=False),
        nullable=False,
        default=UserRole.CITIZEN,
        index=True
    )

    reset_token: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        index=True,
    )
    reset_token_expires_at: Mapped[Optional[datetime]] = mapped_column(
        TIMESTAMP(timezone=True),
        nullable=True,
    )

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

    # Relationships
    saved_recommendations: Mapped[List["SavedRecommendation"]] = relationship(
        "SavedRecommendation", 
        back_populates="user", 
        cascade="all, delete-orphan"
    )