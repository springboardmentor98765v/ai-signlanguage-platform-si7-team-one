from fastapi import APIRouter, Depends
from app.core.security import oauth2_scheme, verify_token
from app.services.ai_services import predict_sign


router = APIRouter(
    prefix="/predict",
    tags=["Prediction"]
)

@router.post("/")
def predict(token: str = Depends(oauth2_scheme)):

    payload = verify_token(token)

    result = predict_sign(None)

    return {
        "status": "success",
        "user": payload["sub"],
        "prediction": result["prediction"],
        "confidence": result["confidence"]
    }

from app.schemas.prediction import PredictionRequest

@router.post("/")
def predict(
    request: PredictionRequest,
    token: str = Depends(oauth2_scheme)
):

    payload = verify_token(token)

    result = predict_sign(request.image_name)

    return {
        "status": "success",
        "user": payload["sub"],
        "prediction": result["prediction"],
        "confidence": result["confidence"]
    }
    