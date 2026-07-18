import { useState, useEffect } from "react";
import {
  Home, BookOpen, Camera, CheckSquare, MessageCircle, TrendingUp,
  Award, Users, Settings, Bell, ChevronRight, Play, RotateCcw,
  ArrowRight, Eye, EyeOff, Clock, Zap, Target, Activity,
  Shield, Server, UserCheck, LogOut, Plus, Search, Filter,
  Download, Share2, AlertTriangle, CheckCircle, XCircle, Info,
  SkipForward, Calendar, Lock, Mail, Check, ChevronLeft,
} from "lucide-react";

export default function NotificationsPanel() {
  const notifs = [
    { type: "achievement", title: "New badge earned!", desc: "You earned the \"Perfect Score\" badge", t: "2 min ago",  read: false },
    { type: "feedback",    title: "Instructor feedback", desc: "Dr. Roberts left a note on your FEAR assessment", t: "1 hr ago",   read: false },
    { type: "reminder",    title: "Daily practice reminder", desc: "Keep your 14-day streak going today!", t: "3 hr ago",   read: false },
    { type: "system",      title: "New course available", desc: "ASL Advanced Conversation is now open", t: "Yesterday", read: true },
    { type: "achievement", title: "Module complete!", desc: "You finished Module 3: Basic Phrases", t: "2 days ago", read: true },
  ];
  return (
    <div className="p-8 max-w-2xl mx-auto space-y-3">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-foreground">Notifications</h2>
        <button className="text-xs text-primary hover:text-primary/80 font-semibold">Mark all read</button>
      </div>
      {notifs.map((n, i) => (
        <div key={i} className={`p-4 rounded-xl border transition-all ${n.read ? "border-border bg-card opacity-60" : "border-primary/20 bg-primary/5"}`}>
          <div className="flex items-start gap-3.5">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
              n.type === "achievement" ? "bg-warning/10" :
              n.type === "feedback"    ? "bg-primary/10" :
              n.type === "reminder"   ? "bg-muted" : "bg-muted"
            }`}>
              {n.type === "achievement" ? <Award size={14} className="text-warning" /> :
               n.type === "feedback"    ? <MessageCircle size={14} className="text-primary" /> :
               n.type === "reminder"   ? <Bell size={14} className="text-muted-foreground" /> :
               <Info size={14} className="text-muted-foreground" />}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                {n.title}
                {!n.read && <div className="w-2 h-2 rounded-full bg-primary" />}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{n.desc}</div>
            </div>
            <span className="text-xs text-muted-foreground flex-shrink-0">{n.t}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
