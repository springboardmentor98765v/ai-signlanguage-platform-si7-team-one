// Business Logic service client — Practice/Assessment/Feedback/Analytics/
// Certificate/Recommendation/Progress. Runs standalone on port 8002 (dev),
// separate from Intern 2's backend (8000) and Intern 3's AI service (8001).
// Confirmed against real routers + schemas (2026-07-30):
//   routers/practice.py, assessment.py, feedback.py, analytics.py,
//   progress.py, certificate.py, leaderboard.py, notification.py,
//   export.py, recommendation.py + matching schemas.
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
// ── Analytics (M2 Day 9) ──────────────────────────────────────────────────
// Confirmed: GET /analytics/{user_id} -> AnalyticsOut
// { user_id, total_sessions, lessons_completed, average_accuracy, weak_signs[] }
export async function getUserAnalytics(userId) {
  if (BUSINESS_USE_MOCKS) {
    return delay({
      user_id: userId,
      total_sessions: 24,
      lessons_completed: 18,
      average_accuracy: 91,
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
        { week_label: "Wk 1", sessions_count: 3, average_accuracy: 72, weak_signs: ["R", "X"] },
        { week_label: "Wk 2", sessions_count: 4, average_accuracy: 78, weak_signs: ["M", "N"] },
        { week_label: "Wk 3", sessions_count: 5, average_accuracy: 83, weak_signs: ["Q"] },
        { week_label: "Wk 4", sessions_count: 6, average_accuracy: 88, weak_signs: [] },
        { week_label: "Wk 5", sessions_count: 4, average_accuracy: 91, weak_signs: [] },
      ],
      improvement_rate: 19,
      current_week_accuracy: 91,
      previous_week_accuracy: 88,
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
      average_accuracy: 91,
      grade: "A",
      distinct_signs_practiced: 18,
      weak_signs: ["R", "M", "N", "Q", "X"],
      strong_signs: ["A", "B", "C", "D", "E", "L", "Y"],
      current_week_accuracy: 91,
      improvement_rate: 19,
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
export async function getRecommendations(userId) {
  if (BUSINESS_USE_MOCKS) {
    return {
      user_id: userId,
      recommendations: [],
      total_recommended: 0,
    };
  }
  return businessRequest(`/recommendations/${userId}`);
}
// ── M3: Gamification / Leaderboard / Notifications / Export ─────────────
export async function getGamification(userId) {
  if (BUSINESS_USE_MOCKS) {
    return delay({
      user_id: userId,
      streak: { current_streak: 14, longest_streak: 21, last_practiced_date: new Date().toISOString() },
      badges: [],
      total_badges_earned: 0,
    });
  }
  return businessRequest(`/gamification/${userId}`);
}

export async function getLeaderboard(rankBy = "accuracy") {
  if (BUSINESS_USE_MOCKS) {
    return delay({
      rank_by: rankBy,
      entries: [],
      total_learners: 0,
    });
  }
  return businessRequest(`/leaderboard?rank_by=${encodeURIComponent(rankBy)}`);
}

export async function getNotifications(userId) {
  if (BUSINESS_USE_MOCKS) {
    return delay({
      user_id: userId,
      notifications: [],
      unread_count: 0,
      total: 0,
    });
  }
  return businessRequest(`/notifications/${userId}`);
}

export async function markNotificationsRead(userId) {
  if (BUSINESS_USE_MOCKS) {
    return delay({
      user_id: userId,
      notifications: [],
      unread_count: 0,
      total: 0,
    });
  }
  return businessRequest(`/notifications/${userId}/read`, { method: "POST" });
}

export async function triggerNotifications(userId) {
  if (BUSINESS_USE_MOCKS) {
    return delay({
      user_id: userId,
      notifications: [],
      unread_count: 0,
      total: 0,
    });
  }
  return businessRequest(`/notifications/${userId}/trigger`, { method: "POST" });
}

export async function downloadLearnerProgressExport(userId, format = "csv") {
  if (BUSINESS_USE_MOCKS) {
    return delay(null);
  }
  const token = localStorage.getItem("token");
  const res = await fetch(`${BUSINESS_BASE_URL}/export/${userId}/progress?format=${encodeURIComponent(format)}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`Export failed: ${res.status}`);
  return res.blob();
}

export async function downloadClassSummaryExport(format = "csv") {
  if (BUSINESS_USE_MOCKS) {
    return delay(null);
  }
  const token = localStorage.getItem("token");
  const res = await fetch(`${BUSINESS_BASE_URL}/export/class/summary?format=${encodeURIComponent(format)}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`Class export failed: ${res.status}`);
  return res.blob();
}

// GET /export/class/summary?format=csv|excel -> file blob (instructor use)
export async function exportClassSummary(format = "csv") {
  if (BUSINESS_USE_MOCKS) {
    const csv = "Student,Accuracy,Streak\nMarcus Johnson,88,7\nPriya Patel,62,2";
    return new Blob([csv], { type: "text/csv" });
  }
  const token = localStorage.getItem("token");
  const res = await fetch(`${BUSINESS_BASE_URL}/export/class/summary?format=${format}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Export failed: ${res.status}`);
  return res.blob();
}
// ── M4 Day 3: Accessibility Trainer Analytics ────────────────────────────
// Confirmed against real router + schema (trainer_analytics.py):
//   GET /trainer/{trainer_id}/dashboard -> TrainerDashboardOut
//   { trainer_id, assigned_learners_count, avg_sessions_per_week,
//     avg_assessment_score, certified_count, low_engagement_count,
//     learners: [{ learner_id, sessions_this_week, engagement_level,
//       avg_assessment_score, skill_development_trend (nullable),
//       certification_status, highest_certified_level }] }
export async function getTrainerDashboard(trainerId) {
  if (BUSINESS_USE_MOCKS) {
    return delay({
      trainer_id: trainerId,
      assigned_learners_count: 5,
      avg_sessions_per_week: 4.2,
      avg_assessment_score: 79.4,
      certified_count: 2,
      low_engagement_count: 1,
      learners: [],
    });
  }
  return businessRequest(`/trainer/${trainerId}/dashboard`);
}

// POST /trainer/assign — body { trainer_id: UUID, learner_id: UUID }
export async function assignLearnerToTrainer(trainerId, learnerId) {
  if (BUSINESS_USE_MOCKS) {
    return delay({ trainer_id: trainerId, learner_id: learnerId, assigned_at: new Date().toISOString() });
  }
  return businessRequest("/trainer/assign", {
    method: "POST",
    body: JSON.stringify({ trainer_id: trainerId, learner_id: learnerId }),
  });
}


// ─────────────────────────────────────────────────────────────────────────────
// M4 DAY 3 ADDITIONS TO businessApi.js
// Paste these blocks at the END of the existing businessApi.js file,
// after the last `assignLearnerToTrainer` function.
//
// All shapes confirmed from real routers + schemas (2026-08-15):
//   app/routers/certification.py, app/schemas/certification.py
//   app/routers/export.py  (learning/assessment/accuracy/certification-report)
// ─────────────────────────────────────────────────────────────────────────────

// ── M4: Certification Exam ───────────────────────────────────────────────────
// Confirmed against real router (certification.py) + schemas (certification.py).
//
// Exam flow:
//   1. GET /certification/levels           → list of 4 levels with thresholds
//   2. POST /certification/start           → CertificationExamOut { exam_id, required_signs, ... }
//   3. POST /certification/attempt (×N)    → CertificationAttemptResultOut
//   4. POST /certification/{exam_id}/complete → CertificationResultOut { passed, score, ... }
//   5. POST /certification/{exam_id}/certificate → PDF blob (only if passed)

// GET /certification/levels
// Returns: [{ level, num_signs, pass_threshold, description }]
export async function getCertificationLevels() {
  if (BUSINESS_USE_MOCKS) {
    return delay([
      { level: "beginner",     num_signs: 5,  pass_threshold: 0.7,  description: "Signs A–E. 70% weighted-score threshold." },
      { level: "intermediate", num_signs: 10, pass_threshold: 0.75, description: "Signs A–J. 75% weighted-score threshold." },
      { level: "advanced",     num_signs: 18, pass_threshold: 0.8,  description: "Signs A–R. 80% weighted-score threshold." },
      { level: "professional", num_signs: 26, pass_threshold: 0.85, description: "Full alphabet A–Z. 85% weighted-score threshold." },
    ]);
  }
  return businessRequest("/certification/levels");
}

// POST /certification/start — body { user_id: UUID, level: CertificationLevel }
// Returns: CertificationExamOut {
//   exam_id, user_id, level, required_signs: string[], status, started_at
// }
export async function startCertificationExam(userId, level) {
  if (BUSINESS_USE_MOCKS) {
    const signsMap = {
      beginner: ["A", "B", "C", "D", "E"],
      intermediate: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
      advanced: ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R"],
      professional: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
    };
    return delay({
      exam_id: "00000000-0000-0000-0000-000000000099",
      user_id: userId,
      level,
      required_signs: signsMap[level] ?? ["A", "B", "C", "D", "E"],
      status: "in_progress",
      started_at: new Date().toISOString(),
    });
  }
  return businessRequest("/certification/start", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, level }),
  });
}

