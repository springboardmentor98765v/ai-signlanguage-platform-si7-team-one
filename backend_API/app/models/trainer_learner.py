# app/models/trainer_learner.py
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base

class TrainerLearner(Base):
    __tablename__ = "instructor_students"

    id: Mapped[int] = mapped_column(primary_key=True)
    trainer_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"))
    learner_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"))