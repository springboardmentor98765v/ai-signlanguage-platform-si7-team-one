import { useState, useEffect } from "react";
import {
  Home, BookOpen, Camera, CheckSquare, MessageCircle, TrendingUp,
  Award, Users, Settings, Bell, ChevronRight, Play, RotateCcw,
  ArrowRight, Eye, EyeOff, Clock, Zap, Target, Activity,
  Shield, Server, UserCheck, LogOut, Plus, Search, Filter,
  Download, Share2, AlertTriangle, CheckCircle, XCircle, Info,
  SkipForward, Calendar, Lock, Mail, Check, ChevronLeft,
} from "lucide-react";
import { MCard } from "../components/shared/MCard";
import { Bdg, PBar } from "../components/shared/Indicators";

export default function StudentDetail() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/70 to-primary/40 flex items-center justify-center text-xl font-bold text-primary-foreground">P</div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Priya Patel</h2>
          <p className="text-muted-foreground text-sm">priya.patel@example.com · Enrolled Jun 1, 2026</p>
        </div>
        <Bdg label="At Risk" v="warning" />
        <button className="ml-auto bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-xl transition-colors">
          Send Feedback
        </button>
      </div>
      <div className="grid grid-cols-4 gap-5">
        <MCard icon={TrendingUp} label="Overall Progress" value="45%" col="amber" />
        <MCard icon={Target}     label="Avg Accuracy"     value="62%" col="amber" />
        <MCard icon={Clock}      label="Time This Week"   value="1.2h" col="violet" />
        <MCard icon={Calendar}   label="Last Active"      value="3d ago" col="cyan" />
      </div>
      <div className="bg-card border border-border rounded-[14px]  p-6 " style={{ boxShadow: 'var(--card-shadow)' }}>
        <h3 className="font-semibold text-foreground mb-5 text-sm">Assessment History</h3>
        <div className="space-y-2.5">
          {[
            { mod: "Greetings",    date: "Jul 10", score: 78, att: 3 },
            { mod: "Numbers 1–10", date: "Jul 8",  score: 58, att: 5 },
            { mod: "Alphabet A–M", date: "Jul 5",  score: 65, att: 4 },
          ].map(a => (
            <div key={a.mod} className="flex items-center gap-4 p-3.5 bg-muted/50 rounded-xl border border-border/50">
              <div className="flex-1">
                <div className="text-sm font-semibold text-foreground">{a.mod}</div>
                <div className="text-xs text-muted-foreground">{a.date} · {a.att} attempts</div>
              </div>
              <PBar pct={a.score} cls="w-28" />
              <div className="text-sm font-bold text-foreground w-10 text-right">{a.score}%</div>
              <Bdg label={a.score >= 75 ? "Pass" : "Needs Work"} v={a.score >= 75 ? "success" : "warning"} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// D. TRAINER CONSOLE
// ══════════════════════════════════════════════════════════════════════════
