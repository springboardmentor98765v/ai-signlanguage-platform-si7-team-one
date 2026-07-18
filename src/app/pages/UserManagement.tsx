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

export default function UserManagement() {
  const [search, setSearch] = useState("");
  const users = [
    { name: "Maya Chen",       email: "maya.chen@example.com",   role: "learner" as Role,    status: "active",   joined: "Mar 12, 2026" },
    { name: "Dr. Anya Roberts",email: "a.roberts@signpath.edu",   role: "instructor" as Role, status: "active",   joined: "Jan 5, 2026" },
    { name: "James Wu",        email: "james.wu@example.com",     role: "learner" as Role,    status: "active",   joined: "Jun 2, 2026" },
    { name: "Maria Santos",    email: "m.santos@rehab.org",       role: "trainer" as Role,    status: "active",   joined: "Feb 18, 2026" },
    { name: "David Park",      email: "d.park@example.com",       role: "learner" as Role,    status: "inactive", joined: "Apr 30, 2026" },
    { name: "System Admin",    email: "admin@signpath.ai",        role: "admin" as Role,      status: "active",   joined: "Jan 1, 2026" },
  ];
  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            placeholder="Search users…"
          />
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold px-4 py-2.5 rounded-xl transition-colors">
          <Plus size={13} /> Invite User
        </button>
      </div>

      <div className="bg-card border border-border rounded-[14px] overflow-hidden" style={{ boxShadow: 'var(--card-shadow)' }}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {["User", "Role", "Status", "Joined", ""].map((h, i) => (
                <th key={i} className={`text-xs font-semibold text-muted-foreground p-4 ${i === 4 ? "text-right" : "text-left"}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr key={u.email} className={`border-b border-border/50 hover:bg-muted/50 transition-colors ${i === filtered.length - 1 ? "border-0" : ""}`}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/70 to-primary/40 flex items-center justify-center text-xs font-bold text-primary-foreground">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{u.name}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <Bdg label={u.role.charAt(0).toUpperCase() + u.role.slice(1)} v={u.role === "admin" ? "warning" : u.role === "instructor" ? "info" : u.role === "trainer" ? "success" : "default"} />
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${u.status === "active" ? "bg-success" : "bg-muted-foreground"}`} />
                    <span className="text-xs text-muted-foreground capitalize">{u.status}</span>
                  </div>
                </td>
                <td className="p-4 text-xs text-muted-foreground">{u.joined}</td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <button className="text-xs text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors">Edit</button>
                    <button className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors ${u.status === "active" ? "text-danger hover:bg-danger/10" : "text-success hover:bg-success/10"}`}>
                      {u.status === "active" ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
