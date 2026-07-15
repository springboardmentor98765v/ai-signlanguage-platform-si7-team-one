import httpx
from typing import Optional


USE_MOCK_AI = False

# TEMPORARY: pointing directly at Abhinaya's raw AI service for testing,
# since Aashi's backend doesn't yet forward to it properly. No auth needed
# here since her service has no auth layer. Once Aashi's /predict wraps
# this correctly, switch AI_PREDICT_URL to point at her backend instead.
AI_PREDICT_URL = "http://127.0.0.1:8001/predict"


class AIPredictionResult:
    def __init__(self, success: bool, predicted_sign: Optional[str] = None,
                 confidence: Optional[float] = None, message: Optional[str] = None):
        self.success = success
        self.predicted_sign = predicted_sign
        self.confidence = confidence
        self.message = message


def get_prediction(image_bytes: bytes, auth_token: Optional[str] = None) -> AIPredictionResult:
    """
    Calls Abhinaya's AI service directly (temporary, until Aashi's backend
    properly forwards to it). No auth token needed for this raw service.
    """
    files = {"file": ("frame.jpg", image_bytes, "image/jpeg")}

    response = httpx.post(AI_PREDICT_URL, files=files)
    response.raise_for_status()
    data = response.json()

    if not data.get("success", False):
        return AIPredictionResult(success=False, message=data.get("message", "Prediction failed"))

    return AIPredictionResult(
        success=True,
        predicted_sign=data.get("prediction"),
        confidence=data.get("confidence"),
    )