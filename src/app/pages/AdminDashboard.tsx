import { useState, useEffect } from "react";
import {
  Home, BookOpen, Camera, CheckSquare, MessageCircle, TrendingUp,
  Award, Users, Settings, Bell, ChevronRight, Play, RotateCcw,
  ArrowRight, Eye, EyeOff, Clock, Zap, Target, Activity,
  Shield, Server, UserCheck, LogOut, Plus, Search, Filter,
  Download, Share2, AlertTriangle, CheckCircle, XCircle, Info,
  SkipForward, Calendar, Lock, Mail, Check, ChevronLeft, UserX, UserCheck2,
} from "lucide-react";
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, AreaChart, Area,
} from "recharts";
import { adminGrowth } from "../lib/mockData";
import { MCard } from "../components/shared/MCard";
import { Bdg } from "../components/shared/Indicators";
import { useIsDark } from "../lib/useIsDark";

interface User {
  id: number; name: string; email: string;
  role: string; active: boolean; joined: string;
}

export default function AdminDashboard() {
  const dark = useIsDark();
  const grid = dark ? "rgba(255,255,255,0.05)" : "#EBEBEB";
  const tick = dark ? "#9CA3AF" : "#6A6A6A";
  const tipBg = dark ? "#1C1C1E" : "#FFFFFF";
  const tipBorder = dark ? "rgba(255,255,255,0.08)" : "#DDDDDD";

  // ── M2 Day 5: User list with activate/deactivate ──────────────────────
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: "Maya Chen",      email: "maya@example.com",    role: "learner",    active: true,  joined: "Jun 1, 2026" },
    { id: 2, name: "Marcus Johnson", email: "marcus@example.com",  role: "learner",    active: true,  joined: "Jun 3, 2026" },
    { id: 3, name: "Dr. Anya Roberts",email:"anya@example.com",   role: "instructor", active: true,  joined: "May 15, 2026" },
    { id: 4, name: "Priya Patel",    email: "priya@example.com",   role: "learner",    active: false, joined: "Jun 10, 2026" },
    { id: 5, name: "Leo Finch",      email: "leo@example.com",     role: "learner",    active: true,  joined: "Jun 12, 2026" },
    { id: 6, name: "Admin User",     email: "admin@example.com",   role: "admin",      active: true,  joined: "Jan 1, 2026" },
  ]);
  const [userSearch, setUserSearch] = useState("");

  const toggleActive = (id: number) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, active: !u.active } : u));
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  // ── M2 Day 5: Lesson list view ────────────────────────────────────────
  const lessons = [
    { title: "Letter A", level: "Beginner",     cat: "Alphabet", learners: 142 },
    { title: "Letter B", level: "Beginner",     cat: "Alphabet", learners: 138 },
    { title: "Letter C", level: "Beginner",     cat: "Alphabet", learners: 125 },
    { title: "Greetings", level: "Beginner",    cat: "Words",    learners: 98  },
    { title: "Numbers 1–10", level: "Beginner", cat: "Numbers",  learners: 87  },
  ];

  const SVCS = [
    { name: "User Service",       icon: Users,        healthy: true,  uptime: "99.9%", rps: "1.2k" },
    { name: "Course Service",     icon: BookOpen,     healthy: true,  uptime: "99.8%", rps: "890" },
    { name: "Practice Service",   icon: Camera,       healthy: true,  uptime: "99.7%", rps: "2.1k" },
    { name: "Assessment Service", icon: CheckSquare,  healthy: false, uptime: "98.1%", rps: "445" },
    { name: "Feedback Service",   icon: MessageCircle,healthy: true,  uptime: "99.9%", rps: "760" },
    { name: "Analytics Service",  icon: TrendingUp,   healthy: true,  uptime: "100%",  rps: "320" },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-4 gap-5">
        <MCard icon={Users}       label="Active Users"         value="2,847" delta="+107 this month"    col="cyan" />
        <MCard icon={TrendingUp}  label="Completion Rate"      value="73%"   delta="+4% vs last month"  col="emerald" />
        <MCard icon={Activity}    label="AI Predictions Today" value="14.2k" delta="98.7% accurate"     col="violet" />
        <MCard icon={Server}      label="System Health"        value="99.8%" delta="All services nominal" col="emerald" />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-[14px] p-6" style={{ boxShadow: 'var(--card-shadow)' }}>
          <h3 className="font-semibold text-foreground mb-5 text-sm">Platform Growth</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={adminGrowth} barSize={20}>
              <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: tick }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: tick }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: tipBg, border: `1px solid ${tipBorder}`, borderRadius: 12, fontSize: 12, color: dark ? "#FFFFFF" : "#222222" }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, color: dark ? "#FFFFFF" : "#222222" }} />
              <Bar dataKey="users" fill={dark ? "#FFFFFF" : "#4B8299"} radius={[4, 4, 0, 0]} name="Users" />
              <Bar dataKey="comps" fill={dark ? "rgba(255,255,255,0.2)" : "#44724F"} radius={[4, 4, 0, 0]} name="Completions" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-[14px] p-6" style={{ boxShadow: 'var(--card-shadow)' }}>
          <h3 className="font-semibold text-foreground mb-5 text-sm">Microservice Status</h3>
          <div className="space-y-2.5">
            {SVCS.map(svc => (
              <div key={svc.name} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50">
                <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center flex-shrink-0">
                  <svc.icon size={14} className="text-muted-foreground" />
                </div>
                <div className="flex-1 text-xs font-medium text-foreground">{svc.name}</div>
                <div className="text-[11px] text-muted-foreground">{svc.rps} req/s</div>
                <div className="text-[11px] text-muted-foreground">{svc.uptime}</div>
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${svc.healthy ? "bg-success" : "bg-warning animate-pulse"}`} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── M2 Day 5: User list with role + active/inactive + toggle ── */}
      <div className="bg-card border border-border rounded-[14px] p-6" style={{ boxShadow: 'var(--card-shadow)' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-foreground text-sm">All Users</h3>
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Search users..."
                className="bg-muted border border-border rounded-xl pl-8 pr-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary/50 w-48"
              />
            </div>
            <button className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3.5 py-2 rounded-xl text-xs font-bold">
              <Plus size={11} />Add User
            </button>
          </div>
        </div>
        <div className="space-y-2">
          {filteredUsers.map(u => (
            <div key={u.id} className="flex items-center gap-4 p-3.5 rounded-xl bg-muted/50 border border-border/50">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/70 to-primary/40 flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0">
                {u.name.charAt(0)}
              </div>
              <div className="w-40 flex-shrink-0">
                <div className="text-sm font-semibold text-foreground">{u.name}</div>
                <div className="text-xs text-muted-foreground">{u.email}</div>
              </div>
              <Bdg
                label={u.role}
                v={u.role === "admin" ? "warning" : u.role === "instructor" ? "info" : "default"}
              />
              <div className="text-xs text-muted-foreground flex-1">Joined {u.joined}</div>
              <Bdg label={u.active ? "Active" : "Inactive"} v={u.active ? "success" : "error"} />
              <button
                onClick={() => toggleActive(u.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  u.active
                    ? "bg-rose-950/40 text-rose-400 border border-rose-900/40 hover:bg-rose-950/60"
                    : "bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 hover:bg-emerald-950/60"
                }`}
              >
                {u.active ? <><UserX size={11} />Deactivate</> : <><UserCheck2 size={11} />Activate</>}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── M2 Day 5: Lesson list view (title, level, learners using it) ── */}
      <div className="bg-card border border-border rounded-[14px] p-6" style={{ boxShadow: 'var(--card-shadow)' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-foreground text-sm">Lesson Catalogue</h3>
          <button className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3.5 py-2 rounded-xl text-xs font-bold">
            <Plus size={11} />Add Lesson
          </button>
        </div>
        <div className="space-y-2">
          {lessons.map(l => (
            <div key={l.title} className="flex items-center gap-4 p-3.5 rounded-xl bg-muted/50 border border-border/50">
              <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center flex-shrink-0">
                <BookOpen size={13} className="text-muted-foreground" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-foreground">{l.title}</div>
                <div className="text-xs text-muted-foreground">{l.cat}</div>
              </div>
              <Bdg label={l.level} v="info" />
              <div className="text-xs text-muted-foreground w-28 text-right">{l.learners} learners</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}