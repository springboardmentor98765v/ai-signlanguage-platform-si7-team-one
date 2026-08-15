// AI/CV service client — talks directly to Intern 3's standalone
// FastAPI service (NOT through Intern 2's backend — the backend's
// /predict/ proxy only wraps prediction, not history/analytics/dashboard,
// so those 3 have to be called here directly). No auth on this service —
// it's a single shared in-memory history across everyone hitting it,
// resets on server restart. Confirmed against the real source
// (src/api.py, history.py, analytics.py, dashboard.py) on 2026-07-19.

const AI_BASE_URL = "http://127.0.0.1:8001";
export const AI_USE_MOCKS = true; // flip to false once you/team have this running locally

const delay = (v) => new Promise((r) => setTimeout(() => r(v), 400));

async function aiRequest(path, options = {}) {
  const res = await fetch(`${AI_BASE_URL}${path}`, options);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`AI service ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

// Send a captured frame (Blob/File) to /predict. Confirmed response shape:
// success + prediction + confidence + confidence_level + status + feedback
// + processing_time_ms + hand_position + hand_distance + gesture_quality
// + suggestion — or { success: false, message } if no hand / invalid image.
export async function predictSign(imageBlob) {
  if (AI_USE_MOCKS) {
    return delay({
      success: true,
      prediction: "A",
      confidence: 0.91,
      confidence_level: "High",
      status: "correct",
      feedback: "Great job! Your sign was recognized clearly.",
      processing_time_ms: 42.3,
      hand_position: "centered",
      hand_distance: "optimal",
      gesture_quality: "good",
      suggestion: "Keep your hand steady for best results.",
    });
  }
  const formData = new FormData();
  formData.append("file", imageBlob, "frame.jpg");
  return aiRequest("/predict", { method: "POST", body: formData });
}

export async function getHistory() {
  if (AI_USE_MOCKS) {
    return delay({ total_predictions: 0, history: [] });
  }
  return aiRequest("/history");
}

export async function clearHistory() {
  if (AI_USE_MOCKS) {
    return delay({ message: "Prediction history cleared successfully." });
  }
  return aiRequest("/history", { method: "DELETE" });
}

export async function getAnalytics() {
  if (AI_USE_MOCKS) {
    return delay({
      total_predictions: 0,
      average_confidence: 0,
      high_confidence_predictions: 0,
      low_confidence_predictions: 0,
      most_predicted_sign: null,
    });
  }
  return aiRequest("/analytics");
}

export async function getDashboard() {
  if (AI_USE_MOCKS) {
    return delay({
      analytics: {
        total_predictions: 0, average_confidence: 0,
        high_confidence_predictions: 0, low_confidence_predictions: 0,
        most_predicted_sign: null,
      },
      recent_predictions: [],
    });
  }
  return aiRequest("/dashboard");
}