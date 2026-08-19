import { useState, useEffect } from "react";
import {
  Home, BookOpen, Camera, CheckSquare, MessageCircle, TrendingUp,
  Award, Users, Settings, Bell, ChevronRight, Play, RotateCcw,
  ArrowRight, Eye, EyeOff, Clock, Zap, Target, Activity,
  Shield, Server, UserCheck, LogOut, Plus, Search, Filter,
  Download, Share2, AlertTriangle, CheckCircle, XCircle, Info,
  SkipForward, Calendar, Lock, Mail, Check, ChevronLeft,
} from "lucide-react";
import { Bdg } from "../components/shared/Indicators";

export default function CourseManagement() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">My Courses</h2>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-xl transition-colors">
          <Plus size={14} /> New Course
        </button>
      </div>
      <div className="space-y-3">
        {[
          { title: "ASL Fundamentals",  students: 18, modules: 6, pub: true },
          { title: "ASL Intermediate",  students: 12, modules: 4, pub: true },
          { title: "Emotions in Context",students: 0, modules: 2, pub: false },
        ].map(c => (
          <div key={c.title} className="bg-card border border-border rounded-[14px] p-5 flex items-center gap-4" style={{ boxShadow: 'var(--card-shadow)' }}>
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <BookOpen size={17} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-foreground text-sm">{c.title}</div>
              <div className="text-xs text-muted-foreground">{c.modules} modules · {c.students} students enrolled</div>
            </div>
            <Bdg label={c.pub ? "Published" : "Draft"} v={c.pub ? "success" : "default"} />
            <div className="flex gap-2">
              <button className="text-xs bg-muted border border-border px-3.5 py-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors">Edit</button>
              <button className="text-xs bg-muted border border-border p-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors"><Share2 size={12} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
