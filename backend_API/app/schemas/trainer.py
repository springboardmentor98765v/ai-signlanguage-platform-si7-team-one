# app/schemas/trainer.py

from datetime import date
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


class EngagementResponse(BaseModel):
    learner_id: UUID
    sessions_last_7_days: int
    sessions_last_30_days: int
    last_active: date | None

    model_config = ConfigDict(from_attributes=True)


class SkillDevelopmentResponse(BaseModel):
    learner_id: UUID
    accuracy_trend: list[dict]
    improvement_pct: float

    model_config = ConfigDict(from_attributes=True)


class AssessmentAnalyticsResponse(BaseModel):
    learner_id: UUID
    average_score: float
    weak_letters: list[str]
    total_attempts: int

    model_config = ConfigDict(from_attributes=True)


class CertificationStatusResponse(BaseModel):
    learner_id: UUID
    certified: bool
    level: str | None
    date_issued: date | None

    model_config = ConfigDict(from_attributes=True)


class TrainerDashboardResponse(BaseModel):
    trainer_id: UUID
    learners: list[LearnerSummary]
    engagement: list[EngagementResponse]
    skill_development: list[SkillDevelopmentResponse]
    assessment_analytics: list[AssessmentAnalyticsResponse]
    certification_status: list[CertificationStatusResponse]


class MessageResponse(BaseModel):
    message: str