# app/schemas/trainer.py
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class AssignLearnerRequest(BaseModel):
    trainer_id: UUID
    learner_id: UUID


class LearnerSummary(BaseModel):
    user_id: UUID
    full_name: str
    email: str

    model_config = ConfigDict(from_attributes=True)


class MessageResponse(BaseModel):
    message: str


# --- Matches Intern 4's actual response shape exactly ---

class LearnerDetail(BaseModel):
    learner_id: UUID
    engagement_level: str                    # "High" / "Medium" / "Low"
    sessions_this_week: int
    skill_development_trend: float | None     # % improvement, null if not enough data
    avg_assessment_score: float                # 0-100
    certification_status: str                  # "Certified" / "In Progress" / "Not Started"
    highest_certified_level: str | None        # "beginner"/"intermediate"/"advanced"/"professional" or null


class DashboardSummary(BaseModel):
    avg_sessions_per_week: float
    avg_assessment_score: float
    certified_count: int
    low_engagement_count: int


class TrainerDashboardResponse(BaseModel):
    trainer_id: UUID
    summary: DashboardSummary
    learners: list[LearnerDetail]