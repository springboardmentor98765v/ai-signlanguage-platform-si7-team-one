from fastapi import APIRouter, HTTPException
from uuid import UUID
from typing import List

from app.schemas.trainer_analytics import (
    AssignLearnerRequest,
    TrainerAssignmentOut,
    TrainerDashboardOut,
    LearnerAnalyticsOut,
)
from app.services.trainer_analytics_service import (
    trainer_assignment_store,
    compute_trainer_dashboard,
    compute_learner_analytics,
)

router = APIRouter(prefix="/trainer", tags=["trainer-analytics"])


@router.post("/assign", response_model=TrainerAssignmentOut, status_code=201)
def assign_learner(payload: AssignLearnerRequest):
    assignment = trainer_assignment_store.assign(payload.trainer_id, payload.learner_id)
    return trainer_assignment_store.to_out(assignment)


@router.delete("/{trainer_id}/learners/{learner_id}")
def unassign_learner(trainer_id: UUID, learner_id: UUID):
    removed = trainer_assignment_store.unassign(trainer_id, learner_id)
    if not removed:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return {"message": "Learner unassigned"}


@router.get("/{trainer_id}/learners", response_model=List[UUID])
def list_assigned_learners(trainer_id: UUID):
    return trainer_assignment_store.get_learners_for_trainer(trainer_id)


@router.get("/{trainer_id}/learners/{learner_id}", response_model=LearnerAnalyticsOut)
def get_learner_analytics(trainer_id: UUID, learner_id: UUID):
    assigned = trainer_assignment_store.get_learners_for_trainer(trainer_id)
    if learner_id not in assigned:
        raise HTTPException(status_code=404, detail="Learner is not assigned to this trainer")
    return compute_learner_analytics(learner_id)


@router.get("/{trainer_id}/dashboard", response_model=TrainerDashboardOut)
def get_trainer_dashboard(trainer_id: UUID):
    return compute_trainer_dashboard(trainer_id)