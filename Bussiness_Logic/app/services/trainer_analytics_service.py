"""
Accessibility Trainer Analytics Service (Milestone 4, Day 3)

Computes the 4 analytics groups called out by the original project
document (Section 11) and the M4 SRS gap list: learner engagement,
skill development, assessment analytics, and certification status —
scoped to the learners assigned to a given Accessibility Trainer.

Nothing here invents new metrics from scratch — every number is derived
by reusing the existing M1-M3 services:
  - engagement           -> practice_store (sessions in the trailing 7 days)
  - skill development    -> analytics_service.compute_weekly_analytics() (improvement_rate)
  - assessment analytics -> assessment_store (average weighted score across sessions)
  - certification status -> certification_service.certification_store (Day 2)

Trainer-learner assignment is a simple in-memory placeholder standing in
for Intern 5's mapping table (not yet built as of M4 Day 3 — see SRS
Cross-Domain Dependency Matrix, due by Day 3).
"""

from uuid import UUID
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional

from app.models.trainer_assignment import TrainerAssignment
from app.schemas.trainer_analytics import (
    TrainerAssignmentOut,
    LearnerAnalyticsOut,
    TrainerDashboardOut,
)
from app.services.practice_service import practice_store
from app.services.assessment_service import assessment_store
from app.services.analytics_service import compute_weekly_analytics
from app.services.certification_service import certification_store

# ── Engagement thresholds ────────────────────────────────────────────
# Adjust these constants to tune sensitivity without touching logic.
HIGH_ENGAGEMENT_SESSIONS_PER_WEEK = 4
LOW_ENGAGEMENT_SESSIONS_PER_WEEK = 2   # below this => "Low"


class InMemoryTrainerAssignmentStore:
    """
    Standing in for the real trainer-learner mapping table (Intern 5,
    M4 Day 2). Swap for real DB calls once that table exists.
    """

    def __init__(self):
        self._assignments: List[TrainerAssignment] = []

    def assign(self, trainer_id: UUID, learner_id: UUID) -> TrainerAssignment:
        existing = self.get(trainer_id, learner_id)
        if existing is not None:
            return existing
        assignment = TrainerAssignment(
            trainer_id=trainer_id,
            learner_id=learner_id,
            assigned_at=datetime.now(timezone.utc),
        )
        self._assignments.append(assignment)
        return assignment

    def unassign(self, trainer_id: UUID, learner_id: UUID) -> bool:
        before = len(self._assignments)
        self._assignments = [
            a for a in self._assignments
            if not (a.trainer_id == trainer_id and a.learner_id == learner_id)
        ]
        return len(self._assignments) < before

    def get(self, trainer_id: UUID, learner_id: UUID) -> Optional[TrainerAssignment]:
        for a in self._assignments:
            if a.trainer_id == trainer_id and a.learner_id == learner_id:
                return a
        return None

    def get_learners_for_trainer(self, trainer_id: UUID) -> List[UUID]:
        return [a.learner_id for a in self._assignments if a.trainer_id == trainer_id]

    def to_out(self, assignment: TrainerAssignment) -> TrainerAssignmentOut:
        return TrainerAssignmentOut(
            trainer_id=assignment.trainer_id,
            learner_id=assignment.learner_id,
            assigned_at=assignment.assigned_at,
        )


trainer_assignment_store = InMemoryTrainerAssignmentStore()


# ── Per-learner metric calculations ─────────────────────────────────

def _sessions_this_week(user_id: UUID) -> int:
    sessions = practice_store.get_sessions_by_user(user_id)
    cutoff = datetime.now(timezone.utc) - timedelta(days=7)
    return sum(1 for s in sessions if s.started_at >= cutoff)


def _engagement_level(sessions_this_week: int) -> str:
    if sessions_this_week >= HIGH_ENGAGEMENT_SESSIONS_PER_WEEK:
        return "High"
    if sessions_this_week >= LOW_ENGAGEMENT_SESSIONS_PER_WEEK:
        return "Medium"
    return "Low"


def _avg_assessment_score(user_id: UUID) -> float:
    sessions = practice_store.get_sessions_by_user(user_id)
    scores = []
    for session in sessions:
        assessment = assessment_store.get(session.session_id)
        if assessment is None or assessment.total_predictions == 0:
            continue
        scores.append(assessment.score_sum / assessment.total_predictions)
    return round(sum(scores) / len(scores), 2) if scores else 0.0


def _skill_development_trend(user_id: UUID) -> Optional[float]:
    weekly = compute_weekly_analytics(user_id)
    return weekly.improvement_rate


def _certification_status(user_id: UUID) -> Dict[str, Optional[str]]:
    exams = certification_store.get_exams_by_user(user_id)
    completed = [e for e in exams if e.status == "completed"]
    passed = [e for e in completed if e.passed]

    if passed:
        # Highest level passed, ranked by how many signs that level covers
        # (Professional=26 > Advanced=20 > Intermediate=14 > Beginner=8)
        highest = max(passed, key=lambda e: len(e.required_signs))
        return {"status": "Certified", "highest_certified_level": highest.level}
    if completed:
        return {"status": "In Progress", "highest_certified_level": None}
    return {"status": "Not Started", "highest_certified_level": None}


def compute_learner_analytics(learner_id: UUID) -> LearnerAnalyticsOut:
    sessions_this_week = _sessions_this_week(learner_id)
    cert = _certification_status(learner_id)
    return LearnerAnalyticsOut(
        learner_id=learner_id,
        sessions_this_week=sessions_this_week,
        engagement_level=_engagement_level(sessions_this_week),
        avg_assessment_score=_avg_assessment_score(learner_id),
        skill_development_trend=_skill_development_trend(learner_id),
        certification_status=cert["status"],
        highest_certified_level=cert["highest_certified_level"],
    )


def compute_trainer_dashboard(trainer_id: UUID) -> TrainerDashboardOut:
    learner_ids = trainer_assignment_store.get_learners_for_trainer(trainer_id)
    learners = [compute_learner_analytics(lid) for lid in learner_ids]

    count = len(learners)
    avg_sessions = round(sum(l.sessions_this_week for l in learners) / count, 1) if count else 0.0
    avg_score = round(sum(l.avg_assessment_score for l in learners) / count, 2) if count else 0.0
    certified_count = sum(1 for l in learners if l.certification_status == "Certified")
    low_engagement_count = sum(1 for l in learners if l.engagement_level == "Low")

    return TrainerDashboardOut(
        trainer_id=trainer_id,
        assigned_learners_count=count,
        avg_sessions_per_week=avg_sessions,
        avg_assessment_score=avg_score,
        certified_count=certified_count,
        low_engagement_count=low_engagement_count,
        learners=learners,
    )