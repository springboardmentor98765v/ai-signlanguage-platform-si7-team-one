import { BrowserRouter, Routes, Route, Navigate, useOutletContext, useNavigate } from "react-router";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./ThemeProvider";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { RoleRoute } from "./routes/RoleRoute";
import { AppShell } from "./components/layout/AppShell";
import type { Screen, Role } from "./lib/types";
import Leaderboard from "./pages/Leaderboard";
import LoginScreen from "./pages/LoginScreen";
import SignupScreen from "./pages/SignupScreen";
import OnboardingScreen from "./pages/OnboardingScreen";
import LearnerDashboard from "./pages/LearnerDashboard";
import CourseCatalog from "./pages/CourseCatalog";
import LessonView from "./pages/LessonView";
import PracticeScreen from "./pages/PracticeScreen";
import AssessmentScreen from "./pages/AssessmentScreen";
import FeedbackScreen from "./pages/FeedbackScreen";
import ProgressAnalytics from "./pages/ProgressAnalytics";
import Certificates from "./pages/Certificates";
import InstructorDashboard from "./pages/InstructorDashboard";
import CourseManagement from "./pages/CourseManagement";
import StudentDetail from "./pages/StudentDetail";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import SystemMonitoring from "./pages/SystemMonitoring";
import NotificationsPanel from "./pages/NotificationsPanel";
import SettingsScreen from "./pages/SettingsScreen";
import CameraPermissionScreen from "./pages/CameraPermissionScreen";
import { SCREEN_PATH } from "./lib/nav";
import AccessibilityTrainerDashboard from "./pages/AccessibilityTrainerDashboard";
import CertificationExam from "./pages/CertificationExam";
// Small bridge: AppShell passes `go` down via Outlet context; pages that
// were written to take a `go` prop directly (unchanged from the original
// prototype) read it off that context here instead of needing edits.
function GoPage({ Component }: { Component: React.ComponentType<{ go: (s: Screen) => void }> }) {
  const { go } = useOutletContext<{ go: (s: Screen) => void }>();
  return <Component go={go} />;
}

// Real wiring for the three pre-login screens. onLogin/onSignup/onDone in
// the original prototype just flipped local `auth` state; now they call
// AuthContext and navigate to a real URL, and go through services/api.js
// (mocked today, real once Intern 2's endpoints are live — Day 6 task).
const ROLE_HOME: Record<Role, string> = {
  learner: "/dashboard",
  instructor: "/instructor",
  trainer: "/trainer",
  admin: "/admin",
};

function LoginRoute() {
  const { login } = useAuth();
  const navigate = useNavigate();
  return (
    <LoginScreen
      onLogin={(r: Role, token: string, userId?: string, fullName?: string) => {
        login(r, token, userId, fullName);
        navigate(ROLE_HOME[r] ?? "/dashboard");
      }}
      goSignup={() => navigate("/signup")}
    />
  );
}

function SignupRoute() {
  const { login } = useAuth();
  const navigate = useNavigate();
  return (
    <SignupScreen
      onSignup={(role: Role, token: string, userId: string) => {
        login(role, token, userId);
        navigate("/onboarding");
      }}
      goLogin={() => navigate("/login")}
    />
  );
}

function OnboardingRoute() {
  const { role } = useAuth();
  const navigate = useNavigate();
  return (
    <OnboardingScreen
      onDone={() => {
        navigate(ROLE_HOME[role] ?? "/dashboard");
      }}
    />
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public / auth screens */}
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/signup" element={<SignupRoute />} />
            <Route path="/onboarding" element={<OnboardingRoute />} />

            {/* Protected app screens — all roles, gated by ProtectedRoute */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppShell />}>
                <Route path="/dashboard" element={<GoPage Component={LearnerDashboard} />} />
                <Route path="/courses" element={<GoPage Component={CourseCatalog} />} />
                <Route path="/courses/lesson" element={<GoPage Component={LessonView} />} />
                <Route path="/practice" element={<GoPage Component={PracticeScreen} />} />
                <Route path="/assessment" element={<GoPage Component={AssessmentScreen} />} />
                <Route path="/feedback" element={<GoPage Component={FeedbackScreen} />} />
                <Route path="/progress" element={<ProgressAnalytics />} />
                <Route path="/certificates" element={<GoPage Component={Certificates} />} />

                {/* Instructor-only */}
                <Route element={<RoleRoute allow={["instructor"]} />}>
                  <Route path="/instructor" element={<GoPage Component={InstructorDashboard} />} />
                  <Route path="/instructor/courses" element={<CourseManagement />} />
                  <Route path="/instructor/students" element={<StudentDetail />} />
                </Route>

                {/* Accessibility Trainer-only — M4 Day 1 fix: /trainer now points
                    at the real dashboard (learner engagement, skill development,
                    assessment analytics, certification monitoring) instead of the
                    old mock gesture-review console. */}
                <Route element={<RoleRoute allow={["trainer"]} />}>
                  <Route path="/trainer" element={<GoPage Component={AccessibilityTrainerDashboard} />} />
                </Route>

                {/* Admin-only */}
                <Route element={<RoleRoute allow={["admin"]} />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<UserManagement />} />
                  <Route path="/admin/system" element={<SystemMonitoring />} />
                </Route>

                <Route path="/notifications" element={<NotificationsPanel />} />
                <Route path="/settings" element={<SettingsScreen />} />
                <Route path="/camera-permission" element={<GoPage Component={CameraPermissionScreen} />} />

                <Route path="/leaderboard" element={<GoPage Component={Leaderboard} />} />
                <Route path="/certification-exam" element={<GoPage Component={CertificationExam} />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}