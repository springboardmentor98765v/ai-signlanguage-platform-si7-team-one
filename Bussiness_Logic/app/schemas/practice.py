"""
Practice Service — Pydantic Schemas

These mirror the PracticeSession field design from Day 1
(AI Sign Lang - Business Logic (Intern 4) Notion doc).

NOTE: user_id / lesson_id are plain strings for now since Intern 2's
User Service and Course Service aren't live yet. Once real auth (Day 6)
and seeded lessons (Day 5) exist, these should become validated FKs
(e.g. checked against the User/Lesson tables) rather than free-form strings.
"""

from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class SessionStatus(str, Enum):
    in_progress = "in_progress"
    completed = "completed"
    abandoned = "abandoned"


class PracticeSessionStartRequest(BaseModel):
    user_id: str = Field(..., description="ID of the learner starting the session")
    lesson_id: str = Field(..., description="ID of the lesson being practiced")
    expected_sign: str = Field(..., description="The letter/sign the learner is attempting")


class PracticeSessionEndRequest(BaseModel):
    session_id: str = Field(..., description="ID of the session to end")
    status: SessionStatus = Field(
        default=SessionStatus.completed,
        description="Final status — 'completed' by default, or 'abandoned' if the learner quit early",
    )


class PracticeSessionOut(BaseModel):
    session_id: str
    user_id: str
    lesson_id: str
    expected_sign: str
    status: SessionStatus
    start_time: datetime
    end_time: Optional[datetime] = None
    attempt_count: int
    duration_seconds: Optional[int] = None
