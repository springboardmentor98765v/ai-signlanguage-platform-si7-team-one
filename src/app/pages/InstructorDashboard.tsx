import { useState, useEffect } from "react";
import {
  Home, BookOpen, Camera, CheckSquare, MessageCircle, TrendingUp,
  Award, Users, Settings, Bell, ChevronRight, Play, RotateCcw,
  ArrowRight, Eye, EyeOff, Clock, Zap, Target, Activity,
  Shield, Server, UserCheck, LogOut, Plus, Search, Filter,
  Download, Share2, AlertTriangle, CheckCircle, XCircle, Info,
  SkipForward, Calendar, Lock, Mail, Check, ChevronLeft,
} from "lucide-react";
import type { Screen } from "../lib/types";
import { MCard } from "../components/shared/MCard";
import { Bdg, PBar } from "../components/shared/Indicators";

export default function InstructorDashboard({ go }: { go: (s: Screen) => void }) {
  const [search, setSearch] = useState("");

  const students = [
    { name: "Marcus Johnson", pct: 78, acc: 88, last: "Today",     status: "on-track" },
    { name: "Priya Patel",    pct: 45, acc: 62, last: "3d ago",    status: "at-risk" },
    { name: "Leo Finch",      pct: 91, acc: 95, last: "Today",     status: "excellent" },
    { name: "Amara Osei",     pct: 33, acc: 58, last: "5d ago",    status: "at-risk" },
    { name: "Tom Nguyen",     pct: 67, acc: 81, last: "Yesterday", status: "on-track" },
    { name: "Sofia Reyes",    pct: 88, acc: 92, last: "Today",     status: "excellent" },
  ];

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-4 gap-5">
        <MCard icon={Users}         label="Total Students"    value="24"  delta="3 new this week"  col="cyan" />
        <MCard icon={TrendingUp}    label="Avg Class Progress" value="67%" delta="+5% vs last week" col="emerald" />
        <MCard icon={AlertTriangle} label="At-Risk Students"  value="4"   delta="need attention"   col="amber" />
        <MCard icon={CheckCircle}   label="Completions"       value="8"   delta="this month"       col="violet" />
      </div>

      <div className="bg-card border border-border rounded-[14px] p-6" style={{ boxShadow: 'var(--card-shadow)' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-foreground text-sm">Student Overview</h3>
          <div className="flex gap-2.5 items-center">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name..."
                className="bg-muted border border-border rounded-xl pl-8 pr-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary/50 w-48"
              />
            </div>
            <button className="flex items-center gap-1.5 bg-muted border border-border px-3.5 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground transition-colors">
              <Filter size={11} />Filter
            </button>
            <button className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3.5 py-2 rounded-xl text-xs font-bold">
              <Plus size={11} />Add
            </button>
          </div>
        </div>

        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground py-6 text-center">No students match "{search}"</p>
        )}

        <div className="space-y-2">
          {filtered.map(s => (
            <button
              key={s.name}
              onClick={() => go("student-detail")}
              className="w-full flex items-center gap-4 p-3.5 rounded-xl bg-muted/50 hover:bg-muted border border-border/50 hover:border-primary/30 transition-all text-left"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/70 to-primary/40 flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0">
                {s.name.charAt(0)}
              </div>
              <div className="w-32 flex-shrink-0">
                <div className="text-sm font-semibold text-foreground">{s.name}</div>
                <div className="text-xs text-muted-foreground">{s.last}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
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