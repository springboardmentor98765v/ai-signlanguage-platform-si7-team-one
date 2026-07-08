"""
Local dev entrypoint — FOR STANDALONE TESTING ONLY.

Once Intern 2's shared FastAPI project skeleton (Day 2 deliverable) is
available, `app.routers.practice.router` should be included there instead:

    from app.routers import practice
    app.include_router(practice.router)

Run locally with:
    uvicorn main:app --reload
"""

from fastapi import FastAPI
from app.routers import practice

app = FastAPI(title="Practice Service (dev)")

app.include_router(practice.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "practice"}
