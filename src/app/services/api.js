// Central API layer — realigned against Intern 2's actual backend code
// (routers/auth.py, routers/courses.py) as of 2026-07-19, since the
// original API_CONTRACT.md doc turned out to be stale in several places.
// Base URL http://localhost:8000. Every function below returns mock data
// today and is a one-line swap to the real fetch call once the backend
// endpoint is confirmed live. Toggle per-function or globally with
// USE_MOCKS.
//
// M4 Day 5: BASE_URL now reads from VITE_API_URL env var so the production
// build points at the live deployed backend instead of localhost:8000.
// Set in .env.production: VITE_API_URL=https://your-backend.onrender.com

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
export const USE_MOCKS = false; // false = use real backend

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
// NOTE: realigned against Intern 2's actual routers/auth.py + courses.py
// (2026-07-19), which diverge from the original API_CONTRACT.md doc in
// several ways — see comments on each function below.
export async function registerUser({ name, email, password, role }) {
  if (USE_MOCKS) {
    return delay({
      user_id: "00000000-0000-0000-0000-000000000001",
      full_name: name,
      email,
      roles: ["learner"],
      created_at: new Date().toISOString(),
    });
  }
  // Real endpoint ignores `role` — every new user is created as "learner"
  // server-side (see DEFAULT_ROLE in auth.py). Field is full_name, not name.
  // Returns 201 + a full UserResponse, not just { message }.
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ full_name: name, email, password, role }),
  });
}

export async function loginUser({ email, password, role }) {
  if (USE_MOCKS) {
    const data = {
      access_token: "mock-jwt-token",
      token_type: "bearer",
      user: {
        user_id: "00000000-0000-0000-0000-000000000001",
        full_name: "Maya Chen",
        email,
        roles: [localStorage.getItem("role") || "learner"],
        created_at: new Date().toISOString(),
      },
    };
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("role", data.user.roles[0]);
    return { ...data, role: data.user.roles[0] };
  }
  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, role }),
  });
  localStorage.setItem("token", data.access_token);
  const returnedRole = data.user?.roles?.[0] ?? "learner";
  localStorage.setItem("role", returnedRole);
  return { ...data, role: returnedRole };
}

export async function getProfile() {
  if (USE_MOCKS) {
    return delay({
      user_id: "00000000-0000-0000-0000-000000000001",
      full_name: "Maya Chen",
      email: "maya.chen@example.com",
      roles: [localStorage.getItem("role") || "learner"],
      created_at: new Date().toISOString(),
    });
  }
  // Real response: UserResponse { user_id, full_name, email, roles: [], created_at }
  return request("/auth/profile");
}

export function logoutUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
}

export async function updateProfile({ fullName, email }) {
  if (USE_MOCKS) {
    return delay({
      user_id: "00000000-0000-0000-0000-000000000001",
      full_name: fullName,
      email,
      roles: [localStorage.getItem("role") || "learner"],
      created_at: new Date().toISOString(),
    });
  }
  return request("/auth/me", {
    method: "PUT",
    body: JSON.stringify({ full_name: fullName, email }),
  });
}

export async function changePassword({ oldPassword, newPassword }) {
  if (USE_MOCKS) {
    return delay({ message: "Password changed successfully." });
  }
  return request("/auth/me/password", {
    method: "PUT",
    body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
  });
}

// ── Courses / Lessons ────────────────────────────────────────────────────
export async function getCourses() {
  return delay([
    {
      id: "1", title: "ASL Fundamentals", difficulty: "Beginner", lessons: 24,
      desc: "Core signs, alphabet, and basic phrases.", hrs: "6 hrs", pct: 100, cat: "ASL"
    },
    {
      id: "2", title: "ASL Intermediate", difficulty: "Intermediate", lessons: 32,
      desc: "Emotions, questions, and sentence structure.", hrs: "9 hrs", pct: 68, cat: "ASL"
    },
    {
      id: "3", title: "ASL Advanced Conversation", difficulty: "Advanced", lessons: 28,
      desc: "Classifiers, complex grammar, and fluent ASL.", hrs: "12 hrs", pct: 0, cat: "ASL"
    },
    {
      id: "4", title: "BSL Basics", difficulty: "Beginner", lessons: 20,
      desc: "Introduction to British Sign Language.", hrs: "5 hrs", pct: 0, cat: "BSL"
    },
    {
      id: "5", title: "Medical Sign Language", difficulty: "Intermediate", lessons: 18,
      desc: "Healthcare vocabulary for clinical environments.", hrs: "4 hrs", pct: 12, cat: "Specialized"
    },
    {
      id: "6", title: "Numbers & Math Signs", difficulty: "Beginner", lessons: 10,
      desc: "Counting, arithmetic, and quantities.", hrs: "2 hrs", pct: 45, cat: "ASL"
    },
  ]);
}

export async function getCourseById(id) {
  return delay({ id, title: "Alphabet Basics", difficulty: "Beginner", description: "Learn the alphabet in sign language." });
}

export async function getLessons(moduleId) {
  if (USE_MOCKS) {
    return delay([
      {
        lesson_id: 1, module_id: 1, title: "Letter A", description: "Introduction to the sign for A",
        sequence_order: 1, difficulty_level: "beginner", is_published: true, created_at: new Date().toISOString()
      },
      {
        lesson_id: 2, module_id: 1, title: "Letter B", description: "Introduction to the sign for B",
        sequence_order: 2, difficulty_level: "beginner", is_published: true, created_at: new Date().toISOString()
      },
    ]);
  }
  const qs = moduleId ? `?module_id=${moduleId}` : "";
  return request(`/courses/lessons${qs}`);
}

export async function getLessonById(id) {
  if (USE_MOCKS) {
    return delay({
      lesson_id: id, module_id: 1, title: "Letter A", description: "Introduction to the sign for A",
      sequence_order: 1, difficulty_level: "beginner", is_published: true, created_at: new Date().toISOString()
    });
  }
  return request(`/courses/lessons/${id}`);
}