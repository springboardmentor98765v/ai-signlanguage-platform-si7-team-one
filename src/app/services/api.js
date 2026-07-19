// Central API layer — matches Intern 2's API_CONTRACT.md exactly.
// Base URL http://localhost:8000. Every function below returns mock data
// today and is a one-line swap to the real fetch call once the backend
// endpoint is confirmed live (SRS Day 6 task). Toggle per-function or
// globally with USE_MOCKS.

const BASE_URL = "http://localhost:8000";
export const USE_MOCKS = true; // flip to false once backend is reachable

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

const MOCK_DELAY = 300;
const delay = (v) => new Promise((r) => setTimeout(() => r(v), MOCK_DELAY));

// ── Auth ──────────────────────────────────────────────────────────────────
export async function registerUser({ name, email, password, role }) {
  if (USE_MOCKS) {
    return delay({ message: "User registered successfully" });
  }
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, role }),
  });
}

export async function loginUser({ email, password }) {
  if (USE_MOCKS) {
    const data = { access_token: "mock-jwt-token", token_type: "Bearer" };
    localStorage.setItem("token", data.access_token);
    const profile = await getProfile();
    localStorage.setItem("role", profile.role);
    return { ...data, role: profile.role };
  }
  // Real contract only returns { access_token, token_type } — no role.
  // Role has to come from a follow-up /auth/profile call.
  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem("token", data.access_token);
  const profile = await getProfile();
  localStorage.setItem("role", profile.role);
  return { ...data, role: profile.role };
}

export async function getProfile() {
  if (USE_MOCKS) {
    return delay({
      name: "Maya Chen",
      email: "maya.chen@example.com",
      role: localStorage.getItem("role") || "learner",
    });
  }
  return request("/auth/profile");
}

export function logoutUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
}

// ── Courses / Lessons ────────────────────────────────────────────────────
export async function getCourses() {
  if (USE_MOCKS) {
    return delay([
      { id: "1", title: "ASL Fundamentals", difficulty: "Beginner", lessons: 24,
        desc: "Core signs, alphabet, and basic phrases.", hrs: "6 hrs", pct: 100, cat: "ASL" },
      { id: "2", title: "ASL Intermediate", difficulty: "Intermediate", lessons: 32,
        desc: "Emotions, questions, and sentence structure.", hrs: "9 hrs", pct: 68, cat: "ASL" },
      { id: "3", title: "ASL Advanced Conversation", difficulty: "Advanced", lessons: 28,
        desc: "Classifiers, complex grammar, and fluent ASL.", hrs: "12 hrs", pct: 0, cat: "ASL" },
      { id: "4", title: "BSL Basics", difficulty: "Beginner", lessons: 20,
        desc: "Introduction to British Sign Language.", hrs: "5 hrs", pct: 0, cat: "BSL" },
      { id: "5", title: "Medical Sign Language", difficulty: "Intermediate", lessons: 18,
        desc: "Healthcare vocabulary for clinical environments.", hrs: "4 hrs", pct: 12, cat: "Specialized" },
      { id: "6", title: "Numbers & Math Signs", difficulty: "Beginner", lessons: 10,
        desc: "Counting, arithmetic, and quantities.", hrs: "2 hrs", pct: 45, cat: "ASL" },
    ]);
  }
  // Real contract returns only { id, title, difficulty } per course — no
  // desc/hrs/pct/cat/lessons yet. CourseCatalog's toUiCourse() already
  // fills safe defaults for whatever fields are missing.
  return request("/courses");
}

export async function getCourseById(id) {
  if (USE_MOCKS) {
    return delay({ id, title: "Alphabet Basics", difficulty: "Beginner", description: "Learn the alphabet in sign language." });
  }
  return request(`/courses/${id}`);
}

export async function getLessons() {
  if (USE_MOCKS) {
    return delay([
      { id: "1", course_id: "1", lesson_name: "Letter A" },
      { id: "2", course_id: "1", lesson_name: "Letter B" },
    ]);
  }
  return request("/lessons");
}

export async function getLessonById(id) {
  if (USE_MOCKS) {
    return delay({ id, course_id: "1", lesson_name: "Letter A" });
  }
  return request(`/lessons/${id}`);
}