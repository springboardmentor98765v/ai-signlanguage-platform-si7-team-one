import { Outlet, useLocation, useNavigate } from "react-router";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { useAuth } from "../../context/AuthContext";
import { SCREEN_PATH, PATH_SCREEN } from "../../lib/nav";
import type { Screen } from "../../lib/types";

// Shared layout for every authenticated screen: Sidebar + TopBar + page
// content via <Outlet/>. Replaces the old renderScreen() switch in App.tsx.
// Pages keep their existing `go={(s: Screen) => void}` prop — go() here
// just translates a Screen into navigate(path), so no page internals had
// to change during the router migration.
export function AppShell() {
  const { role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const activeScreen: Screen = PATH_SCREEN[location.pathname] ?? "learner-dashboard";
  const go = (s: Screen) => navigate(SCREEN_PATH[s]);

  const fullHeight = ["practice", "assessment", "lesson"].includes(activeScreen);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar role={role} active={activeScreen} setScreen={go} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar role={role} screen={activeScreen} onLogout={handleLogout} />
        <main className={`flex-1 ${fullHeight ? "overflow-hidden" : "overflow-auto"}`}>
          <Outlet context={{ go }} />
        </main>
      </div>
    </div>
  );
}
