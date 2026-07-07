from fastapi import FastAPI

app = FastAPI(
    title="Sign Language Platform - User & Course API",
    version="1.0.0"
)

@app.get("/")
def root():
    return {"message": "API is running"}

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "Backend API"
    }