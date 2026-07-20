import { useState, useEffect } from "react";
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
import { accuracyData, weeklyTime, weakAreas } from "../lib/mockData";
import { MCard } from "../components/shared/MCard";
import { Bdg } from "../components/shared/Indicators";
import { getAnalytics } from "../services/aiApi";

interface AiAnalytics {
  total_predictions: number;
  average_confidence: number;
  high_confidence_predictions: number;
  low_confidence_predictions: number;
  most_predicted_sign: string | null;
}

export default function ProgressAnalytics() {
  const [ai, setAi] = useState<AiAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getAnalytics()
      .then(setAi)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">
      {/* ── REAL DATA — from Intern 3's AI service /analytics endpoint. ──
          Session-only: resets whenever the AI service restarts, since
          history is stored in-memory, not a database. */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground text-sm">Live AI Session Stats</h3>
          <Bdg label="Live from AI service" v="info" />
        </div>
        {loading && <div className="h-16 bg-[#0e1a30] rounded-lg animate-pulse" />}
        {!loading && error && (
          <p className="text-xs text-rose-400">Couldn't reach the AI service — is it running on port 8001?</p>
        )}
        {!loading && !error && ai && (
          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className="text-2xl font-bold text-foreground">{ai.total_predictions}</div>
              <div className="text-xs text-muted-foreground">Predictions this session</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{Math.round(ai.average_confidence * 100)}%</div>
              <div className="text-xs text-muted-foreground">Average confidence</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-400">{ai.high_confidence_predictions}</div>
              <div className="text-xs text-muted-foreground">High-confidence</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{ai.most_predicted_sign ?? "—"}</div>
              <div className="text-xs text-muted-foreground">Most practiced sign</div>
            </div>
          </div>
        )}
      </div>

      {/* ── MOCK DATA BELOW — no backing endpoint exists yet for
          time-series accuracy, per-category breakdown, weekly practice
          time, or a practice calendar. Kept as illustrative mock until
          Business Logic's Analytics service (now on main) is wired in. ── */}
      <div className="grid grid-cols-4 gap-4">
        <MCard icon={TrendingUp} label="Avg Accuracy (30d)" value="84%" delta="+11% vs last month" col="cyan" />
        <MCard icon={Target}     label="Signs Mastered"      value="142" delta="of 248 learned"     col="emerald" />
        <MCard icon={Clock}      label="Practice Time"       value="31.4h" delta="this month"       col="violet" />
        <MCard icon={Zap}        label="Current Streak"      value="14 days" delta="Best: 21 days"  col="amber" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4 text-sm">Accuracy Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={accuracyData}>
              <defs>
                <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,140,200,0.07)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#7a90b8" }} tickLine={false} axisLine={false} interval={2} />
              <YAxis tick={{ fontSize: 10, fill: "#7a90b8" }} tickLine={false} axisLine={false} domain={[50, 100]} />
              <Tooltip contentStyle={{ background: "#0e1a30", border: "1px solid rgba(100,140,200,0.1)", borderRadius: 8, fontSize: 11 }} />
              <Area type="monotone" dataKey="accuracy" stroke="#06b6d4" strokeWidth={2} fill="url(#ag)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4 text-sm">Practice Time This Week</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyTime} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,140,200,0.07)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#7a90b8" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#7a90b8" }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#0e1a30", border: "1px solid rgba(100,140,200,0.1)", borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="min" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="minutes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4 text-sm">Accuracy by Category</h3>
          <div className="space-y-3">
            {[...weakAreas].sort((a, b) => a.v - b.v).map(item => (
              <div key={item.cat} className="flex items-center gap-3">
                <div className="text-xs text-muted-foreground w-20">{item.cat}</div>
                <div className="flex-1 h-2 bg-[#1a2844] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.v >= 80 ? "bg-emerald-500" : item.v >= 70 ? "bg-amber-500" : "bg-rose-500"}`}
                    style={{ width: `${item.v}%` }}
                  />
                </div>
                <div className="text-xs font-semibold text-foreground w-9 text-right">{item.v}%</div>
                {item.v < 75 && <Bdg label="Focus" v="warning" />}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4 text-sm">Practice Calendar — July 2026</h3>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <div key={i} className="text-center text-[10px] text-muted-foreground">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {/* offset: July 1 is Wednesday (col 3) */}
            {[0, 1].map(i => <div key={`off${i}`} />)}
            {Array.from({ length: 31 }, (_, i) => {
              const d = i + 1;
              const practiced = d <= 15 && d !== 4 && d !== 10;
              const isToday = d === 16;
              return (
                <div key={d} className={`aspect-square rounded flex items-center justify-center text-[10px] font-semibold ${
                  isToday ? "bg-cyan-500 text-black" :
                  practiced ? "bg-emerald-900/60 text-emerald-400" :
                  "bg-[#0e1a30] text-muted-foreground"
                }`}>
                  {d}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-900/60" />Practiced</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-cyan-500" />Today</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-[#0e1a30]" />Missed</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Certificates ───────────────────────────────────────────────────────────