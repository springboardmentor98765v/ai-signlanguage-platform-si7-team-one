from pydantic import BaseModel
from uuid import UUID
from typing import List


class AnalyticsOut(BaseModel):
    user_id: UUID
    total_sessions: int
    lessons_completed: int
    average_accuracy: float
    weak_signs: List[str]   # signs with accuracy below threshold, worth extra practice