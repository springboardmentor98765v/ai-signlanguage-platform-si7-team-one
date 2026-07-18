import { useState, useEffect } from "react";
import {
  Home, BookOpen, Camera, CheckSquare, MessageCircle, TrendingUp,
  Award, Users, Settings, Bell, ChevronRight, Play, RotateCcw,
  ArrowRight, Eye, EyeOff, Clock, Zap, Target, Activity,
  Shield, Server, UserCheck, LogOut, Plus, Search, Filter,
  Download, Share2, AlertTriangle, CheckCircle, XCircle, Info,
  SkipForward, Calendar, Lock, Mail, Check, ChevronLeft,
} from "lucide-react";
import { HandOverlay } from "../components/shared/HandOverlay";
import { Bdg } from "../components/shared/Indicators";

export default function TrainerConsole() {
  const [sel, setSel] = useState<number | null>(null);
  const cases = [
    { id: 1, user: "Alex Kim",      sign: "DISGUST", ai: 48, t: "10 min ago" },
    { id: 2, user: "Taylor Brown",  sign: "FEAR",    ai: 52, t: "22 min ago" },
    { id: 3, user: "Yuki Tanaka",   sign: "PLEASE",  ai: 61, t: "1 hr ago" },
    { id: 4, user: "Carlos M.",     sign: "HELLO",   ai: 44, t: "2 hr ago" },
  ];
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Trainer Console</h2>
          <p className="text-muted-foreground text-sm">Review AI-flagged low-confidence gesture predictions</p>
        </div>
        <Bdg label={`${cases.length} pending review`} v="warning" />
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-2.5">
          {cases.map(c => (
            <button
              key={c.id} onClick={() => setSel(c.id)}
              className={`w-full p-4 rounded-[14px] border text-left transition-all ${
                sel === c.id ? "border-primary/40 bg-primary/5" : "border-border bg-card hover:border-primary/20"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-foreground flex-shrink-0">
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
          <div className="bg-card border border-border rounded-[14px] p-6 space-y-5" style={{ boxShadow: 'var(--card-shadow)' }}>
            <h3 className="font-semibold text-foreground text-sm">Review Case #{sel}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted rounded-xl p-3">
                <div className="text-xs text-muted-foreground mb-2 text-center">User Gesture</div>
                <div className="flex items-center justify-center">
                  <HandOverlay w={100} h={90} animated />
                </div>
              </div>
              <div className="bg-muted rounded-xl p-3">
                <div className="text-xs text-muted-foreground mb-2 text-center">Reference</div>
                <div className="flex items-center justify-center">
                  <HandOverlay w={100} h={90} animated={false} />
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Trainer Notes</label>
              <textarea
                className="w-full bg-card border border-border rounded-xl p-3.5 text-sm text-foreground resize-none focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 h-20"
                placeholder="Add correction notes…"
              />
            </div>
            <div className="flex gap-2">
              <button className="flex-1 bg-success hover:bg-success/90 text-white text-xs font-bold py-2.5 rounded-xl transition-colors">Approve</button>
              <button className="flex-1 bg-muted border border-border text-xs text-foreground py-2.5 rounded-xl hover:bg-hover transition-all">Override</button>
              <button className="bg-danger/10 border border-danger/30 text-danger text-xs px-3 py-2.5 rounded-xl hover:bg-danger/15 transition-colors">Flag</button>
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-[14px] flex items-center justify-center text-muted-foreground text-sm" style={{ boxShadow: 'var(--card-shadow)' }}>
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
