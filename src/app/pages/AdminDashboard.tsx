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
import { adminGrowth } from "../lib/mockData";
import { MCard } from "../components/shared/MCard";
import { useIsDark } from "../lib/useIsDark";

export default function AdminDashboard() {
  const dark = useIsDark();
  const grid = dark ? "rgba(255,255,255,0.05)" : "#EBEBEB";
  const tick = dark ? "#9CA3AF" : "#6A6A6A";
  const tipBg = dark ? "#1C1C1E" : "#FFFFFF";
  const tipBorder = dark ? "rgba(255,255,255,0.08)" : "#DDDDDD";
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
        <MCard icon={Users}       label="Active Users"        value="2,847" delta="+107 this month"   col="cyan" />
        <MCard icon={TrendingUp}  label="Completion Rate"     value="73%"   delta="+4% vs last month"  col="emerald" />
        <MCard icon={Activity}    label="AI Predictions Today"value="14.2k" delta="98.7% accurate"    col="violet" />
        <MCard icon={Server}      label="System Health"       value="99.8%" delta="All services nominal" col="emerald" />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-[14px]  p-6 " style={{ boxShadow: 'var(--card-shadow)' }}>
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

        <div className="bg-card border border-border rounded-[14px]  p-6 " style={{ boxShadow: 'var(--card-shadow)' }}>
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
    </div>
  );
}
