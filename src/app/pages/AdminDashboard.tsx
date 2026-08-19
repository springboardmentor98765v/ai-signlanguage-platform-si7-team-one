import { useState, useEffect } from "react";
import {
  BookOpen,
  Camera,
  CheckSquare,
  MessageCircle,
  TrendingUp,
  Users,
  Server,
  Activity,
  Search,
} from "lucide-react";

import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { adminGrowth } from "../lib/mockData";
import { MCard } from "../components/shared/MCard";
import { Bdg } from "../components/shared/Indicators";
import { useIsDark } from "../lib/useIsDark";
import {
  adminListUsers,
  adminToggleUserStatus,
} from "../services/api";

interface BackendUser {
  user_id: string;
  full_name: string;
  email: string;
  is_active: boolean;
  roles: string[];
}

export default function AdminDashboard() {
  const dark = useIsDark();

  const grid = dark
    ? "rgba(255,255,255,0.05)"
    : "#EBEBEB";

  const tick = dark
    ? "#9CA3AF"
    : "#6A6A6A";

  const tipBg = dark
    ? "#1C1C1E"
    : "#FFFFFF";

  const tipBorder = dark
    ? "rgba(255,255,255,0.08)"
    : "#DDDDDD";

  const [users, setUsers] =
    useState<BackendUser[]>([]);

  const [userSearch, setUserSearch] =
    useState("");

  const [loadingUsers, setLoadingUsers] =
    useState(true);

  // ─────────────────────────────────────────────
  // LOAD USERS
  // ─────────────────────────────────────────────

  useEffect(() => {
    adminListUsers()
      .then((data) => {
        setUsers(data ?? []);
      })
      .catch(() => {
        setUsers([]);
      })
      .finally(() => {
        setLoadingUsers(false);
      });
  }, []);

  // ─────────────────────────────────────────────
  // TOGGLE USER STATUS
  // ─────────────────────────────────────────────

  const toggleActive = async (
    userId: string,
    currentlyActive: boolean
  ) => {
    try {
      await adminToggleUserStatus(
        userId,
        !currentlyActive
      );

      setUsers((prev) =>
        prev.map((user) =>
          user.user_id === userId
            ? {
                ...user,
                is_active: !currentlyActive,
              }
            : user
        )
      );
    } catch {
      // Keep current UI state if API fails.
    }
  };

  // ─────────────────────────────────────────────
  // USER STATS
  // ─────────────────────────────────────────────

  const activeUsers = users.filter(
    (user) => user.is_active
  ).length;

  const totalUsers = users.length;

  // ─────────────────────────────────────────────
  // SEARCH
  // ─────────────────────────────────────────────

  const filteredUsers = users.filter((user) => {
    const query =
      userSearch.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      user.full_name
        .toLowerCase()
        .includes(query) ||
      user.email
        .toLowerCase()
        .includes(query)
    );
  });

  // ─────────────────────────────────────────────
  // ROLE
  // IMPORTANT:
  // Backend DB role is "trainer"
  // NOT "accessibility_trainer"
  // ─────────────────────────────────────────────

  const getRole = (
    roles: string[]
  ): string => {
    if (roles.includes("admin")) {
      return "admin";
    }

    if (roles.includes("instructor")) {
      return "instructor";
    }

    if (roles.includes("trainer")) {
      return "trainer";
    }

    return "learner";
  };

  // ─────────────────────────────────────────────
  // LESSON MOCK DATA
  // ─────────────────────────────────────────────

  const lessons = [
    {
      title: "Letter A",
      level: "Beginner",
      cat: "Alphabet",
      learners: 142,
    },
    {
      title: "Letter B",
      level: "Beginner",
      cat: "Alphabet",
      learners: 138,
    },
    {
      title: "Letter C",
      level: "Beginner",
      cat: "Alphabet",
      learners: 125,
    },
    {
      title: "Greetings",
      level: "Beginner",
      cat: "Words",
      learners: 98,
    },
    {
      title: "Numbers 1–10",
      level: "Beginner",
      cat: "Numbers",
      learners: 87,
    },
  ];

  // ─────────────────────────────────────────────
  // SERVICE STATUS
  // ─────────────────────────────────────────────

  const SVCS = [
    {
      name: "User Service",
      icon: Users,
      healthy: true,
      uptime: "99.9%",
      rps: "1.2k",
    },
    {
      name: "Course Service",
      icon: BookOpen,
      healthy: true,
      uptime: "99.8%",
      rps: "890",
    },
    {
      name: "Practice Service",
      icon: Camera,
      healthy: true,
      uptime: "99.7%",
      rps: "2.1k",
    },
    {
      name: "Assessment Service",
      icon: CheckSquare,
      healthy: false,
      uptime: "98.1%",
      rps: "445",
    },
    {
      name: "Feedback Service",
      icon: MessageCircle,
      healthy: true,
      uptime: "99.9%",
      rps: "760",
    },
    {
      name: "Analytics Service",
      icon: TrendingUp,
      healthy: true,
      uptime: "100%",
      rps: "320",
    },
  ];

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto">

      {/* ═══════════════════════════════════════════
          STATS
      ═══════════════════════════════════════════ */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">

        <MCard
          icon={Users}
          label="Total Users"
          value={
            loadingUsers
              ? "…"
              : String(totalUsers)
          }
          delta={`${activeUsers} active`}
          col="cyan"
        />

        <MCard
          icon={TrendingUp}
          label="Completion Rate"
          value="73%"
          delta="+4% vs last month"
          col="emerald"
        />

        <MCard
          icon={Activity}
          label="AI Predictions Today"
          value="14.2k"
          delta="98.7% accurate"
          col="violet"
        />

        <MCard
          icon={Server}
          label="System Health"
          value="99.8%"
          delta="All services nominal"
          col="emerald"
        />

      </div>

      {/* ═══════════════════════════════════════════
          PLATFORM GROWTH + SERVICE STATUS
      ═══════════════════════════════════════════ */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">

        {/* Platform Growth */}

        <div
          className="bg-card border border-border rounded-[14px] p-6"
          style={{
            boxShadow:
              "var(--card-shadow)",
          }}
        >
          <h3 className="font-semibold text-foreground mb-5 text-sm">
            Platform Growth
          </h3>

          <ResponsiveContainer
            width="100%"
            height={200}
          >
            <AreaChart data={adminGrowth}>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke={grid}
                vertical={false}
              />

              <XAxis
                dataKey="month"
                tick={{
                  fontSize: 11,
                  fill: tick,
                }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                tick={{
                  fontSize: 11,
                  fill: tick,
                }}
                axisLine={false}
                tickLine={false}
                width={30}
              />

              <Tooltip
                contentStyle={{
                  background: tipBg,
                  border: `1px solid ${tipBorder}`,
                  borderRadius: 10,
                  fontSize: 12,
                }}
              />

              <Area
                type="monotone"
                dataKey="learners"
                stroke="var(--primary)"
                fill="var(--primary)"
                fillOpacity={0.15}
                strokeWidth={2}
                dot={false}
              />

            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Service Status */}

        <div
          className="bg-card border border-border rounded-[14px] p-6"
          style={{
            boxShadow:
              "var(--card-shadow)",
          }}
        >
          <h3 className="font-semibold text-foreground mb-5 text-sm">
            Service Status
          </h3>

          <div className="space-y-3">

            {SVCS.map((service) => {
              const Icon = service.icon;

              return (
                <div
                  key={service.name}
                  className="flex items-center justify-between"
                >

                  <div className="flex items-center gap-2.5">

                    <Icon
                      size={14}
                      className="text-muted-foreground"
                    />

                    <span className="text-xs text-foreground">
                      {service.name}
                    </span>

                  </div>

                  <div className="flex items-center gap-3">

                    <span className="text-xs text-muted-foreground">
                      {service.rps} rps
                    </span>

                    <span className="text-xs text-muted-foreground">
                      {service.uptime}
                    </span>

                    <div
                      className={`w-2 h-2 rounded-full ${
                        service.healthy
                          ? "bg-emerald-400"
                          : "bg-rose-400"
                      }`}
                    />

                  </div>

                </div>
              );
            })}

          </div>
        </div>

      </div>

      {/* ═══════════════════════════════════════════
          USER MANAGEMENT
      ═══════════════════════════════════════════ */}

      <div
        className="bg-card border border-border rounded-[14px] p-6"
        style={{
          boxShadow:
            "var(--card-shadow)",
        }}
      >

        <div className="flex items-center justify-between mb-5">

          <h3 className="font-semibold text-foreground text-sm">
            User Management
          </h3>

          <div className="relative">

            <Search
              size={12}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />

            <input
              value={userSearch}
              onChange={(event) =>
                setUserSearch(
                  event.target.value
                )
              }
              placeholder="Search users…"
              className="bg-muted border border-border rounded-xl pl-8 pr-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary/50 w-48"
            />

          </div>

        </div>

        {loadingUsers ? (

          <div className="py-8 text-center text-xs text-muted-foreground">
            Loading users…
          </div>

        ) : (

          <div className="space-y-2">

            {filteredUsers.map((user) => {

              /*
               * IMPORTANT:
               *
               * Backend DB:
               *   learner
               *   instructor
               *   trainer
               *   admin
               *
               * Do NOT use:
               *   accessibility_trainer
               */

              const roleStr = getRole(
                user.roles
              );

              const roleLabel =
                roleStr
                  .charAt(0)
                  .toUpperCase() +
                roleStr.slice(1);

              const roleVariant =
                roleStr === "admin"
                  ? "warning"
                  : roleStr === "instructor"
                    ? "info"
                    : roleStr === "trainer"
                      ? "success"
                      : "default";

              return (
                <div
                  key={user.user_id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                >

                  {/* Avatar */}

                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/70 to-primary/40 flex items-center justify-center text-xs font-bold text-primary-foreground flex-shrink-0">
                    {user.full_name
                      ?.charAt(0)
                      ?.toUpperCase() ?? "U"}
                  </div>

                  {/* User Information */}

                  <div className="flex-1 min-w-0">

                    <div className="text-xs font-semibold text-foreground truncate">
                      {user.full_name}
                    </div>

                    <div className="text-[10px] text-muted-foreground truncate">
                      {user.email}
                    </div>

                  </div>

                  {/* Role */}

                  <Bdg
                    label={roleLabel}
                    v={roleVariant}
                  />

                  {/* Active Status */}

                  <div
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      user.is_active
                        ? "bg-emerald-400"
                        : "bg-muted-foreground"
                    }`}
                  />

                  {/* Toggle Status */}

                  <button
                    onClick={() =>
                      toggleActive(
                        user.user_id,
                        user.is_active
                      )
                    }
                    className={`text-[10px] px-2 py-1 rounded-lg transition-colors flex-shrink-0 ${
                      user.is_active
                        ? "text-rose-400 hover:bg-rose-950/30"
                        : "text-emerald-400 hover:bg-emerald-950/30"
                    }`}
                  >
                    {user.is_active
                      ? "Deactivate"
                      : "Activate"}
                  </button>

                </div>
              );
            })}

            {/* Empty State */}

            {filteredUsers.length === 0 && (

              <div className="py-6 text-center text-xs text-muted-foreground">

                {users.length === 0
                  ? "No users found — backend may not be running."
                  : `No users match "${userSearch}"`}

              </div>

            )}

          </div>

        )}

      </div>

      {/* ═══════════════════════════════════════════
          LESSON CATALOGUE
      ═══════════════════════════════════════════ */}

      <div
        className="bg-card border border-border rounded-[14px] p-6"
        style={{
          boxShadow:
            "var(--card-shadow)",
        }}
      >

        <div className="flex items-center justify-between mb-4">

          <h3 className="font-semibold text-foreground text-sm">
            Lesson Catalogue
          </h3>

          <Bdg
            label="Mock data"
            v="default"
          />

        </div>

        <div className="space-y-2">

          {lessons.map((lesson) => (

            <div
              key={lesson.title}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
            >

              <div>

                <div className="text-xs font-semibold text-foreground">
                  {lesson.title}
                </div>

                <div className="text-[10px] text-muted-foreground">
                  {lesson.cat} · {lesson.level}
                </div>

              </div>

              <div className="text-xs text-muted-foreground">
                {lesson.learners} learners
              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}