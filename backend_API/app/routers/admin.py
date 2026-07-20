from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.user import User
from app.models.role import Role
from app.models.user_role import UserRole
from app.core.security import require_role

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users")
def list_all_users(
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    users = db.query(User).all()
    return [
        {
            "user_id": u.user_id, "full_name": u.full_name, "email": u.email,
            "is_active": u.is_active,
            "roles": [ur.role.role_name for ur in u.user_roles],
        } for u in users
    ]


@router.patch("/users/{user_id}/status")
def toggle_user_status(
    user_id: str,
    is_active: bool,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = is_active
    db.commit()
    return {"message": f"User {'activated' if is_active else 'deactivated'}"}


@router.patch("/users/{user_id}/role")
def change_user_role(
    user_id: str,
    role_name: str,
    db: Session = Depends(get_db),
    _: User = Depends(require_role("admin")),
):
    user = db.query(User).filter(User.user_id == user_id).first()
    role = db.query(Role).filter(Role.role_name == role_name).first()
    if not user or not role:
        raise HTTPException(status_code=404, detail="User or role not found")

    existing = db.query(UserRole).filter_by(user_id=user_id, role_id=role.role_id).first()
    if not existing:
        db.add(UserRole(user_id=user_id, role_id=role.role_id))
        db.commit()
    return {"message": f"Role '{role_name}' added to user"}