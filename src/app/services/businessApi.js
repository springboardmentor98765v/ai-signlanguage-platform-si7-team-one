// Business Logic service client — Practice/Assessment/Feedback/Analytics/
// Certificate/Recommendation/Progress. Runs standalone on port 8002 (dev),
// separate from Intern 2's backend (8000) and Intern 3's AI service (8001).
// Confirmed against real routers + schemas (2026-07-20):
//   routers/practice.py, assessment.py, feedback.py + matching schemas.
// No auth on this service currently — same caveat as the AI service.

const BUSINESS_BASE_URL = "http://127.0.0.1:8002";
export const BUSINESS_USE_MOCKS = false; // flip to false once running locally

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
// ── Analytics (M2 Day 9) ──────────────────────────────────────────────────
// Confirmed: GET /analytics/{user_id} -> AnalyticsOut
// { user_id, total_sessions, lessons_completed, average_accuracy, weak_signs[] }
export async function getUserAnalytics(userId) {
  if (BUSINESS_USE_MOCKS) {
    return delay({
      user_id: userId,
      total_sessions: 24,
      lessons_completed: 18,
      average_accuracy: 0.91,
      weak_signs: ["R", "M", "N", "Q", "X"],
    });
  }
  return businessRequest(`/analytics/${userId}`);
}

// Confirmed: GET /analytics/{user_id}/weekly -> WeeklyAnalyticsOut
// { user_id, weeks: [{ week_label, sessions_count, average_accuracy, weak_signs }],
//   improvement_rate, current_week_accuracy, previous_week_accuracy }
export async function getWeeklyAnalytics(userId) {
  if (BUSINESS_USE_MOCKS) {
    return delay({
      user_id: userId,
      weeks: [
        { week_label: "Wk 1", sessions_count: 3, average_accuracy: 0.72, weak_signs: ["R", "X"] },
        { week_label: "Wk 2", sessions_count: 4, average_accuracy: 0.78, weak_signs: ["M", "N"] },
        { week_label: "Wk 3", sessions_count: 5, average_accuracy: 0.83, weak_signs: ["Q"] },
        { week_label: "Wk 4", sessions_count: 6, average_accuracy: 0.88, weak_signs: [] },
        { week_label: "Wk 5", sessions_count: 4, average_accuracy: 0.91, weak_signs: [] },
      ],
      improvement_rate: 0.19,
      current_week_accuracy: 0.91,
      previous_week_accuracy: 0.88,
    });
  }
  return businessRequest(`/analytics/${userId}/weekly`);
}

// ── Progress Report (M2 Day 9) ────────────────────────────────────────────
// Confirmed: GET /progress/{user_id} -> ProgressReportOut
// { total_sessions, completed_sessions, total_practice_time_seconds,
//   average_accuracy, grade, distinct_signs_practiced, weak_signs[],
//   strong_signs[], current_week_accuracy, improvement_rate,
//   recommended_for_practice[], certificate_eligible, certificate_reasons_failed[] }
export async function getProgressReport(userId) {
  if (BUSINESS_USE_MOCKS) {
    return delay({
      user_id: userId,
      generated_at: new Date().toISOString(),
      total_sessions: 24,
      completed_sessions: 21,
      total_practice_time_seconds: 86400,
      average_accuracy: 0.91,
      grade: "A",
      distinct_signs_practiced: 18,
      weak_signs: ["R", "M", "N", "Q", "X"],
      strong_signs: ["A", "B", "C", "D", "E", "L", "Y"],
      current_week_accuracy: 0.91,
      improvement_rate: 0.19,
      recommended_for_practice: ["R", "M", "N"],
      certificate_eligible: false,
      certificate_reasons_failed: ["Average accuracy below 80% for letters R, M, N"],
    });
  }
  return businessRequest(`/progress/${userId}`);
}

// POST /progress/{user_id}/pdf — downloads a PDF progress report.
// Returns raw PDF bytes; caller creates an object URL and triggers download.
export async function downloadProgressPDF(userId, learnerName) {
  if (BUSINESS_USE_MOCKS) {
    // Can't generate a real PDF in mock mode — just resolve silently.
    return delay(null);
  }
  const token = localStorage.getItem("token");
  const res = await fetch(`${BUSINESS_BASE_URL}/progress/${userId}/pdf`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ learner_name: learnerName }),
  });
  if (!res.ok) throw new Error(`Progress PDF failed: ${res.status}`);
  return res.blob();
}

// ── Certificates (M2 Day 9) ───────────────────────────────────────────────
// GET /certificates/{user_id}/eligibility -> EligibilityOut
// { user_id, eligible, reasons_failed[], criteria_met[], checked_at }
export async function getCertificateEligibility(userId) {
  if (BUSINESS_USE_MOCKS) {
    return delay({
      user_id: userId,
      eligible: false,
      reasons_failed: ["Average accuracy below 80% for letters R, M, N"],
      criteria_met: ["Completed minimum 10 sessions", "Practiced at least 15 signs"],
      checked_at: new Date().toISOString(),
    });
  }
  return businessRequest(`/certificates/${userId}/eligibility`);
}

// POST /certificates/{user_id}/generate — returns PDF blob.
export async function generateCertificate(userId, learnerName) {
  if (BUSINESS_USE_MOCKS) {
    return delay(null);
  }
  const token = localStorage.getItem("token");
  const res = await fetch(`${BUSINESS_BASE_URL}/certificates/${userId}/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ learner_name: learnerName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail?.message ?? `Certificate generation failed: ${res.status}`);
  }
  return res.blob();
}