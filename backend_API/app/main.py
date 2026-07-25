from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.core.limiter import limiter
from app.core.middleware import log_requests
from app.routers import auth, courses, health, predict, instructor, admin

app = FastAPI(
    title="Sign Language Platform API",
    description="Backend API for the AI-Powered Sign Language Learning & Assessment Platform.",
    version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.middleware("http")(log_requests)

app.include_router(auth.router)
app.include_router(courses.router)
app.include_router(health.router)
app.include_router(predict.router)
app.include_router(instructor.router)
app.include_router(admin.router)