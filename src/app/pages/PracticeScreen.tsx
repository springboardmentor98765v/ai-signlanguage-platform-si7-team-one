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
import { FlowStepper } from "../components/shared/FlowStepper";

export default function PracticeScreen({ go }: { go: (s: Screen) => void }) {
  const [conf, setConf] = useState(73);
  const [attempts, setAttempts] = useState(2);
  const [sign, setSign] = useState("FEAR");
  const SIGNS = ["FEAR", "SURPRISE", "DISGUST", "HAPPY", "SAD"];

  useEffect(() => {
    const id = setInterval(() => {
      setConf(v => Math.max(42, Math.min(98, v + (Math.random() - 0.42) * 5)));
    }, 600);
    return () => clearInterval(id);
  }, []);

  const confRnd = Math.round(conf);
  const confCol = conf >= 80 ? "bg-success" : conf >= 60 ? "bg-warning" : "bg-danger";
  const confTxt = conf >= 80 ? "text-success" : conf >= 60 ? "text-warning" : "text-danger";
  const confMsg = conf >= 80 ? "Great!" : conf >= 60 ? "Almost there" : "Keep trying";

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">
      <FlowStepper active={1} />

      <div className="flex-1 flex overflow-hidden">
        {/* Camera feed */}
        <div className="flex-1 relative bg-gradient-to-b from-muted via-muted to-background">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 -m-12 bg-primary/3 rounded-full blur-3xl" />
              <HandOverlay w={320} h={390} animated />
            </div>
          </div>

          <div className="absolute top-4 left-4 flex items-center gap-2 bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-muted-foreground">Hand detected</span>
          </div>

          <div className="absolute top-4 right-4 bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-muted-foreground border border-border">
            Attempt {attempts} / 5
          </div>

          <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-3">
            <button
              onClick={() => { setAttempts(a => a + 1); setConf(50 + Math.random() * 20); }}
              className="flex items-center gap-2 bg-card/80 backdrop-blur border border-border hover:bg-hover text-foreground px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            >
              <RotateCcw size={15} />
              Try Again
            </button>
            <button
              onClick={() => go("feedback")}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-bold transition-colors"
            >
              <SkipForward size={15} />
              Next Sign
            </button>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-68 flex-shrink-0 border-l border-border bg-card flex flex-col p-4 gap-4 overflow-y-auto" style={{ width: "272px" }}>
          <div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Target Sign</div>
            <div className="text-3xl font-bold text-foreground leading-none mb-1">{sign}</div>
            <div className="text-xs text-muted-foreground">Lesson 3 · Emotions</div>
          </div>

          <div className="bg-muted border border-border rounded-xl overflow-hidden relative">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider p-2.5 pb-0">Reference</div>
            <div className="flex items-center justify-center py-2">
              <HandOverlay w={120} h={140} animated={false} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">AI Confidence</div>
              <span className={`text-xl font-bold ${confTxt}`}>{confRnd}%</span>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden mb-1">
              <div className={`h-full rounded-full transition-all duration-300 ${confCol}`} style={{ width: `${conf}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Low</span>
              <span className={confTxt}>{confMsg}</span>
              <span>High</span>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Breakdown</div>
            <div className="space-y-2">
              {[
                { lbl: "Hand Shape",  score: 91 },
                { lbl: "Movement",    score: 78 },
                { lbl: "Orientation", score: 85 },
                { lbl: "Location",    score: confRnd },
              ].map(({ lbl, score }) => (
                <div key={lbl} className="flex items-center gap-2">
                  <div className="text-xs text-muted-foreground w-20">{lbl}</div>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${score >= 80 ? "bg-success" : score >= 65 ? "bg-warning" : "bg-danger"}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <div className="text-xs font-semibold text-foreground w-8 text-right">{score}%</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Signs in Set</div>
            <div className="flex flex-wrap gap-1.5">
              {SIGNS.map(s => (
                <button
                  key={s} onClick={() => setSign(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    s === sign ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground border border-border hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Assessment Screen ──────────────────────────────────────────────────────
