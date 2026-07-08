"""
Practice Service — Router

Day 2 deliverable per SRS: "Practice session start/end endpoints
scaffolded and returning session IDs."

This router is meant to be mounted inside Intern 2's shared FastAPI app
(e.g. app.include_router(practice.router)) — not run as a standalone app.
See main.py in this folder for a local dev-only example of how it's wired.
"""

from fastapi import APIRouter, HTTPException

from app.schemas.practice import (
    PracticeSessionStartRequest,
    PracticeSessionEndRequest,
    PracticeSessionOut,
)
from app.services.practice_service import (
    practice_session_store,
    PracticeSessionNotFoundError,
    InvalidSessionStateError,
)

router = APIRouter(prefix="/practice", tags=["Practice Service"])


@router.post("/start", response_model=PracticeSessionOut, status_code=201)
def start_practice_session(payload: PracticeSessionStartRequest):
    """Start a new practice session and return its session_id."""
    session = practice_session_store.start_session(
        user_id=payload.user_id,
        lesson_id=payload.lesson_id,
        expected_sign=payload.expected_sign,
    )
    return session


@router.post("/end", response_model=PracticeSessionOut)
def end_practice_session(payload: PracticeSessionEndRequest):
    """End an existing practice session, computing duration_seconds."""
    try:
        session = practice_session_store.end_session(
            session_id=payload.session_id,
            status=payload.status,
        )
    except PracticeSessionNotFoundError:
        raise HTTPException(status_code=404, detail=f"Session '{payload.session_id}' not found")
    except InvalidSessionStateError as e:
        raise HTTPException(status_code=409, detail=str(e))

    return session


@router.get("/{session_id}", response_model=PracticeSessionOut)
def get_practice_session(session_id: str):
    """Fetch a session by ID — useful for debugging/Postman testing today,
    and will back the Practice screen's session state later."""
    session = practice_session_store.get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")
    return session
