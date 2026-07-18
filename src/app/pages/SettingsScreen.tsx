import { useState, useEffect } from "react";
import {
  Home, BookOpen, Camera, CheckSquare, MessageCircle, TrendingUp,
  Award, Users, Settings, Bell, ChevronRight, Play, RotateCcw,
  ArrowRight, Eye, EyeOff, Clock, Zap, Target, Activity,
  Shield, Server, UserCheck, LogOut, Plus, Search, Filter,
  Download, Share2, AlertTriangle, CheckCircle, XCircle, Info,
  SkipForward, Calendar, Lock, Mail, Check, ChevronLeft, Sun, Moon,
} from "lucide-react";
import { useTheme } from "../ThemeProvider";

export default function SettingsScreen() {
  const [emailN, setEmailN] = useState(true);
  const [pushN, setPushN] = useState(true);
  const [auto, setAuto] = useState(false);
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="p-8 max-w-xl mx-auto space-y-6">
      <div className="bg-card border border-border rounded-[14px] p-6" style={{ boxShadow: 'var(--card-shadow)' }}>
        <h3 className="font-semibold text-foreground mb-5 text-sm">Profile</h3>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-xl font-bold text-primary-foreground">M</div>
          <div>
            <div className="font-bold text-foreground">Maya Chen</div>
            <div className="text-sm text-muted-foreground">maya.chen@example.com</div>
          </div>
          <button className="ml-auto text-xs text-primary border border-primary/30 px-3.5 py-2 rounded-xl hover:bg-primary/5 font-medium">Edit Photo</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[{ lbl: "Full Name", val: "Maya Chen" }, { lbl: "Email", val: "maya.chen@example.com" }].map(f => (
            <div key={f.lbl}>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">{f.lbl}</label>
              <input defaultValue={f.val} className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-[14px] p-6 space-y-5" style={{ boxShadow: 'var(--card-shadow)' }}>
        <h3 className="font-semibold text-foreground text-sm">Appearance</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {theme === "dark" ? <Moon size={16} className="text-primary" /> : <Sun size={16} className="text-warning" />}
            <div>
              <div className="text-sm font-semibold text-foreground">Dark mode</div>
              <div className="text-xs text-muted-foreground">
                {theme === "dark" ? "Currently using dark theme" : "Currently using light theme"}
              </div>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${theme === "dark" ? "bg-primary" : "bg-switch-background"}`}
          >
            <div className={`w-4.5 h-4.5 rounded-full bg-white absolute top-[3px] transition-all shadow-sm ${theme === "dark" ? "left-[22px]" : "left-[3px]"}`} />
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-[14px] p-6 space-y-5" style={{ boxShadow: 'var(--card-shadow)' }}>
        <h3 className="font-semibold text-foreground text-sm">Preferences</h3>
        {[
          { lbl: "Email notifications",  desc: "Progress updates and reminders by email",         val: emailN, set: setEmailN },
          { lbl: "Push notifications",   desc: "In-app alerts for streaks, badges, and feedback", val: pushN,  set: setPushN },
          { lbl: "Auto-capture mode",    desc: "Automatically capture signs without a button tap", val: auto,   set: setAuto },
        ].map(p => (
          <div key={p.lbl} className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-foreground">{p.lbl}</div>
              <div className="text-xs text-muted-foreground">{p.desc}</div>
            </div>
            <button
              onClick={() => p.set(!p.val)}
              className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${p.val ? "bg-primary" : "bg-switch-background"}`}
            >
              <div className={`w-4.5 h-4.5 rounded-full bg-white absolute top-[3px] transition-all shadow-sm ${p.val ? "left-[22px]" : "left-[3px]"}`} />
            </button>
          </div>
        ))}
      </div>

      <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 rounded-xl transition-colors text-sm shadow-sm">
        Save Changes
      </button>
    </div>
  );
}
