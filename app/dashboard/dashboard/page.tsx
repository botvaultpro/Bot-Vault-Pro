"use client";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutPanelLeft, Star, FileText, ShieldCheck, BarChart2, Mail,
  ArrowRight, CheckCircle2, Lock, Zap, Activity, Calendar,
} from "lucide-react";
import clsx from "clsx";
import ReferralWidget from "@/app/components/ReferralWidget";

const BOT_GRID = [
  {
    slug: "sitebuilder",
    name: "SiteBuilder Pro",
    icon: LayoutPanelLeft,
    href: "/dashboard/bots/sitebuilder",
    description: "Generate AI websites & proposals",
  },
  {
    slug: "reviewbot",
    name: "ReviewBot",
    icon: Star,
    href: "/dashboard/reviewbot",
    description: "AI Google review replies",
  },
  {
    slug: "weeklypulse",
    name: "WeeklyPulse",
    icon: BarChart2,
    href: "/dashboard/weeklypulse",
    description: "Weekly business health report",
  },
  {
    slug: "emailcoach",
    name: "EmailCoach",
    icon: Mail,
    href: "/dashboard/emailcoach",
    description: "3 AI reply options per email",
  },
  {
    slug: "clausecheck",
    name: "ClauseCheck",
    icon: ShieldCheck,
    href: "/dashboard/clausecheck",
    description: "AI contract risk scanner",
  },
  {
    slug: "invoiceforge",
    name: "InvoiceForge",
    icon: FileText,
    href: "/dashboard/invoiceforge",
    description: "Professional invoices & tracking",
  },
];

type BotSub = { bot_slug: string; status: string; current_period_end?: string };
type ActivityItem = { id: string; bot_slug: string; action: string; detail: string | null; created_at: string };

const BOT_LABELS: Record<string, string> = {
  sitebuilder: "SiteBuilder Pro",
  reviewbot:   "ReviewBot",
  invoiceforge:"InvoiceForge",
  clausecheck: "ClauseCheck",
  weeklypulse: "WeeklyPulse",
  emailcoach:  "EmailCoach",
};

