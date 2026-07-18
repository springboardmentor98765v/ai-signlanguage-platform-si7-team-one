import { useState, useEffect } from "react";
import {
  Home, BookOpen, Camera, CheckSquare, MessageCircle, TrendingUp,
  Award, Users, Settings, Bell, ChevronRight, Play, RotateCcw,
  ArrowRight, Eye, EyeOff, Clock, Zap, Target, Activity,
  Shield, Server, UserCheck, LogOut, Plus, Search, Filter,
  Download, Share2, AlertTriangle, CheckCircle, XCircle, Info,
  SkipForward, Calendar, Lock, Mail, Check, ChevronLeft,
} from "lucide-react";

export default function SystemMonitoring() {
  const SVCS = [
    { name: "User Service",       icon: Users,         healthy: true,  uptime: 99.9, lat: 42,  err: 0.01, rps: 1240 },
    { name: "Course Service",     icon: BookOpen,      healthy: true,  uptime: 99.8, lat: 38,  err: 0.02, rps: 890 },
    { name: "Practice Service",   icon: Camera,        healthy: true,  uptime: 99.7, lat: 65,  err: 0.03, rps: 2100 },
    { name: "Assessment Service", icon: CheckSquare,   healthy: false, uptime: 98.1, lat: 120, err: 1.8,  rps: 445 },
    { name: "Feedback Service",   icon: MessageCircle, healthy: true,  uptime: 99.9, lat: 28,  err: 0.01, rps: 760 },
    { name: "Analytics Service",  icon: TrendingUp,    healthy: true,  uptime: 100,  lat: 15,  err: 0,    rps: 320 },
  ];
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-3 gap-5">
        {SVCS.map(svc => (
          <div key={svc.name} className={`bg-card rounded-[14px] p-5 border ${svc.healthy ? "border-border" : "border-warning/30 bg-warning/5"}`} style={{ boxShadow: 'var(--card-shadow)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
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

      <div className="bg-card border border-border rounded-[14px]  p-6 " style={{ boxShadow: 'var(--card-shadow)' }}>
        <h3 className="font-semibold text-foreground mb-5 text-sm">Recent Error Logs</h3>
        <div className="space-y-1.5">
          {[
            { t: "14:32:11", lvl: "WARN",  svc: "assessment", msg: "Model confidence below threshold for gesture ID: g_8841" },
            { t: "14:28:03", lvl: "WARN",  svc: "assessment", msg: "Prediction latency spike: 287ms (threshold: 200ms)" },
            { t: "14:15:57", lvl: "INFO",  svc: "practice",   msg: "Webcam session started — user_id: 4921" },
            { t: "14:01:22", lvl: "ERROR", svc: "assessment", msg: "Hand landmark detection failed — insufficient lighting" },
            { t: "13:55:44", lvl: "INFO",  svc: "analytics",  msg: "Daily stats aggregation complete — 14,201 predictions processed" },
          ].map((log, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-muted font-mono text-xs">
              <span className="text-muted-foreground flex-shrink-0">{log.t}</span>
              <span className={`w-12 flex-shrink-0 font-semibold ${log.lvl === "ERROR" ? "text-danger" : log.lvl === "WARN" ? "text-warning" : "text-primary"}`}>{log.lvl}</span>
              <span className="text-muted-foreground w-20 flex-shrink-0">[{log.svc}]</span>
              <span className="text-foreground">{log.msg}</span>
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
