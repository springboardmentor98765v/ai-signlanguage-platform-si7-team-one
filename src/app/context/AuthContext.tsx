import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Role } from "../lib/types";
import { getProfile, logoutUser } from "../services/api";

interface AuthState {
  isAuthenticated: boolean;
  role: Role;
  userId: string | null; // real UUID from backend's UserResponse — needed by
                          // Business Logic's /practice/start (user_id: UUID)
  
  fullName: string | null;
  loading: boolean;
  login: (role: Role, token?: string, userId?: string, fullName?: string) => void;
  logout: () => void;
  setRole: (r: Role) => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRoleState] = useState<Role>("learner");
  const [userId, setUserId] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role") as Role | null;
    const storedUserId = localStorage.getItem("user_id");
    if (token) {
      setIsAuthenticated(true);
      setRoleState(storedRole || "learner");
      setUserId(storedUserId);
      getProfile().catch(() => {
        // token invalid/expired — force logout
        logoutUser();
        setIsAuthenticated(false);
      }).then((profile) => {
        if (profile?.full_name) setFullName(profile.full_name);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (r: Role, token?: string, uid?: string, name?: string) => {
    if (token) localStorage.setItem("token", token);
    localStorage.setItem("role", r);
    setRoleState(r);
    if (uid) {
      localStorage.setItem("user_id", uid);
      setUserId(uid);
    }
    if (name) setFullName(name);
    setIsAuthenticated(true);
  };

  const logout = () => {
    logoutUser();
    localStorage.removeItem("user_id");
    setUserId(null);
    setIsAuthenticated(false);
  };

  const setRole = (r: Role) => {
    localStorage.setItem("role", r);
    setRoleState(r);
  };

  return (
      <AuthContext.Provider value={{ isAuthenticated, role, userId, fullName, loading, login, logout, setRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}