function DashboardInner() {
  const [subscriptions, setSubscriptions]   = useState<BotSub[]>([]);
  const [activity, setActivity]             = useState<ActivityItem[]>([]);
  const [name, setName]                     = useState("");
  const [totalActivity, setTotalActivity]   = useState(0);
  const [nextBilling, setNextBilling]       = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, subsRes, activityRes] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", user.id).single(),
        supabase.from("bot_subscriptions").select("bot_slug, status, current_period_end").eq("user_id", user.id),
        supabase.from("activity_log").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
      ]);

      if (profileRes.data?.full_name) setName(profileRes.data.full_name.split(" ")[0]);
      const subs = subsRes.data ?? [];
      setSubscriptions(subs);
      setActivity(activityRes.data ?? []);

      // Next billing date
      const activeSubs = subs.filter((s) => s.status === "active" && s.current_period_end);
      if (activeSubs.length > 0) {
        const earliest = activeSubs.sort((a, b) =>
          new Date(a.current_period_end!).getTime() - new Date(b.current_period_end!).getTime()
        )[0];
        setNextBilling(earliest.current_period_end ?? null);
      }

      // Count this month's activity
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { count } = await supabase
        .from("activity_log")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", monthStart);
      setTotalActivity(count ?? 0);
    }
    load();
  }, []);

  function isActive(slug: string) {
    const sub = subscriptions.find((s) => s.bot_slug === slug);
    return sub?.status === "active" || sub?.status === "trialing";
  }

  function getStatus(slug: string): "active" | "trial" | "locked" {
    const sub = subscriptions.find((s) => s.bot_slug === slug);
    if (!sub) return "locked";
    if (sub.status === "active") return "active";
    if (sub.status === "trialing") return "trial";
    return "locked";
  }

  const activeCount = subscriptions.filter((s) => s.status === "active").length;
  const bundleActive = activeCount >= 3;
  const botsUntilBundle = Math.max(0, 3 - activeCount);

  const STAT_CARDS = [
    {
      label: "Active Bots",
      value: `${activeCount}`,
      sub: "of 6",
      icon: Zap,
      color: "var(--accent-blue)",
      bg: "rgba(59,130,246,0.08)",
      border: "rgba(59,130,246,0.2)",
    },
    {
      label: "Uses This Month",
      value: String(totalActivity),
      sub: "actions",
      icon: Activity,
      color: "var(--accent-green)",
      bg: "rgba(16,185,129,0.08)",
      border: "rgba(16,185,129,0.2)",
    },
    {
      label: "Next Billing",
      value: nextBilling
        ? new Date(nextBilling).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        : "—",
      sub: nextBilling ? new Date(nextBilling).getFullYear().toString() : "No active sub",
      icon: Calendar,
      color: "var(--text-secondary)",
      bg: "var(--bg-elevated)",
      border: "var(--border)",
    },
    {
      label: "Bundle Status",
      value: bundleActive ? "20% Off" : botsUntilBundle > 0 ? `+${botsUntilBundle} bots` : "—",
      sub: bundleActive ? "Bundle active" : "for 20% off",
      icon: Zap,
      color: bundleActive ? "var(--accent-green)" : "var(--accent-amber)",
      bg: bundleActive ? "rgba(16,185,129,0.08)" : "rgba(245,158,11,0.08)",
      border: bundleActive ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="font-display font-extrabold text-3xl"
            style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          >
            {name ? `Hey, ${name}` : "Dashboard"}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Your AI automation command center.
          </p>
        </div>
        <Link
          href="/dashboard/billing"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:-translate-y-px"
          style={{
            background: "var(--accent-blue-glow)",
            border: "1px solid rgba(59,130,246,0.3)",
            color: "var(--accent-blue)",
          }}
        >
          <Zap className="w-4 h-4" />
          Manage Subscriptions
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-xl p-5"
              style={{
                background: card.bg,
                border: `1px solid ${card.border}`,
                borderRadius: "12px",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-mono uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
                  {card.label}
                </p>
                <Icon className="w-3.5 h-3.5" style={{ color: card.color }} />
              </div>
              <p
                className="font-display font-extrabold text-3xl"
                style={{ color: card.color, letterSpacing: "-0.02em" }}
              >
                {card.value}
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>{card.sub}</p>
            </div>
          );
        })}
      </div>

      {/* My Bots grid */}
      <div>
        <h2
          className="font-display font-bold text-xl mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          My Bots
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BOT_GRID.map((bot) => {
            const Icon = bot.icon;
            const status = getStatus(bot.slug);
            const active = status === "active" || status === "trial";

            return (
              <div
                key={bot.slug}
                className={clsx(
                  "rounded-xl p-5 flex flex-col gap-4 transition-all",
                  active ? "card-hover" : "opacity-60"
                )}
                style={{
                  background: active ? "var(--bg-surface)" : "var(--bg-surface)",
                  border: `1px solid ${active ? "var(--border)" : "var(--border)"}`,
                  borderRadius: "12px",
                }}
              >
                <div className="flex items-start justify-between">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      background: active ? "var(--accent-blue-glow)" : "var(--bg-elevated)",
                      border: `1px solid ${active ? "rgba(59,130,246,0.25)" : "var(--border)"}`,
                    }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: active ? "var(--accent-blue)" : "var(--text-tertiary)" }}
                    />
                  </div>

                  {status === "active" && (
                    <span
                      className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
                      style={{
                        background: "rgba(16,185,129,0.1)",
                        border: "1px solid rgba(16,185,129,0.25)",
                        color: "var(--accent-green)",
                      }}
                    >
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  )}
                  {status === "trial" && (
                    <span
                      className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
                      style={{
                        background: "rgba(245,158,11,0.1)",
                        border: "1px solid rgba(245,158,11,0.25)",
                        color: "var(--accent-amber)",
                      }}
                    >
                      Trial
                    </span>
                  )}
                  {status === "locked" && (
                    <span
                      className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full"
                      style={{
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border)",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </div>

                <div>
                  <h3
                    className="font-display font-bold text-sm"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {bot.name}
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                    {bot.description}
                  </p>
                </div>

                {active ? (
                  <Link
                    href={bot.href}
                    className="flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all hover:-translate-y-px"
                    style={{
                      background: "var(--accent-blue-glow)",
                      border: "1px solid rgba(59,130,246,0.3)",
                      color: "var(--accent-blue)",
                    }}
                  >
                    Open Bot <ArrowRight className="w-3 h-3" />
                  </Link>
                ) : (
                  <Link
                    href="/dashboard/billing"
                    className="flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all hover:-translate-y-px"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    Subscribe
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Referral Program */}
      <ReferralWidget />

      {/* Recent Activity */}
      <div
        className="rounded-xl p-6"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px" }}
      >
        <h2
          className="font-display font-bold text-lg mb-5 flex items-center gap-2"
          style={{ color: "var(--text-primary)" }}
        >
          <Activity className="w-5 h-5" style={{ color: "var(--accent-blue)" }} />
          Recent Activity
        </h2>

        {activity.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--text-tertiary)" }} />
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              No activity yet. Open a bot to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {activity.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 py-2.5 border-b last:border-0"
                style={{ borderColor: "rgba(31,46,69,0.5)" }}
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: "var(--accent-blue)" }}
                />
                <div className="flex-1 min-w-0">
                  <span
                    className="text-xs font-mono mr-2"
                    style={{ color: "var(--accent-blue)", fontFamily: "var(--font-mono)" }}
                  >
                    {BOT_LABELS[item.bot_slug] ?? item.bot_slug}
                  </span>
                  <span className="text-sm" style={{ color: "var(--text-primary)" }}>{item.action}</span>
                  {item.detail && (
                    <span className="text-sm ml-1" style={{ color: "var(--text-secondary)" }}>
                      — {item.detail}
                    </span>
                  )}
                </div>
                <span className="text-xs shrink-0" style={{ color: "var(--text-tertiary)" }}>
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardInner />
    </Suspense>
  );
}
