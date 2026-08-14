import { useState, useEffect, useRef } from "react";
import {
  Home, BookOpen, Camera, CheckSquare, MessageCircle, TrendingUp,
  Award, Users, Settings, Bell, ChevronRight, Play, RotateCcw,
  ArrowRight, Eye, EyeOff, Clock, Zap, Target, Activity,
  Shield, Server, UserCheck, LogOut, Plus, Search, Filter,
  Download, Share2, AlertTriangle, CheckCircle, XCircle, Info,
  SkipForward, Calendar, Lock, Mail, Check, ChevronLeft, Loader2,
} from "lucide-react";
import type { Screen } from "../lib/types";
import { HandOverlay } from "../components/shared/HandOverlay";
import { FlowStepper } from "../components/shared/FlowStepper";
import { useAuth } from "../context/AuthContext";
import { startPracticeSession, submitPracticeAttempt, endPracticeSession } from "../services/businessApi";
type AttemptResult = {
  success: boolean;
  predicted_sign?: string;
  confidence?: number;
  hold_seconds?: number;
  message?: string;
  // AI guidance fields from Intern 3's updated /predict response
  suggestion?: string;        // e.g. "Move hand closer to camera"
  hand_position?: string;     // "Left" | "Center" | "Right"
  hand_distance?: string;     // "Too Far" | "Good Distance" | "Too Close"
  gesture_quality?: string;   // "Good" | "Poor" etc.
  processing_time_ms?: number;
  assessment?: {
    correct_predictions: number;
    total_predictions: number;
    accuracy_percentage: number;
    score: number;
    grade: string;
  };
};

const PLACEHOLDER_LESSON_ID = 1;
const MAX_ATTEMPTS = 5;

// M2 Day 7: expanded sign list — full A-Z alphabet + common words.
// Intern 3's model currently covers A-Z; words section can be enabled
// once the model supports them (uncomment below when ready).
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const WORDS = ["Hello", "Thank you", "Please", "Yes", "No"];
const ALL_SIGNS = [...ALPHABET, ...WORDS];

export default function PracticeScreen({ go }: { go: (s: Screen) => void }) {
  const { userId } = useAuth();
  const [sign, setSign] = useState("A");
  const [category, setCategory] = useState<"alphabet" | "words">("alphabet");
  const [attempts, setAttempts] = useState(0);

  // ── M2 Day 7: Timer ──────────────────────────────────────────────────
  const [timerActive, setTimerActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    setElapsed(0);
    setTimerActive(true);
  };
  const stopTimer = () => {
    setTimerActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive]);

  const fmtTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [result, setResult] = useState<AttemptResult | null>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const holdStartedAt = useRef<string | null>(null);
  const sessionEndedRef = useRef(false);
  // Effect 1 — camera only, runs once
useEffect(() => {
  let stream: MediaStream | null = null;
  navigator.mediaDevices
    ?.getUserMedia({ video: { facingMode: "user" } })
    .then(s => {
      stream = s;
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        setCameraReady(true);
        startTimer();
      }
    })
    .catch(() => setCameraError("Couldn't access your camera."));
  return () => {
    stream?.getTracks().forEach(t => t.stop());
    stopTimer();
  };
}, []);  // ← empty array, camera opens once only

// Effect 2 — abandon session on unmount, reads latest sessionId via ref
const sessionIdRef = useRef<string | null>(null);
useEffect(() => {
  sessionIdRef.current = sessionId;  // keep ref in sync whenever sessionId changes
}, [sessionId]);

