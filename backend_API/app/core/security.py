# app/core/security.py

from datetime import datetime, timedelta
from typing import List
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.session import get_db
from app.models.user import User

import hashlib
import secrets


# Password hashing configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Bearer token authentication
oauth2_scheme = HTTPBearer()


def hash_password(password: str) -> str:
    """Hash a plain-text password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain-text password against its hashed value."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict) -> str:
    """Create a JWT access token with an expiration time."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )


def decode_token(token: str) -> dict:
    """Decode and validate a JWT access token."""
    try:
        return jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    Get the currently authenticated user from the JWT token.

    M4:
    The JWT 'sub' value is a string, while the database user_id
    column is UUID, so the value is explicitly converted to UUID.
    """
    token = credentials.credentials
    payload = decode_token(token)

    user_id_raw = payload.get("sub")

    if not user_id_raw:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    # M4: Convert JWT subject from string to UUID
    try:
        user_id = UUID(user_id_raw)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    user = db.query(User).filter(User.user_id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive",
        )

    return user


def get_user_roles(user: User) -> List[str]:
    """Return all role names assigned to the user."""
    return [ur.role.role_name for ur in user.user_roles]


def require_role(*allowed_roles: str):
    """
    RBAC dependency.

    Example:
        Depends(require_role("admin", "instructor"))

    For the accessibility trainer role:
        Depends(require_role("accessibility_trainer"))
    """

    def role_checker(
        current_user: User = Depends(get_current_user),
    ) -> User:
        user_roles = get_user_roles(current_user)

        if not any(role in allowed_roles for role in user_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires one of roles: {allowed_roles}",
            )

        return current_user

    return role_checker


# ============================================================
# M2 - Refresh Token Helpers
# ============================================================

REFRESH_TOKEN_EXPIRE_DAYS = 30


def generate_refresh_token() -> tuple[str, str]:
    """
    Generate a refresh token.

    Returns:
        raw_token: Token sent to the client.
        token_hash: SHA-256 hash stored in the database.
    """
    raw_token = secrets.token_urlsafe(48)
    token_hash = hashlib.sha256(raw_token.encode()).hexdigest()

    return raw_token, token_hash


def hash_refresh_token(raw_token: str) -> str:
    """Generate SHA-256 hash of a refresh token."""
    return hashlib.sha256(raw_token.encode()).hexdigest()


# ============================================================
# M4 - Authorization Helpers
# ============================================================

def verify_self_or_admin(
    current_user: User,
    target_id: UUID,
) -> None:
    """
    Allow access only when:

    1. The current user is accessing their own resource, OR
    2. The current user has the admin role.
    """
    role_names = get_user_roles(current_user)

    if (
        current_user.user_id != target_id
        and "admin" not in role_names
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )


def verify_self_or_roles(
    current_user: User,
    target_id: UUID,
    *allowed_roles: str,
) -> None:
    """
    Allow access when:

    1. The current user is accessing their own resource, OR
    2. The current user has one of the specified roles.

    Examples:

        # Self only
        verify_self_or_roles(
            current_user,
            user_id,
        )

        # Self or accessibility trainer
        verify_self_or_roles(
            current_user,
            user_id,
            "accessibility_trainer",
        )

        # Self or accessibility trainer or admin
        verify_self_or_roles(
            current_user,
            user_id,
            "accessibility_trainer",
            "admin",
        )
    """

    # User accessing their own resource
    if current_user.user_id == target_id:
        return

    # User has one of the allowed roles
    if (
        allowed_roles
        and set(allowed_roles).intersection(
            get_user_roles(current_user)
        )
    ):
        return

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Access denied",
    )