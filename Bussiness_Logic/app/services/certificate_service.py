from uuid import UUID, uuid4
from datetime import datetime, timezone
from typing import List, Tuple, Dict

from app.schemas.certificate import EligibilityOut
from app.services.practice_service import practice_store
from app.services.assessment_service import assessment_store
from app.schemas.practice import SessionStatus

# ── Certificate eligibility rules ────────────────────────────────────
# Adjust these constants to tune difficulty without touching logic.
MIN_COMPLETED_SESSIONS = 5
MIN_AVERAGE_ACCURACY = 80.0
MIN_DISTINCT_SIGNS = 5
MAX_WEAK_SIGNS = 2          # learner can have at most this many weak signs
WEAK_SIGN_THRESHOLD = 60.0
WEAK_SIGN_MIN_ATTEMPTS = 2


def check_eligibility(user_id: UUID) -> EligibilityOut:
    sessions = practice_store.get_sessions_by_user(user_id)

    completed_sessions = [
        s for s in sessions if s.status == SessionStatus.completed
    ]

    # Aggregate cross-session stats
    accuracies: List[float] = []
    combined_sign_stats: Dict[str, Dict[str, int]] = {}

    for session in sessions:
        assessment = assessment_store.get(session.session_id)
        if assessment is None or assessment.total_predictions == 0:
            continue
        accuracies.append(
            assessment.correct_predictions / assessment.total_predictions * 100
        )
        for sign, stats in assessment.sign_stats.items():
            entry = combined_sign_stats.setdefault(sign, {"correct": 0, "total": 0})
            entry["correct"] += stats["correct"]
            entry["total"] += stats["total"]

    average_accuracy = (sum(accuracies) / len(accuracies)) if accuracies else 0.0
    distinct_signs = len(combined_sign_stats)
    weak_signs = [
        sign for sign, stats in combined_sign_stats.items()
        if stats["total"] >= WEAK_SIGN_MIN_ATTEMPTS
        and (stats["correct"] / stats["total"] * 100) < WEAK_SIGN_THRESHOLD
    ]

    # ── Check each rule ───────────────────────────────────────────────
    reasons_failed: List[str] = []
    criteria_met: List[str] = []

    # Rule 1: completed sessions
    if len(completed_sessions) >= MIN_COMPLETED_SESSIONS:
        criteria_met.append(
            f"Completed sessions: {len(completed_sessions)} (required: {MIN_COMPLETED_SESSIONS})"
        )
    else:
        reasons_failed.append(
            f"Not enough completed sessions: {len(completed_sessions)}/{MIN_COMPLETED_SESSIONS}"
        )

    # Rule 2: average accuracy
    if average_accuracy >= MIN_AVERAGE_ACCURACY:
        criteria_met.append(
            f"Average accuracy: {round(average_accuracy, 1)}% (required: {MIN_AVERAGE_ACCURACY}%)"
        )
    else:
        reasons_failed.append(
            f"Average accuracy too low: {round(average_accuracy, 1)}% (required: {MIN_AVERAGE_ACCURACY}%)"
        )

    # Rule 3: distinct signs practiced
    if distinct_signs >= MIN_DISTINCT_SIGNS:
        criteria_met.append(
            f"Distinct signs practiced: {distinct_signs} (required: {MIN_DISTINCT_SIGNS})"
        )
    else:
        reasons_failed.append(
            f"Not enough distinct signs practiced: {distinct_signs}/{MIN_DISTINCT_SIGNS}"
        )

    # Rule 4: weak signs
    if len(weak_signs) <= MAX_WEAK_SIGNS:
        criteria_met.append(
            f"Weak signs: {len(weak_signs)} (allowed: up to {MAX_WEAK_SIGNS})"
        )
    else:
        reasons_failed.append(
            f"Too many weak signs: {len(weak_signs)} (allowed: up to {MAX_WEAK_SIGNS}). "
            f"Practice more: {', '.join(weak_signs)}"
        )

    return EligibilityOut(
        user_id=user_id,
        eligible=len(reasons_failed) == 0,
        reasons_failed=reasons_failed,
        criteria_met=criteria_met,
        checked_at=datetime.now(timezone.utc),
    )