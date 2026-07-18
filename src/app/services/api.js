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
    return delay({ id: "mock-user-1", name, email, role });
  }
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, role }),
  });
}

export async function loginUser({ email, password }) {
  if (USE_MOCKS) {
    const data = { token: "mock-jwt-token", role: "learner", email };
    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.role);
    return delay(data);
  }
  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem("token", data.token);
  localStorage.setItem("role", data.role);
  return data;
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
      { id: "1", title: "Alphabet Basics", level: "Beginner", lessons: 26 },
      { id: "2", title: "Numbers 1-20", level: "Beginner", lessons: 20 },
      { id: "3", title: "Everyday Phrases", level: "Intermediate", lessons: 15 },
    ]);
  }
  return request("/courses");
}

export async function getCourseById(id) {
  if (USE_MOCKS) {
    return delay({ id, title: "Alphabet Basics", level: "Beginner", lessons: 26 });
  }
  return request(`/courses/${id}`);
}

export async function getLessons() {
  if (USE_MOCKS) {
    return delay([
      { id: "1", title: "Letter A", courseId: "1" },
      { id: "2", title: "Letter B", courseId: "1" },
    ]);
  }
  return request("/lessons");
}

export async function getLessonById(id) {
  if (USE_MOCKS) {
    return delay({ id, title: "Letter A", courseId: "1" });
  }
  return request(`/lessons/${id}`);
}
