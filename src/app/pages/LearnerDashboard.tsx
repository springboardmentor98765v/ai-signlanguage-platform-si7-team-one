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
import { Bdg, PBar, Ring } from "../components/shared/Indicators";
import { getDashboard } from "../services/aiApi";
import { accuracyData, lessonsCompleted } from "../lib/mockData";
import {
  LineChart, Line, BarChart, Bar, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";

interface RecentPrediction {
  prediction: string;
  confidence: number;
  confidence_level: string;
  status: string;
  gesture_quality: string;
  processing_time_ms: number;
}

export default function LearnerDashboard({ go }: { go: (s: Screen) => void }) {
  const [recent, setRecent] = useState<RecentPrediction[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(d => setRecent(d.recent_predictions ?? []))
      .catch(() => setRecent([]))
      .finally(() => setLoadingRecent(false));
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-5 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">Good morning, Maya 👋</h2>
          <p className="text-muted-foreground text-sm mt-1">You are on a 14-day streak — keep it up!</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-950/30 border border-amber-900/40 rounded-xl px-4 py-2">
          <Zap size={17} className="text-amber-400" />
          <span className="text-amber-400 font-bold">14</span>
          <span className="text-muted-foreground text-sm">day streak</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MCard icon={Target}   label="Overall Accuracy"  value="91%" delta="+3% this week"  col="cyan" />
        <MCard icon={BookOpen} label="Signs Learned"     value="248" delta="+12 today"      col="emerald" />
        <MCard icon={Clock}    label="Practice Time"     value="4.2h" delta="this week"     col="violet" />
        <MCard icon={Award}    label="Badges Earned"     value="7"   delta="1 new"          col="amber" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Continue Learning</h3>
            <Bdg label="In Progress" v="info" />
          </div>
          <div className="flex items-start gap-4">
            <div className="w-20 h-14 bg-gradient-to-br from-cyan-900/60 to-violet-900/60 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen size={22} className="text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground">ASL Intermediate — Module 4</h4>
              <p className="text-xs text-muted-foreground mt-0.5 mb-3">Describing emotions and mental states</p>
              <PBar pct={68} />
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs text-muted-foreground">68% complete · 6 lessons left</span>
                <button
                  onClick={() => go("lesson")}
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                >
                  Resume <ArrowRight size={11} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 flex flex-col items-center justify-center">
          <Ring pct={73} size={88} />
          <div className="mt-3 text-center">
            <div className="text-sm font-semibold text-foreground">Module Progress</div>
            <div className="text-xs text-muted-foreground">Module 4 of 6</div>
          </div>
        </div>
      </div>

      {/* ── M2 Day 3 — real chart library (Recharts), sample data for now
          per the SRS checklist ("Graphs working with sample data for now"). ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Accuracy Over Time</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={accuracyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="accuracy" stroke="var(--primary)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Lessons Completed</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={lessonsCompleted}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Recent Achievements</h3>
          <div className="space-y-3">
            {[
              { lbl: "Perfect Score",  desc: "100% on Greetings assessment", em: "🏆", t: "Today" },
              { lbl: "Speed Signer",   desc: "Completed 20 signs in 5 min",  em: "⚡", t: "Yesterday" },
              { lbl: "Week Warrior",   desc: "7 consecutive practice days",  em: "🔥", t: "Jul 9" },
            ].map(a => (
              <div key={a.lbl} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#162035] flex items-center justify-center text-base">{a.em}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">{a.lbl}</div>
                  <div className="text-xs text-muted-foreground truncate">{a.desc}</div>
                </div>
                <span className="text-xs text-muted-foreground">{a.t}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
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
                className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#0e1a30] hover:bg-[#162035] border border-border/50 hover:border-cyan-900/40 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-[#162035] flex items-center justify-center">
                  {item.type === "practice" ? <Camera size={13} className="text-cyan-400" /> :
                   item.type === "assessment" ? <CheckSquare size={13} className="text-emerald-400" /> :
                   <BookOpen size={13} className="text-violet-400" />}
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

      {/* ── REAL DATA — from Intern 3's AI service /dashboard endpoint,
          live from this session's actual practice attempts (in-memory,
          resets on AI service restart). Everything above this stays mock
          per SRS FR-1 ("Learner Dashboard mock data acceptable"). ── */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Recent AI Predictions</h3>
          <Bdg label="Live from AI service" v="info" />
        </div>
        {loadingRecent && <div className="h-12 bg-[#0e1a30] rounded-lg animate-pulse" />}
        {!loadingRecent && recent.length === 0 && (
          <p className="text-xs text-muted-foreground">No predictions yet this session — try the Practice screen.</p>
        )}
        {!loadingRecent && recent.length > 0 && (
          <div className="space-y-2">
            {recent.map((r, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-[#162035] flex items-center justify-center font-bold text-cyan-400">
                  {r.prediction}
                </div>
                <div className="flex-1 text-muted-foreground">
                  {Math.round(r.confidence * 100)}% confidence · {r.gesture_quality}
                </div>
                <Bdg label={r.confidence_level} v={r.confidence_level === "High" ? "success" : "warning"} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}