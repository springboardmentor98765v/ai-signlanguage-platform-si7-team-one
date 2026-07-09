from fastapi import APIRouter, HTTPException
from app.schemas.practice import (
    PracticeSessionStartRequest,
    PracticeSessionEndRequest,
    PracticeSessionOut,
)
from app.services.practice_service import practice_store

router = APIRouter(prefix="/practice", tags=["practice"])


@router.post("/start", response_model=PracticeSessionOut, status_code=201)
def start_practice_session(payload: PracticeSessionStartRequest):
    session = practice_store.start_session(payload.user_id, payload.lesson_id)
    return practice_store.to_out(session)


@router.post("/end", response_model=PracticeSessionOut)
def end_practice_session(payload: PracticeSessionEndRequest):
    try:
        session = practice_store.end_session(payload.session_id, payload.status)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return practice_store.to_out(session)


@router.get("/{session_id}", response_model=PracticeSessionOut)
def get_practice_session(session_id: str):
    from uuid import UUID
    session = practice_store.get_session(UUID(session_id))
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return practice_store.to_out(session)