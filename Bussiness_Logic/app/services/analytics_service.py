from uuid import UUID
from typing import List

from app.schemas.analytics import AnalyticsOut
from app.services.practice_service import practice_store
from app.services.assessment_service import assessment_store
from app.schemas.practice import SessionStatus

WEAK_SIGN_ACCURACY_THRESHOLD = 60.0  # below this %, a sign counts as "weak"
WEAK_SIGN_MIN_ATTEMPTS = 2           # ignore signs tried fewer times than this (not enough data)


def compute_analytics(user_id: UUID) -> AnalyticsOut:
    sessions = practice_store.get_sessions_by_user(user_id)

    total_sessions = len(sessions)
    lessons_completed = len({
        s.lesson_id for s in sessions if s.status == SessionStatus.completed
    })

    accuracies: List[float] = []
    combined_sign_stats = {}  # sign -> {"correct": int, "total": int}

    for session in sessions:
        assessment = assessment_store.get(session.session_id)
        if assessment is None or assessment.total_predictions == 0:
            continue
        accuracies.append(assessment.correct_predictions / assessment.total_predictions * 100)

        for sign, stats in assessment.sign_stats.items():
            combined = combined_sign_stats.setdefault(sign, {"correct": 0, "total": 0})
            combined["correct"] += stats["correct"]
            combined["total"] += stats["total"]

    average_accuracy = round(sum(accuracies) / len(accuracies), 2) if accuracies else 0.0

    weak_signs = [
        sign for sign, stats in combined_sign_stats.items()
        if stats["total"] >= WEAK_SIGN_MIN_ATTEMPTS
        and (stats["correct"] / stats["total"] * 100) < WEAK_SIGN_ACCURACY_THRESHOLD
    ]

    return AnalyticsOut(
        user_id=user_id,
        total_sessions=total_sessions,
        lessons_completed=lessons_completed,
        average_accuracy=average_accuracy,
        weak_signs=weak_signs,
    )