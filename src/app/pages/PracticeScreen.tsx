import { useState, useEffect, useRef } from "react";
import {
  Home, BookOpen, Camera, CheckSquare, MessageCircle, TrendingUp,
  Award, Users, Settings, Bell, ChevronRight, Play, RotateCcw,
  ArrowRight, Eye, EyeOff, Clock, Zap, Target, Activity,
  Shield, Server, UserCheck, LogOut, Plus, Search, Filter,
  Download, Share2, AlertTriangle, CheckCircle, XCircle, Info,
  SkipForward, Calendar, Lock, Mail, Check, ChevronLeft, Loader2,
  Hand,
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
  suggestion?: string;
  hand_position?: string;
  hand_distance?: string;
  gesture_quality?: string;
  processing_time_ms?: number;
  assessment?: {
    correct_predictions: number;
    total_predictions: number;
    accuracy_percentage: number;
    score: number;
    grade: string;
  };
};

// Motion cue config — direction drives the animated trail on screen
type MotionDir = "left-to-right" | "right-to-left" | "up-to-down" | "circular";
const WORD_MOTION_CUES: Record<string, { arrow: string; description: string; dir: MotionDir }> = {
  "Hello":     { arrow: "➡️", description: "Wave hand Left → Right",   dir: "left-to-right"  },
  "Thank you": { arrow: "⬇️", description: "Hand chin → forward",       dir: "up-to-down"     },
  "Please":    { arrow: "🔄", description: "Circular motion on chest",  dir: "circular"       },
  "Yes":       { arrow: "⬇️", description: "Fist nod Up → Down",       dir: "up-to-down"     },
  "No":        { arrow: "⬅️", description: "Index finger Right → Left", dir: "right-to-left"  },
};

const RECORD_DURATION_MS = 2000; // 2 seconds of recording
const PLACEHOLDER_LESSON_ID = 1;
const MAX_ATTEMPTS = 5;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const WORDS = ["Hello", "Thank you", "Please", "Yes", "No"];

