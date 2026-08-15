import { Navigate, Outlet } from "react-router";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../lib/types";

// M4 Day 1 fix — ProtectedRoute only checks "is logged in", not "is this
// role allowed here". Any authenticated user could type /trainer or /admin
// into the URL bar and see it, regardless of their actual role. This wraps
// role-specific route groups (Instructor, Accessibility Trainer, Admin)
// and redirects anyone whose role isn't in `allow` back to their own home.
const ROLE_HOME: Record<Role, string> = {
  learner: "/dashboard",
  instructor: "/instructor",
  trainer: "/trainer",
  admin: "/admin",
};

export function RoleRoute({ allow }: { allow: Role[] }) {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-muted-foreground text-sm">
        Loading...
      </div>
    );
  }

  if (!allow.includes(role)) {
    return <Navigate to={ROLE_HOME[role] ?? "/dashboard"} replace />;
  }

  return <Outlet />;
}