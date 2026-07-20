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
import { startPracticeSession, submitPracticeAttempt } from "../services/businessApi";

type AttemptResult = {
  success: boolean;
  predicted_sign?: string;
  confidence?: number;
  hold_seconds?: number;
  message?: string;
  assessment?: {
    correct_predictions: number;
    total_predictions: number;
    accuracy_percentage: number;
    score: number;
    grade: string;
  };
};

// Placeholder lesson id — Practice's route (/practice) doesn't carry a real
// lesson id yet (same known gap as LessonView). Swap for a real id once
// lesson selection flows through routing/context.
const PLACEHOLDER_LESSON_ID = 1;

export default function PracticeScreen({ go }: { go: (s: Screen) => void }) {
  const { userId } = useAuth();
  const [attempts, setAttempts] = useState(0);
  const [sign, setSign] = useState("A");
  const SIGNS = ["A", "B", "C", "D", "E"];

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [result, setResult] = useState<AttemptResult | null>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const holdStartedAt = useRef<string | null>(null);

  // Real webcam feed via getUserMedia.
  useEffect(() => {
    let stream: MediaStream | null = null;
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "user" } })
      .then(s => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          setCameraReady(true);
        }
      })
      .catch(() => setCameraError("Couldn't access your camera. Check permissions and try again."));
    return () => stream?.getTracks().forEach(t => t.stop());
  }, []);

  // Start a real practice session as soon as we know who the learner is.
  // Falls back to a mock UUID if not logged in with a real user_id yet
  // (e.g. came through the signup/onboarding mock flow).
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

  // Capture the current frame and submit it as a real attempt — this goes
  // through Business Logic's /practice/{session_id}/attempt, which calls
  // the AI service internally AND records the assessment, unlike calling
  // the AI service directly (which would skip scoring entirely).
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
        setResult({ success: false, message: "Business Logic service unavailable. Is it running on port 8002?" });
      } finally {
        setCapturing(false);
        holdStartedAt.current = new Date().toISOString();
      }
    }, "image/jpeg", 0.9);
  };

  const acc = result?.assessment?.accuracy_percentage ?? null;
  const confCol = acc == null ? "bg-[#1a2844]" : acc >= 80 ? "bg-emerald-500" : acc >= 60 ? "bg-amber-500" : "bg-rose-500";
  const confTxt = acc == null ? "text-muted-foreground" : acc >= 80 ? "text-emerald-400" : acc >= 60 ? "text-amber-400" : "text-rose-400";

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
              <div className="relative">
                <div className="absolute inset-0 -m-12 bg-cyan-500/3 rounded-full blur-3xl" />
                <HandOverlay w={320} h={390} animated />
              </div>
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

          <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${cameraReady ? "bg-emerald-400" : "bg-muted-foreground"}`} />
            <span className="text-xs text-muted-foreground">{cameraReady ? "Camera live" : "Connecting..."}</span>
          </div>

          <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs text-muted-foreground">
            Attempt {attempts} / 5
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

          <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-3">
            <button
              onClick={() => setResult(null)}
              className="flex items-center gap-2 bg-[#0e1a30]/80 backdrop-blur border border-border hover:border-cyan-900/40 text-foreground px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            >
              <RotateCcw size={15} />
              Try Again
            </button>
            <button
              onClick={handleCapture}
              disabled={!cameraReady || !sessionId || capturing}
              className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed text-black px-6 py-2.5 rounded-xl text-sm font-bold transition-colors"
            >
              {capturing ? <Loader2 size={15} className="animate-spin" /> : <Camera size={15} />}
              {capturing ? "Analyzing..." : "Capture & Predict"}
            </button>
            <button
              onClick={() => go("feedback")}
              disabled={!sessionId}
              className="flex items-center gap-2 bg-[#0e1a30]/80 backdrop-blur border border-border hover:border-cyan-900/40 text-foreground px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
            >
              <SkipForward size={15} />
              Get Feedback
            </button>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-68 flex-shrink-0 border-l border-border bg-[#0a1425] flex flex-col p-4 gap-4 overflow-y-auto" style={{ width: "272px" }}>
          <div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Target Sign</div>
            <div className="text-3xl font-bold text-foreground leading-none mb-1">{sign}</div>
            <div className="text-xs text-muted-foreground">Lesson 3 · Alphabet</div>
          </div>

          <div className="bg-[#0d1625] border border-border rounded-xl overflow-hidden relative">
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
              </div>
            </div>
          )}

          <div className="mt-auto">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Signs in Set</div>
            <div className="flex flex-wrap gap-1.5">
              {SIGNS.map(s => (
                <button
                  key={s} onClick={() => { setSign(s); setResult(null); }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    s === sign ? "bg-cyan-500 text-black" : "bg-[#0e1a30] text-muted-foreground border border-border hover:text-foreground"
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