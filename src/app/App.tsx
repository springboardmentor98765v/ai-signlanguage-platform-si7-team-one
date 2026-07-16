import React, { useState, useEffect } from "react";
import { useTheme } from "./ThemeProvider";
import {
  Home, BookOpen, Camera, CheckSquare, MessageCircle, TrendingUp,
  Award, Users, Settings, Bell, ChevronRight, Play, RotateCcw,
  ArrowRight, Eye, EyeOff, Clock, Zap, Target, Activity,
  Shield, Server, UserCheck, LogOut, Plus, Search, Filter,
  Download, Share2, AlertTriangle, CheckCircle, XCircle, Info,
  SkipForward, Calendar, Lock, Mail, Check, ChevronLeft,
} from "lucide-react";
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, AreaChart, Area,
} from "recharts";

// ── Types ──────────────────────────────────────────────────────────────────
type Screen =
  | "login" | "signup" | "onboarding"
  | "learner-dashboard" | "courses" | "lesson" | "practice"
  | "assessment" | "feedback" | "progress" | "certificates"
  | "instructor-dashboard" | "course-management" | "student-detail"
  | "trainer-console"
  | "admin-dashboard" | "user-management" | "system-monitoring"
  | "notifications" | "settings" | "camera-permission";

type Role = "learner" | "instructor" | "trainer" | "admin";

// ── Mock data ──────────────────────────────────────────────────────────────
const accuracyData = [
  { date: "Jun 17", accuracy: 62 }, { date: "Jun 19", accuracy: 68 },
  { date: "Jun 21", accuracy: 71 }, { date: "Jun 23", accuracy: 75 },
  { date: "Jun 25", accuracy: 73 }, { date: "Jun 27", accuracy: 79 },
  { date: "Jun 29", accuracy: 82 }, { date: "Jul 1", accuracy: 81 },
  { date: "Jul 3", accuracy: 85 }, { date: "Jul 5", accuracy: 88 },
  { date: "Jul 7", accuracy: 84 }, { date: "Jul 9", accuracy: 91 },
  { date: "Jul 11", accuracy: 89 }, { date: "Jul 13", accuracy: 93 },
  { date: "Jul 15", accuracy: 91 },
];
const weeklyTime = [
  { day: "Mon", min: 25 }, { day: "Tue", min: 40 }, { day: "Wed", min: 15 },
  { day: "Thu", min: 50 }, { day: "Fri", min: 35 }, { day: "Sat", min: 60 },
  { day: "Sun", min: 45 },
];
const weakAreas = [
  { cat: "Numbers", v: 71 }, { cat: "Colors", v: 64 }, { cat: "Emotions", v: 78 },
  { cat: "Actions", v: 82 }, { cat: "Greetings", v: 94 }, { cat: "Questions", v: 69 },
  { cat: "Time", v: 76 },
];
const adminGrowth = [
  { month: "Feb", users: 1820, comps: 134 }, { month: "Mar", users: 2105, comps: 198 },
  { month: "Apr", users: 2340, comps: 221 }, { month: "May", users: 2580, comps: 267 },
  { month: "Jun", users: 2740, comps: 312 }, { month: "Jul", users: 2847, comps: 341 },
];

// ── Hand landmark positions (MediaPipe-style) ─────────────────────────────
const LANDMARKS: [number, number][] = [
  [0.50, 0.88], // wrist
  [0.38, 0.76], [0.28, 0.67], [0.22, 0.58], [0.18, 0.50], // thumb
  [0.42, 0.62], [0.38, 0.47], [0.36, 0.36], [0.35, 0.26], // index
  [0.50, 0.60], [0.50, 0.44], [0.50, 0.33], [0.50, 0.23], // middle
  [0.58, 0.62], [0.61, 0.46], [0.63, 0.36], [0.64, 0.26], // ring
  [0.66, 0.67], [0.71, 0.54], [0.74, 0.45], [0.76, 0.37], // pinky
];
const CONNECTIONS: [number, number][] = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [0,9],[9,10],[10,11],[11,12],
  [0,13],[13,14],[14,15],[15,16],
  [0,17],[17,18],[18,19],[19,20],
  [5,9],[9,13],[13,17],
];

function HandOverlay({
  w = 300, h = 380, animated = true,
}: {
  w?: number; h?: number; animated?: boolean;
}) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!animated) return;
    const id = setInterval(() => setTick(t => t + 1), 60);
    return () => clearInterval(id);
  }, [animated]);
  const j = (v: number, i: number) =>
    animated ? v + Math.sin((tick * 0.07 + i * 0.8)) * 0.007 : v;
  return (
    <svg width={w} height={h} className="pointer-events-none">
      {CONNECTIONS.map(([a, b], i) => (
        <line
          key={i}
          x1={j(LANDMARKS[a][0], a) * w} y1={j(LANDMARKS[a][1], a) * h}
          x2={j(LANDMARKS[b][0], b) * w} y2={j(LANDMARKS[b][1], b) * h}
          stroke="var(--hand-stroke)" strokeWidth={1.5}
        />
      ))}
      {LANDMARKS.map(([x, y], i) => (
        <circle
          key={i}
          cx={j(x, i) * w} cy={j(y, i) * h}
          r={i === 0 ? 5 : i % 4 === 0 ? 4.5 : 3}
          fill={i % 4 === 0 ? "var(--hand-joint)" : "var(--hand-bone)"}
        />
      ))}
    </svg>
  );
}

// ── Shared components ─────────────────────────────────────────────────────
type BadgeVariant = "default" | "success" | "warning" | "error" | "info";
function Bdg({ label, v = "default" }: { label: string; v?: BadgeVariant }) {
  const cls: Record<BadgeVariant, string> = {
    default: "bg-muted text-muted-foreground",
    success: "bg-surface text-success",
    warning: "bg-surface text-warning",
    error: "bg-surface text-danger",
    info: "bg-surface text-secondary",
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${cls[v]}`}>
      {label}
    </span>
  );
}

function PBar({ pct, cls = "" }: { pct: number; cls?: string }) {
  return (
    <div className={`h-2 bg-muted rounded-full overflow-hidden ${cls}`}>
      <div
        className="h-full bg-gradient-to-r from-primary to-success rounded-full transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function Ring({ pct, size = 100 }: { pct: number; size?: number }) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (pct / 100) * c;
  const col = pct >= 80 ? "var(--success)" : pct >= 60 ? "var(--warning)" : "var(--danger)";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={6} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={col} strokeWidth={6}
          strokeDasharray={c} strokeDashoffset={off}
          strokeLinecap="round" className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold" style={{ color: col }}>{pct}%</span>
      </div>
    </div>
  );
}

type MColor = "cyan" | "emerald" | "violet" | "amber";
const MCLS: Record<MColor, string> = {
  cyan:    "text-primary bg-surface",
  emerald: "text-success bg-surface",
  violet:  "text-secondary bg-surface",
  amber:   "text-warning bg-surface",
};
function MCard({
  icon: Icon, label, value, delta, col = "cyan",
}: { icon: React.ElementType; label: string; value: string; delta?: string; col?: MColor }) {
  return (
    <div className="bg-card border border-border rounded-[20px] shadow-sm p-7 shadow-sm">
      <div className="flex items-start justify-between mb-5">
        <div className={`p-3 rounded-[14px] ${MCLS[col]}`}>
          <Icon size={22} className={MCLS[col].split(" ")[0]} />
        </div>
        {delta && (
          <span className="text-xs text-success bg-success/10 px-2.5 py-1 rounded-full font-medium">
            {delta}
          </span>
        )}
      </div>
      <div className="text-[28px] font-bold text-foreground mb-1.5 leading-tight">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

// ── Flow stepper ───────────────────────────────────────────────────────────
const FLOW_STEPS = ["Select Lesson", "Practice", "AI Analysis", "Feedback", "Saved"];
function FlowStepper({ active }: { active: number }) {
  return (
    <div className="flex items-center justify-center gap-2 py-3 border-b border-border/50 bg-card">
      {FLOW_STEPS.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
              i === active
                ? "bg-primary text-primary-foreground"
                : i < active
                ? "bg-surface text-success"
                : "text-muted-foreground"
            }`}
          >
            {i < active && <Check size={9} />}
            {s}
          </div>
          {i < FLOW_STEPS.length - 1 && <ChevronRight size={11} className="text-muted-foreground" />}
        </div>
      ))}
    </div>
  );
}

