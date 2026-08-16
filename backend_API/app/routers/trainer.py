from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.security import require_role, verify_self_or_admin
from app.services import trainer_service
from app.schemas.trainer import (
    LearnerSummary, EngagementResponse, SkillDevelopmentResponse,
    AssessmentAnalyticsResponse, CertificationStatusResponse,
    TrainerDashboardResponse, AssignLearnerRequest, MessageResponse
)

router = APIRouter(prefix="/trainer", tags=["Accessibility Trainer"])


@router.post("/assign", response_model=MessageResponse, status_code=201)
def assign_learner(
    payload: AssignLearnerRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("trainer"))
):
    verify_self_or_admin(current_user, payload.trainer_id)
    trainer_service.assign_learner(db, payload.trainer_id, payload.learner_id)
    return {"message": "Learner assigned"}


@router.delete("/{trainer_id}/learners/{learner_id}", response_model=MessageResponse)
def unassign_learner(
    trainer_id: UUID,
    learner_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("trainer"))
):
    verify_self_or_admin(current_user, trainer_id)
    trainer_service.unassign_learner(db, trainer_id, learner_id)
    return {"message": "Learner unassigned"}


@router.get("/{trainer_id}/learners", response_model=list[LearnerSummary])
def get_learners(
    trainer_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("trainer"))
):
    verify_self_or_admin(current_user, trainer_id)
    return trainer_service.get_assigned_learners(db, trainer_id)


@router.get("/{trainer_id}/learners/{learner_id}", response_model=LearnerSummary)
def get_learner_detail(
    trainer_id: UUID,
    learner_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("trainer"))
):
    verify_self_or_admin(current_user, trainer_id)
    return trainer_service.get_learner_detail(db, trainer_id, learner_id)


@router.get("/{trainer_id}/dashboard", response_model=TrainerDashboardResponse)
def get_dashboard(
    trainer_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("trainer"))
):
    verify_self_or_admin(current_user, trainer_id)
    return trainer_service.get_dashboard_summary(db, trainer_id)


# --- Sub-routes kept per Intern 4's suggestion, as fallback for Intern 1 ---

@router.get("/{trainer_id}/learners/{learner_id}/engagement", response_model=EngagementResponse)
def get_engagement(
    trainer_id: UUID,
    learner_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("trainer"))
):
    verify_self_or_admin(current_user, trainer_id)
    trainer_service.verify_assignment(db, trainer_id, learner_id)
    return trainer_service.get_engagement(db, learner_id)


@router.get("/{trainer_id}/learners/{learner_id}/skill-development", response_model=SkillDevelopmentResponse)
def get_skill_development(
    trainer_id: UUID,
    learner_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("trainer"))
):
    verify_self_or_admin(current_user, trainer_id)
    trainer_service.verify_assignment(db, trainer_id, learner_id)
    return trainer_service.get_skill_development(db, learner_id)


@router.get("/{trainer_id}/learners/{learner_id}/analytics", response_model=AssessmentAnalyticsResponse)
def get_assessment_analytics(
    trainer_id: UUID,
    learner_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("trainer"))
):
    verify_self_or_admin(current_user, trainer_id)
    trainer_service.verify_assignment(db, trainer_id, learner_id)
    return trainer_service.get_assessment_analytics(db, learner_id)


@router.get("/{trainer_id}/learners/{learner_id}/certification-status", response_model=CertificationStatusResponse)
def get_certification_status(
    trainer_id: UUID,
    learner_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("trainer"))
):
    verify_self_or_admin(current_user, trainer_id)
    trainer_service.verify_assignment(db, trainer_id, learner_id)
    return trainer_service.get_certification_status(db, learner_id)