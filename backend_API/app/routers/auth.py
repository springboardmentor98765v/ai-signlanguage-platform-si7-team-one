from datetime import datetime, timedelta, timezone
import secrets

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.models.role import Role
from app.models.user_role import UserRole
from app.models.refresh_token import RefreshToken
from app.schemas.auth import (
    UserRegister, UserLogin, UserResponse, TokenPairResponse,
    RefreshTokenRequest,
)
from app.schemas.user import (
    UpdateProfileRequest, ChangePasswordRequest,
    ForgotPasswordRequest, ResetPasswordRequest,
)
from app.core.security import (
    hash_password, verify_password, create_access_token,
    get_current_user, get_user_roles,
    generate_refresh_token, hash_refresh_token,
)
from app.core.limiter import limiter

router = APIRouter(prefix="/auth", tags=["Authentication"])

DEFAULT_ROLE = "learner"
REFRESH_TOKEN_EXPIRE_DAYS = 30

# In-memory reset token store for now (swap for password_reset_tokens table later)
reset_tokens: dict[str, str] = {}  # token -> user_email


# ── Registration & Login ────────────────────────────────

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
            detail=f"Setup error: default role '{DEFAULT_ROLE}' is missing. Contact an administrator.",
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
    response_model=TokenPairResponse,
    summary="Log in and receive access + refresh tokens",
    description="Rate limited to 5 attempts per minute per IP to prevent brute-force attacks. "
                 "Roles are embedded in the access token at login time. "
                 "Use the refresh token with /auth/refresh to get a new access token without re-entering credentials.",
)
@limiter.limit("5/minute")
def login(request: Request, payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    roles = get_user_roles(user)
    access_token = create_access_token({"sub": str(user.user_id), "roles": roles})

    raw_refresh, refresh_hash = generate_refresh_token()
    db.add(RefreshToken(
        user_id=user.user_id,
        token_hash=refresh_hash,
        expires_at=datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
    ))
    db.commit()

    return TokenPairResponse(
        access_token=access_token,
        refresh_token=raw_refresh,
        user=UserResponse(
            user_id=user.user_id,
            full_name=user.full_name,
            email=user.email,
            roles=roles,
            created_at=user.created_at,
        ),
    )


@router.post(
    "/refresh",
    response_model=TokenPairResponse,
    summary="Exchange a refresh token for a new access + refresh token pair",
    description="Rotates the refresh token — the old one is revoked and a new one issued, "
                 "so a leaked refresh token can only be used once before becoming invalid.",
)
def refresh_token(payload: RefreshTokenRequest, db: Session = Depends(get_db)):
    token_hash = hash_refresh_token(payload.refresh_token)
    stored = db.query(RefreshToken).filter_by(token_hash=token_hash, revoked=False).first()

    if not stored or stored.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    user = db.query(User).filter(User.user_id == stored.user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    # Rotate: revoke old, issue new
    stored.revoked = True
    roles = get_user_roles(user)
    new_access = create_access_token({"sub": str(user.user_id), "roles": roles})
    new_raw_refresh, new_hash = generate_refresh_token()
    db.add(RefreshToken(
        user_id=user.user_id,
        token_hash=new_hash,
        expires_at=datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
    ))
    db.commit()

    return TokenPairResponse(
        access_token=new_access,
        refresh_token=new_raw_refresh,
        user=UserResponse(
            user_id=user.user_id,
            full_name=user.full_name,
            email=user.email,
            roles=roles,
            created_at=user.created_at,
        ),
    )


@router.post(
    "/logout",
    summary="Revoke a refresh token",
    description="Call this on logout to invalidate the refresh token so it can no longer be used.",
)
def logout(payload: RefreshTokenRequest, db: Session = Depends(get_db)):
    token_hash = hash_refresh_token(payload.refresh_token)
    stored = db.query(RefreshToken).filter_by(token_hash=token_hash).first()
    if stored:
        stored.revoked = True
        db.commit()
    return {"message": "Logged out"}


# ── Profile ────────────────────────────────

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


@router.put(
    "/me",
    response_model=UserResponse,
    summary="Update your own profile (name and/or email)",
)
def update_profile(
    payload: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.full_name:
        current_user.full_name = payload.full_name
    if payload.email:
        existing = db.query(User).filter(
            User.email == payload.email, User.user_id != current_user.user_id
        ).first()
        if existing:
            raise HTTPException(status_code=409, detail="Email already in use")
        current_user.email = payload.email
    db.commit()
    db.refresh(current_user)
    return UserResponse(
        user_id=current_user.user_id,
        full_name=current_user.full_name,
        email=current_user.email,
        roles=get_user_roles(current_user),
        created_at=current_user.created_at,
    )


@router.put(
    "/me/password",
    summary="Change your own password",
)
def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not verify_password(payload.old_password, current_user.password_hash):
        raise HTTPException(status_code=401, detail="Old password is incorrect")
    current_user.password_hash = hash_password(payload.new_password)
    db.commit()
    return {"message": "Password updated successfully"}


# ── Forgot / Reset Password ────────────────────────────────

@router.post(
    "/forgot-password",
    summary="Request a password reset link",
    description="Free-tier approach: reset link is printed to the server console instead of emailed.",
)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        # Don't reveal whether email exists — security best practice
        return {"message": "If that email exists, a reset link has been sent"}

    token = secrets.token_urlsafe(32)
    reset_tokens[token] = payload.email

    print(f"\n[PASSWORD RESET] Reset link for {payload.email}: http://localhost:3000/reset-password?token={token}\n")

    return {"message": "If that email exists, a reset link has been sent"}


@router.post(
    "/reset-password",
    summary="Reset password using a reset token",
)
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    email = reset_tokens.get(payload.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.password_hash = hash_password(payload.new_password)
    db.commit()
    del reset_tokens[payload.token]
    return {"message": "Password reset successfully"}