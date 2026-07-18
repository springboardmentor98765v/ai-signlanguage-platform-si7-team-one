import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Role } from "../lib/types";
import { getProfile, logoutUser } from "../services/api";

interface AuthState {
  isAuthenticated: boolean;
  role: Role;
  loading: boolean;
  login: (role: Role, token?: string) => void;
  logout: () => void;
  setRole: (r: Role) => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRoleState] = useState<Role>("learner");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role") as Role | null;
    if (token) {
      setIsAuthenticated(true);
      setRoleState(storedRole || "learner");
      getProfile().catch(() => {
        // token invalid/expired — force logout
        logoutUser();
        setIsAuthenticated(false);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (r: Role, token?: string) => {
    if (token) localStorage.setItem("token", token);
    localStorage.setItem("role", r);
    setRoleState(r);
    setIsAuthenticated(true);
  };

  const logout = () => {
    logoutUser();
    setIsAuthenticated(false);
  };

  const setRole = (r: Role) => {
    localStorage.setItem("role", r);
    setRoleState(r);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, role, loading, login, logout, setRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
