# app/routers/analytics.py
from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.security import get_current_user, verify_self_or_admin
from app.services import analytics_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/{user_id}")
def get_analytics(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    verify_self_or_admin(current_user, user_id)
    return analytics_service.get_summary(db, user_id)

@router.get("/{user_id}/weekly")
def get_weekly_analytics(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    verify_self_or_admin(current_user, user_id)
    return analytics_service.get_weekly(db, user_id)