from fastapi import FastAPI

from app.routers import auth, courses, health, predict

app = FastAPI(title="Sign Language Platform API")

app.include_router(auth.router)
app.include_router(courses.router)
app.include_router(health.router)
app.include_router(predict.router)