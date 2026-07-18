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
import { HandOverlay } from "../components/shared/HandOverlay";
import { Bdg, Ring } from "../components/shared/Indicators";
import { FlowStepper } from "../components/shared/FlowStepper";

export default function FeedbackScreen({ go }: { go: (s: Screen) => void }) {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <FlowStepper active={3} />

      <div className="bg-card border border-border rounded-[14px] p-6 flex items-center gap-5" style={{ boxShadow: 'var(--card-shadow)' }}>
        <Ring pct={84} size={96} />
        <div>
          <h2 className="text-lg font-bold text-foreground">Great work, Maya!</h2>
          <p className="text-muted-foreground text-sm mt-1.5">
            You scored 84% on FEAR — a 9-point improvement from your last attempt.
          </p>
          <div className="flex gap-2 mt-3">
            <Bdg label="Personal Best 🎉" v="success" />
            <Bdg label="4th Attempt" v="info" />
          </div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-xs text-muted-foreground">Accuracy trend</div>
          <div className="text-2xl font-bold text-success mt-0.5">+9%</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {[
          { lbl: "Your Attempt", col: "bg-primary", badge: <Bdg label="84%" v="info" />, anim: true },
          { lbl: "Reference Sign", col: "bg-success", badge: <Bdg label="Target" v="success" />, anim: false },
        ].map(({ lbl, col, badge, anim }) => (
          <div key={lbl} className="bg-card border border-border rounded-[14px] overflow-hidden" style={{ boxShadow: 'var(--card-shadow)' }}>
            <div className="p-3 border-b border-border flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${col}`} />
              <span className="text-xs font-semibold text-foreground">{lbl}</span>
              {badge}
            </div>
            <div className="flex items-center justify-center py-4 bg-muted h-40">
              <HandOverlay w={160} h={130} animated={anim} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-[14px] p-6" style={{ boxShadow: 'var(--card-shadow)' }}>
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-sm">
          <MessageCircle size={15} className="text-primary" />
          AI Correction Tips
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { a: "Hand Shape",       s: "good",    t: "Fingers spread correctly — palm orientation matches reference." },
            { a: "Movement",         s: "warning", t: "The upward trembling motion needs slightly more speed." },
            { a: "Facial Expression",s: "error",   t: "Widen the eyes more — this is critical for FEAR in ASL." },
            { a: "Location",         s: "good",    t: "Hand positioned at the correct height relative to shoulder." },
          ].map(({ a, s, t }) => (
            <div key={a} className={`p-3 rounded-xl border ${
              s === "good" ? "border-success/30 bg-success/5" :
              s === "warning" ? "border-warning/30 bg-warning/5" :
              "border-danger/30 bg-danger/5"
            }`}>
              <div className="flex items-center gap-1.5 mb-1">
                {s === "good" ? <CheckCircle size={13} className="text-success" /> :
                 s === "warning" ? <AlertTriangle size={13} className="text-warning" /> :
                 <XCircle size={13} className="text-danger" />}
                <span className="text-xs font-semibold text-foreground">{a}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{t}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={() => go("practice")} className="flex items-center gap-2 bg-muted border border-border hover:bg-hover text-foreground px-4 py-2.5 rounded-xl text-sm font-semibold transition-all">
          <RotateCcw size={14} />
          Try FEAR Again
        </button>
        <button onClick={() => go("practice")} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-bold transition-colors">
          <SkipForward size={14} />
          Next: SURPRISE
        </button>
        <button onClick={() => go("progress")} className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          View Progress <TrendingUp size={13} />
        </button>
      </div>
    </div>
  );
}

// ── Progress Analytics ─────────────────────────────────────────────────────