useEffect(() => {
  return () => {
    // cleanup uses ref (not closure) so it always sees the latest sessionId
    if (sessionIdRef.current && !sessionEndedRef.current) {
      sessionEndedRef.current = true;
      endPracticeSession(sessionIdRef.current, "abandoned").catch(() => {});
    }
  };
}, []);  // ← empty array, cleanup registered once only

  useEffect(() => {
    const uid = userId ?? "00000000-0000-0000-0000-000000000000";
    startPracticeSession(uid, PLACEHOLDER_LESSON_ID)
      .then(session => {
        setSessionId(session.session_id);
        localStorage.setItem("current_session_id", session.session_id);
        localStorage.setItem("current_expected_sign", sign);
      })
      .catch(() => setSessionError("Couldn't start a practice session. Is the Business Logic service running on port 8002?"));
    holdStartedAt.current = new Date().toISOString();
  }, []);

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current || !sessionId) return;
    setCapturing(true);
    setResult(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) { setCapturing(false); return; }
      try {
        const data: AttemptResult = await submitPracticeAttempt(
          sessionId, sign, blob, holdStartedAt.current ?? undefined
        );
        setResult(data);
        setAttempts(a => a + 1);
        localStorage.setItem("current_expected_sign", sign);
      } catch (e) {
        setResult({ success: false, message: `Request failed: ${(e as Error).message}` });
      } finally {
        setCapturing(false);
        holdStartedAt.current = new Date().toISOString();
      }
    }, "image/jpeg", 0.9);
  };

  const handleSignChange = (s: string) => {
    setSign(s);
    setResult(null);
    setAttempts(0);
    setElapsed(0);
    holdStartedAt.current = new Date().toISOString();
    localStorage.setItem("current_expected_sign", s);
  };

  const acc = result?.assessment?.accuracy_percentage ?? null;
  const confCol = acc == null ? "bg-[#1a2844]" : acc >= 80 ? "bg-emerald-500" : acc >= 60 ? "bg-amber-500" : "bg-rose-500";
  const confTxt = acc == null ? "text-muted-foreground" : acc >= 80 ? "text-emerald-400" : acc >= 60 ? "text-amber-400" : "text-rose-400";
  const currentSigns = category === "alphabet" ? ALPHABET : WORDS;
  const handleFinish = async () => {
    if (sessionId && !sessionEndedRef.current) {
      sessionEndedRef.current = true;
      try {
        await endPracticeSession(sessionId, "completed");
      } catch (e) {
        // non-fatal — still let them see feedback even if the end-call fails
      }
    }
    go("feedback");
  };
  return (
    <div className="h-full bg-[#060b13] flex flex-col overflow-hidden">
      <FlowStepper active={1} />

      <div className="flex-1 flex overflow-hidden">
        {/* Camera feed */}
        <div className="flex-1 relative bg-gradient-to-b from-[#0a1a0a] via-[#091410] to-[#060b13]">
          <video
            ref={videoRef}
            autoPlay playsInline muted
            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
          />
          <canvas ref={canvasRef} className="hidden" />

          {!cameraReady && !cameraError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <HandOverlay w={320} h={390} animated />
            </div>
          )}

          {cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-8">
              <AlertTriangle size={28} className="text-rose-400" />
              <p className="text-sm text-muted-foreground max-w-sm">{cameraError}</p>
            </div>
          )}

          {sessionError && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-rose-950/70 border border-rose-900/50 text-rose-400 text-xs px-4 py-2 rounded-xl backdrop-blur-sm">
              {sessionError}
            </div>
          )}

          {/* Camera status */}
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${cameraReady ? "bg-emerald-400" : "bg-muted-foreground"}`} />
            <span className="text-xs text-muted-foreground">{cameraReady ? "Camera live" : "Connecting..."}</span>
          </div>

          {/* M2 Day 7: Timer */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <Clock size={11} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-mono">{fmtTime(elapsed)}</span>
          </div>

          {/* M2 Day 7: Attempt progress bar */}
          <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
            <span className="text-xs text-muted-foreground bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
              Attempt {attempts} / {MAX_ATTEMPTS}
            </span>
            <div className="w-28 h-1.5 bg-black/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${(attempts / MAX_ATTEMPTS) * 100}%` }}
              />
            </div>
          </div>

          {result && (
            <div className={`absolute top-14 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-sm font-semibold backdrop-blur-sm ${
              result.success ? "bg-emerald-950/70 text-emerald-400 border border-emerald-900/50" : "bg-rose-950/70 text-rose-400 border border-rose-900/50"
            }`}>
              {result.success
                ? `Predicted: ${result.predicted_sign} · Score: ${result.assessment?.score ?? "—"} (${result.assessment?.grade ?? "—"})`
                : (result.message ?? "No prediction")}
            </div>
          )}

          {/* AI hand guidance toast — shown after a capture */}
          {result?.success && result.suggestion && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-amber-950/80 border border-amber-900/50 text-amber-300 text-xs px-4 py-2 rounded-xl backdrop-blur-sm whitespace-nowrap">
              <Info size={12} className="flex-shrink-0" />
              {result.suggestion}
            </div>
          )}

          <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-1.5 px-2 md:gap-3 md:px-0">
            <button
              onClick={() => { setResult(null); setAttempts(0); setElapsed(0); }}
              className="flex items-center gap-1.5 bg-[#0e1a30]/80 backdrop-blur border border-border hover:border-cyan-900/40 text-foreground px-3 py-2.5 md:px-5 rounded-xl text-xs md:text-sm font-semibold transition-all"
            >
              <RotateCcw size={15} />
              Try Again
            </button>
            <button
              onClick={handleCapture}
              disabled={!cameraReady || !sessionId || capturing || attempts >= MAX_ATTEMPTS}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-primary-foreground px-4 py-2.5 md:px-6 rounded-xl text-xs md:text-sm font-bold transition-colors"
            >
              {capturing ? <Loader2 size={15} className="animate-spin" /> : <Camera size={15} />}
              {capturing ? "Analyzing..." : attempts >= MAX_ATTEMPTS ? "Max attempts reached" : "Capture & Predict"}
            </button>
            <button
              onClick={handleFinish}
              disabled={!sessionId}
              className="flex items-center gap-1.5 bg-[#0e1a30]/80 backdrop-blur border border-border hover:border-cyan-900/40 text-foreground px-3 py-2.5 md:px-5 rounded-xl text-xs md:text-sm font-semibold transition-all disabled:opacity-60"
            >
              <SkipForward size={15} />
              Get Feedback
            </button>
          </div>
        </div>

        {/* Right panel */}
        <div className="hidden md:flex flex-shrink-0 border-l border-border bg-[#0a1425] flex-col p-4 gap-4 overflow-y-auto" style={{ width: "272px" }}>
          <div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Target Sign</div>
            <div className="text-3xl font-bold text-foreground leading-none mb-1">{sign}</div>
            <div className="text-xs text-muted-foreground">Lesson 3 · Alphabet</div>
          </div>

          <div className="bg-[#0d1625] border border-border rounded-xl overflow-hidden">
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider p-2.5 pb-0">Reference</div>
            <div className="flex items-center justify-center py-2">
              <HandOverlay w={120} h={140} animated={false} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Accuracy Score</div>
              <span className={`text-xl font-bold ${confTxt}`}>{acc != null ? `${acc}%` : "—"}</span>
            </div>
            <div className="h-2.5 bg-[#1a2844] rounded-full overflow-hidden mb-1">
              <div className={`h-full rounded-full transition-all duration-300 ${confCol}`} style={{ width: `${acc ?? 0}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Low</span>
              <span className={confTxt}>{result?.assessment?.grade ? `Grade ${result.assessment.grade}` : "Waiting for capture"}</span>
              <span>High</span>
            </div>
          </div>

          {result?.success && result.assessment && (
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Session Stats</div>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div>Correct: <span className="text-foreground">{result.assessment.correct_predictions} / {result.assessment.total_predictions}</span></div>
                <div>Hold time: <span className="text-foreground">{result.hold_seconds?.toFixed(1) ?? "—"}s</span></div>
                {result.processing_time_ms != null && (
                  <div>Inference: <span className="text-foreground">{result.processing_time_ms.toFixed(0)}ms</span></div>
                )}
              </div>
            </div>
          )}

          {/* AI hand guidance — position, distance, quality */}
          {result?.success && (result.hand_position || result.hand_distance || result.gesture_quality) && (
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Hand Guidance</div>
              <div className="space-y-1.5 text-xs">
                {result.hand_position && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Position</span>
                    <span className={result.hand_position === "Center" ? "text-emerald-400" : "text-amber-400"}>
                      {result.hand_position}
                    </span>
                  </div>
                )}
                {result.hand_distance && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Distance</span>
                    <span className={result.hand_distance === "Good Distance" ? "text-emerald-400" : "text-amber-400"}>
                      {result.hand_distance}
                    </span>
                  </div>
                )}
                {result.gesture_quality && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quality</span>
                    <span className={result.gesture_quality === "Good" ? "text-emerald-400" : "text-rose-400"}>
                      {result.gesture_quality}
                    </span>
                  </div>
                )}
                {result.suggestion && (
                  <div className="mt-2 text-[10px] text-amber-400 bg-amber-950/30 border border-amber-900/30 rounded-lg px-2.5 py-2 leading-relaxed">
                    💡 {result.suggestion}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* M2 Day 7: Expanded sign picker with category tabs */}
          <div className="mt-auto">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Pick a Sign</div>
            <div className="flex gap-1.5 mb-2.5">
              {(["alphabet", "words"] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => { setCategory(cat); handleSignChange(cat === "alphabet" ? "A" : "Hello"); }}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold capitalize transition-all ${
                    category === cat ? "bg-primary text-primary-foreground" : "bg-[#0e1a30] text-muted-foreground border border-border hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {currentSigns.map(s => (
                <button
                  key={s}
                  onClick={() => handleSignChange(s)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                    s === sign
                      ? "bg-primary text-primary-foreground"
                      : "bg-[#0e1a30] text-muted-foreground border border-border hover:text-foreground"
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