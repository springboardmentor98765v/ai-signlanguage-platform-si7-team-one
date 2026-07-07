# Day 1 - AI/CV Pipeline Plan

## Objective

Develop an AI-powered Sign Language Recognition module that detects hand gestures using Computer Vision and predicts sign language alphabets using Machine Learning.

## Planned Pipeline

1. Capture webcam frames using OpenCV.
2. Detect the hand using MediaPipe Hands.
3. Extract 21 hand landmarks.
4. Convert landmarks into numerical feature vectors.
5. Train a Machine Learning model (KNN/CNN) on labeled sign language data.
6. Predict the performed sign.
7. Return the predicted sign and confidence score through a FastAPI endpoint.
8. Integrate the API with the backend.

## Technologies

- Python
- OpenCV
- MediaPipe
- NumPy
- Scikit-Learn
- FastAPI