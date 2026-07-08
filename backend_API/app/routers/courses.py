from fastapi import APIRouter

router = APIRouter(prefix="/courses", tags=["Courses"])

@router.get("/")
def get_courses():
    return []