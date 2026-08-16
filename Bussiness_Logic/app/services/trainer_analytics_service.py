"""
Accessibility Trainer Analytics Service (updated post Day 3)

Learner-trainer assignment is now owned entirely by Intern 2's backend
service (the real instructor_students table). This service no longer
maintains its own in-memory assignment store — instead it calls Aashi's
GET /trainer/{trainer_id}/learners endpoint to fetch the list of assigned
learners, then computes analytics on top using our existing M1-M4 stores.
"""

import httpx
from uuid import UUID
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional

from app.schemas.trainer_analytics import (
    LearnerAnalyticsOut,
    TrainerDashboardOut,
)
from app.services.practice_service import practice_store
from app.services.assessment_service import assessment_store
from app.services.analytics_service import compute_weekly_analytics
from app.services.certification_service import certification_store
from app.core.config import BACKEND_API_URL, AI_SERVICE_TIMEOUT_SECONDS

# ── Engagement thresholds ────────────────────────────────────────────
HIGH_ENGAGEMENT_SESSIONS_PER_WEEK = 4
LOW_ENGAGEMENT_SESSIONS_PER_WEEK = 2


# ── Learner list — fetched from Aashi's service ──────────────────────

def get_learners_for_trainer(trainer_id: UUID) -> List[UUID]:
    """
    Calls Aashi's backend:
      GET {BACKEND_API_URL}/trainer/{trainer_id}/learners
    Falls back to empty list on any network/timeout error so the
    dashboard still responds gracefully if her service is temporarily down.
    """
    url = f"{BACKEND_API_URL}/trainer/{trainer_id}/learners"
    try:
        response = httpx.get(url, timeout=AI_SERVICE_TIMEOUT_SECONDS)
        response.raise_for_status()
        raw = response.json()
        return [UUID(str(item)) for item in raw]
    except Exception:
        return []


# ── Per-learner metric calculations (unchanged from Day 3) ────────────

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
    learner_ids = get_learners_for_trainer(trainer_id)
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