// Business Logic service client — Practice/Assessment/Feedback/Analytics/
// Certificate/Recommendation/Progress. Runs standalone on port 8002 (dev),
// separate from Intern 2's backend (8000) and Intern 3's AI service (8001).
// Confirmed against real routers + schemas (2026-07-20):
//   routers/practice.py, assessment.py, feedback.py + matching schemas.
// No auth on this service currently — same caveat as the AI service.

const BUSINESS_BASE_URL = "http://127.0.0.1:8002";
export const BUSINESS_USE_MOCKS = true; // flip to false once running locally

const delay = (v) => new Promise((r) => setTimeout(() => r(v), 300));

async function businessRequest(path, options = {}) {
  // Don't force Content-Type when sending FormData (file uploads) — the
  // browser needs to set its own multipart/form-data boundary, which a
  // hardcoded application/json header silently breaks (causes a 422 on
  // /practice/{id}/attempt since FastAPI can't parse the form fields).
  const isFormData = options.body instanceof FormData;
  const res = await fetch(`${BUSINESS_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Business service ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

// ── Practice sessions ────────────────────────────────────────────────────
// POST /practice/start — body { user_id: UUID, lesson_id: int }
export async function startPracticeSession(userId, lessonId) {
  if (BUSINESS_USE_MOCKS) {
    return delay({
      session_id: "00000000-0000-0000-0000-000000000001",
      user_id: userId, lesson_id: lessonId,
      status: "in_progress", started_at: new Date().toISOString(),
      ended_at: null, duration_seconds: null,
    });
  }
  return businessRequest("/practice/start", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, lesson_id: lessonId }),
  });
}

// POST /practice/end — body { session_id: UUID, status: "completed"|"abandoned" }
export async function endPracticeSession(sessionId, status = "completed") {
  if (BUSINESS_USE_MOCKS) {
    return delay({ session_id: sessionId, status, ended_at: new Date().toISOString() });
  }
  return businessRequest("/practice/end", {
    method: "POST",
    body: JSON.stringify({ session_id: sessionId, status }),
  });
}

// POST /practice/{session_id}/attempt — multipart/form-data:
//   expected_sign (string), attempt_started_at (ISO string, optional), file (image)
// This is the REAL endpoint the Practice screen should call — it forwards
// the frame to Intern 3's AI service internally AND records the assessment
// in one call, unlike calling the AI service directly (which skips scoring).
export async function submitPracticeAttempt(sessionId, expectedSign, imageBlob, attemptStartedAt) {
  if (BUSINESS_USE_MOCKS) {
    const correct = Math.random() > 0.3;
    return delay({
      success: true,
      predicted_sign: correct ? expectedSign : "X",
      confidence: correct ? 0.88 : 0.52,
      hold_seconds: 1.4,
      assessment: {
        session_id: sessionId,
        correct_predictions: correct ? 1 : 0,
        total_predictions: 1,
        accuracy_percentage: correct ? 100 : 0,
        score: correct ? 88 : 40,
        grade: correct ? "A" : "C",
        completed_at: null,
      },
    });
  }
  const formData = new FormData();
  formData.append("expected_sign", expectedSign);
  if (attemptStartedAt) formData.append("attempt_started_at", attemptStartedAt);
  formData.append("file", imageBlob, "frame.jpg");
  return businessRequest(`/practice/${sessionId}/attempt`, { method: "POST", body: formData });
}

// ── Assessment ────────────────────────────────────────────────────────────
export async function getAssessment(sessionId) {
  if (BUSINESS_USE_MOCKS) {
    return delay({
      session_id: sessionId, correct_predictions: 3, total_predictions: 4,
      accuracy_percentage: 75, score: 78, grade: "B", completed_at: null,
    });
  }
  return businessRequest(`/assessment/${sessionId}`);
}

// ── Feedback ──────────────────────────────────────────────────────────────
// POST /feedback/generate — body { session_id: UUID, expected_sign?: string }
// Requires an assessment to already exist for the session (i.e. at least
// one submitPracticeAttempt() call must have happened first).
export async function generateFeedback(sessionId, expectedSign) {
  if (BUSINESS_USE_MOCKS) {
    return delay({
      session_id: sessionId,
      feedback: [
        { feedback_type: "praise", message: "Nice work holding the sign steady.", severity: "low" },
        { feedback_type: "improvement", message: "Try keeping your fingers a bit closer together.", severity: "medium" },
      ],
      generated_at: new Date().toISOString(),
    });
  }
  return businessRequest("/feedback/generate", {
    method: "POST",
    body: JSON.stringify({ session_id: sessionId, expected_sign: expectedSign }),
  });
}

export async function getFeedback(sessionId) {
  if (BUSINESS_USE_MOCKS) {
    return delay({
      session_id: sessionId,
      feedback: [{ feedback_type: "praise", message: "Nice work!", severity: "low" }],
      generated_at: new Date().toISOString(),
    });
  }
  return businessRequest(`/feedback/${sessionId}`);
}