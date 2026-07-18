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
import { Bdg, PBar } from "../components/shared/Indicators";

export default function CourseCatalog({ go }: { go: (s: Screen) => void }) {
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
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-56 max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            placeholder="Search courses..."
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {filters.map(f => (
            <button
              key={f} onClick={() => setFilter(f)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground border border-border hover:text-foreground hover:bg-muted/80"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-5">
        {filtered.map(c => (
          <div key={c.id} className="bg-card border border-border rounded-[14px] overflow-hidden hover:border-primary/30 transition-all group" style={{ boxShadow: 'var(--card-shadow)' }}>
            <div className="h-28 bg-muted/50 flex items-center justify-center relative">
              <BookOpen size={32} className="text-muted-foreground/40 group-hover:text-primary/60 transition-colors" />
              <div className="absolute top-3 left-3 flex gap-2">
                <Bdg label={c.diff} v={c.diff === "Beginner" ? "info" : c.diff === "Intermediate" ? "warning" : "error"} />
                <Bdg label={c.cat} />
              </div>
              {c.pct === 100 && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-success rounded-full flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </div>
              )}
            </div>
            <div className="p-5">
              <h4 className="font-semibold text-foreground mb-1.5 text-sm">{c.title}</h4>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{c.desc}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                <span>{c.lessons} lessons</span>
                <span className="text-border">·</span>
                <span>{c.hrs}</span>
              </div>
              {c.pct > 0 && c.pct < 100 && (
                <div className="mb-4">
                  <PBar pct={c.pct} />
                  <span className="text-xs text-muted-foreground mt-1.5 block">{c.pct}% complete</span>
                </div>
              )}
              <button
                onClick={() => go("lesson")}
                className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  c.pct === 100
                    ? "bg-muted text-muted-foreground"
                    : c.pct > 0
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-muted text-foreground hover:bg-muted/80 border border-border"
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
