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
import { Bdg } from "../components/shared/Indicators";

export default function AssessmentScreen({ go }: { go: (s: Screen) => void }) {
  const [qIdx, setQIdx] = useState(3);
  const [scores, setScores] = useState([92, 88, 75]);
  const [capturing, setCapturing] = useState(false);
  const [timer, setTimer] = useState(0);
  const SIGNS = ["HELLO", "THANK YOU", "PLEASE", "FEAR", "SURPRISE", "DISGUST", "YES", "NO"];
  const TOTAL = 8;

  const capture = () => {
    setCapturing(true);
    let t = 3;
    setTimer(t);
    const id = setInterval(() => {
      t--;
      setTimer(t);
      if (t === 0) {
        clearInterval(id);
        setCapturing(false);
        const s = 60 + Math.floor(Math.random() * 35);
        setScores(prev => [...prev, s]);
        setTimeout(() => {
          if (qIdx < TOTAL) setQIdx(q => q + 1);
          else go("feedback");
        }, 800);
      }
    }, 1000);
  };

  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">
      <div className="bg-card border-b border-border px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-semibold text-foreground text-sm">Module 4 Assessment</h3>
            <p className="text-xs text-muted-foreground">Sign {qIdx} of {TOTAL} · Emotions &amp; Mental States</p>
          </div>
          {avg > 0 && <Bdg label={`${avg}% avg`} v="info" />}
        </div>
        <div className="flex gap-1">
          {Array.from({ length: TOTAL }, (_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-all ${
                i < scores.length
                  ? scores[i] >= 80 ? "bg-success" : scores[i] >= 60 ? "bg-warning" : "bg-danger"
                  : i === qIdx - 1 ? "bg-primary animate-pulse" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 flex gap-5 p-5 overflow-hidden">
        <div className="flex-1 bg-muted rounded-[14px] border border-border relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <HandOverlay w={240} h={300} animated={!capturing} />
          </div>
          {capturing && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
              <div className="text-center">
                <div className="text-7xl font-bold text-primary mb-2">{timer}</div>
                <div className="text-sm text-muted-foreground">Hold your sign steady…</div>
              </div>
            </div>
          )}
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-card/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-border">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-xs text-muted-foreground">Camera active</span>
          </div>
        </div>

        <div className="w-56 flex flex-col gap-3 flex-shrink-0">
          <div className="bg-card border border-border rounded-[14px] p-4" style={{ boxShadow: 'var(--card-shadow)' }}>
            <div className="text-xs text-muted-foreground mb-1">Sign this word:</div>
            <div className="text-4xl font-bold text-foreground mb-2">{SIGNS[qIdx - 1]}</div>
            <div className="flex items-center justify-center">
              <HandOverlay w={100} h={80} animated={false} />
            </div>
          </div>

          <button
            onClick={capture} disabled={capturing}
            className={`py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              capturing ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary hover:bg-primary/90 text-primary-foreground"
            }`}
          >
            <Camera size={15} />
            {capturing ? "Capturing…" : "Capture Sign"}
          </button>

          {scores.length > 0 && (
            <div className="bg-card border border-border rounded-[14px] p-3 flex-1 overflow-y-auto" style={{ boxShadow: 'var(--card-shadow)' }}>
              <div className="text-xs text-muted-foreground mb-2">Previous Scores</div>
              <div className="space-y-2">
                {scores.map((sc, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="text-xs text-muted-foreground w-14 truncate">{SIGNS[i]}</div>
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${sc >= 80 ? "bg-success" : sc >= 60 ? "bg-warning" : "bg-danger"}`} style={{ width: `${sc}%` }} />
                    </div>
                    <div className="text-xs font-semibold text-foreground">{sc}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => go("feedback")}
            className="flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground border border-border rounded-xl py-2.5 transition-all hover:border-primary/30"
          >
            <ArrowRight size={13} />
            View Results
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Feedback Screen ────────────────────────────────────────────────────────
