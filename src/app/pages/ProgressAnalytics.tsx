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
import { useIsDark } from "../lib/useIsDark";

export default function ProgressAnalytics() {
  const dark = useIsDark();
  const grid = dark ? "rgba(255,255,255,0.05)" : "#EBEBEB";
  const tick = dark ? "#9CA3AF" : "#6A6A6A";
  const tipBg = dark ? "#1C1C1E" : "#FFFFFF";
  const tipBorder = dark ? "rgba(255,255,255,0.08)" : "#DDDDDD";
  const barFill = dark ? "#FFFFFF" : "#4B8299";
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-4 gap-5">
        <MCard icon={TrendingUp} label="Avg Accuracy (30d)" value="84%" delta="+11% vs last month" col="cyan" />
        <MCard icon={Target}     label="Signs Mastered"      value="142" delta="of 248 learned"     col="emerald" />
        <MCard icon={Clock}      label="Practice Time"       value="31.4h" delta="this month"       col="violet" />
        <MCard icon={Zap}        label="Current Streak"      value="14 days" delta="Best: 21 days"  col="amber" />
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 bg-card border border-border rounded-[14px]  p-6 " style={{ boxShadow: 'var(--card-shadow)' }}>
          <h3 className="font-semibold text-foreground mb-5 text-sm">Accuracy Over Time</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={accuracyData}>
              <defs>
                <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={dark ? "#FFFFFF" : "#4B8299"} stopOpacity={dark ? 0.12 : 0.15} />
                  <stop offset="95%" stopColor={dark ? "#FFFFFF" : "#4B8299"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={grid} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: tick }} tickLine={false} axisLine={false} interval={2} />
              <YAxis tick={{ fontSize: 11, fill: tick }} tickLine={false} axisLine={false} domain={[50, 100]} />
              <Tooltip contentStyle={{ background: tipBg, border: `1px solid ${tipBorder}`, borderRadius: 12, fontSize: 12, color: dark ? "#FFFFFF" : "#222222" }} />
              <Area type="monotone" dataKey="accuracy" stroke={dark ? "#FFFFFF" : "#4B8299"} strokeWidth={2} fill="url(#ag)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card border border-border rounded-[14px]  p-6 " style={{ boxShadow: 'var(--card-shadow)' }}>
          <h3 className="font-semibold text-foreground mb-5 text-sm">Practice Time This Week</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyTime} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: tick }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: tick }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: tipBg, border: `1px solid ${tipBorder}`, borderRadius: 12, fontSize: 12, color: dark ? "#FFFFFF" : "#222222" }} />
              <Bar dataKey="min" fill={barFill} radius={[4, 4, 0, 0]} name="minutes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-[14px]  p-6 " style={{ boxShadow: 'var(--card-shadow)' }}>
          <h3 className="font-semibold text-foreground mb-5 text-sm">Accuracy by Category</h3>
          <div className="space-y-3.5">
            {[...weakAreas].sort((a, b) => a.v - b.v).map(item => (
              <div key={item.cat} className="flex items-center gap-3">
                <div className="text-xs text-muted-foreground w-20">{item.cat}</div>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
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

        <div className="bg-card border border-border rounded-[14px]  p-6 " style={{ boxShadow: 'var(--card-shadow)' }}>
          <h3 className="font-semibold text-foreground mb-5 text-sm">Practice Calendar — July 2026</h3>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <div key={i} className="text-center text-[10px] text-muted-foreground">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {[0, 1].map(i => <div key={`off${i}`} />)}
            {Array.from({ length: 31 }, (_, i) => {
              const d = i + 1;
              const practiced = d <= 15 && d !== 4 && d !== 10;
              const isToday = d === 16;
              return (
                <div key={d} className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-semibold ${
                  isToday ? "bg-primary text-primary-foreground" :
                  practiced ? "bg-success/10 text-success" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {d}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-success/10" />Practiced</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-primary" />Today</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-muted" />Missed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
