import { useState } from "react";
import {
  Users, TrendingUp, Award, CheckCircle, AlertTriangle,
  Activity, Search, ChevronRight,
} from "lucide-react";
import { MCard } from "../components/shared/MCard";
import { Bdg, PBar } from "../components/shared/Indicators";

// M4 Day 2 — Accessibility Trainer Dashboard, built per the original
// project document Section 11: learner engagement, skill development,
// assessment analytics, certification monitoring. Sample data for now,
// real data connects Day 3 once Intern 2/4's Trainer APIs exist.
interface TraineeRow {
  name: string;
  engagement: "high" | "medium" | "low"; // how often they practice
  sessionsThisWeek: number;
  skillDevelopment: number; // % improvement over time
  avgAssessmentScore: number;
  certificationStatus: "certified" | "in-progress" | "not-started";
}

const MOCK_TRAINEES: TraineeRow[] = [
  { name: "Marcus Johnson", engagement: "high",   sessionsThisWeek: 6, skillDevelopment: 18, avgAssessmentScore: 88, certificationStatus: "certified" },
  { name: "Priya Patel",    engagement: "low",    sessionsThisWeek: 1, skillDevelopment: -3, avgAssessmentScore: 62, certificationStatus: "not-started" },
  { name: "Leo Finch",      engagement: "high",   sessionsThisWeek: 7, skillDevelopment: 22, avgAssessmentScore: 95, certificationStatus: "certified" },
  { name: "Amara Osei",     engagement: "medium", sessionsThisWeek: 3, skillDevelopment: 9,  avgAssessmentScore: 71, certificationStatus: "in-progress" },
  { name: "Tom Nguyen",     engagement: "medium", sessionsThisWeek: 4, skillDevelopment: 12, avgAssessmentScore: 81, certificationStatus: "in-progress" },
];

function EngagementBdg({ level }: { level: TraineeRow["engagement"] }) {
  const v = level === "high" ? "success" : level === "medium" ? "warning" : "error";
  return <Bdg label={level.charAt(0).toUpperCase() + level.slice(1)} v={v} />;
}

function CertBdg({ status }: { status: TraineeRow["certificationStatus"] }) {
  if (status === "certified") return <Bdg label="Certified" v="success" />;
  if (status === "in-progress") return <Bdg label="In Progress" v="info" />;
  return <Bdg label="Not Started" v="default" />;
}

export default function AccessibilityTrainerDashboard({ go }: { go: (s: any) => void }) {
  const [search, setSearch] = useState("");
  const trainees = MOCK_TRAINEES.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const avgEngagementSessions = Math.round(
    MOCK_TRAINEES.reduce((sum, t) => sum + t.sessionsThisWeek, 0) / MOCK_TRAINEES.length
  );
  const avgScore = Math.round(
    MOCK_TRAINEES.reduce((sum, t) => sum + t.avgAssessmentScore, 0) / MOCK_TRAINEES.length
  );
  const certifiedCount = MOCK_TRAINEES.filter(t => t.certificationStatus === "certified").length;
  const lowEngagementCount = MOCK_TRAINEES.filter(t => t.engagement === "low").length;

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-lg font-bold text-foreground">Accessibility Trainer Dashboard</h2>
        <p className="text-muted-foreground text-sm">Learner engagement, skill development, and certification monitoring</p>
      </div>

      {/* Assessment analytics summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <MCard icon={Users}       label="Assigned Learners"    value={String(MOCK_TRAINEES.length)} col="cyan" />
        <MCard icon={Activity}    label="Avg Sessions / Week"  value={String(avgEngagementSessions)} col="violet" />
        <MCard icon={TrendingUp}  label="Avg Assessment Score" value={`${avgScore}%`} col="emerald" />
        <MCard icon={Award}       label="Certified"            value={`${certifiedCount}/${MOCK_TRAINEES.length}`} col="amber" />
      </div>

      {lowEngagementCount > 0 && (
        <div className="flex items-center gap-2.5 bg-warning/5 border border-warning/30 rounded-xl px-4 py-3">
          <AlertTriangle size={15} className="text-warning flex-shrink-0" />
          <span className="text-sm text-foreground">
            {lowEngagementCount} learner{lowEngagementCount > 1 ? "s" : ""} showing low engagement this week — may need outreach.
          </span>
        </div>
      )}

      {/* Learner engagement / skill development / certification table */}
      <div className="bg-card border border-border rounded-[14px] p-6" style={{ boxShadow: 'var(--card-shadow)' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-foreground text-sm">Assigned Learners</h3>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search learners..."
              className="bg-muted border border-border rounded-xl pl-8 pr-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary/50 w-48"
            />
          </div>
        </div>

        {trainees.length === 0 ? (
          <p className="text-xs text-muted-foreground py-6 text-center">No learners match "{search}"</p>
        ) : (
          <div className="space-y-2">
            {trainees.map(t => (
              <div key={t.name} className="flex items-center gap-4 p-3.5 rounded-xl bg-muted/50 border border-border/50">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/70 to-primary/40 flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0">
                  {t.name.charAt(0)}
                </div>
                <div className="w-36 flex-shrink-0">
                  <div className="text-sm font-semibold text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.sessionsThisWeek} sessions this week</div>
                </div>

                <div className="w-24 flex-shrink-0">
                  <div className="text-xs text-muted-foreground mb-1">Engagement</div>
                  <EngagementBdg level={t.engagement} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Skill Development</span>
                    <span className={`text-xs font-semibold ${t.skillDevelopment >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {t.skillDevelopment >= 0 ? "+" : ""}{t.skillDevelopment}%
                    </span>
                  </div>
                  <PBar pct={Math.max(0, Math.min(100, 50 + t.skillDevelopment))} />
                </div>

                <div className="w-16 text-center flex-shrink-0">
                  <div className="text-base font-bold text-foreground">{t.avgAssessmentScore}%</div>
                  <div className="text-[10px] text-muted-foreground">avg score</div>
                </div>

                <div className="w-28 flex-shrink-0 text-center">
                  <CertBdg status={t.certificationStatus} />
                </div>

                <ChevronRight size={14} className="text-muted-foreground flex-shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}