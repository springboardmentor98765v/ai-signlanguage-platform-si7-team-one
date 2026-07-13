from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials
from app.core.security import oauth2_scheme, decode_token
from app.schemas.prediction import PredictionRequest
from app.services.ai_services import predict_sign

router = APIRouter(
    prefix="/predict",
    tags=["Prediction"]
)


@router.post("/")
def predict(
    request: PredictionRequest,
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme)
):
    payload = decode_token(credentials.credentials)

    result = predict_sign(request.image_name)

    return {
        "status": "success",
        "user": payload["sub"],
        "prediction": result["prediction"],
        "confidence": result["confidence"]
    }