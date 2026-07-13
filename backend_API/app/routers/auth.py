from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.models.role import Role
from app.models.user_role import UserRole
from app.schemas.auth import UserRegister, UserLogin, UserResponse, TokenResponse
from app.core.security import (
    hash_password, verify_password, create_access_token,
    get_current_user, get_user_roles,
)
from app.core.limiter import limiter

router = APIRouter(prefix="/auth", tags=["Authentication"])

DEFAULT_ROLE = "learner"


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Creates a new user account with the default 'learner' role. "
                 "Password is hashed with bcrypt before storage.",
)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    new_user = User(
        full_name=payload.full_name,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    db.add(new_user)
    db.flush()

    role = db.query(Role).filter(Role.role_name == DEFAULT_ROLE).first()
    if not role:
        raise HTTPException(
            status_code=500,
            detail=f"Default role '{DEFAULT_ROLE}' not seeded in roles table",
        )
    db.add(UserRole(user_id=new_user.user_id, role_id=role.role_id))
    db.commit()
    db.refresh(new_user)

    return UserResponse(
        user_id=new_user.user_id,
        full_name=new_user.full_name,
        email=new_user.email,
        roles=[DEFAULT_ROLE],
        created_at=new_user.created_at,
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Log in and receive a JWT access token",
    description="Rate limited to 5 attempts per minute per IP to prevent brute-force attacks. "
                 "Roles are embedded in the token at login time.",
)
@limiter.limit("5/minute")
def login(request: Request, payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    roles = get_user_roles(user)
    token = create_access_token({"sub": str(user.user_id), "roles": roles})

    return TokenResponse(
        access_token=token,
        user=UserResponse(
            user_id=user.user_id,
            full_name=user.full_name,
            email=user.email,
            roles=roles,
            created_at=user.created_at,
        ),
    )


@router.get(
    "/profile",
    response_model=UserResponse,
    summary="Get the currently logged-in user's profile",
)
def profile(current_user: User = Depends(get_current_user)):
    return UserResponse(
        user_id=current_user.user_id,
        full_name=current_user.full_name,
        email=current_user.email,
        roles=get_user_roles(current_user),
        created_at=current_user.created_at,
    )