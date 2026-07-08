"""
Practice Service — Business Logic

Handles session lifecycle (start / end). Storage is in-memory for Day 2
since Intern 5's DB tables aren't due until Day 4. All DB access is
isolated behind this module so the router never touches storage directly —
when the real DB lands, only this file should need to change.
"""

import uuid
from datetime import datetime
from typing import Dict, Optional

from app.models.practice import PracticeSession
from app.schemas.practice import SessionStatus


class PracticeSessionNotFoundError(Exception):
    pass


class InvalidSessionStateError(Exception):
    pass


class InMemoryPracticeSessionStore:
    """Temporary stand-in for the DB-backed session store."""

    def __init__(self) -> None:
        self._sessions: Dict[str, PracticeSession] = {}

    def start_session(self, user_id: str, lesson_id: str, expected_sign: str) -> PracticeSession:
        session_id = str(uuid.uuid4())
        session = PracticeSession(
            session_id=session_id,
            user_id=user_id,
            lesson_id=lesson_id,
            expected_sign=expected_sign,
            status=SessionStatus.in_progress,
            start_time=datetime.utcnow(),
            attempt_count=0,
        )
        self._sessions[session_id] = session
        return session

    def end_session(self, session_id: str, status: SessionStatus = SessionStatus.completed) -> PracticeSession:
        session = self._sessions.get(session_id)
        if session is None:
            raise PracticeSessionNotFoundError(f"No session found with id={session_id}")

        if session.status != SessionStatus.in_progress:
            raise InvalidSessionStateError(
                f"Session {session_id} is already '{session.status.value}' — cannot end again"
            )

        session.end_time = datetime.utcnow()
        session.status = status
        session.duration_seconds = int((session.end_time - session.start_time).total_seconds())
        return session

    def get_session(self, session_id: str) -> Optional[PracticeSession]:
        return self._sessions.get(session_id)

    def increment_attempt(self, session_id: str) -> PracticeSession:
        """Called by the Assessment Service (Day 4) each time the learner
        attempts a sign within a session."""
        session = self._sessions.get(session_id)
        if session is None:
            raise PracticeSessionNotFoundError(f"No session found with id={session_id}")
        session.attempt_count += 1
        return session


# Single shared instance for Day 2 — module-level "singleton" store.
# Fine for a single-process dev server; will not survive a restart,
# and won't work across multiple workers. Both are non-issues once
# this is backed by a real DB.
practice_session_store = InMemoryPracticeSessionStore()
