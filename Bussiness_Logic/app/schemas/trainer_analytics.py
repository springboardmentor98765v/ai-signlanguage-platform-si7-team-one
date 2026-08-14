"""
Accessibility Trainer Dashboard — Pydantic Schemas (Milestone 4, Day 3)

Powers the Accessibility Trainer Dashboard described in the original
project document (Section 11, 'Dashboard & Analytics') and required by
the M4 SRS (Section 4/5, Intern 4 + Intern 1 + Intern 2). Aggregates
engagement, skill development, assessment analytics, and certification
status for the learners assigned to a given trainer.
"""

from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import List, Optional


class AssignLearnerRequest(BaseModel):
    trainer_id: UUID
    learner_id: UUID


class TrainerAssignmentOut(BaseModel):
    trainer_id: UUID
    learner_id: UUID
    assigned_at: datetime


class LearnerAnalyticsOut(BaseModel):
    learner_id: UUID
    sessions_this_week: int
    engagement_level: str            # "High" | "Medium" | "Low"
    avg_assessment_score: float      # 0-100, averaged weighted score across sessions
    skill_development_trend: Optional[float] = None  # % change vs previous week, None if not enough data
    certification_status: str        # "Certified" | "In Progress" | "Not Started"
    highest_certified_level: Optional[str] = None


class TrainerDashboardOut(BaseModel):
    trainer_id: UUID
    assigned_learners_count: int
    avg_sessions_per_week: float
    avg_assessment_score: float
    certified_count: int
    low_engagement_count: int
    learners: List[LearnerAnalyticsOut]