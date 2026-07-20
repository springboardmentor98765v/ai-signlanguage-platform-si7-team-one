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
import { predictSign } from "../services/aiApi";

type PredictResult = {
  success: boolean;
  prediction?: string;
  confidence?: number;
  confidence_level?: string;
  status?: string;
  feedback?: string;
  suggestion?: string;
  hand_position?: string;
  hand_distance?: string;
  gesture_quality?: string;
  message?: string;
};

export default function PracticeScreen({ go }: { go: (s: Screen) => void }) {
  const [attempts, setAttempts] = useState(0);
  const [sign, setSign] = useState("A");
  const SIGNS = ["A", "B", "C", "D", "E"];

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [result, setResult] = useState<PredictResult | null>(null);

  // Real webcam feed via getUserMedia — matches SRS FR-1/Day 5 requirement.
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

  // Capture the current video frame to a canvas, convert to a JPEG blob,
  // and send it to the real AI service (Intern 3's /predict endpoint).
  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
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
        const data: PredictResult = await predictSign(blob);
        setResult(data);
        setAttempts(a => a + 1);
      } catch (e) {
        setResult({ success: false, message: "AI service unavailable. Is it running on port 8001?" });
      } finally {
        setCapturing(false);
      }
    }, "image/jpeg", 0.9);
  };

  const conf = result?.confidence != null ? Math.round(result.confidence * 100) : null;
  const confCol = conf == null ? "bg-[#1a2844]" : conf >= 80 ? "bg-emerald-500" : conf >= 60 ? "bg-amber-500" : "bg-rose-500";
  const confTxt = conf == null ? "text-muted-foreground" : conf >= 80 ? "text-emerald-400" : conf >= 60 ? "text-amber-400" : "text-rose-400";

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
                ? `Predicted: ${result.prediction} · ${result.feedback ?? ""}`
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
              disabled={!cameraReady || capturing}
              className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed text-black px-6 py-2.5 rounded-xl text-sm font-bold transition-colors"
            >
              {capturing ? <Loader2 size={15} className="animate-spin" /> : <Camera size={15} />}
              {capturing ? "Analyzing..." : "Capture & Predict"}
            </button>
            <button
              onClick={() => go("feedback")}
              className="flex items-center gap-2 bg-[#0e1a30]/80 backdrop-blur border border-border hover:border-cyan-900/40 text-foreground px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            >
              <SkipForward size={15} />
              Next Sign
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
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">AI Confidence</div>
              <span className={`text-xl font-bold ${confTxt}`}>{conf != null ? `${conf}%` : "—"}</span>
            </div>
            <div className="h-2.5 bg-[#1a2844] rounded-full overflow-hidden mb-1">
              <div className={`h-full rounded-full transition-all duration-300 ${confCol}`} style={{ width: `${conf ?? 0}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Low</span>
              <span className={confTxt}>{result?.confidence_level ?? "Waiting for capture"}</span>
              <span>High</span>
            </div>
          </div>

          {result?.success && (
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">AI Feedback</div>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div>Position: <span className="text-foreground">{result.hand_position}</span></div>
                <div>Distance: <span className="text-foreground">{result.hand_distance}</span></div>
                <div>Quality: <span className="text-foreground">{result.gesture_quality}</span></div>
                {result.suggestion && (
                  <div className="mt-2 p-2 rounded-lg bg-cyan-950/30 border border-cyan-900/30 text-cyan-400">
                    {result.suggestion}
                  </div>
                )}
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