from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field,field_validator
from typing import Optional


class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    password: str = Field(..., min_length=6)
    requested_role: Optional[str] = "learner" 

    @field_validator("requested_role")
    @classmethod
    def validate_requested_role(cls, v):
        allowed = {"learner", "instructor"}  # admin excluded on purpose
        if v not in allowed:
            raise ValueError(f"requested_role must be one of {allowed}")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    user_id: UUID
    full_name: str
    email: EmailStr
    roles: list[str]
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class RefreshTokenRequest(BaseModel):
    refresh_token: str


class TokenPairResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse