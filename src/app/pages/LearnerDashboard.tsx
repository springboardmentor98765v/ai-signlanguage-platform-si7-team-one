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
import { MCard } from "../components/shared/MCard";
import { Bdg, PBar, Ring } from "../components/shared/Indicators";

export default function LearnerDashboard({ go }: { go: (s: Screen) => void }) {
  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Good morning, Maya 👋</h2>
          <p className="text-muted-foreground text-sm mt-1.5">You are on a 14-day streak — keep it up!</p>
        </div>
        <div className="flex items-center gap-2.5 bg-primary/10 border border-primary/20 rounded-xl px-4 py-2.5">
          <Zap size={17} className="text-primary" />
          <span className="text-primary font-bold">14</span>
          <span className="text-muted-foreground text-sm">day streak</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        <MCard icon={Target}   label="Overall Accuracy"  value="91%" delta="+3% this week"  col="cyan" />
        <MCard icon={BookOpen} label="Signs Learned"     value="248" delta="+12 today"      col="emerald" />
        <MCard icon={Clock}    label="Practice Time"     value="4.2h" delta="this week"     col="violet" />
        <MCard icon={Award}    label="Badges Earned"     value="7"   delta="1 new"          col="amber" />
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 bg-card border border-border rounded-[14px] p-6" style={{ boxShadow: 'var(--card-shadow)' }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-foreground">Continue Learning</h3>
            <Bdg label="In Progress" v="info" />
          </div>
          <div className="flex items-start gap-5">
            <div className="w-20 h-14 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen size={22} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground">ASL Intermediate — Module 4</h4>
              <p className="text-xs text-muted-foreground mt-1 mb-3">Describing emotions and mental states</p>
              <PBar pct={68} />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">68% complete · 6 lessons left</span>
                <button
                  onClick={() => go("lesson")}
                  className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-semibold"
                >
                  Resume <ArrowRight size={11} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-[14px] p-6 flex flex-col items-center justify-center" style={{ boxShadow: 'var(--card-shadow)' }}>
          <Ring pct={73} size={96} />
          <div className="mt-4 text-center">
            <div className="text-sm font-semibold text-foreground">Module Progress</div>
            <div className="text-xs text-muted-foreground mt-0.5">Module 4 of 6</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="bg-card border border-border rounded-[14px] p-6" style={{ boxShadow: 'var(--card-shadow)' }}>
          <h3 className="font-semibold text-foreground mb-5">Recent Achievements</h3>
          <div className="space-y-4">
            {[
              { lbl: "Perfect Score",  desc: "100% on Greetings assessment", em: "🏆", t: "Today" },
              { lbl: "Speed Signer",   desc: "Completed 20 signs in 5 min",  em: "⚡", t: "Yesterday" },
              { lbl: "Week Warrior",   desc: "7 consecutive practice days",  em: "🔥", t: "Jul 9" },
            ].map(a => (
              <div key={a.lbl} className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-base">{a.em}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">{a.lbl}</div>
                  <div className="text-xs text-muted-foreground truncate">{a.desc}</div>
                </div>
                <span className="text-xs text-muted-foreground">{a.t}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-[14px] p-6" style={{ boxShadow: 'var(--card-shadow)' }}>
          <h3 className="font-semibold text-foreground mb-5">Recommended Next</h3>
          <div className="space-y-2.5">
            {[
              { title: "Numbers 1–20",   type: "practice",   time: "8 min",  diff: "Beginner" },
              { title: "Color Signs",    type: "lesson",     time: "12 min", diff: "Beginner" },
              { title: "Module 4 Quiz",  type: "assessment", time: "15 min", diff: "Intermediate" },
            ].map(item => (
              <button
                key={item.title}
                onClick={() => go(item.type as Screen)}
                className="w-full flex items-center gap-3.5 p-3.5 rounded-xl bg-muted/50 hover:bg-muted border border-border/50 transition-all text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center">
                  {item.type === "practice" ? <Camera size={14} className="text-primary" /> :
                   item.type === "assessment" ? <CheckSquare size={14} className="text-success" /> :
                   <BookOpen size={14} className="text-muted-foreground" />}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-foreground">{item.title}</div>
                  <div className="text-xs text-muted-foreground capitalize">{item.type} · {item.time}</div>
                </div>
                <Bdg label={item.diff} v={item.diff === "Beginner" ? "info" : "warning"} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
