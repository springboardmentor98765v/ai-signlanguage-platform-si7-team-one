# app/models/accessibility_trainer_learner.py
from datetime import datetime
from uuid import UUID as PyUUID

from sqlalchemy import ForeignKey, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.models.base import Base


class AccessibilityTrainerLearner(Base):
    __tablename__ = "accessibility_trainer_learner"

    trainer_learner_id: Mapped[int] = mapped_column(primary_key=True)
    trainer_id: Mapped[PyUUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False
    )
    learner_id: Mapped[PyUUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False
    )
    assigned_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now(), nullable=False
    )