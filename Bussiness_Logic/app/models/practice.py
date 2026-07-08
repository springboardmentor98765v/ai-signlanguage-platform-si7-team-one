"""
Practice Service — Data Model (STUB)

This is a plain Python dataclass standing in for the real PracticeSession
ORM model, since Intern 5's DB/SQLAlchemy models aren't due until Day 4
(per the Cross-Domain Dependency Matrix in the SRS).

Field names match the Day 1 design exactly, so that swapping this out for
`class PracticeSession(Base): ...` later is a drop-in replacement, not a
rewrite of the service/router layer.

TODO (Day 4): Replace with a real SQLAlchemy model once Intern 5's schema
lands, and swap InMemoryPracticeSessionStore (services/practice_service.py)
for actual DB session calls.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional

from app.schemas.practice import SessionStatus


@dataclass
class PracticeSession:
    session_id: str
    user_id: str
    lesson_id: str
    expected_sign: str
    status: SessionStatus
    start_time: datetime
    end_time: Optional[datetime] = None
    attempt_count: int = 0
    duration_seconds: Optional[int] = None
