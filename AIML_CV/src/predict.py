import os
import joblib
import numpy as np

# -----------------------
# Paths
# -----------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_DIR = os.path.join(
    BASE_DIR,
    "..",
    "models"
)

# -----------------------
# Load Model
# -----------------------

MODEL_PATH = os.path.join(
    MODEL_DIR,
    "xgboost_landmark.pkl"
)

ENCODER_PATH = os.path.join(
    MODEL_DIR,
    "label_encoder.pkl"
)

model = joblib.load(MODEL_PATH)
encoder = joblib.load(ENCODER_PATH)

print("Model Loaded Successfully!")

# -----------------------
# Prediction Function
# -----------------------

def predict_gesture(features):

    if len(features) != 63:
        raise ValueError(
            f"Expected 63 features but got {len(features)}"
        )

    features = np.array(features).reshape(1, -1)

    prediction = model.predict(features)

    gesture = encoder.inverse_transform(prediction)[0]

    confidence = model.predict_proba(features).max()

    return {
        "gesture": gesture,
        "confidence": round(float(confidence) * 100, 2)
    }