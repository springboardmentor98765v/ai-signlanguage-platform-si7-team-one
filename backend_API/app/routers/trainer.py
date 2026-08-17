# app/routers/trainer.py
from uuid import UUID

from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.security import require_role, verify_self_or_admin, oauth2_scheme
from app.services import trainer_service
from app.schemas.trainer import (
    LearnerSummary, TrainerDashboardResponse, LearnerDetail,
    AssignLearnerRequest, MessageResponse
)

router = APIRouter(prefix="/trainer", tags=["Accessibility Trainer"])

ROLE = "accessibility_trainer"


@router.post("/assign", response_model=MessageResponse, status_code=201)
def assign_learner(
    payload: AssignLearnerRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(ROLE))
):
    verify_self_or_admin(current_user, payload.trainer_id)
    trainer_service.assign_learner(db, payload.trainer_id, payload.learner_id)
    return {"message": "Learner assigned"}


@router.delete("/{trainer_id}/learners/{learner_id}", response_model=MessageResponse)
def unassign_learner(
    trainer_id: UUID,
    learner_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(ROLE))
):
    verify_self_or_admin(current_user, trainer_id)
    trainer_service.unassign_learner(db, trainer_id, learner_id)
    return {"message": "Learner unassigned"}


@router.get("/{trainer_id}/learners", response_model=list[LearnerSummary])
def get_learners(
    trainer_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(ROLE))
):
    verify_self_or_admin(current_user, trainer_id)
    return trainer_service.get_assigned_learners(db, trainer_id)


@router.get("/{trainer_id}/learners/{learner_id}", response_model=LearnerDetail)
async def get_learner_detail(
    trainer_id: UUID,
    learner_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(ROLE)),
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
):
    verify_self_or_admin(current_user, trainer_id)
    trainer_service.verify_assignment(db, trainer_id, learner_id)
    return await trainer_service.get_learner_analytics(trainer_id, learner_id, credentials.credentials)


@router.get("/{trainer_id}/dashboard", response_model=TrainerDashboardResponse)
async def get_dashboard(
    trainer_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_role(ROLE)),
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
):
    verify_self_or_admin(current_user, trainer_id)
    return await trainer_service.get_dashboard_summary(trainer_id, credentials.credentials)