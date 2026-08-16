# app/services/trainer_service.py

from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.instructor_student import InstructorStudent
from app.models.user import User


def get_assigned_learners(db: Session, trainer_id: UUID):
    return (
        db.query(User)
        .join(
            InstructorStudent,
            InstructorStudent.learner_id == User.user_id
        )
        .filter(
            InstructorStudent.instructor_id == trainer_id,
            InstructorStudent.status == "active"
        )
        .all()
    )


def get_learner_detail(
    db: Session,
    trainer_id: UUID,
    learner_id: UUID
):
    verify_assignment(db, trainer_id, learner_id)

    learner = (
        db.query(User)
        .filter(User.user_id == learner_id)
        .first()
    )

    if not learner:
        raise HTTPException(
            status_code=404,
            detail="Learner not found"
        )

    return learner


def verify_assignment(
    db: Session,
    trainer_id: UUID,
    learner_id: UUID
):
    mapping = (
        db.query(InstructorStudent)
        .filter(
            InstructorStudent.instructor_id == trainer_id,
            InstructorStudent.learner_id == learner_id,
            InstructorStudent.status == "active"
        )
        .first()
    )

    if not mapping:
        raise HTTPException(
            status_code=403,
            detail="Learner not assigned to this trainer"
        )

    return mapping


def assign_learner(db: Session, trainer_id: UUID, learner_id: UUID):
    existing = (
        db.query(InstructorStudent)
        .filter(
            InstructorStudent.instructor_id == trainer_id,
            InstructorStudent.learner_id == learner_id,
        )
        .first()
    )

    if existing:
        if existing.status == "active":
            raise HTTPException(400, "Learner already assigned to this trainer")
        # Reactivate a previously inactive mapping instead of creating a duplicate row
        existing.status = "active"
        db.commit()
        db.refresh(existing)
        return existing

    mapping = InstructorStudent(
        instructor_id=trainer_id,
        learner_id=learner_id,
        status="active",
    )
    db.add(mapping)
    db.commit()
    db.refresh(mapping)
    return mapping


def unassign_learner(db: Session, trainer_id: UUID, learner_id: UUID):
    mapping = (
        db.query(InstructorStudent)
        .filter(
            InstructorStudent.instructor_id == trainer_id,
            InstructorStudent.learner_id == learner_id,
            InstructorStudent.status == "active",
        )
        .first()
    )

    if not mapping:
        raise HTTPException(404, "Assignment not found")

    # Soft-delete via status flip, consistent with the active-status pattern
    # used everywhere else in this file (get_assigned_learners, verify_assignment)
    mapping.status = "inactive"
    db.commit()


# --- Stubs: awaiting Intern 4's calculation logic ---

def get_engagement(db: Session, learner_id: UUID):
    raise HTTPException(501, "Not implemented - awaiting Intern 4's calculation logic")

def get_skill_development(db: Session, learner_id: UUID):
    raise HTTPException(501, "Not implemented - awaiting Intern 4's calculation logic")

def get_assessment_analytics(db: Session, learner_id: UUID):
    raise HTTPException(501, "Not implemented - awaiting Intern 4's calculation logic")

def get_certification_status(db: Session, learner_id: UUID):
    raise HTTPException(501, "Not implemented - awaiting Intern 4's calculation logic")

def get_dashboard_summary(db: Session, trainer_id: UUID):
    raise HTTPException(501, "Not implemented - awaiting Intern 4's calculation logic")