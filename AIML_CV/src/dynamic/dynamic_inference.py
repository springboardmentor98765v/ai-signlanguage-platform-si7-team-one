import os
import cv2
import numpy as np
import tensorflow as tf
import mediapipe as mp


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "dynamic_word_model.keras"
)

LABEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "dynamic_label_encoder.npy"
)


# ============================================================
# CONFIGURATION
# ============================================================

MAX_FRAMES = 30
FEATURES_PER_FRAME = 63


# ============================================================
# LOAD MODEL
# ============================================================

print("Loading dynamic model...")

model = tf.keras.models.load_model(
    MODEL_PATH
)

labels = np.load(
    LABEL_PATH,
    allow_pickle=True
)

print("Dynamic model loaded successfully.")

print("Classes:")

for i, label in enumerate(labels):
    print(f"{i} -> {label}")


# ============================================================
# MEDIAPIPE
# ============================================================

mp_hands = mp.solutions.hands

hands = mp_hands.Hands(
    static_image_mode=True,
    max_num_hands=1,
    min_detection_confidence=0.5
)


# ============================================================
# EXTRACT LANDMARKS
# ============================================================

def extract_landmarks(frame):

    rgb = cv2.cvtColor(
        frame,
        cv2.COLOR_BGR2RGB
    )

    results = hands.process(rgb)

    if not results.multi_hand_landmarks:
        return None

    hand = results.multi_hand_landmarks[0]

    features = []

    for landmark in hand.landmark:

        features.extend([
            landmark.x,
            landmark.y,
            landmark.z
        ])

    return features


# ============================================================
# VIDEO → 30 × 63
# ============================================================

def extract_video_sequence(video_path):

    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():

        raise ValueError(
            "Could not open video."
        )

    total_frames = int(
        cap.get(cv2.CAP_PROP_FRAME_COUNT)
    )

    if total_frames <= 0:

        cap.release()

        raise ValueError(
            "Video contains no frames."
        )

    # Select exactly 30 frames
    frame_indices = np.linspace(
        0,
        total_frames - 1,
        MAX_FRAMES
    ).astype(int)

    sequence = []

    for frame_index in frame_indices:

        cap.set(
            cv2.CAP_PROP_POS_FRAMES,
            int(frame_index)
        )

        success, frame = cap.read()

        if not success:
            continue

        features = extract_landmarks(
            frame
        )

        if features is not None:

            sequence.append(
                features
            )

    cap.release()

    if len(sequence) == 0:

        raise ValueError(
            "No hand detected in the video."
        )

    sequence = np.array(
        sequence,
        dtype=np.float32
    )

    # --------------------------------------------------------
    # Padding
    # --------------------------------------------------------

    if len(sequence) < MAX_FRAMES:

        last_frame = sequence[-1]

        padding_count = (
            MAX_FRAMES - len(sequence)
        )

        padding = np.repeat(
            last_frame[np.newaxis, :],
            padding_count,
            axis=0
        )

        sequence = np.vstack([
            sequence,
            padding
        ])

    # --------------------------------------------------------
    # Truncation
    # --------------------------------------------------------

    elif len(sequence) > MAX_FRAMES:

        sequence = sequence[
            :MAX_FRAMES
        ]

    # --------------------------------------------------------
    # Safety check
    # --------------------------------------------------------

    if sequence.shape != (
        MAX_FRAMES,
        FEATURES_PER_FRAME
    ):

        raise ValueError(
            f"Invalid sequence shape: "
            f"{sequence.shape}"
        )

    return sequence


# ============================================================
# PREDICTION
# ============================================================

def predict_video(video_path):

    sequence = extract_video_sequence(
        video_path
    )

    # Add batch dimension
    input_data = np.expand_dims(
        sequence,
        axis=0
    )

    # Shape:
    # (1, 30, 63)

    probabilities = model.predict(
        input_data,
        verbose=0
    )[0]

    predicted_index = int(
        np.argmax(probabilities)
    )

    prediction = str(
        labels[predicted_index]
    )

    confidence = float(
        probabilities[predicted_index]
    )

    return {
        "prediction": prediction,
        "confidence": round(
            confidence * 100,
            2
        ),
        "sequence_shape": list(
            sequence.shape
        )
    }