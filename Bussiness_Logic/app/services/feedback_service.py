from uuid import UUID
from datetime import datetime, timezone
from typing import Dict, Optional, List

from app.models.feedback import SessionFeedback
from app.schemas.feedback import FeedbackItem, FeedbackType, Severity, FeedbackOut
from app.schemas.assessment import AssessmentOut


def generate_feedback_items(assessment: AssessmentOut) -> List[FeedbackItem]:
    """
    Rule-based feedback, mapped to the DB's 3-value feedback_type enum
    (improvement / correction / praise). Thresholds reuse the Day 1 design,
    now applied to the session-level aggregated score/accuracy instead of
    a single attempt.
    """
    items: List[FeedbackItem] = []
    score = assessment.score
    accuracy = assessment.accuracy_percentage

    if score >= 85:
        items.append(FeedbackItem(
            feedback_type=FeedbackType.praise,
            message="Great job! Your signs are consistently accurate.",
            severity=Severity.low,
        ))
    elif score >= 60:
        items.append(FeedbackItem(
            feedback_type=FeedbackType.improvement,
            message="Close — check your hand and finger positioning for a cleaner sign.",
            severity=Severity.medium,
        ))
    else:
        items.append(FeedbackItem(
            feedback_type=FeedbackType.correction,
            message="Several signs didn't match the expected one. Review the reference sign and try again slower.",
            severity=Severity.high,
        ))

    # Extra targeted message if accuracy is very low, even if average score isn't terrible
    if accuracy < 50 and assessment.total_predictions > 0:
        items.append(FeedbackItem(
            feedback_type=FeedbackType.correction,
            message="You're missing more than half your attempts — try slowing down and re-checking hand placement before each sign.",
            severity=Severity.high,
        ))

    return items


class InMemoryFeedbackStore:
    def __init__(self):
        self._feedback: Dict[UUID, SessionFeedback] = {}

    def generate(self, session_id: UUID, assessment: AssessmentOut) -> SessionFeedback:
        items = generate_feedback_items(assessment)
        feedback = SessionFeedback(
            session_id=session_id,
            items=items,
            generated_at=datetime.now(timezone.utc),
        )
        self._feedback[session_id] = feedback
        return feedback

    def get(self, session_id: UUID) -> Optional[SessionFeedback]:
        return self._feedback.get(session_id)

    def to_out(self, feedback: SessionFeedback) -> FeedbackOut:
        return FeedbackOut(
            session_id=feedback.session_id,
            feedback=feedback.items,
            generated_at=feedback.generated_at,
        )


feedback_store = InMemoryFeedbackStore()