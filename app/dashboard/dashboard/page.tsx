"use client";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Globe, Star, FileText, Scale, BarChart2, Mail,
  ArrowRight, CheckCircle2, Lock, Zap, Activity,
} from "lucide-react";
import clsx from "clsx";

const BOT_GRID = [
  { slug: "sitebuilder", name: "SiteBuilder Pro", icon: Globe, color: "text-vault-green", border: "border-vault-green/20", bg: "bg-vault-green/5", href: "/dashboard/bots/sitebuilder", description: "Generate AI websites & proposals" },
  { slug: "reviewbot", name: "ReviewBot", icon: Star, color: "text-yellow-400", border: "border-yellow-400/20", bg: "bg-yellow-400/5", href: "/dashboard/reviewbot", description: "AI Google review replies" },
  { slug: "invoiceforge", name: "InvoiceForge", icon: FileText, color: "text-blue-400", border: "border-blue-400/20", bg: "bg-blue-400/5", href: "/dashboard/invoiceforge", description: "Professional invoices & proposals" },
  { slug: "clausecheck", name: "ClauseCheck", icon: Scale, color: "text-orange-400", border: "border-orange-400/20", bg: "bg-orange-400/5", href: "/dashboard/clausecheck", description: "AI contract risk scanner" },
  { slug: "weeklypulse", name: "WeeklyPulse", icon: BarChart2, color: "text-purple-400", border: "border-purple-400/20", bg: "bg-purple-400/5", href: "/dashboard/weeklypulse", description: "Weekly business health report" },
  { slug: "emailcoach", name: "EmailCoach", icon: Mail, color: "text-vault-accent", border: "border-vault-accent/20", bg: "bg-vault-accent/5", href: "/dashboard/emailcoach", description: "3 AI reply options per email" },
];

type BotSub = { bot_slug: string; status: string };
type ActivityItem = { id: string; bot_slug: string; action: string; detail: string | null; created_at: string };

function DashboardInner() {
  const [subscriptions, setSubscriptions] = useState<BotSub[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [name, setName] = useState("");
  const [totalActivity, setTotalActivity] = useState(0);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, subsRes, activityRes] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", user.id).single(),
        supabase.from("bot_subscriptions").select("bot_slug, status").eq("user_id", user.id),
        supabase.from("activity_log").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
      ]);

      if (profileRes.data?.full_name) setName(profileRes.data.full_name.split(" ")[0]);
      setSubscriptions(subsRes.data ?? []);
      setActivity(activityRes.data ?? []);

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

  const activeCount = subscriptions.filter((s) => s.status === "active").length;

  const BOT_LABELS: Record<string, string> = {
    sitebuilder: "SiteBuilder Pro",
    reviewbot: "ReviewBot",
    invoiceforge: "InvoiceForge",
    clausecheck: "ClauseCheck",
    weeklypulse: "WeeklyPulse",
    emailcoach: "EmailCoach",
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">
            {name ? `Hey, ${name} 👋` : "Dashboard"}
          </h1>
          <p className="text-vault-text-dim mt-1">Your AI automation hub.</p>
        </div>
        <Link
          href="/dashboard/billing"
          className="flex items-center gap-2 bg-vault-accent/10 border border-vault-accent/30 text-vault-accent px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-vault-accent/20 transition-colors"
        >
          <Zap className="w-4 h-4" /> Manage Subscriptions
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card-surface rounded-xl p-4">
          <p className="text-xs text-vault-text-dim mb-1 font-mono">Bots Active</p>
          <p className="font-display text-3xl font-bold text-vault-accent">{activeCount}</p>
          <p className="text-xs text-vault-text-dim">of 6</p>
        </div>
        <div className="card-surface rounded-xl p-4">
          <p className="text-xs text-vault-text-dim mb-1 font-mono">Actions This Month</p>
          <p className="font-display text-3xl font-bold text-vault-green">{totalActivity}</p>
        </div>
        <div className="card-surface rounded-xl p-4">
          <p className="text-xs text-vault-text-dim mb-1 font-mono">Bundle Discount</p>
          <p className="font-display text-3xl font-bold text-yellow-400">{activeCount >= 3 ? "20%" : "—"}</p>
          {activeCount < 3 && <p className="text-xs text-vault-text-dim">{3 - activeCount} more for 20% off</p>}
        </div>
      </div>

      {/* My Bots grid */}
      <div>
        <h2 className="font-display text-xl font-bold mb-4">My Bots</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BOT_GRID.map((bot) => {
            const Icon = bot.icon;
            const active = isActive(bot.slug);
            return (
              <div key={bot.slug} className={clsx(
                "rounded-2xl border p-5 flex flex-col gap-3 transition-all",
                active ? `${bot.border} ${bot.bg}` : "card-surface opacity-70"
              )}>
                <div className="flex items-start justify-between">
                  <div className={clsx("w-10 h-10 rounded-xl border flex items-center justify-center", bot.border, bot.bg)}>
                    <Icon className={clsx("w-5 h-5", bot.color)} />
                  </div>
                  {active ? (
                    <span className={clsx("flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border", bot.border, bot.color, bot.bg)}>
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border border-vault-border text-vault-text-dim">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm">{bot.name}</h3>
                  <p className="text-xs text-vault-text-dim mt-0.5">{bot.description}</p>
                </div>
                {active ? (
                  <Link href={bot.href} className={clsx("flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-colors", bot.border, bot.color, bot.bg, "hover:opacity-90 border")}>
                    Go To Bot <ArrowRight className="w-3 h-3" />
                  </Link>
                ) : (
                  <Link href="/dashboard/billing" className="flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold bg-vault-accent/10 text-vault-accent border border-vault-accent/20 hover:bg-vault-accent/20 transition-colors">
                    Subscribe
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card-surface rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-vault-accent" /> Recent Activity
        </h2>
        {activity.length === 0 ? (
          <p className="text-vault-text-dim text-sm">No activity yet. Start using a bot to see your activity here.</p>
        ) : (
          <div className="space-y-2">
            {activity.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-2.5 border-b border-vault-border/50 last:border-0">
                <div className="w-2 h-2 rounded-full bg-vault-accent shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-mono text-vault-accent mr-2">{BOT_LABELS[item.bot_slug] ?? item.bot_slug}</span>
                  <span className="text-sm text-vault-text">{item.action}</span>
                  {item.detail && <span className="text-sm text-vault-text-dim ml-1">— {item.detail}</span>}
                </div>
                <span className="text-xs text-vault-text-dim shrink-0">{new Date(item.created_at).toLocaleDateString()}</span>
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