export default function PracticeScreen({ go }: { go: (s: Screen) => void }) {
  const { userId } = useAuth();
  const [sign, setSign] = useState("A");
  const [category, setCategory] = useState<"alphabet" | "words">("alphabet");
  const [attempts, setAttempts] = useState(0);

  // ── Timer ─────────────────────────────────────────────────────────────
  const [timerActive, setTimerActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimer = () => { setElapsed(0); setTimerActive(true); };
  const stopTimer  = () => { setTimerActive(false); if (timerRef.current) clearInterval(timerRef.current); };
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive]);
  const fmtTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  // ── Motion recording state ────────────────────────────────────────────
  const [recording, setRecording]     = useState(false);   // actively recording frames
  const [recordPct, setRecordPct]     = useState(0);        // 0–100 progress bar
  const [motionDone, setMotionDone]   = useState(false);    // recording just finished
  const recordFrames  = useRef<Blob[]>([]);                 // collected frames
  const recordTimer   = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordStart   = useRef<number>(0);

  // ── Motion trail animation ────────────────────────────────────────────
  // phase: "idle" | "animating" (hand moving) | "freeze" (sign name shown 1s)
  const [motionPhase, setMotionPhase] = useState<"idle" | "animating" | "freeze">("idle");
  const [trailPct, setTrailPct]       = useState(0);   // 0-100, drives position
  const trailRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runMotionAnimation = (onDone: () => void) => {
    setMotionPhase("animating");
    setTrailPct(0);
    let pct = 0;
    trailRef.current = setInterval(() => {
      pct += 4;   // ~25 steps x 40ms = 1 second animation
      setTrailPct(Math.min(pct, 100));
      if (pct >= 100) {
        clearInterval(trailRef.current!);
        setMotionPhase("freeze");
        setTimeout(() => {
          setMotionPhase("idle");
          onDone();
        }, 1000);  // sign name stays visible for 1 second
      }
    }, 40);
  };

  // ── Camera & session ──────────────────────────────────────────────────
  const videoRef   = useRef<HTMLVideoElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const [cameraReady,  setCameraReady]  = useState(false);
  const [cameraError,  setCameraError]  = useState<string | null>(null);
  const [capturing,    setCapturing]    = useState(false);
  const [result,       setResult]       = useState<AttemptResult | null>(null);
  const [sessionId,    setSessionId]    = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const holdStartedAt  = useRef<string | null>(null);
  const sessionEndedRef = useRef(false);
  const sessionIdRef   = useRef<string | null>(null);
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);

  // Camera
  useEffect(() => {
    let stream: MediaStream | null = null;
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "user" } })
      .then(s => { stream = s; if (videoRef.current) { videoRef.current.srcObject = s; setCameraReady(true); startTimer(); } })
      .catch(() => setCameraError("Couldn't access your camera."));
    return () => { stream?.getTracks().forEach(t => t.stop()); stopTimer(); };
  }, []);

  // Session cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionIdRef.current && !sessionEndedRef.current) {
        sessionEndedRef.current = true;
        endPracticeSession(sessionIdRef.current, "abandoned").catch(() => {});
      }
    };
  }, []);

  // Start session
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

  // ── Capture a single frame from the video element ─────────────────────
  const captureFrame = (): Blob | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    // canvas.toBlob is async; use toDataURL + convert for sync capture during recording loop
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    const byteString = atob(dataUrl.split(",")[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    return new Blob([ab], { type: "image/jpeg" });
  };

  // ── Alphabet: single-frame capture ───────────────────────────────────
  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current || !sessionId) return;
    setCapturing(true);
    setResult(null);
    const video = videoRef.current, canvas = canvasRef.current;
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(async (blob) => {
      if (!blob) { setCapturing(false); return; }
      try {
        const data: AttemptResult = await submitPracticeAttempt(sessionId, sign, blob, holdStartedAt.current ?? undefined);
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

  // ── Words: motion recording — collect frames, send middle frame ───────
  const startMotionRecord = () => {
    if (!cameraReady || !sessionId || recording || capturing || attempts >= MAX_ATTEMPTS) return;
    setResult(null);
    setMotionDone(false);
    // Show the motion trail animation first, then start recording
    runMotionAnimation(() => {
      setRecording(true);
      setRecordPct(0);
      recordFrames.current = [];
      recordStart.current  = Date.now();

      recordTimer.current = setInterval(() => {
        const elapsed = Date.now() - recordStart.current;
        const pct = Math.min((elapsed / RECORD_DURATION_MS) * 100, 100);
        setRecordPct(pct);

        const frame = captureFrame();
        if (frame) recordFrames.current.push(frame);

        if (elapsed >= RECORD_DURATION_MS) {
          clearInterval(recordTimer.current!);
          finishMotionRecord();
        }
      }, 100); // capture ~10 frames/sec
    }); // end runMotionAnimation callback
  };

  const finishMotionRecord = async () => {
    setRecording(false);
    setMotionDone(true);
    setRecordPct(100);
    setCapturing(true);

    const frames = recordFrames.current;
    if (frames.length === 0 || !sessionId) { setCapturing(false); return; }

    // Send the middle frame — most representative of the held gesture
    const midFrame = frames[Math.floor(frames.length / 2)];

    try {
      const data: AttemptResult = await submitPracticeAttempt(sessionId, sign, midFrame, holdStartedAt.current ?? undefined);
      setResult(data);
      setAttempts(a => a + 1);
      localStorage.setItem("current_expected_sign", sign);
    } catch (e) {
      setResult({ success: false, message: `Request failed: ${(e as Error).message}` });
    } finally {
      setCapturing(false);
      setMotionDone(false);
      setRecordPct(0);
      holdStartedAt.current = new Date().toISOString();
    }
  };

  const handleSignChange = (s: string) => {
    setSign(s); setResult(null); setAttempts(0); setElapsed(0); setRecordPct(0); setRecording(false); setMotionDone(false);
    if (recordTimer.current) clearInterval(recordTimer.current);
    holdStartedAt.current = new Date().toISOString();
    localStorage.setItem("current_expected_sign", s);
  };

  const handleFinish = async () => {
    if (sessionId && !sessionEndedRef.current) {
      sessionEndedRef.current = true;
      try { await endPracticeSession(sessionId, "completed"); } catch {}
    }
    go("feedback");
  };

  const acc      = result?.assessment?.accuracy_percentage ?? null;
  const confCol  = acc == null ? "bg-[#1a2844]" : acc >= 80 ? "bg-emerald-500" : acc >= 60 ? "bg-amber-500" : "bg-rose-500";
  const confTxt  = acc == null ? "text-muted-foreground" : acc >= 80 ? "text-emerald-400" : acc >= 60 ? "text-amber-400" : "text-rose-400";
  const currentSigns = category === "alphabet" ? ALPHABET : WORDS;
  const motionCue    = category === "words" ? WORD_MOTION_CUES[sign] : null;
  const isWords      = category === "words";

  return (
    <div className="h-full bg-[#060b13] flex flex-col overflow-hidden">
      <FlowStepper active={1} />

      <div className="flex-1 flex overflow-hidden">
        {/* Camera feed */}
        <div className="flex-1 relative bg-gradient-to-b from-[#0a1a0a] via-[#091410] to-[#060b13]">
          <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" />
          <canvas ref={canvasRef} className="hidden" />

          {!cameraReady && !cameraError && (
            <div className="absolute inset-0 flex items-center justify-center"><HandOverlay w={320} h={390} animated /></div>
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

          {/* Timer */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <Clock size={11} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-mono">{fmtTime(elapsed)}</span>
          </div>

          {/* Attempt counter */}
          <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
            <span className="text-xs text-muted-foreground bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
              Attempt {attempts} / {MAX_ATTEMPTS}
            </span>
            <div className="w-28 h-1.5 bg-black/40 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${(attempts / MAX_ATTEMPTS) * 100}%` }} />
            </div>
          </div>

          {/* Motion cue overlay — shown for words before/during recording */}
          {isWords && motionCue && !result && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 bg-black/50 backdrop-blur-sm px-5 py-3 rounded-2xl border border-white/10">
              <span className="text-2xl">{motionCue.arrow}</span>
              <span className="text-xs text-white/80 font-medium">{motionCue.description}</span>
            </div>
          )}

          {/* Motion trail animation — shown during animating/freeze phase */}
          {isWords && motionCue && motionPhase !== "idle" && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Freeze phase: show sign name big in center */}
              {motionPhase === "freeze" && (
                <div className="flex flex-col items-center gap-2 animate-pulse">
                  <span className="text-6xl font-black text-white drop-shadow-lg">{sign.toUpperCase()}</span>
                  <span className="text-lg text-white/80 font-semibold">Now perform!</span>
                </div>
              )}

              {/* Animating phase: moving hand icon along a path */}
              {motionPhase === "animating" && (() => {
                const dir = motionCue.dir;
                // Compute x/y position based on direction and trailPct
                let x = 50, y = 50;
                if (dir === "left-to-right") { x = trailPct; y = 50; }
                else if (dir === "right-to-left") { x = 100 - trailPct; y = 50; }
                else if (dir === "up-to-down") { x = 50; y = trailPct; }
                else if (dir === "circular") {
                  const angle = (trailPct / 100) * 2 * Math.PI;
                  x = 50 + 30 * Math.cos(angle);
                  y = 50 + 30 * Math.sin(angle);
                }
                // Trail dots behind the hand
                const dots = [0.25, 0.5, 0.75].map(frac => {
                  let dx = 50, dy = 50;
                  const p = Math.max(0, trailPct - frac * 30);
                  if (dir === "left-to-right") { dx = p; dy = 50; }
                  else if (dir === "right-to-left") { dx = 100 - p; dy = 50; }
                  else if (dir === "up-to-down") { dx = 50; dy = p; }
                  else if (dir === "circular") {
                    const a = (p / 100) * 2 * Math.PI;
                    dx = 50 + 30 * Math.cos(a);
                    dy = 50 + 30 * Math.sin(a);
                  }
                  return { dx, dy, frac };
                });
                return (
                  <div className="absolute inset-0">
                    {/* Trail dots */}
                    {dots.map((d, i) => (
                      <div
                        key={i}
                        className="absolute w-3 h-3 rounded-full bg-cyan-400"
                        style={{
                          left: `${d.dx}%`,
                          top: `${d.dy}%`,
                          transform: "translate(-50%,-50%)",
                          opacity: 0.3 + i * 0.15,
                        }}
                      />
                    ))}
                    {/* Hand icon */}
                    <div
                      className="absolute text-4xl transition-none"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        transform: "translate(-50%,-50%)",
                        filter: "drop-shadow(0 0 8px rgba(99,255,220,0.8))",
                      }}
                    >
                      ✋
                    </div>
                    {/* Direction label */}
                    <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-xl text-white text-sm font-bold">
                      {motionCue.description}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Recording progress ring — shown while actually capturing frames */}
          {recording && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-4 border-rose-500/30 flex items-center justify-center">
                <div
                  className="w-24 h-24 rounded-full border-4 border-rose-500 absolute"
                  style={{
                    clipPath: "inset(0)",
                    background: `conic-gradient(rgb(239,68,68) ${recordPct * 3.6}deg, transparent 0deg)`,
                    opacity: 0.25,
                    borderRadius: "50%",
                  }}
                />
                <span className="text-rose-400 text-xs font-bold z-10">REC</span>
              </div>
            </div>
          )}

          {/* Result toast */}
          {result && (
            <div className={`absolute top-14 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-sm font-semibold backdrop-blur-sm ${
              result.success ? "bg-emerald-950/70 text-emerald-400 border border-emerald-900/50" : "bg-rose-950/70 text-rose-400 border border-rose-900/50"
            }`}>
              {result.success
                ? `Predicted: ${result.predicted_sign} · Score: ${result.assessment?.score ?? "—"} (${result.assessment?.grade ?? "—"})`
                : (result.message ?? "No prediction")}
            </div>
          )}

          {/* AI suggestion toast */}
          {result?.success && result.suggestion && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-amber-950/80 border border-amber-900/50 text-amber-300 text-xs px-4 py-2 rounded-xl backdrop-blur-sm whitespace-nowrap">
              <Info size={12} className="flex-shrink-0" />
              {result.suggestion}
            </div>
          )}

          {/* Bottom buttons */}
          <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-1.5 px-2 md:gap-3 md:px-0">
            <button
              onClick={() => { setResult(null); setAttempts(0); setElapsed(0); setRecordPct(0); }}
              className="flex items-center gap-1.5 bg-[#0e1a30]/80 backdrop-blur border border-border hover:border-cyan-900/40 text-foreground px-3 py-2.5 md:px-5 rounded-xl text-xs md:text-sm font-semibold transition-all"
            >
              <RotateCcw size={15} /> Try Again
            </button>

            {/* Alphabet: single capture button */}
            {!isWords && (
              <button
                onClick={handleCapture}
                disabled={!cameraReady || !sessionId || capturing || attempts >= MAX_ATTEMPTS}
                className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-primary-foreground px-4 py-2.5 md:px-6 rounded-xl text-xs md:text-sm font-bold transition-colors"
              >
                {capturing ? <Loader2 size={15} className="animate-spin" /> : <Camera size={15} />}
                {capturing ? "Analyzing..." : attempts >= MAX_ATTEMPTS ? "Max attempts reached" : "Capture & Predict"}
              </button>
            )}

            {/* Words: hold-to-record motion button */}
            {isWords && (
              <button
                onClick={startMotionRecord}
                disabled={!cameraReady || !sessionId || recording || capturing || motionPhase !== "idle" || attempts >= MAX_ATTEMPTS}
                className={`flex items-center gap-1.5 px-4 py-2.5 md:px-6 rounded-xl text-xs md:text-sm font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                  recording
                    ? "bg-rose-600 text-white animate-pulse"
                    : motionPhase === "animating"
                    ? "bg-cyan-600 text-white animate-pulse"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
                }`}
              >
                {capturing ? <Loader2 size={15} className="animate-spin" /> : <Hand size={15} />}
                {capturing
                  ? "Analyzing..."
                  : recording
                  ? `Recording… ${Math.round(recordPct)}%`
                  : motionPhase === "animating"
                  ? "Watch the motion…"
                  : motionPhase === "freeze"
                  ? "Perform now!"
                  : attempts >= MAX_ATTEMPTS
                  ? "Max attempts reached"
                  : "Record Motion"}
              </button>
            )}

            <button
              onClick={handleFinish}
              disabled={!sessionId}
              className="flex items-center gap-1.5 bg-[#0e1a30]/80 backdrop-blur border border-border hover:border-cyan-900/40 text-foreground px-3 py-2.5 md:px-5 rounded-xl text-xs md:text-sm font-semibold transition-all disabled:opacity-60"
            >
              <SkipForward size={15} /> Get Feedback
            </button>
          </div>
        </div>

        {/* Right panel */}
        <div className="hidden md:flex flex-shrink-0 border-l border-border bg-[#0a1425] flex-col p-4 gap-4 overflow-y-auto" style={{ width: "272px" }}>
          <div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Target Sign</div>
            <div className="text-3xl font-bold text-foreground leading-none mb-1">{sign}</div>
            <div className="text-xs text-muted-foreground">{isWords ? "Words · Motion gesture" : "Lesson 3 · Alphabet"}</div>
          </div>

          {/* Motion cue card for words */}
          {isWords && motionCue && (
            <div className="bg-[#0d1625] border border-border rounded-xl p-3">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Motion Guide</div>
              <div className="text-3xl mb-1">{motionCue.arrow}</div>
              <div className="text-xs text-foreground font-medium">{motionCue.description}</div>
              <div className="text-[10px] text-muted-foreground mt-1">Hold "Record Motion" and perform the gesture</div>
            </div>
          )}

          {/* Reference image for alphabet */}
          {!isWords && (
            <div className="bg-[#0d1625] border border-border rounded-xl overflow-hidden">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider p-2.5 pb-0">
                Reference
              </div>

              <div className="h-40 flex items-center justify-center p-3">
                <img
                  src={`/asl-reference/${sign}.png`}
                  alt={`ASL sign for ${sign}`}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}

          {/* Recording progress bar (words only) */}
          {isWords && (recording || recordPct > 0) && (
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Recording</div>
              <div className="h-2 bg-[#1a2844] rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full transition-all duration-100" style={{ width: `${recordPct}%` }} />
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">{recording ? `${Math.ceil((RECORD_DURATION_MS - (Date.now() - recordStart.current)) / 1000)}s remaining` : "Done"}</div>
            </div>
          )}

          {/* Accuracy score */}
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

          {/* Session stats */}
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

          {/* AI hand guidance */}
          {result?.success && (result.hand_position || result.hand_distance || result.gesture_quality) && (
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Hand Guidance</div>
              <div className="space-y-1.5 text-xs">
                {result.hand_position && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Position</span>
                    <span className={result.hand_position === "Center" ? "text-emerald-400" : "text-amber-400"}>{result.hand_position}</span>
                  </div>
                )}
                {result.hand_distance && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Distance</span>
                    <span className={result.hand_distance === "Good Distance" ? "text-emerald-400" : "text-amber-400"}>{result.hand_distance}</span>
                  </div>
                )}
                {result.gesture_quality && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quality</span>
                    <span className={result.gesture_quality === "Good" ? "text-emerald-400" : "text-rose-400"}>{result.gesture_quality}</span>
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

          {/* Sign picker */}
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
                    s === sign ? "bg-primary text-primary-foreground" : "bg-[#0e1a30] text-muted-foreground border border-border hover:text-foreground"
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