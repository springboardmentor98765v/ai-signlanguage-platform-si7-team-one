from fastapi import APIRouter, HTTPException
from app.schemas.practice import (
    PracticeSessionStartRequest,
    PracticeSessionEndRequest,
    PracticeSessionOut,
)
from fastapi import UploadFile, File, Form
from app.schemas.practice import AttemptResultOut
from app.services.ai_client import get_prediction
from app.services.assessment_service import assessment_store
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

@router.post("/{session_id}/attempt", response_model=AttemptResultOut)
async def submit_attempt(session_id: str, expected_sign: str = Form(...), file: UploadFile = File(...)):
    from uuid import UUID
    session_uuid = UUID(session_id)

    session = practice_store.get_session(session_uuid)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    image_bytes = await file.read()
    result = get_prediction(image_bytes)

    if not result.success:
        return AttemptResultOut(success=False, message=result.message)

    assessment = assessment_store.record_attempt(
        session_id=session_uuid,
        predicted_sign=result.predicted_sign,
        expected_sign=expected_sign,
        confidence=result.confidence,
    )
    assessment_out = assessment_store.to_out(assessment)

    return AttemptResultOut(
        success=True,
        predicted_sign=result.predicted_sign,
        confidence=result.confidence,
        assessment=assessment_out.model_dump(mode="json"),
    )