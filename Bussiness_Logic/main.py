from fastapi import FastAPI
from app.routers import practice, assessment, feedback, analytics, recommendation

app = FastAPI(title="Practice Service (dev)")

app.include_router(practice.router)
app.include_router(assessment.router)
app.include_router(feedback.router)
app.include_router(analytics.router)
app.include_router(recommendation.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "practice"}