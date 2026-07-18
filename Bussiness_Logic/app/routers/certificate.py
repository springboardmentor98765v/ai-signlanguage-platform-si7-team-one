from fastapi import APIRouter
from uuid import UUID
from app.schemas.certificate import EligibilityOut
from app.services.certificate_service import check_eligibility

router = APIRouter(prefix="/certificates", tags=["certificates"])


@router.get("/{user_id}/eligibility", response_model=EligibilityOut)
def get_eligibility(user_id: UUID):
    return check_eligibility(user_id)