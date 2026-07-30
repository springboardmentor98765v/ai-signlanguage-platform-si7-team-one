import { useMemo } from "react";
import { Trophy, Flame, ArrowUpRight, Medal, Crown, Sparkles } from "lucide-react";
import type { Screen } from "../lib/types";
import { MCard } from "../components/shared/MCard";
import { Bdg } from "../components/shared/Indicators";

type LeaderRow = {
  rank: number;
  name: string;
  role: string;
  accuracy: number;
  streak: number;
  badges: number;
  isMe?: boolean;
};

const accuracyLeaders: LeaderRow[] = [
  { rank: 1, name: "Maya Chen", role: "Learner", accuracy: 98, streak: 22, badges: 12, isMe: true },
  { rank: 2, name: "Aanya Shah", role: "Learner", accuracy: 96, streak: 18, badges: 10 },
  { rank: 3, name: "Ethan Brooks", role: "Learner", accuracy: 94, streak: 15, badges: 9 },
  { rank: 4, name: "Noah Patel", role: "Learner", accuracy: 92, streak: 12, badges: 8 },
  { rank: 5, name: "Sara Khan", role: "Learner", accuracy: 91, streak: 11, badges: 7 },
];

const streakLeaders: LeaderRow[] = [
  { rank: 1, name: "Maya Chen", role: "Learner", accuracy: 98, streak: 22, badges: 12, isMe: true },
  { rank: 2, name: "Sara Khan", role: "Learner", accuracy: 91, streak: 21, badges: 8 },
  { rank: 3, name: "Aanya Shah", role: "Learner", accuracy: 96, streak: 18, badges: 10 },
  { rank: 4, name: "Ethan Brooks", role: "Learner", accuracy: 94, streak: 16, badges: 9 },
  { rank: 5, name: "Noah Patel", role: "Learner", accuracy: 92, streak: 14, badges: 7 },
];

function MedalIcon({ rank }: { rank: number }) {
  if (rank === 1) return <Crown size={16} className="text-warning" />;
  if (rank === 2) return <Medal size={16} className="text-slate-300" />;
  if (rank === 3) return <Medal size={16} className="text-amber-600" />;
  return <span className="text-xs font-semibold text-muted-foreground">#{rank}</span>;
}

function LeaderCard({
  title,
  subtitle,
  rows,
  metricLabel,
  metricValue,
}: {
  title: string;
  subtitle: string;
  rows: LeaderRow[];
  metricLabel: string;
  metricValue: (row: LeaderRow) => string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <Bdg label="Live mock data" v="info" />
      </div>

      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={`${title}-${row.rank}-${row.name}`}
            className={`flex items-center gap-3 rounded-lg border px-3 py-3 transition-all ${
              row.isMe
                ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                : "border-border bg-[#0e1a30]"
            }`}
          >
            <div className="w-8 flex items-center justify-center">
              <MedalIcon rank={row.rank} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold text-foreground truncate">{row.name}</div>
                {row.isMe && <Bdg label="You" v="success" />}
              </div>
              <div className="text-xs text-muted-foreground truncate">{row.role}</div>
            </div>

            <div className="text-right">
              <div className="text-sm font-semibold text-foreground">{metricValue(row)}</div>
              <div className="text-[11px] text-muted-foreground">{metricLabel}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Leaderboard({ go }: { go: (s: Screen) => void }) {
  const me = useMemo(
    () => accuracyLeaders.find((row) => row.isMe) ?? accuracyLeaders[0],
    []
  );

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Leaderboard</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Compare progress by accuracy and streak, with your rank highlighted.
          </p>
        </div>
        <button
          onClick={() => go("practice")}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition"
        >
          <Sparkles size={16} />
          Keep Practicing
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <MCard icon={Trophy} label="Your Accuracy Rank" value={`#${me.rank}`} delta={`${me.accuracy}% accuracy`} col="cyan" />
        <MCard icon={Flame} label="Current Streak" value={`${me.streak}`} delta="days in a row" col="amber" />
        <MCard icon={ArrowUpRight} label="Badges Earned" value={`${me.badges}`} delta="locked + unlocked" col="emerald" />
        <MCard icon={Medal} label="Top Rank" value="#1" delta="by accuracy & streak" col="violet" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <LeaderCard
          title="Ranked by Accuracy"
          subtitle="Highest average accuracy across recent practice"
          rows={accuracyLeaders}
          metricLabel="accuracy"
          metricValue={(row) => `${row.accuracy}%`}
        />

        <LeaderCard
          title="Ranked by Streak"
          subtitle="Longest active practice streak this week"
          rows={streakLeaders}
          metricLabel="streak"
          metricValue={(row) => `${row.streak} days`}
        />
      </div>
    </div>
  );
}