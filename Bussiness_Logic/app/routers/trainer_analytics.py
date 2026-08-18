from typing import List
from uuid import UUID

from fastapi import (
    APIRouter,
    Header,
    HTTPException,
)

from app.schemas.trainer_analytics import (
    TrainerDashboardOut,
    LearnerAnalyticsOut,
)

from app.services.trainer_analytics_service import (
    get_learners_for_trainer,
    compute_trainer_dashboard,
    compute_learner_analytics,
)


router = APIRouter(
    prefix="/trainer",
    tags=["trainer-analytics"],
)


@router.get(
    "/{trainer_id}/learners",
    response_model=List[UUID],
)
def list_assigned_learners(
    trainer_id: UUID,
    authorization: str | None = Header(
        default=None
    ),
):
    """
    Get learner IDs assigned to the trainer.

    The authorization token is forwarded to
    the backend API.
    """

    learners = get_learners_for_trainer(
        trainer_id,
        authorization,
    )

    return learners


@router.get(
    "/{trainer_id}/learners/{learner_id}",
    response_model=LearnerAnalyticsOut,
)
def get_learner_analytics(
    trainer_id: UUID,
    learner_id: UUID,
    authorization: str | None = Header(
        default=None
    ),
):

    assigned = get_learners_for_trainer(
        trainer_id,
        authorization,
    )

    if learner_id not in assigned:
        raise HTTPException(
            status_code=404,
            detail=(
                "Learner is not assigned "
                "to this trainer"
            ),
        )

    return compute_learner_analytics(
        learner_id
    )


@router.get(
    "/{trainer_id}/dashboard",
    response_model=TrainerDashboardOut,
)
def get_trainer_dashboard(
    trainer_id: UUID,
    authorization: str | None = Header(
        default=None
    ),
):

    return compute_trainer_dashboard(
        trainer_id,
        authorization,
    )