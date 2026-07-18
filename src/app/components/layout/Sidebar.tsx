import { Bell, Settings } from "lucide-react";
import type { Role, Screen } from "../../lib/types";
import { NAV } from "../../lib/nav";

export function Sidebar({
  role, active, setScreen,
}: {
  role: Role; active: Screen; setScreen: (s: Screen) => void;
}) {
  return (
    <div className="w-60 flex-shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      <div className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-sm text-primary-foreground">✋</div>
          <div>
            <div className="font-bold text-sidebar-foreground text-sm leading-none">SignPath AI</div>
            <div className="text-[11px] text-muted-foreground mt-1">v2.4.0</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto space-y-0.5">
        {NAV[role].map(({ screen, label, icon: Icon }) => (
          <button
            key={screen}
            onClick={() => setScreen(screen)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              active === screen
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
            }`}
          >
            <Icon size={16} strokeWidth={1.5} />
            {label}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-0.5">
        {([
          { screen: "notifications" as Screen, label: "Notifications", icon: Bell, badge: 3 },
          { screen: "settings" as Screen,      label: "Settings",      icon: Settings },
        ]).map(({ screen, label, icon: Icon, badge }) => (
          <button
            key={screen}
            onClick={() => setScreen(screen)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              active === screen
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
            }`}
          >
            <Icon size={16} strokeWidth={1.5} />
            {label}
            {badge && (
              <span className="ml-auto w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
