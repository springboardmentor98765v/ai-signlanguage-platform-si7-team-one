from fastapi import APIRouter
from app.schemas.auth import UserRegister, UserLogin
from app.core.security import hash_password, verify_password, create_access_token
from app.core.security import verify_token
from fastapi import Depends
from app.core.security import oauth2_scheme

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

fake_db = {}

@router.post("/register")
def register(user: UserRegister):

    fake_db[user.email] = {
        "name": user.name,
        "email": user.email,
        "password": hash_password(user.password),
        "role": user.role
    }

    return {
        "message": "User registered successfully"
    }

@router.post("/login")
def login(user: UserLogin):

    db_user = fake_db.get(user.email)

    if not db_user:
        return {"message": "User not found"}

    if not verify_password(user.password, db_user["password"]):
        return {"message": "Invalid password"}

    token = create_access_token({"sub": user.email})

    return {
        "access_token": token,
        "token_type": "Bearer"
    }



@router.get("/profile")
def profile(token: str = Depends(oauth2_scheme)):

    payload = verify_token(token)

    email = payload["sub"]

    user = fake_db.get(email)

    return {
        "name": user["name"],
        "email": user["email"],
        "role": user["role"]
    }