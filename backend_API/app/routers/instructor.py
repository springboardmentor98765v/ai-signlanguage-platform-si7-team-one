from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.models.instructor_student import InstructorStudent  # from Intern 5
from app.core.security import require_role, get_current_user

router = APIRouter(prefix="/instructor", tags=["Instructor"])


@router.post("/assign-student/{student_id}")
def assign_student(
    student_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("instructor", "admin")),
):
    existing = db.query(InstructorStudent).filter_by(
        instructor_id=current_user.user_id, student_id=student_id
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Already assigned")

    link = InstructorStudent(instructor_id=current_user.user_id, student_id=student_id)
    db.add(link)
    db.commit()
    return {"message": "Student assigned"}


@router.get("/students")
def get_my_students(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("instructor", "admin")),
):
    links = db.query(InstructorStudent).filter_by(instructor_id=current_user.user_id).all()
    student_ids = [link.student_id for link in links]
    students = db.query(User).filter(User.user_id.in_(student_ids)).all()
    return [{"user_id": s.user_id, "full_name": s.full_name, "email": s.email} for s in students]