// ── Navigation config ──────────────────────────────────────────────────────
const NAV: Record<Role, { screen: Screen; label: string; icon: React.ElementType }[]> = {
  learner: [
    { screen: "learner-dashboard", label: "Dashboard", icon: Home },
    { screen: "courses",           label: "Courses",   icon: BookOpen },
    { screen: "practice",          label: "Practice",  icon: Camera },
    { screen: "assessment",        label: "Assessments", icon: CheckSquare },
    { screen: "progress",          label: "Progress",  icon: TrendingUp },
    { screen: "certificates",      label: "Certificates", icon: Award },
  ],
  instructor: [
    { screen: "instructor-dashboard", label: "Dashboard", icon: Home },
    { screen: "course-management",    label: "Courses",   icon: BookOpen },
    { screen: "student-detail",       label: "Students",  icon: Users },
  ],
  trainer: [
    { screen: "trainer-console", label: "Console", icon: Activity },
  ],
  admin: [
    { screen: "admin-dashboard",    label: "Dashboard", icon: Home },
    { screen: "user-management",    label: "Users",     icon: Users },
    { screen: "system-monitoring",  label: "System",    icon: Server },
  ],
};

// ── Sidebar ────────────────────────────────────────────────────────────────
function Sidebar({
  role, setRole, active, setScreen,
}: {
  role: Role; setRole: (r: Role) => void; active: Screen; setScreen: (s: Screen) => void;
}) {
  return (
    <div className="w-60 flex-shrink-0 bg-card border-r border-border flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-sm">✋</div>
          <div>
            <div className="font-bold text-foreground text-sm leading-none">SignPath AI</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">v2.4.0</div>
          </div>
        </div>
      </div>

      <div className="p-2.5 border-b border-border">
        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 px-1.5">
          Role
        </div>
        <div className="grid grid-cols-2 gap-1">
          {(["learner", "instructor", "trainer", "admin"] as Role[]).map(r => (
            <button
              key={r}
              onClick={() => { setRole(r); setScreen(NAV[r][0].screen); }}
              className={`py-1.5 text-[11px] rounded-[10px] capitalize font-medium transition-all ${
                role === r
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/10"
              }`}
            >
              {r === "trainer" ? "Trainer" : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <nav className="flex-1 p-2.5 overflow-y-auto space-y-0.5">
        {NAV[role].map(({ screen, label, icon: Icon }) => (
          <button
            key={screen}
            onClick={() => setScreen(screen)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[14px] text-sm font-medium transition-all ${
                active === screen
                  ? "bg-surface text-primary border border-primary/40"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/10"
              }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      <div className="p-2.5 border-t border-border space-y-0.5">
        {([
          { screen: "notifications" as Screen, label: "Notifications", icon: Bell, badge: 3 },
          { screen: "settings" as Screen,      label: "Settings",      icon: Settings },
        ]).map(({ screen, label, icon: Icon, badge }) => (
          <button
            key={screen}
            onClick={() => setScreen(screen)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[14px] text-sm font-medium transition-all ${
              active === screen
                ? "bg-surface text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/10"
            }`}
          >
            <Icon size={15} />
            {label}
            {badge && (
              <span className="ml-auto w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Top bar ────────────────────────────────────────────────────────────────
const SCREEN_LABELS: Record<Screen, string> = {
  login: "Login", signup: "Sign Up", onboarding: "Onboarding",
  "learner-dashboard": "Dashboard", courses: "Course Catalog",
  lesson: "Lesson View", practice: "Practice", assessment: "Assessment",
  feedback: "AI Feedback", progress: "Progress & Analytics",
  certificates: "Certificates", "instructor-dashboard": "Instructor Dashboard",
  "course-management": "Course Management", "student-detail": "Student Detail",
  "trainer-console": "Trainer Console", "admin-dashboard": "Admin Dashboard",
  "user-management": "User Management", "system-monitoring": "System Monitoring",
  notifications: "Notifications", settings: "Settings",
  "camera-permission": "Camera Permission",
};
const ROLE_CLS: Record<Role, string> = {
  learner:    "bg-surface text-secondary",
  instructor: "bg-surface text-secondary",
  trainer:    "bg-surface text-success",
  admin:      "bg-surface text-warning",
};

function TopBar({
  role, screen, onLogout,
}: { role: Role; screen: Screen; onLogout: () => void }) {
  return (
    <div className="h-16 border-b border-border bg-card/80 backdrop-blur flex items-center px-6 gap-3 flex-shrink-0">
      <div className="flex-1 text-base font-semibold text-foreground">
        {SCREEN_LABELS[screen]}
      </div>
      <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${ROLE_CLS[role]}`}>
        {role}
      </span>
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-white">
        M
      </div>
      <button
        onClick={onLogout}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        <LogOut size={15} />
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// A. AUTH SCREENS
// ══════════════════════════════════════════════════════════════════════════

function LoginScreen({
  onLogin, goSignup,
}: { onLogin: (r: Role) => void; goSignup: () => void }) {
  const [email, setEmail] = useState("maya.chen@example.com");
  const [pw, setPw] = useState("password123");
  const [show, setShow] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role>("learner");

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-[45%] bg-surface flex-col justify-between p-12 relative overflow-hidden border-r border-border">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/4 w-48 h-48 bg-secondary/5 rounded-full blur-2xl" />
        <div className="absolute top-32 right-12 opacity-25">
          <HandOverlay w={240} h={290} animated />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2.5 mb-12">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-base">✋</div>
            <span className="font-bold text-lg text-foreground">SignPath AI</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground leading-tight mb-4">
            Learn sign language<br />
            <span className="text-primary">with real-time AI</span>
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            Gesture recognition, instant AI feedback, and personalized learning paths for every skill level.
          </p>
        </div>
        <div className="relative space-y-3">
          {[
            { icon: Camera, t: "Real-time gesture recognition" },
            { icon: TrendingUp, t: "AI-powered accuracy scoring" },
            { icon: Award, t: "Certified completion credentials" },
          ].map(({ icon: Icon, t }) => (
            <div key={t} className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="w-6 h-6 rounded-full bg-surface flex items-center justify-center">
                <Icon size={12} className="text-primary" />
              </div>
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-foreground mb-1">Welcome back</h2>
            <p className="text-muted-foreground text-sm">Sign in to continue your learning journey</p>
          </div>

          <div className="flex gap-1 mb-5 p-1 bg-muted rounded-[14px]">
            {(["learner", "instructor", "trainer", "admin"] as Role[]).map(r => (
              <button
                key={r}
                onClick={() => setSelectedRole(r)}
                className={`flex-1 py-1.5 text-[11px] font-semibold rounded-[10px] capitalize transition-all ${
                  selectedRole === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="space-y-4 mb-5">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-surface border border-border rounded-[14px] pl-9 pr-4 h-12 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-foreground">Password</label>
                <button className="text-xs text-primary hover:text-primary/80">Forgot password?</button>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={show ? "text" : "password"}
                  value={pw} onChange={e => setPw(e.target.value)}
                  className="w-full bg-surface border border-border rounded-[14px] pl-9 pr-10 h-12 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                />
                <button
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => onLogin(selectedRole)}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-[14px] h-11 transition-colors mb-4 text-sm"
          >
            Sign in
          </button>

          <div className="relative flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button className="w-full bg-surface border border-border hover:border-primary/30 text-foreground font-medium py-2.5 rounded-[14px] h-11 transition-all flex items-center justify-center gap-3 mb-6 text-sm">
            <svg width="16" height="16" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-xs text-muted-foreground">
            New to SignPath?{" "}
            <button onClick={goSignup} className="text-primary hover:text-primary/80 font-semibold">
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function SignupScreen({
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
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-base">✋</div>
          <span className="font-bold text-lg text-foreground">SignPath AI</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Create your account</h2>
        <p className="text-muted-foreground text-sm mb-6">Choose your role to get started</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {ROLES.map(({ v, label, desc, icon: Icon }) => (
            <button
              key={v} onClick={() => setRole(v)}
              className={`p-4 rounded-xl border text-left transition-all ${
                role === v
                  ? "border-primary/60 bg-surface"
                  : "border-border bg-surface hover:border-primary/20"
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
                className="w-full bg-surface border border-border rounded-[14px] px-4 h-12 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                placeholder={f.placeholder}
              />
            </div>
          ))}
        </div>

        <button
          onClick={onSignup}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-[14px] h-11 transition-colors mb-4 text-sm"
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

function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const Qs = [
    { q: "Have you learned any sign language before?", opts: ["Never tried it", "Learned a few basics", "Know conversational ASL", "Advanced / fluent"] },
    { q: "What is your primary goal?", opts: ["Personal communication", "Work with Deaf/HoH community", "Professional certification", "Just exploring"] },
    { q: "How much time can you practice daily?", opts: ["5–10 min / day", "15–20 min / day", "30+ min / day", "Flexible schedule"] },
  ];
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="flex gap-1.5 mb-8">
          {Qs.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>
        <div className="text-xs text-muted-foreground mb-2">Question {step + 1} of {Qs.length}</div>
        <h2 className="text-2xl font-bold text-foreground mb-6">{Qs[step].q}</h2>
        <div className="space-y-2.5">
          {Qs[step].opts.map(opt => (
            <button
              key={opt}
              onClick={() => step < Qs.length - 1 ? setStep(s => s + 1) : onDone()}
              className="w-full p-4 rounded-xl border border-border bg-surface hover:border-primary/50 hover:bg-surface text-left text-foreground text-sm font-medium transition-all"
            >
              {opt}
            </button>
          ))}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Your answers help us place you at the right starting level
        </p>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// B. LEARNER SCREENS
// ══════════════════════════════════════════════════════════════════════════

function LearnerDashboard({ go }: { go: (s: Screen) => void }) {
  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1800px] mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground">Good morning, Maya 👋</h2>
          <p className="text-muted-foreground text-sm mt-1">You are on a 14-day streak — keep it up!</p>
        </div>
        <div className="flex items-center gap-2 bg-surface border border-warning/40 rounded-xl px-4 py-2">
          <Zap size={17} className="text-warning" />
          <span className="text-warning font-bold">14</span>
          <span className="text-muted-foreground text-sm">day streak</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <MCard icon={Target}   label="Overall Accuracy"  value="91%" delta="+3% this week"  col="cyan" />
        <MCard icon={BookOpen} label="Signs Learned"     value="248" delta="+12 today"      col="emerald" />
        <MCard icon={Clock}    label="Practice Time"     value="4.2h" delta="this week"     col="violet" />
        <MCard icon={Award}    label="Badges Earned"     value="7"   delta="1 new"          col="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-card border border-border rounded-[20px] shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Continue Learning</h3>
            <Bdg label="In Progress" v="info" />
          </div>
          <div className="flex items-start gap-4">
            <div className="w-20 h-14 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen size={22} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground">ASL Intermediate — Module 4</h4>
              <p className="text-xs text-muted-foreground mt-0.5 mb-3">Describing emotions and mental states</p>
              <PBar pct={68} />
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs text-muted-foreground">68% complete · 6 lessons left</span>
                <button
                  onClick={() => go("lesson")}
                  className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-semibold"
                >
                  Resume <ArrowRight size={11} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-[20px] shadow-sm p-6 flex flex-col items-center justify-center">
          <Ring pct={73} size={110} />
          <div className="mt-3 text-center">
            <div className="text-sm font-semibold text-foreground">Module Progress</div>
            <div className="text-xs text-muted-foreground">Module 4 of 6</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-[20px] shadow-sm p-6">
          <h3 className="font-semibold text-foreground mb-4">Recent Achievements</h3>
          <div className="space-y-3">
            {[
              { lbl: "Perfect Score",  desc: "100% on Greetings assessment", em: "🏆", t: "Today" },
              { lbl: "Speed Signer",   desc: "Completed 20 signs in 5 min",  em: "⚡", t: "Yesterday" },
              { lbl: "Week Warrior",   desc: "7 consecutive practice days",  em: "🔥", t: "Jul 9" },
            ].map(a => (
              <div key={a.lbl} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-base">{a.em}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">{a.lbl}</div>
                  <div className="text-xs text-muted-foreground truncate">{a.desc}</div>
                </div>
                <span className="text-xs text-muted-foreground">{a.t}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-[20px] shadow-sm p-6">
          <h3 className="font-semibold text-foreground mb-4">Recommended Next</h3>
          <div className="space-y-2">
            {[
              { title: "Numbers 1–20",   type: "practice",   time: "8 min",  diff: "Beginner" },
              { title: "Color Signs",    type: "lesson",     time: "12 min", diff: "Beginner" },
              { title: "Module 4 Quiz",  type: "assessment", time: "15 min", diff: "Intermediate" },
            ].map(item => (
              <button
                key={item.title}
                onClick={() => go(item.type as Screen)}
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-surface hover:bg-secondary/10 border border-border/50 hover:border-primary/40 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                  {item.type === "practice" ? <Camera size={13} className="text-primary" /> :
                   item.type === "assessment" ? <CheckSquare size={13} className="text-success" /> :
                   <BookOpen size={13} className="text-secondary" />}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-foreground">{item.title}</div>
                  <div className="text-xs text-muted-foreground capitalize">{item.type} · {item.time}</div>
                </div>
                <Bdg label={item.diff} v={item.diff === "Beginner" ? "info" : "warning"} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CourseCatalog({ go }: { go: (s: Screen) => void }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const courses = [
    { id: 1, title: "ASL Fundamentals",           desc: "Core signs, alphabet, and basic phrases.",              lessons: 24, hrs: "6 hrs",  diff: "Beginner",     pct: 100, cat: "ASL" },
    { id: 2, title: "ASL Intermediate",           desc: "Emotions, questions, and sentence structure.",         lessons: 32, hrs: "9 hrs",  diff: "Intermediate", pct: 68,  cat: "ASL" },
    { id: 3, title: "ASL Advanced Conversation",  desc: "Classifiers, complex grammar, and fluent ASL.",       lessons: 28, hrs: "12 hrs", diff: "Advanced",     pct: 0,   cat: "ASL" },
    { id: 4, title: "BSL Basics",                 desc: "Introduction to British Sign Language.",              lessons: 20, hrs: "5 hrs",  diff: "Beginner",     pct: 0,   cat: "BSL" },
    { id: 5, title: "Medical Sign Language",       desc: "Healthcare vocabulary for clinical environments.",    lessons: 18, hrs: "4 hrs",  diff: "Intermediate", pct: 12,  cat: "Specialized" },
    { id: 6, title: "Numbers & Math Signs",        desc: "Counting, arithmetic, and quantities.",              lessons: 10, hrs: "2 hrs",  diff: "Beginner",     pct: 45,  cat: "ASL" },
  ];
  const filters = ["All", "ASL", "BSL", "Specialized", "Beginner", "Intermediate", "Advanced"];
  const filtered = courses.filter(c =>
    (filter === "All" || c.cat === filter || c.diff === filter) &&
    c.title.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1800px] mx-auto">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-surface border border-border rounded-[14px] pl-9 pr-4 h-12 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
            placeholder="Search courses..."
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {filters.map(f => (
            <button
              key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground border border-border hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(c => (
          <div key={c.id} className="bg-card border border-border rounded-[20px] shadow-sm overflow-hidden hover:border-primary/50 transition-all group">
            <div className="h-28 bg-gradient-to-br from-surface to-card flex items-center justify-center relative">
              <BookOpen size={32} className="text-primary group-hover:text-primary/80 transition-colors" />
              <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                <Bdg label={c.diff} v={c.diff === "Beginner" ? "info" : c.diff === "Intermediate" ? "warning" : "error"} />
                <Bdg label={c.cat} />
              </div>
              {c.pct === 100 && (
                <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-success rounded-full flex items-center justify-center">
                  <Check size={10} className="text-black" />
                </div>
              )}
            </div>
            <div className="p-5">
              <h4 className="font-semibold text-foreground mb-1">{c.title}</h4>
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{c.desc}</p>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                <span>{c.lessons} lessons</span>
                <span className="text-border">·</span>
                <span>{c.hrs}</span>
              </div>
              {c.pct > 0 && c.pct < 100 && (
                <div className="mb-3">
                  <PBar pct={c.pct} />
                  <span className="text-xs text-muted-foreground mt-1 block">{c.pct}% complete</span>
                </div>
              )}
              <button
                onClick={() => go("lesson")}
                className={`w-full py-2.5 rounded-[14px] text-xs font-semibold transition-all ${
                  c.pct === 100
                    ? "bg-muted text-muted-foreground"
                    : c.pct > 0
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-foreground hover:bg-foreground/5 border border-border"
                }`}
              >
                {c.pct === 100 ? "Review" : c.pct > 0 ? "Continue" : "Start Course"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LessonView({ go }: { go: (s: Screen) => void }) {
  const [active, setActive] = useState(3);
  const steps = [
    { id: 1, title: "Introduction to Emotions", done: true },
    { id: 2, title: "Happy, Sad, Angry",         done: true },
    { id: 3, title: "Fear, Surprise, Disgust",   done: false },
    { id: 4, title: "Complex Feelings",          done: false },
    { id: 5, title: "Emotional Nuance",          done: false },
    { id: 6, title: "Module Quiz",               done: false },
  ];
  return (
    <div className="flex h-full overflow-hidden">
      <div className="w-64 border-r border-border bg-card flex flex-col p-4 flex-shrink-0">
        <div className="mb-4 px-1">
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Module 4</div>
          <div className="font-semibold text-foreground text-sm">Emotions & Mental States</div>
          <PBar pct={33} cls="mt-2" />
          <div className="text-xs text-muted-foreground mt-1">2 of 6 complete</div>
        </div>
        <div className="space-y-0.5 flex-1 overflow-y-auto">
          {steps.map(s => (
            <button
              key={s.id} onClick={() => setActive(s.id)}
              className={`w-full flex items-center gap-2.5 p-3 rounded-xl text-left transition-all ${
                active === s.id ? "bg-surface border border-primary/40" : "hover:bg-secondary/10"
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                s.done ? "bg-success" : active === s.id ? "border-2 border-primary" : "border-2 border-muted"
              }`}>
                {s.done && <Check size={9} className="text-black" />}
                {!s.done && active === s.id && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
              </div>
              <span className={`text-xs font-medium ${active === s.id ? "text-primary" : s.done ? "text-muted-foreground" : "text-foreground"}`}>
                {s.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Bdg label="Lesson 3" v="info" />
            <Bdg label="8 min" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-5">Fear, Surprise &amp; Disgust</h2>

          <div className="aspect-video bg-surface rounded-xl mb-6 flex items-center justify-center relative overflow-hidden border border-border">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
            <button className="w-12 h-12 bg-primary hover:bg-primary/90 rounded-full flex items-center justify-center transition-colors relative z-10">
              <Play size={18} className="text-black ml-0.5" />
            </button>
            <div className="absolute bottom-3 left-4 text-xs text-muted-foreground">
              Instructor: Dr. Anya Roberts · 3:42
            </div>
          </div>

          <p className="text-muted-foreground text-sm leading-relaxed mb-5">
            In this lesson we explore three powerful emotional signs — FEAR, SURPRISE, and DISGUST. These signs rely heavily on facial expression, which carries as much meaning as the hand shape itself in ASL.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
            {["FEAR", "SURPRISE", "DISGUST"].map(sign => (
              <div key={sign} className="bg-surface border border-border rounded-lg p-4 text-center">
                <div className="w-14 h-14 mx-auto mb-3 flex items-center justify-center overflow-hidden">
                  <HandOverlay w={56} h={56} animated={false} />
                </div>
                <div className="font-semibold text-foreground text-sm">{sign}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Tap to practice</div>
              </div>
            ))}
          </div>

          <h4 className="font-semibold text-foreground mb-2 text-sm">Key Points</h4>
          <ul className="space-y-2 mb-6">
            {[
              "Facial expression carries 70% of the meaning in emotional signs",
              "FEAR uses both hands raised, fingers spread wide, with wide open eyes",
              "SURPRISE is a quick upward flick from both index fingers at the chin",
              "DISGUST involves a twisting motion near the mouth or nose area",
            ].map(p => (
              <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                {p}
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft size={15} />
              Previous Lesson
            </button>
            <button
              onClick={() => go("camera-permission")}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-5 py-2.5 rounded-[14px] h-11 transition-colors text-sm"
            >
              <Camera size={15} />
              Start Practice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Practice Screen (Centerpiece) ──────────────────────────────────────────
function PracticeScreen({ go }: { go: (s: Screen) => void }) {
  const [conf, setConf] = useState(73);
  const [attempts, setAttempts] = useState(2);
  const [sign, setSign] = useState("FEAR");
  const SIGNS = ["FEAR", "SURPRISE", "DISGUST", "HAPPY", "SAD"];

  useEffect(() => {
    const id = setInterval(() => {
      setConf(v => Math.max(42, Math.min(98, v + (Math.random() - 0.42) * 5)));
    }, 600);
    return () => clearInterval(id);
  }, []);

  const confRnd = Math.round(conf);
  const confCol = conf >= 80 ? "bg-success" : conf >= 60 ? "bg-warning" : "bg-danger";
  const confTxt = conf >= 80 ? "text-success" : conf >= 60 ? "text-warning" : "text-danger";
  const confMsg = conf >= 80 ? "Great!" : conf >= 60 ? "Almost there" : "Keep trying";

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">
      <FlowStepper active={1} />

      <div className="flex-1 flex overflow-hidden">
        {/* Camera feed */}
        <div className="flex-1 relative bg-gradient-to-b from-background via-secondary/10 to-card">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 -m-12 bg-primary/3 rounded-full blur-3xl" />
              <HandOverlay w={320} h={390} animated />
            </div>
          </div>

          <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-muted-foreground">Hand detected</span>
          </div>

          <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-muted-foreground">
            Attempt {attempts} / 5
          </div>

          <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-3">
            <button
              onClick={() => { setAttempts(a => a + 1); setConf(50 + Math.random() * 20); }}
              className="flex items-center gap-2 bg-surface/80 backdrop-blur border border-border hover:border-primary/40 text-foreground px-5 py-2.5 rounded-[14px] h-11 text-sm font-semibold transition-all"
            >
              <RotateCcw size={15} />
              Try Again
            </button>
            <button
              onClick={() => go("feedback")}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-black px-6 py-2.5 rounded-[14px] h-11 text-sm font-bold transition-colors"
            >
              <SkipForward size={15} />
              Next Sign
            </button>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-72 flex-shrink-0 border-l border-border bg-card flex flex-col p-5 gap-4 overflow-y-auto" style={{ width: "288px" }}>
          <div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Target Sign</div>
            <div className="text-3xl font-bold text-foreground leading-none mb-1">{sign}</div>
            <div className="text-xs text-muted-foreground">Lesson 3 · Emotions</div>
          </div>

          <div className="bg-secondary/10 border border-border rounded-xl overflow-hidden relative">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider p-2.5 pb-0">Reference</div>
            <div className="flex items-center justify-center py-2">
              <HandOverlay w={120} h={140} animated={false} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">AI Confidence</div>
              <span className={`text-xl font-bold ${confTxt}`}>{confRnd}%</span>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden mb-1">
              <div className={`h-full rounded-full transition-all duration-300 ${confCol}`} style={{ width: `${conf}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Low</span>
              <span className={confTxt}>{confMsg}</span>
              <span>High</span>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Breakdown</div>
            <div className="space-y-2">
              {[
                { lbl: "Hand Shape",  score: 91 },
                { lbl: "Movement",    score: 78 },
                { lbl: "Orientation", score: 85 },
                { lbl: "Location",    score: confRnd },
              ].map(({ lbl, score }) => (
                <div key={lbl} className="flex items-center gap-2">
                  <div className="text-xs text-muted-foreground w-20">{lbl}</div>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${score >= 80 ? "bg-success" : score >= 65 ? "bg-warning" : "bg-danger"}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <div className="text-xs font-semibold text-foreground w-8 text-right">{score}%</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Signs in Set</div>
            <div className="flex flex-wrap gap-1.5">
              {SIGNS.map(s => (
                <button
                  key={s} onClick={() => setSign(s)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                    s === sign ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground border border-border hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Assessment Screen ──────────────────────────────────────────────────────
function AssessmentScreen({ go }: { go: (s: Screen) => void }) {
  const [qIdx, setQIdx] = useState(3);
  const [scores, setScores] = useState([92, 88, 75]);
  const [capturing, setCapturing] = useState(false);
  const [timer, setTimer] = useState(0);
  const SIGNS = ["HELLO", "THANK YOU", "PLEASE", "FEAR", "SURPRISE", "DISGUST", "YES", "NO"];
  const TOTAL = 8;

  const capture = () => {
    setCapturing(true);
    let t = 3;
    setTimer(t);
    const id = setInterval(() => {
      t--;
      setTimer(t);
      if (t === 0) {
        clearInterval(id);
        setCapturing(false);
        const s = 60 + Math.floor(Math.random() * 35);
        setScores(prev => [...prev, s]);
        setTimeout(() => {
          if (qIdx < TOTAL) setQIdx(q => q + 1);
          else go("feedback");
        }, 800);
      }
    }, 1000);
  };

  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">
      <div className="bg-card border-b border-border px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-semibold text-foreground text-sm">Module 4 Assessment</h3>
            <p className="text-xs text-muted-foreground">Sign {qIdx} of {TOTAL} · Emotions &amp; Mental States</p>
          </div>
          {avg > 0 && <Bdg label={`${avg}% avg`} v="info" />}
        </div>
        <div className="flex gap-1">
          {Array.from({ length: TOTAL }, (_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-all ${
                i < scores.length
                  ? scores[i] >= 80 ? "bg-success" : scores[i] >= 60 ? "bg-warning" : "bg-danger"
                  : i === qIdx - 1 ? "bg-primary animate-pulse" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 flex gap-5 p-5 overflow-hidden">
        <div className="flex-1 bg-secondary/10 rounded-xl border border-border relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <HandOverlay w={240} h={300} animated={!capturing} />
          </div>
          {capturing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-7xl font-bold text-primary mb-2">{timer}</div>
                <div className="text-sm text-muted-foreground">Hold your sign steady…</div>
              </div>
            </div>
          )}
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-muted-foreground">Camera active</span>
          </div>
        </div>

        <div className="w-56 flex flex-col gap-3 flex-shrink-0">
          <div className="bg-surface border border-border rounded-xl p-4">
            <div className="text-xs text-muted-foreground mb-1">Sign this word:</div>
            <div className="text-4xl font-bold text-foreground mb-2">{SIGNS[qIdx - 1]}</div>
            <div className="flex items-center justify-center">
              <HandOverlay w={100} h={80} animated={false} />
            </div>
          </div>

          <button
            onClick={capture} disabled={capturing}
            className={`py-3 rounded-[14px] font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              capturing ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-black"
            }`}
          >
            <Camera size={15} />
            {capturing ? "Capturing…" : "Capture Sign"}
          </button>

          {scores.length > 0 && (
            <div className="bg-surface border border-border rounded-xl p-3 flex-1 overflow-y-auto">
              <div className="text-xs text-muted-foreground mb-2">Previous Scores</div>
              <div className="space-y-2">
                {scores.map((sc, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="text-xs text-muted-foreground w-14 truncate">{SIGNS[i]}</div>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${sc >= 80 ? "bg-success" : sc >= 60 ? "bg-warning" : "bg-danger"}`} style={{ width: `${sc}%` }} />
                    </div>
                    <div className="text-xs font-semibold text-foreground">{sc}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => go("feedback")}
            className="flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground border border-border rounded-xl py-2.5 transition-all hover:border-primary/40"
          >
            <ArrowRight size={13} />
            View Results
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Feedback Screen ────────────────────────────────────────────────────────
function FeedbackScreen({ go }: { go: (s: Screen) => void }) {
  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      <FlowStepper active={3} />

      <div className="bg-card border border-border rounded-[20px] shadow-sm p-6 flex items-center gap-6">
        <Ring pct={84} size={110} />
        <div>
          <h2 className="text-lg font-bold text-foreground">Great work, Maya!</h2>
          <p className="text-muted-foreground text-sm mt-1">
            You scored 84% on FEAR — a 9-point improvement from your last attempt.
          </p>
          <div className="flex gap-2 mt-2.5">
            <Bdg label="Personal Best 🎉" v="success" />
            <Bdg label="4th Attempt" v="info" />
          </div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-xs text-muted-foreground">Accuracy trend</div>
          <div className="text-2xl font-bold text-success mt-0.5">+9%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[
          { lbl: "Your Attempt", col: "bg-primary", badge: <Bdg label="84%" v="info" />, anim: true },
          { lbl: "Reference Sign", col: "bg-success", badge: <Bdg label="Target" v="success" />, anim: false },
        ].map(({ lbl, col, badge, anim }) => (
            <div key={lbl} className="bg-card border border-border rounded-[20px] shadow-sm overflow-hidden">
            <div className="p-2.5 border-b border-border flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${col}`} />
              <span className="text-xs font-semibold text-foreground">{lbl}</span>
              {badge}
            </div>
            <div className="flex items-center justify-center py-5 bg-secondary/10 h-52">
              <HandOverlay w={160} h={130} animated={anim} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-[20px] shadow-sm p-6">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2 text-base">
          <MessageCircle size={16} className="text-primary" />
          AI Correction Tips
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { a: "Hand Shape",       s: "good",    t: "Fingers spread correctly — palm orientation matches reference." },
            { a: "Movement",         s: "warning", t: "The upward trembling motion needs slightly more speed." },
            { a: "Facial Expression",s: "error",   t: "Widen the eyes more — this is critical for FEAR in ASL." },
            { a: "Location",         s: "good",    t: "Hand positioned at the correct height relative to shoulder." },
          ].map(({ a, s, t }) => (
            <div key={a} className={`p-3 rounded-lg border ${
              s === "good" ? "border-success/50 bg-surface/20" :
              s === "warning" ? "border-warning/50 bg-surface/20" :
              "border-danger/50 bg-surface/20"
            }`}>
              <div className="flex items-center gap-1.5 mb-1">
                {s === "good" ? <CheckCircle size={13} className="text-success" /> :
                 s === "warning" ? <AlertTriangle size={13} className="text-warning" /> :
                 <XCircle size={13} className="text-danger" />}
                <span className="text-xs font-semibold text-foreground">{a}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{t}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={() => go("practice")} className="flex items-center gap-2 bg-surface border border-border hover:border-primary/40 text-foreground px-4 py-2.5 rounded-[14px] h-11 text-sm font-semibold transition-all">
          <RotateCcw size={14} />
          Try FEAR Again
        </button>
        <button onClick={() => go("practice")} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-black px-5 py-2.5 rounded-[14px] h-11 text-sm font-bold transition-colors">
          <SkipForward size={14} />
          Next: SURPRISE
        </button>
        <button onClick={() => go("progress")} className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          View Progress <TrendingUp size={13} />
        </button>
      </div>
    </div>
  );
}

// ── Progress Analytics ─────────────────────────────────────────────────────
function ProgressAnalytics() {
  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1800px] mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <MCard icon={TrendingUp} label="Avg Accuracy (30d)" value="84%" delta="+11% vs last month" col="cyan" />
        <MCard icon={Target}     label="Signs Mastered"      value="142" delta="of 248 learned"     col="emerald" />
        <MCard icon={Clock}      label="Practice Time"       value="31.4h" delta="this month"       col="violet" />
        <MCard icon={Zap}        label="Current Streak"      value="14 days" delta="Best: 21 days"  col="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-card border border-border rounded-[20px] shadow-sm p-6">
          <h3 className="font-semibold text-foreground mb-4 text-base">Accuracy Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={accuracyData}>
              <defs>
                <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--primary)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} interval={2} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} domain={[50, 100]} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="accuracy" stroke="var(--primary)" strokeWidth={2} fill="url(#ag)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card border border-border rounded-[20px] shadow-sm p-6">
          <h3 className="font-semibold text-foreground mb-4 text-base">Practice Time This Week</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyTime} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="min" fill="var(--accent)" radius={[4, 4, 0, 0]} name="minutes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-[20px] shadow-sm p-6">
          <h3 className="font-semibold text-foreground mb-4 text-base">Accuracy by Category</h3>
          <div className="space-y-4">
            {[...weakAreas].sort((a, b) => a.v - b.v).map(item => (
              <div key={item.cat} className="flex items-center gap-3">
                <div className="text-sm text-muted-foreground w-24">{item.cat}</div>
                <div className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.v >= 80 ? "bg-success" : item.v >= 70 ? "bg-warning" : "bg-danger"}`}
                    style={{ width: `${item.v}%` }}
                  />
                </div>
                <div className="text-xs font-semibold text-foreground w-9 text-right">{item.v}%</div>
                {item.v < 75 && <Bdg label="Focus" v="warning" />}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-[20px] shadow-sm p-6">
          <h3 className="font-semibold text-foreground mb-4 text-base">Practice Calendar — July 2026</h3>
          <div className="grid grid-cols-7 gap-1.5 mb-2">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <div key={i} className="text-center text-xs text-muted-foreground font-medium">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {/* offset: July 1 is Wednesday (col 3) */}
            {[0, 1].map(i => <div key={`off${i}`} />)}
            {Array.from({ length: 31 }, (_, i) => {
              const d = i + 1;
              const practiced = d <= 15 && d !== 4 && d !== 10;
              const isToday = d === 16;
              return (
                <div key={d} className={`aspect-square rounded-lg flex items-center justify-center text-xs font-semibold ${
                  isToday ? "bg-primary text-primary-foreground" :
                  practiced ? "bg-surface text-success" :
                  "bg-surface text-muted-foreground"
                }`}>
                  {d}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-surface" />Practiced</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-primary" />Today</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-surface" />Missed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Certificates ───────────────────────────────────────────────────────────
function Certificates() {
  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[
          { title: "ASL Fundamentals",  date: "May 12, 2026", score: 94, id: "CERT-2026-ASL-001" },
          { title: "Numbers & Math",    date: "Jun 3, 2026",  score: 88, id: "CERT-2026-NUM-042" },
        ].map(cert => (
          <div key={cert.id} className="bg-gradient-to-br from-surface to-secondary/10 border border-primary/30 rounded-[20px] overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 border-b border-primary/20">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">SignPath AI</span>
                <Award size={18} className="text-warning" />
              </div>
              <div className="text-lg font-bold text-foreground mb-1">Certificate of Completion</div>
              <div className="text-primary font-semibold text-sm">{cert.title}</div>
            </div>
            <div className="p-4">
              <div className="text-xs text-muted-foreground mb-0.5">Awarded to</div>
              <div className="font-bold text-foreground mb-3">Maya Chen</div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                <span>{cert.date}</span>
                <span className="text-success font-semibold">{cert.score}% final score</span>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 bg-primary hover:bg-primary/90 text-black text-xs font-bold py-2 rounded-[14px] transition-colors">
                  <Download size={11} /> Download
                </button>
                <button className="flex items-center justify-center bg-secondary/10 border border-border hover:border-primary/40 text-muted-foreground hover:text-foreground text-xs py-2 px-3 rounded-lg transition-all">
                  <Share2 size={11} />
                </button>
              </div>
              <div className="text-[10px] text-muted-foreground mt-3 font-mono">{cert.id}</div>
            </div>
          </div>
        ))}

        <div className="bg-secondary/10 border border-border/50 rounded-xl p-5 flex flex-col items-center justify-center text-center opacity-50">
          <Award size={28} className="text-muted-foreground mb-3" />
          <div className="font-semibold text-foreground text-sm mb-1">ASL Intermediate</div>
          <div className="text-xs text-muted-foreground mb-3">Complete the course to earn</div>
          <PBar pct={68} cls="w-full" />
          <div className="text-xs text-muted-foreground mt-1">68% complete</div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-[20px] shadow-sm p-6">
        <h3 className="font-semibold text-foreground mb-4 text-base">Achievement Badges</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { lbl: "First Sign",   em: "🌟", earned: true },
            { lbl: "Week Warrior", em: "🔥", earned: true },
            { lbl: "Speed Signer", em: "⚡", earned: true },
            { lbl: "Perfect Score",em: "🏆", earned: true },
            { lbl: "100 Signs",    em: "💯", earned: true },
            { lbl: "Month Master", em: "📅", earned: true },
            { lbl: "Night Owl",    em: "🦉", earned: true },
            { lbl: "Consistency",  em: "📈", earned: false },
            { lbl: "ASL Expert",   em: "🎓", earned: false },
          ].map(b => (
            <div key={b.lbl} className={`flex flex-col items-center gap-2 p-4 rounded-[20px] border w-24 ${b.earned ? "border-warning/40 bg-surface/20" : "border-border bg-surface opacity-40"}`}>
              <span className="text-3xl">{b.em}</span>
              <span className="text-[11px] font-semibold text-center text-muted-foreground leading-tight">{b.lbl}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// C. INSTRUCTOR SCREENS
// ══════════════════════════════════════════════════════════════════════════

function InstructorDashboard({ go }: { go: (s: Screen) => void }) {
  const students = [
    { name: "Marcus Johnson", pct: 78, acc: 88, last: "Today",    status: "on-track" },
    { name: "Priya Patel",    pct: 45, acc: 62, last: "3d ago",   status: "at-risk" },
    { name: "Leo Finch",      pct: 91, acc: 95, last: "Today",    status: "excellent" },
    { name: "Amara Osei",     pct: 33, acc: 58, last: "5d ago",   status: "at-risk" },
    { name: "Tom Nguyen",     pct: 67, acc: 81, last: "Yesterday",status: "on-track" },
    { name: "Sofia Reyes",    pct: 88, acc: 92, last: "Today",    status: "excellent" },
  ];
  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1800px] mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <MCard icon={Users}        label="Total Students"   value="24"  delta="3 new this week"  col="cyan" />
        <MCard icon={TrendingUp}   label="Avg Class Progress" value="67%" delta="+5% vs last week" col="emerald" />
        <MCard icon={AlertTriangle}label="At-Risk Students" value="4"   delta="need attention"   col="amber" />
        <MCard icon={CheckCircle}  label="Completions"      value="8"   delta="this month"       col="violet" />
      </div>

      <div className="bg-card border border-border rounded-[20px] shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground text-base">Student Overview</h3>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 bg-surface border border-border px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Filter size={11} />Filter
            </button>
            <button className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-lg text-xs font-bold">
              <Plus size={11} />Add
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          {students.map(s => (
            <button
              key={s.name}
              onClick={() => go("student-detail")}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-surface hover:bg-secondary/10 border border-border/50 hover:border-primary/40 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/70 to-secondary/70 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                {s.name.charAt(0)}
              </div>
              <div className="w-32 flex-shrink-0">
                <div className="text-sm font-semibold text-foreground">{s.name}</div>
                <div className="text-xs text-muted-foreground">{s.last}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Progress</span>
                  <span className="text-xs font-semibold text-foreground">{s.pct}%</span>
                </div>
                <PBar pct={s.pct} />
              </div>
              <div className="w-16 text-center flex-shrink-0">
                <div className="text-base font-bold text-foreground">{s.acc}%</div>
                <div className="text-[10px] text-muted-foreground">accuracy</div>
              </div>
              <Bdg
                label={s.status === "excellent" ? "Excellent" : s.status === "at-risk" ? "At Risk" : "On Track"}
                v={s.status === "excellent" ? "success" : s.status === "at-risk" ? "warning" : "info"}
              />
              <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CourseManagement() {
  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">My Courses</h2>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-black text-xs font-bold px-4 py-2 rounded-[14px] h-11 transition-colors">
          <Plus size={14} /> New Course
        </button>
      </div>
      <div className="space-y-3">
        {[
          { title: "ASL Fundamentals",  students: 18, modules: 6, pub: true },
          { title: "ASL Intermediate",  students: 12, modules: 4, pub: true },
          { title: "Emotions in Context",students: 0, modules: 2, pub: false },
        ].map(c => (
          <div key={c.title} className="bg-card border border-border rounded-[20px] shadow-sm p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center flex-shrink-0">
              <BookOpen size={17} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-foreground text-sm">{c.title}</div>
              <div className="text-xs text-muted-foreground">{c.modules} modules · {c.students} students enrolled</div>
            </div>
            <Bdg label={c.pub ? "Published" : "Draft"} v={c.pub ? "success" : "default"} />
            <div className="flex gap-2">
              <button className="text-xs bg-surface border border-border px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors">Edit</button>
              <button className="text-xs bg-surface border border-border p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"><Share2 size={12} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StudentDetail() {
  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-xl font-bold text-white">P</div>
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-foreground">Priya Patel</h2>
          <p className="text-muted-foreground text-sm">priya.patel@example.com · Enrolled Jun 1, 2026</p>
        </div>
        <Bdg label="At Risk" v="warning" />
        <button className="ml-auto bg-primary hover:bg-primary/90 text-black text-xs font-bold px-4 py-2 rounded-[14px] h-11 transition-colors">
          Send Feedback
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <MCard icon={TrendingUp} label="Overall Progress" value="45%" col="amber" />
        <MCard icon={Target}     label="Avg Accuracy"     value="62%" col="amber" />
        <MCard icon={Clock}      label="Time This Week"   value="1.2h" col="violet" />
        <MCard icon={Calendar}   label="Last Active"      value="3d ago" col="cyan" />
      </div>
      <div className="bg-card border border-border rounded-[20px] shadow-sm p-6">
        <h3 className="font-semibold text-foreground mb-4 text-base">Assessment History</h3>
        <div className="space-y-2">
          {[
            { mod: "Greetings",    date: "Jul 10", score: 78, att: 3 },
            { mod: "Numbers 1–10", date: "Jul 8",  score: 58, att: 5 },
            { mod: "Alphabet A–M", date: "Jul 5",  score: 65, att: 4 },
          ].map(a => (
            <div key={a.mod} className="flex items-center gap-4 p-3 bg-surface rounded-lg border border-border/50">
              <div className="flex-1">
                <div className="text-sm font-semibold text-foreground">{a.mod}</div>
                <div className="text-xs text-muted-foreground">{a.date} · {a.att} attempts</div>
              </div>
              <PBar pct={a.score} cls="w-28" />
              <div className="text-sm font-bold text-foreground w-10 text-right">{a.score}%</div>
              <Bdg label={a.score >= 75 ? "Pass" : "Needs Work"} v={a.score >= 75 ? "success" : "warning"} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// D. TRAINER CONSOLE
// ══════════════════════════════════════════════════════════════════════════

function TrainerConsole() {
  const [sel, setSel] = useState<number | null>(null);
  const cases = [
    { id: 1, user: "Alex Kim",      sign: "DISGUST", ai: 48, t: "10 min ago" },
    { id: 2, user: "Taylor Brown",  sign: "FEAR",    ai: 52, t: "22 min ago" },
    { id: 3, user: "Yuki Tanaka",   sign: "PLEASE",  ai: 61, t: "1 hr ago" },
    { id: 4, user: "Carlos M.",     sign: "HELLO",   ai: 44, t: "2 hr ago" },
  ];
  return (
    <div className="p-6 lg:p-8 max-w-[1800px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg lg:text-xl font-bold text-foreground">Trainer Console</h2>
          <p className="text-muted-foreground text-sm">Review AI-flagged low-confidence gesture predictions</p>
        </div>
        <Bdg label={`${cases.length} pending review`} v="warning" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-2">
          {cases.map(c => (
            <button
              key={c.id} onClick={() => setSel(c.id)}
              className={`w-full p-5 rounded-[20px] border text-left transition-all ${
                sel === c.id ? "border-primary/50 bg-surface" : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-xs font-bold text-foreground flex-shrink-0">
                  {c.user.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-foreground">{c.user}</div>
                  <div className="text-xs text-muted-foreground">Sign: <span className="text-foreground font-semibold">{c.sign}</span> · {c.t}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-warning">{c.ai}%</div>
                  <Bdg label="Low conf." v="warning" />
                </div>
              </div>
            </button>
          ))}
        </div>

        {sel ? (
          <div className="bg-card border border-border rounded-[20px] shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-foreground text-sm">Review Case #{sel}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-secondary/10 rounded-xl p-4">
                <div className="text-sm text-muted-foreground mb-2 text-center">User Gesture</div>
                <div className="flex items-center justify-center">
                  <HandOverlay w={120} h={110} animated />
                </div>
              </div>
              <div className="bg-secondary/10 rounded-xl p-4">
                <div className="text-sm text-muted-foreground mb-2 text-center">Reference</div>
                <div className="flex items-center justify-center">
                  <HandOverlay w={120} h={110} animated={false} />
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Trainer Notes</label>
              <textarea
                className="w-full bg-surface border border-border rounded-[14px] p-4 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 h-24"
                placeholder="Add correction notes…"
              />
            </div>
            <div className="flex gap-2">
              <button className="flex-1 bg-success hover:bg-success/90 text-black text-xs font-bold py-2.5 rounded-[14px] transition-colors">Approve</button>
              <button className="flex-1 bg-surface border border-border text-xs text-foreground py-2.5 rounded-lg hover:border-primary/40 transition-all">Override</button>
              <button className="bg-surface border border-danger/40 text-danger text-xs px-3 py-2.5 rounded-lg hover:bg-surface/60 transition-colors">Flag</button>
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-[20px] shadow-sm flex items-center justify-center text-muted-foreground text-sm min-h-[300px]">
            Select a case to review
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// E. ADMIN SCREENS
// ══════════════════════════════════════════════════════════════════════════

function AdminDashboard() {
  const SVCS = [
    { name: "User Service",       icon: Users,        healthy: true,  uptime: "99.9%", rps: "1.2k" },
    { name: "Course Service",     icon: BookOpen,     healthy: true,  uptime: "99.8%", rps: "890" },
    { name: "Practice Service",   icon: Camera,       healthy: true,  uptime: "99.7%", rps: "2.1k" },
    { name: "Assessment Service", icon: CheckSquare,  healthy: false, uptime: "98.1%", rps: "445" },
    { name: "Feedback Service",   icon: MessageCircle,healthy: true,  uptime: "99.9%", rps: "760" },
    { name: "Analytics Service",  icon: TrendingUp,   healthy: true,  uptime: "100%",  rps: "320" },
  ];
  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1800px] mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <MCard icon={Users}       label="Active Users"        value="2,847" delta="+107 this month"   col="cyan" />
        <MCard icon={TrendingUp}  label="Completion Rate"     value="73%"   delta="+4% vs last month"  col="emerald" />
        <MCard icon={Activity}    label="AI Predictions Today"value="14.2k" delta="98.7% accurate"    col="violet" />
        <MCard icon={Server}      label="System Health"       value="99.8%" delta="All services nominal" col="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-[20px] shadow-sm p-6">
          <h3 className="font-semibold text-foreground mb-4 text-base">Platform Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={adminGrowth} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="users" fill="var(--primary)" radius={[3, 3, 0, 0]} name="Users" />
              <Bar dataKey="comps" fill="var(--success)" radius={[3, 3, 0, 0]} name="Completions" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-[20px] shadow-sm p-6">
          <h3 className="font-semibold text-foreground mb-4 text-base">Microservice Status</h3>
          <div className="space-y-3">
            {SVCS.map(svc => (
              <div key={svc.name} className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border/50">
                <div className="w-7 h-7 rounded-md bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <svc.icon size={13} className="text-muted-foreground" />
                </div>
                <div className="flex-1 text-xs font-medium text-foreground">{svc.name}</div>
                <div className="text-[10px] text-muted-foreground">{svc.rps} req/s</div>
                <div className="text-[10px] text-muted-foreground">{svc.uptime}</div>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${svc.healthy ? "bg-success" : "bg-warning animate-pulse"}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function UserManagement() {
  const [search, setSearch] = useState("");
  const users = [
    { name: "Maya Chen",       email: "maya.chen@example.com",   role: "learner" as Role,    status: "active",   joined: "Mar 12, 2026" },
    { name: "Dr. Anya Roberts",email: "a.roberts@signpath.edu",   role: "instructor" as Role, status: "active",   joined: "Jan 5, 2026" },
    { name: "James Wu",        email: "james.wu@example.com",     role: "learner" as Role,    status: "active",   joined: "Jun 2, 2026" },
    { name: "Maria Santos",    email: "m.santos@rehab.org",       role: "trainer" as Role,    status: "active",   joined: "Feb 18, 2026" },
    { name: "David Park",      email: "d.park@example.com",       role: "learner" as Role,    status: "inactive", joined: "Apr 30, 2026" },
    { name: "System Admin",    email: "admin@signpath.ai",        role: "admin" as Role,      status: "active",   joined: "Jan 1, 2026" },
  ];
  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="p-6 lg:p-8 max-w-[1800px] mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-surface border border-border rounded-[14px] pl-9 pr-4 h-12 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
            placeholder="Search users…"
          />
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-black text-xs font-bold px-4 py-2.5 rounded-[14px] h-11 transition-colors">
          <Plus size={13} /> Invite User
        </button>
      </div>

      <div className="bg-card border border-border rounded-[20px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="sticky top-0 z-10">
            <tr className="border-b border-border bg-card">
              {["User", "Role", "Status", "Joined", ""].map((h, i) => (
                <th key={i} className={`text-sm font-semibold text-muted-foreground px-6 py-5 ${i === 4 ? "text-right" : "text-left"}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr key={u.email} className={`border-b border-border/50 hover:bg-muted/50 transition-colors ${i === filtered.length - 1 ? "border-0" : ""}`}>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/60 to-secondary/60 flex items-center justify-center text-xs font-bold text-white">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{u.name}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <Bdg label={u.role.charAt(0).toUpperCase() + u.role.slice(1)} v={u.role === "admin" ? "warning" : u.role === "instructor" ? "info" : u.role === "trainer" ? "success" : "default"} />
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${u.status === "active" ? "bg-success" : "bg-muted-foreground"}`} />
                    <span className="text-sm text-muted-foreground capitalize">{u.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{u.joined}</td>
                <td className="px-6 py-5">
                  <div className="flex items-center justify-end gap-2">
                    <button className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-secondary/10 transition-colors">Edit</button>
                    <button className={`text-xs px-2 py-1 rounded transition-colors ${u.status === "active" ? "text-danger hover:bg-surface" : "text-success hover:bg-surface"}`}>
                      {u.status === "active" ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

function SystemMonitoring() {
  const SVCS = [
    { name: "User Service",       icon: Users,         healthy: true,  uptime: 99.9, lat: 42,  err: 0.01, rps: 1240 },
    { name: "Course Service",     icon: BookOpen,      healthy: true,  uptime: 99.8, lat: 38,  err: 0.02, rps: 890 },
    { name: "Practice Service",   icon: Camera,        healthy: true,  uptime: 99.7, lat: 65,  err: 0.03, rps: 2100 },
    { name: "Assessment Service", icon: CheckSquare,   healthy: false, uptime: 98.1, lat: 120, err: 1.8,  rps: 445 },
    { name: "Feedback Service",   icon: MessageCircle, healthy: true,  uptime: 99.9, lat: 28,  err: 0.01, rps: 760 },
    { name: "Analytics Service",  icon: TrendingUp,    healthy: true,  uptime: 100,  lat: 15,  err: 0,    rps: 320 },
  ];
  return (
    <div className="p-6 lg:p-8 max-w-[1800px] mx-auto space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {SVCS.map(svc => (
          <div key={svc.name} className={`bg-card rounded-[20px] p-5 border ${svc.healthy ? "border-border" : "border-warning/50 bg-surface/5"}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <svc.icon size={15} className="text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">{svc.name}</div>
                <div className={`text-xs font-semibold ${svc.healthy ? "text-success" : "text-warning"}`}>
                  {svc.healthy ? "● Healthy" : "● Degraded"}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><div className="text-muted-foreground">Uptime</div><div className={`font-bold ${svc.healthy ? "text-foreground" : "text-warning"}`}>{svc.uptime}%</div></div>
              <div><div className="text-muted-foreground">Latency</div><div className={`font-bold ${svc.lat > 100 ? "text-warning" : "text-foreground"}`}>{svc.lat}ms</div></div>
              <div><div className="text-muted-foreground">Error rate</div><div className={`font-bold ${svc.err > 1 ? "text-danger" : "text-foreground"}`}>{svc.err}%</div></div>
              <div><div className="text-muted-foreground">Req/min</div><div className="font-bold text-foreground">{svc.rps}</div></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-[20px] shadow-sm p-6">
        <h3 className="font-semibold text-foreground mb-4 text-base">Recent Error Logs</h3>
        <div className="space-y-1">
          {[
            { t: "14:32:11", lvl: "WARN",  svc: "assessment", msg: "Model confidence below threshold for gesture ID: g_8841" },
            { t: "14:28:03", lvl: "WARN",  svc: "assessment", msg: "Prediction latency spike: 287ms (threshold: 200ms)" },
            { t: "14:15:57", lvl: "INFO",  svc: "practice",   msg: "Webcam session started — user_id: 4921" },
            { t: "14:01:22", lvl: "ERROR", svc: "assessment", msg: "Hand landmark detection failed — insufficient lighting" },
            { t: "13:55:44", lvl: "INFO",  svc: "analytics",  msg: "Daily stats aggregation complete — 14,201 predictions processed" },
          ].map((log, i) => (
            <div key={i} className="flex items-start gap-3 p-2.5 rounded bg-secondary/10 font-mono text-xs">
              <span className="text-muted-foreground flex-shrink-0">{log.t}</span>
              <span className={`w-12 flex-shrink-0 font-semibold ${log.lvl === "ERROR" ? "text-danger" : log.lvl === "WARN" ? "text-warning" : "text-primary"}`}>{log.lvl}</span>
              <span className="text-secondary w-20 flex-shrink-0">[{log.svc}]</span>
              <span className="text-muted-foreground">{log.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// F. SHARED SCREENS
// ══════════════════════════════════════════════════════════════════════════

function NotificationsPanel() {
  const notifs = [
    { type: "achievement", title: "New badge earned!", desc: "You earned the \"Perfect Score\" badge", t: "2 min ago",  read: false },
    { type: "feedback",    title: "Instructor feedback", desc: "Dr. Roberts left a note on your FEAR assessment", t: "1 hr ago",   read: false },
    { type: "reminder",    title: "Daily practice reminder", desc: "Keep your 14-day streak going today!", t: "3 hr ago",   read: false },
    { type: "system",      title: "New course available", desc: "ASL Advanced Conversation is now open", t: "Yesterday", read: true },
    { type: "achievement", title: "Module complete!", desc: "You finished Module 3: Basic Phrases", t: "2 days ago", read: true },
  ];
  return (
    <div className="p-6 lg:p-8 max-w-[800px] mx-auto space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Notifications</h2>
        <button className="text-xs text-primary hover:text-primary/80 font-semibold">Mark all read</button>
      </div>
      {notifs.map((n, i) => (
        <div key={i} className={`p-5 rounded-[20px] border transition-all ${n.read ? "border-border bg-card opacity-60" : "border-primary/40 bg-surface"}`}>
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              n.type === "achievement" ? "bg-warning/15" :
              n.type === "feedback"    ? "bg-primary/15" :
              n.type === "reminder"   ? "bg-success/15" : "bg-muted"
            }`}>
              {n.type === "achievement" ? <Award size={13} className="text-warning" /> :
               n.type === "feedback"    ? <MessageCircle size={13} className="text-primary" /> :
               n.type === "reminder"   ? <Bell size={13} className="text-secondary" /> :
               <Info size={13} className="text-muted-foreground" />}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                {n.title}
                {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{n.desc}</div>
            </div>
            <span className="text-xs text-muted-foreground flex-shrink-0">{n.t}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function SettingsScreen() {
  const { theme, setTheme } = useTheme();
  const [emailN, setEmailN] = useState(true);
  const [pushN, setPushN] = useState(true);
  const [auto, setAuto] = useState(false);
  return (
    <div className="p-6 lg:p-8 max-w-[800px] mx-auto space-y-6">
      <div className="bg-card border border-border rounded-[20px] shadow-sm p-7 shadow-sm">
        <h3 className="font-semibold text-foreground mb-4 text-[18px]">Profile</h3>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl font-bold text-primary-foreground">M</div>
          <div>
            <div className="font-bold text-foreground">Maya Chen</div>
            <div className="text-sm text-muted-foreground">maya.chen@example.com</div>
          </div>
          <button className="ml-auto text-sm text-primary border border-primary/40 px-4 py-2 rounded-[14px] hover:bg-primary/5 transition-colors font-medium">Edit Photo</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[{ lbl: "Full Name", val: "Maya Chen" }, { lbl: "Email", val: "maya.chen@example.com" }].map(f => (
            <div key={f.lbl}>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">{f.lbl}</label>
              <input defaultValue={f.val} className="w-full bg-input-background border border-border rounded-[14px] px-4 h-12 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-[20px] shadow-sm p-7 shadow-sm">
        <h3 className="font-semibold text-foreground text-[18px] mb-4">Appearance</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-foreground">Theme</div>
            <div className="text-xs text-muted-foreground mt-0.5">Select your preferred color scheme</div>
          </div>
          <div className="flex gap-1 p-1 bg-muted rounded-[14px]">
            {(["light", "dark"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-5 py-2 rounded-[12px] text-sm font-medium capitalize transition-all ${
                  theme === t
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-[20px] shadow-sm p-7 space-y-5">
        <h3 className="font-semibold text-foreground text-[18px]">Preferences</h3>
        {[
          { lbl: "Email notifications",  desc: "Progress updates and reminders by email",         val: emailN, set: setEmailN },
          { lbl: "Push notifications",   desc: "In-app alerts for streaks, badges, and feedback", val: pushN,  set: setPushN },
          { lbl: "Auto-capture mode",    desc: "Automatically capture signs without a button tap", val: auto,   set: setAuto },
        ].map(p => (
          <div key={p.lbl} className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-foreground">{p.lbl}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{p.desc}</div>
            </div>
            <button
              onClick={() => p.set(!p.val)}
              className={`w-12 h-7 rounded-full transition-colors relative flex-shrink-0 ${p.val ? "bg-primary" : "bg-switch-background"}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-1 transition-all ${p.val ? "left-6" : "left-1"}`} />
            </button>
          </div>
        ))}
      </div>

      <button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 rounded-[14px] transition-colors text-sm">
        Save Changes
      </button>
    </div>
  );
}

function CameraPermissionScreen({ go }: { go: (s: Screen) => void }) {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center max-w-sm px-4">
        <div className="w-24 h-24 rounded-full bg-surface border-2 border-dashed border-foreground/20 flex items-center justify-center mx-auto mb-6">
          <Camera size={34} className="text-muted-foreground" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Allow Camera Access</h3>
        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
          SignPath AI uses your camera to analyze hand gestures in real-time. Your video is processed locally and never stored on our servers.
        </p>
        <div className="bg-surface border border-border rounded-[20px] p-5 mb-6 space-y-2.5 text-left">
          {["Video stays on your device", "No recordings saved to servers", "Revoke access anytime in Settings"].map(t => (
            <div key={t} className="flex items-center gap-2 text-xs text-muted-foreground">
              <Check size={12} className="text-success flex-shrink-0" />
              {t}
            </div>
          ))}
        </div>
        <button
          onClick={() => go("practice")}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-11 rounded-[14px] transition-colors mb-3"
        >
          Allow Camera Access
        </button>
        <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Maybe later
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════════════

export default function App() {
  const [auth, setAuth] = useState<"login" | "signup" | "onboarding">("login");
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState<Role>("learner");
  const [screen, setScreen] = useState<Screen>("learner-dashboard");

  const login = (r: Role) => {
    setRole(r);
    setLoggedIn(true);
    setScreen(NAV[r][0].screen);
  };

  if (!loggedIn) {
    if (auth === "login")   return <LoginScreen onLogin={login} goSignup={() => setAuth("signup")} />;
    if (auth === "signup")  return <SignupScreen onSignup={() => setAuth("onboarding")} goLogin={() => setAuth("login")} />;
    return <OnboardingScreen onDone={() => login("learner")} />;
  }

  const switchRole = (r: Role) => {
    setRole(r);
    setScreen(NAV[r][0].screen);
  };

  const fullHeight = ["practice", "assessment", "lesson"].includes(screen);

  const renderScreen = () => {
    switch (screen) {
      case "learner-dashboard":    return <LearnerDashboard go={setScreen} />;
      case "courses":              return <CourseCatalog go={setScreen} />;
      case "lesson":               return <LessonView go={setScreen} />;
      case "practice":             return <PracticeScreen go={setScreen} />;
      case "assessment":           return <AssessmentScreen go={setScreen} />;
      case "feedback":             return <FeedbackScreen go={setScreen} />;
      case "progress":             return <ProgressAnalytics />;
      case "certificates":         return <Certificates />;
      case "instructor-dashboard": return <InstructorDashboard go={setScreen} />;
      case "course-management":    return <CourseManagement />;
      case "student-detail":       return <StudentDetail />;
      case "trainer-console":      return <TrainerConsole />;
      case "admin-dashboard":      return <AdminDashboard />;
      case "user-management":      return <UserManagement />;
      case "system-monitoring":    return <SystemMonitoring />;
      case "notifications":        return <NotificationsPanel />;
      case "settings":             return <SettingsScreen />;
      case "camera-permission":    return <CameraPermissionScreen go={setScreen} />;
      default:                     return <LearnerDashboard go={setScreen} />;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar role={role} setRole={switchRole} active={screen} setScreen={setScreen} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar role={role} screen={screen} onLogout={() => setLoggedIn(false)} />
        <main className={`flex-1 ${fullHeight ? "overflow-hidden" : "overflow-auto"}`}>
          {renderScreen()}
        </main>
      </div>
    </div>
  );
}
