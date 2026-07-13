from dataclasses import dataclass, field
from uuid import UUID
from datetime import datetime
from typing import Optional, Dict


@dataclass
class Assessment:
    session_id: UUID
    correct_predictions: int = 0
    total_predictions: int = 0
    score_sum: float = 0.0          # running total, used to compute average score
    completed_at: Optional[datetime] = None
    sign_stats: Dict[str, Dict[str, int]] = field(default_factory=dict)

    # score / accuracy_percentage / grade are DERIVED, not stored directly —
    # computed in the service layer so there's one source of truth.