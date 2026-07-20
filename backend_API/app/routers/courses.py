from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.lesson import Lesson
from app.schemas.course import LessonCreate, LessonResponse
from app.core.security import require_role

router = APIRouter(prefix="/courses", tags=["Courses"])


@router.get(
    "/lessons",
    response_model=list[LessonResponse],
    summary="List all published lessons",
    description="Public endpoint. Optionally filter by module_id.",
)
def list_lessons(module_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(Lesson).filter(Lesson.is_published.is_(True))
    if module_id:
        query = query.filter(Lesson.module_id == module_id)
    return query.order_by(Lesson.sequence_order).all()


@router.get(
    "/lessons/{lesson_id}",
    response_model=LessonResponse,
    summary="Get a single lesson by ID",
)
def get_lesson(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.query(Lesson).filter(Lesson.lesson_id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson


@router.post(
    "/lessons",
    response_model=LessonResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new lesson (admin/instructor only)",
)
def create_lesson(
    payload: LessonCreate,
    db: Session = Depends(get_db),
    _: object = Depends(require_role("admin", "instructor")),
):
    lesson = Lesson(**payload.model_dump())
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson


@router.delete(
    "/lessons/{lesson_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a lesson (admin only)",
)
def delete_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    _: object = Depends(require_role("admin")),
):
    lesson = db.query(Lesson).filter(Lesson.lesson_id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    db.delete(lesson)
    db.commit()

    



@router.get("/lessons", response_model=list[LessonResponse])
def list_lessons(
    module_id: int | None = None,
    search: str | None = None,
    page: int = 1,
    page_size: int = 10,
    db: Session = Depends(get_db),
):
    query = db.query(Lesson).filter(Lesson.is_published.is_(True))
    if module_id:
        query = query.filter(Lesson.module_id == module_id)
    if search:
        query = query.filter(Lesson.title.ilike(f"%{search}%"))
    offset = (page - 1) * page_size
    return query.order_by(Lesson.sequence_order).offset(offset).limit(page_size).all()