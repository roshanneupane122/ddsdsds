import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import ForeignKey, Numeric, SmallInteger, String, TIMESTAMP, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from decimal import Decimal
if TYPE_CHECKING:
    from app.models.municipality import Municipality


class ResourceData(Base):
    __tablename__ = "resource_data"
    
    __table_args__ = (
        # Composite unique constraint automatically creates a multi-column B-tree index
        UniqueConstraint(
            "municipality_id", "category", "indicator_name", "year",
            name="uq_resource_data_muni_cat_ind_year"
        ),
    )

    data_id: Mapped[str] = mapped_column(
        String(36), 
        primary_key=True, 
        default=lambda: str(uuid.uuid4())
    )
    
    municipality_id: Mapped[str] = mapped_column(
        String(36), 
        ForeignKey("municipalities.municipality_id", ondelete="CASCADE"), 
        nullable=False
    )
    
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    indicator_name: Mapped[str] = mapped_column(String(200), nullable=False)
    
    # Optional numeric type for accurate financial/statistical metrics
    value: Mapped[Optional[Decimal]] = mapped_column(Numeric(14, 4), nullable=True)
    year: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    data_source: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    # Audit fields
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

    # Relationship
    municipality: Mapped["Municipality"] = relationship(
        "Municipality", 
        back_populates="resource_data"
    )