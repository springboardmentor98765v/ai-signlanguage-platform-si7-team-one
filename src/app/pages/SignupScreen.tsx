import { useState, useEffect } from "react";
import {
  Home, BookOpen, Camera, CheckSquare, MessageCircle, TrendingUp,
  Award, Users, Settings, Bell, ChevronRight, Play, RotateCcw,
  ArrowRight, Eye, EyeOff, Clock, Zap, Target, Activity,
  Shield, Server, UserCheck, LogOut, Plus, Search, Filter,
  Download, Share2, AlertTriangle, CheckCircle, XCircle, Info,
  SkipForward, Calendar, Lock, Mail, Check, ChevronLeft,
} from "lucide-react";
import type { Role } from "../lib/types";

export default function SignupScreen({
  onSignup, goLogin,
}: { onSignup: () => void; goLogin: () => void }) {
  const [role, setRole] = useState<Role>("learner");
  const ROLES: { v: Role; label: string; desc: string; icon: React.ElementType }[] = [
    { v: "learner",    label: "Learner",               desc: "Learn at your own pace",     icon: BookOpen },
    { v: "instructor", label: "Instructor",             desc: "Teach and manage classes",   icon: Users },
    { v: "trainer",    label: "Accessibility Trainer",  desc: "Validate AI assessments",    icon: UserCheck },
    { v: "admin",      label: "Administrator",          desc: "Manage platform and users",  icon: Shield },
  ];
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-lg">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-base text-primary-foreground">✋</div>
          <span className="font-bold text-lg text-foreground">SignPath AI</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-1.5">Create your account</h2>
        <p className="text-muted-foreground text-sm mb-6">Choose your role to get started</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {ROLES.map(({ v, label, desc, icon: Icon }) => (
            <button
              key={v} onClick={() => setRole(v)}
              className={`p-4 rounded-xl border text-left transition-all ${
                role === v
                  ? "border-primary/40 bg-primary/5"
                  : "border-border bg-card hover:border-primary/20"
              }`}
            >
              <Icon size={17} className={role === v ? "text-primary mb-2" : "text-muted-foreground mb-2"} />
              <div className="text-sm font-semibold text-foreground">{label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
            </button>
          ))}
        </div>

        <div className="space-y-3 mb-5">
          {[
            { label: "Full name", placeholder: "Maya Chen" },
            { label: "Email", placeholder: "you@example.com" },
            { label: "Password", placeholder: "Min. 8 characters" },
          ].map(f => (
            <div key={f.label}>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">{f.label}</label>
              <input
                type={f.label === "Password" ? "password" : "text"}
                className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                placeholder={f.placeholder}
              />
            </div>
          ))}
        </div>

        <button
          onClick={onSignup}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 rounded-xl transition-colors mb-4 text-sm shadow-sm"
        >
          Create account
        </button>
        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <button onClick={goLogin} className="text-primary hover:text-primary/80 font-semibold">Sign in</button>
        </p>
      </div>
    </div>
  );
}
