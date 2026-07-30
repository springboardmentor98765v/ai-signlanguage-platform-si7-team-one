import { useState, useEffect } from "react";
import {
  Home, BookOpen, Camera, CheckSquare, MessageCircle, TrendingUp,
  Award, Users, Settings, Bell, ChevronRight, Play, RotateCcw,
  ArrowRight, Eye, EyeOff, Clock, Zap, Target, Activity,
  Shield, Server, UserCheck, LogOut, Plus, Search, Filter,
  Download, Share2, AlertTriangle, CheckCircle, XCircle, Info,
  SkipForward, Calendar, Lock, Mail, Check, ChevronLeft, RefreshCw, Loader2,
} from "lucide-react";
import { PBar } from "../components/shared/Indicators";
import { Bdg } from "../components/shared/Indicators";
import { useAuth } from "../context/AuthContext";
import { getCertificateEligibility, generateCertificate } from "../services/businessApi";

export default function Certificates() {
  const { userId } = useAuth();
  const uid = userId ?? "00000000-0000-0000-0000-000000000001";

  const [eligibility, setEligibility] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [certLoading, setCertLoading] = useState(false);
  const [certError, setCertError] = useState<string | null>(null);

  useEffect(() => {
    getCertificateEligibility(uid)
      .then((elig) => { setEligibility(elig); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [uid]);

  const handleDownloadCertificate = async () => {
    setCertLoading(true);
    setCertError(null);
    try {
      const blob = await generateCertificate(uid, "Maya Chen");
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "certificate.pdf"; a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e: any) {
      setCertError(e.message ?? "Couldn't generate certificate.");
    } finally {
      setCertLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* ── REAL: Certificate eligibility from Business Logic ── */}
      <div className={`bg-card border rounded-[14px] p-6 ${eligibility?.eligible ? "border-emerald-900/40" : "border-border"}`} style={{ boxShadow: 'var(--card-shadow)' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground text-sm">Certificate Eligibility</h3>
          {eligibility && <Bdg label={eligibility.eligible ? "Eligible ✓" : "Not Yet"} v={eligibility.eligible ? "success" : "default"} />}
        </div>
        {eligibility?.eligible ? (
          <div className="space-y-3">
            <p className="text-xs text-emerald-400">You meet all the requirements! Download your certificate below.</p>
            {eligibility.criteria_met?.map((c: string) => (
              <div key={c} className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle size={12} className="text-emerald-400 flex-shrink-0" />{c}
              </div>
            ))}
            {certError && <p className="text-xs text-rose-400">{certError}</p>}
            <button
              onClick={handleDownloadCertificate}
              disabled={certLoading}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
              {certLoading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              {certLoading ? "Generating..." : "Download Certificate PDF"}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {eligibility?.reasons_failed?.map((r: string) => (
              <div key={r} className="flex items-center gap-2 text-xs text-muted-foreground">
                <XCircle size={12} className="text-rose-400 flex-shrink-0" />{r}
              </div>
            ))}
            {eligibility?.criteria_met?.map((c: string) => (
              <div key={c} className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle size={12} className="text-emerald-400 flex-shrink-0" />{c}
              </div>
            ))}
            {!eligibility && !loading && <p className="text-xs text-muted-foreground">Couldn't check eligibility — is the Business Logic service running on port 8002?</p>}
          </div>
        )}
      </div>

      {/* ── Mock earned certificates (no real certificate history endpoint yet) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { title: "ASL Fundamentals", date: "May 12, 2026", score: 94, id: "CERT-2026-ASL-001" },
          { title: "Numbers & Math",   date: "Jun 3, 2026",  score: 88, id: "CERT-2026-NUM-042" },
        ].map(cert => (
          <div key={cert.id} className="bg-card border border-border rounded-[14px] overflow-hidden" style={{ boxShadow: 'var(--card-shadow)' }}>
            <div className="bg-gradient-to-r from-primary/5 to-success/5 p-6 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">SignPath AI</span>
                <Award size={18} className="text-warning" />
              </div>
              <div className="text-lg font-bold text-foreground mb-1">Certificate of Completion</div>
              <div className="text-primary font-semibold text-sm">{cert.title}</div>
            </div>
            <div className="p-5">
              <div className="text-xs text-muted-foreground mb-0.5">Awarded to</div>
              <div className="font-bold text-foreground mb-3">Maya Chen</div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                <span>{cert.date}</span>
                <span className="text-success font-semibold">{cert.score}% final score</span>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold py-2.5 rounded-xl transition-colors">
                  <Download size={11} /> Download
                </button>
                <button aria-label="Share certificate" className="flex items-center justify-center bg-muted border border-border hover:bg-hover text-muted-foreground hover:text-foreground text-xs py-2.5 px-3 rounded-xl transition-all">
                  <Share2 size={11} />
                </button>
              </div>
              <div className="text-[10px] text-muted-foreground mt-3 font-mono">{cert.id}</div>
            </div>
          </div>
        ))}

        <div className="bg-muted border border-border rounded-[14px] p-6 flex flex-col items-center justify-center text-center opacity-50">
          <Award size={28} className="text-muted-foreground mb-3" />
          <div className="font-semibold text-foreground text-sm mb-1">ASL Intermediate</div>
          <div className="text-xs text-muted-foreground mb-3">Complete the course to earn</div>
          <PBar pct={68} cls="w-full" />
          <div className="text-xs text-muted-foreground mt-1.5">68% complete</div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-[14px] p-6" style={{ boxShadow: 'var(--card-shadow)' }}>
        <h3 className="font-semibold text-foreground mb-5 text-sm">Achievement Badges</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { lbl: "First Sign",    em: "🌟", earned: true },
            { lbl: "Week Warrior",  em: "🔥", earned: true },
            { lbl: "Speed Signer",  em: "⚡", earned: true },
            { lbl: "Perfect Score", em: "🏆", earned: true },
            { lbl: "100 Signs",     em: "💯", earned: true },
            { lbl: "Month Master",  em: "📅", earned: true },
            { lbl: "Night Owl",     em: "🦉", earned: true },
            { lbl: "Consistency",   em: "📈", earned: false },
            { lbl: "ASL Expert",    em: "🎓", earned: false },
          ].map(b => (
            <div key={b.lbl} className={`flex flex-col items-center gap-1.5 p-3 rounded-[14px] border w-20 ${b.earned ? "border-warning/30 bg-warning/5" : "border-border bg-muted opacity-40"}`}>
              <span className="text-2xl">{b.em}</span>
              <span className="text-[10px] font-semibold text-center text-muted-foreground leading-tight">{b.lbl}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
