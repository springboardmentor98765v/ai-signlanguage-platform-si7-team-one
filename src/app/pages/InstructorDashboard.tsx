import { useState, useEffect } from "react";
import {
  Home, BookOpen, Camera, CheckSquare, MessageCircle, TrendingUp,
  Award, Users, Settings, Bell, ChevronRight, Play, RotateCcw,
  ArrowRight, Eye, EyeOff, Clock, Zap, Target, Activity,
  Shield, Server, UserCheck, LogOut, Plus, Search, Filter,
  Download, Share2, AlertTriangle, CheckCircle, XCircle, Info,
  SkipForward, Calendar, Lock, Mail, Check, ChevronLeft, RefreshCw,
} from "lucide-react";
import type { Screen } from "../lib/types";
import { MCard } from "../components/shared/MCard";
import { Bdg, PBar } from "../components/shared/Indicators";
import { getMyStudents } from "../services/api";

interface Student {
  user_id: string;
  full_name: string;
  email: string;
}

export default function InstructorDashboard({ go }: { go: (s: Screen) => void }) {
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getMyStudents()
      .then(data => setStudents(data ?? []))
      .catch(() => setError("Couldn't load students. Is the backend running on port 8000?"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter(s =>
    s.full_name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <MCard icon={Users}         label="Total Students"    value={String(students.length)} delta="assigned to you"   col="cyan" />
        <MCard icon={TrendingUp}    label="Avg Class Progress" value="—"  delta="connect analytics"  col="emerald" />
        <MCard icon={AlertTriangle} label="At-Risk Students"  value="—"   delta="connect analytics"  col="amber" />
        <MCard icon={CheckCircle}   label="Completions"       value="—"   delta="connect analytics"  col="violet" />
      </div>

      <div className="bg-card border border-border rounded-[14px] p-6" style={{ boxShadow: 'var(--card-shadow)' }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-5 gap-3">
          <h3 className="font-semibold text-foreground text-sm">My Students</h3>
          <div className="flex gap-2.5 items-center">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="bg-muted border border-border rounded-xl pl-8 pr-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary/50 w-48"
              />
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw size={18} className="animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center gap-2 py-6 text-sm text-rose-400">
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <p className="text-xs text-muted-foreground py-6 text-center">
            {students.length === 0
              ? "No students assigned to you yet. Ask an admin to assign students via POST /instructor/assign-student/{learner_id}."
              : `No students match "${search}"`}
          </p>
        )}

        <div className="space-y-2">
          {filtered.map(s => (
            <button
              key={s.user_id}
              onClick={() => go("student-detail")}
              className="w-full flex items-center gap-4 p-3.5 rounded-xl bg-muted/50 hover:bg-muted border border-border/50 hover:border-primary/30 transition-all text-left"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/70 to-primary/40 flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0">
                {s.full_name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground">{s.full_name}</div>
                <div className="text-xs text-muted-foreground">{s.email}</div>
              </div>
              <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}