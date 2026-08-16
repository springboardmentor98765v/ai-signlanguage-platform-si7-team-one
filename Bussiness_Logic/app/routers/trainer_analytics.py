from fastapi import APIRouter, HTTPException
from uuid import UUID
from typing import List

from app.schemas.trainer_analytics import (
    TrainerDashboardOut,
    LearnerAnalyticsOut,
)
from app.services.trainer_analytics_service import (
    get_learners_for_trainer,
    compute_trainer_dashboard,
    compute_learner_analytics,
)

router = APIRouter(prefix="/trainer", tags=["trainer-analytics"])

# NOTE: POST /trainer/assign and DELETE /trainer/{trainer_id}/learners/{learner_id}
# removed — Intern 2 (Aashi) owns the trainer-learner mapping via the
# real instructor_students table. This service calls her
# GET /trainer/{trainer_id}/learners to fetch the list, then computes
# analytics on top.


@router.get("/{trainer_id}/learners", response_model=List[UUID])
def list_assigned_learners(trainer_id: UUID):
    """Proxies Aashi's service to return learners assigned to this trainer."""
    return get_learners_for_trainer(trainer_id)


@router.get("/{trainer_id}/learners/{learner_id}", response_model=LearnerAnalyticsOut)
def get_learner_analytics(trainer_id: UUID, learner_id: UUID):
    assigned = get_learners_for_trainer(trainer_id)
    if learner_id not in assigned:
        raise HTTPException(
            status_code=404,
            detail="Learner is not assigned to this trainer"
        )
    return compute_learner_analytics(learner_id)


@router.get("/{trainer_id}/dashboard", response_model=TrainerDashboardOut)
def get_trainer_dashboard(trainer_id: UUID):
    return compute_trainer_dashboard(trainer_id)