// Central API layer — realigned against Intern 2's actual backend code
// (routers/auth.py, routers/courses.py) as of 2026-07-19, since the
// original API_CONTRACT.md doc turned out to be stale in several places.
// Base URL http://localhost:8000. Every function below returns mock data
// today and is a one-line swap to the real fetch call once the backend
// endpoint is confirmed live. Toggle per-function or globally with
// USE_MOCKS.

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
    body: JSON.stringify({ full_name: name, email, password,role }),
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
// ⚠️ MILESTONE 2, UNCONFIRMED: these two endpoints are Intern 2's own Day 2
// M2 task ("Update Profile API" + "Change Password API") — as of writing
// this, it's unknown whether they exist on main yet or what their exact
// path/shape is. Guessed at REST conventions (PATCH /auth/profile,
// POST /auth/change-password) matching the existing /auth/* pattern.
// MUST be re-verified against Intern 2's real code before flipping
// USE_MOCKS off for these two specifically — don't assume this guess is
// correct just because the rest of api.js has been careful about this.
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
// ⚠️ PRODUCT GAP: as of 2026-07-19, Intern 2's backend has NO course-level
// endpoint at all — only /courses/lessons (flat lesson list) and
// /courses/lessons/{id}. There is no /courses or /courses/{id} route.
// getCourses()/getCourseById() below stay mock-only until this is
// resolved with Intern 2 — CourseCatalog.tsx currently has no real data
// source to attach to. Flag this in stand-up before Day 7.
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
  // Confirmed via schemas/course.py: GET /courses/lessons (optional
  // ?module_id= filter), returns LessonResponse[] — { lesson_id, module_id,
  // title, description, sequence_order, difficulty_level, is_published,
  // created_at }.
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
  // Confirmed: GET /courses/lessons/{lesson_id} -> LessonResponse
  return request(`/courses/lessons/${id}`);
}