// POST /certification/attempt — body {
//   exam_id: UUID, expected_sign: string, predicted_sign: string,
//   confidence: float (0.0–1.0), hold_seconds?: float
// }
// Returns: CertificationAttemptResultOut {
//   exam_id, expected_sign, predicted_sign, is_correct, attempt_score,
//   signs_completed, signs_remaining, exam_status
// }
export async function recordCertificationAttempt(examId, expectedSign, predictedSign, confidence, holdSeconds = null) {
  if (BUSINESS_USE_MOCKS) {
    const isCorrect = predictedSign === expectedSign;
    return delay({
      exam_id: examId,
      expected_sign: expectedSign,
      predicted_sign: predictedSign,
      is_correct: isCorrect,
      attempt_score: isCorrect ? 88 : 40,
      signs_completed: 1,
      signs_remaining: 4,
      exam_status: "in_progress",
    });
  }
  return businessRequest("/certification/attempt", {
    method: "POST",
    body: JSON.stringify({
      exam_id: examId,
      expected_sign: expectedSign,
      predicted_sign: predictedSign,
      confidence,
      hold_seconds: holdSeconds,
    }),
  });
}

// POST /certification/{exam_id}/complete
// Returns: CertificationResultOut {
//   exam_id, user_id, level, score, accuracy_percentage,
//   correct_predictions, total_predictions, pass_threshold,
//   passed, completed_at, certificate_id?
// }
export async function completeCertificationExam(examId) {
  if (BUSINESS_USE_MOCKS) {
    return delay({
      exam_id: examId,
      user_id: "00000000-0000-0000-0000-000000000001",
      level: "beginner",
      score: 82.5,
      accuracy_percentage: 80.0,
      correct_predictions: 4,
      total_predictions: 5,
      pass_threshold: 70.0,
      passed: true,
      completed_at: new Date().toISOString(),
      certificate_id: null,
    });
  }
  return businessRequest(`/certification/${examId}/complete`, { method: "POST" });
}

