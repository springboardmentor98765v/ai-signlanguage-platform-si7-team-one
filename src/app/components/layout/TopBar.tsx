import { LogOut } from "lucide-react";
import type { Role, Screen } from "../../lib/types";
import { SCREEN_LABELS, ROLE_CLS } from "../../lib/nav";

export function TopBar({
  role, screen, onLogout,
}: { role: Role; screen: Screen; onLogout: () => void }) {
  return (
    <div className="h-16 border-b border-border bg-navbar flex items-center px-6 gap-4 flex-shrink-0">
      <div className="flex-1 text-base font-semibold text-foreground">
        {SCREEN_LABELS[screen]}
      </div>
      <span className={`text-xs px-3 py-1.5 rounded-full font-medium capitalize ${ROLE_CLS[role]}`}>
        {role}
      </span>
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-xs font-bold text-primary-foreground">
        M
      </div>
      <button
        onClick={onLogout}
        className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-hover"
      >
        <LogOut size={16} strokeWidth={1.5} />
      </button>
    </div>
  );
}
