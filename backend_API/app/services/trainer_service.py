# app/services/trainer_service.py
from uuid import UUID

import httpx
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException

from app.core.config import settings
from app.models.accessibility_trainer_learner import AccessibilityTrainerLearner
from app.models.user import User


# --- Local DB-backed trainer-learner mapping ---

def get_assigned_learners(db: Session, trainer_id: UUID):
    return (
        db.query(User)
        .join(
            AccessibilityTrainerLearner,
            AccessibilityTrainerLearner.learner_id == User.user_id
        )
        .filter(AccessibilityTrainerLearner.trainer_id == trainer_id)
        .all()
    )


def get_learner_detail(db: Session, trainer_id: UUID, learner_id: UUID):
    verify_assignment(db, trainer_id, learner_id)
    learner = db.query(User).filter(User.user_id == learner_id).first()
    if not learner:
        raise HTTPException(404, "Learner not found")
    return learner


def verify_assignment(db: Session, trainer_id: UUID, learner_id: UUID):
    mapping = (
        db.query(AccessibilityTrainerLearner)
        .filter(
            AccessibilityTrainerLearner.trainer_id == trainer_id,
            AccessibilityTrainerLearner.learner_id == learner_id,
        )
        .first()
    )
    if not mapping:
        raise HTTPException(403, "Learner not assigned to this trainer")
    return mapping


def assign_learner(db: Session, trainer_id: UUID, learner_id: UUID):
    if trainer_id == learner_id:
        raise HTTPException(400, "A trainer cannot be assigned as their own learner")

    mapping = AccessibilityTrainerLearner(trainer_id=trainer_id, learner_id=learner_id)
    db.add(mapping)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(400, "Learner already assigned to this trainer")
    db.refresh(mapping)
    return mapping


def unassign_learner(db: Session, trainer_id: UUID, learner_id: UUID):
    mapping = (
        db.query(AccessibilityTrainerLearner)
        .filter(
            AccessibilityTrainerLearner.trainer_id == trainer_id,
            AccessibilityTrainerLearner.learner_id == learner_id,
        )
        .first()
    )
    if not mapping:
        raise HTTPException(404, "Assignment not found")

    db.delete(mapping)
    db.commit()


# --- Bridge to Intern 4's Business Logic service (port 8002) ---

async def _call_logic_service(path: str, token: str) -> dict:
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            resp = await client.get(
                f"{settings.LOGIC_SERVICE_URL}{path}",
                headers={"Authorization": f"Bearer {token}"},
            )
        except httpx.RequestError:
            raise HTTPException(503, "Business Logic service unavailable")

    if resp.status_code == 404:
        raise HTTPException(404, "Data not found")
    if resp.status_code == 403:
        raise HTTPException(403, "Not authorized to view this data")
    if resp.status_code != 200:
        raise HTTPException(502, "Business Logic service returned an unexpected response")

    return resp.json()


async def get_learner_analytics(trainer_id: UUID, learner_id: UUID, token: str):
    """One call returns engagement + skill development + certification status combined."""
    return await _call_logic_service(f"/trainer/{trainer_id}/learners/{learner_id}", token)


async def get_dashboard_summary(trainer_id: UUID, token: str):
    """Combined dashboard: summary card + all learners' analytics in one call."""
    return await _call_logic_service(f"/trainer/{trainer_id}/dashboard", token)