// GET /certification/user/{user_id}/history
// Returns: CertificationResultOut[] (completed exams only)
export async function getCertificationHistory(userId) {
  if (BUSINESS_USE_MOCKS) {
    return delay([]);
  }
  return businessRequest(`/certification/user/${userId}/history`);
}

// POST /certification/{exam_id}/certificate — body { learner_name: string }
// Returns: PDF blob (only if exam passed; 403 if failed)
export async function downloadCertificationCertificate(examId, learnerName) {
  if (BUSINESS_USE_MOCKS) {
    // Return a tiny placeholder blob in mock mode
    const text = `[Mock Certification Certificate PDF for exam ${examId}]`;
    return delay(new Blob([text], { type: "application/pdf" }));
  }
  const res = await fetch(`${BUSINESS_BASE_URL}/certification/${examId}/certificate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ learner_name: learnerName }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Certification certificate failed: ${res.status} ${text}`);
  }
  return res.blob();
}

// ── M4: Report Downloads (all 5 types, PDF + Excel) ─────────────────────────
// Confirmed against real export router (export.py):
//   GET /export/{user_id}/learning?format=pdf|excel&learner_name=...
//   GET /export/{user_id}/assessment?format=pdf|excel&learner_name=...
//   GET /export/{user_id}/accuracy?format=pdf|excel&learner_name=...
//   GET /export/{user_id}/certification-report?format=pdf|excel&learner_name=...
// (Progress export was already in businessApi.js as downloadLearnerProgressExport)

async function downloadReportBlob(path) {
  const res = await fetch(`${BUSINESS_BASE_URL}${path}`);
  if (!res.ok) throw new Error(`Report download failed: ${res.status}`);
  return res.blob();
}

// Learning Report
export async function downloadLearningReport(userId, learnerName = "Learner", format = "pdf") {
  if (BUSINESS_USE_MOCKS) {
    const text = `[Mock Learning ${format.toUpperCase()} Report for ${learnerName}]`;
    const mime = format === "excel"
      ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      : "application/pdf";
    return delay(new Blob([text], { type: mime }));
  }
  return downloadReportBlob(
    `/export/${userId}/learning?format=${format}&learner_name=${encodeURIComponent(learnerName)}`
  );
}

// Assessment Report
export async function downloadAssessmentReport(userId, learnerName = "Learner", format = "pdf") {
  if (BUSINESS_USE_MOCKS) {
    const text = `[Mock Assessment ${format.toUpperCase()} Report for ${learnerName}]`;
    const mime = format === "excel"
      ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      : "application/pdf";
    return delay(new Blob([text], { type: mime }));
  }
  return downloadReportBlob(
    `/export/${userId}/assessment?format=${format}&learner_name=${encodeURIComponent(learnerName)}`
  );
}

// Accuracy Report
export async function downloadAccuracyReport(userId, learnerName = "Learner", format = "pdf") {
  if (BUSINESS_USE_MOCKS) {
    const text = `[Mock Accuracy ${format.toUpperCase()} Report for ${learnerName}]`;
    const mime = format === "excel"
      ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      : "application/pdf";
    return delay(new Blob([text], { type: mime }));
  }
  return downloadReportBlob(
    `/export/${userId}/accuracy?format=${format}&learner_name=${encodeURIComponent(learnerName)}`
  );
}

// Certification Report (NOT the certificate PDF — this is the Certification summary report)
export async function downloadCertificationReport(userId, learnerName = "Learner", format = "pdf") {
  if (BUSINESS_USE_MOCKS) {
    const text = `[Mock Certification ${format.toUpperCase()} Report for ${learnerName}]`;
    const mime = format === "excel"
      ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      : "application/pdf";
    return delay(new Blob([text], { type: mime }));
  }
  return downloadReportBlob(
    `/export/${userId}/certification-report?format=${format}&learner_name=${encodeURIComponent(learnerName)}`
  );
}