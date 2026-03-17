"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TIER_LIMITS, type Tier } from "@/lib/tier-limits";
import { Target, Zap, MessageSquare, Globe, ArrowRight, TrendingUp, CheckCircle2 } from "lucide-react";

const bots = [
  { slug: "leadgen", name: "LeadGen Pro", icon: Target, color: "cyan", key: "leadgen" },
  { slug: "contentblast", name: "ContentBlast", icon: Zap, color: "green", key: "contentblast" },
  { slug: "supportdesk", name: "SupportDesk", icon: MessageSquare, color: "cyan", key: "supportdesk" },
  { slug: "sitebuilder", name: "SiteBuilder Pro", icon: Globe, color: "green", key: "sitebuilder" },
];

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardInner />
    </Suspense>
  );
}

function DashboardInner() {
  const [tier, setTier] = useState<Tier>("free");
  const [usage, setUsage] = useState<Record<string, number>>({ leadgen: 0, contentblast: 0, supportdesk: 0, sitebuilder: 0 });
  const [name, setName] = useState("");
  const [successBanner, setSuccessBanner] = useState(false);
  const searchParams = useSearchParams();

  const fetchSubscription = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("tier")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single();
    if (sub?.tier) setTier(sub.tier as Tier);
    return sub?.tier ?? "free";
  }, []);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
      if (profile?.full_name) setName(profile.full_name.split(" ")[0]);
      await fetchSubscription();
      const now = new Date();
      const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const { data: usageData } = await supabase.from("usage_tracking").select("bot, count").eq("user_id", user.id).eq("month_key", monthKey);
      const u: Record<string, number> = { leadgen: 0, contentblast: 0, supportdesk: 0, sitebuilder: 0 };
      usageData?.forEach((row) => { u[row.bot] = row.count; });
      setUsage(u);
    }
    load();
  }, [fetchSubscription]);

  // After Stripe redirect with ?success=true, poll until the webhook updates the plan
  useEffect(() => {
    if (searchParams.get("success") !== "true") return;
    setSuccessBanner(true);

    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      const currentTier = await fetchSubscription();
      if (currentTier && currentTier !== "free") {
        clearInterval(interval);
      }
      if (attempts >= 8) clearInterval(interval); // stop after ~16s
    }, 2000);

    return () => clearInterval(interval);
  }, [searchParams, fetchSubscription]);

  const limits = TIER_LIMITS[tier];
  function getLimit(key: string): number {
    if (key === "leadgen") return limits.leadgen.leadsPerRun;
    if (key === "contentblast") return limits.contentblast.blastsPerMonth;
    if (key === "supportdesk") return limits.supportdesk.ticketsPerMonth;
    if (key === "sitebuilder") return limits.sitebuilder.prospectsPerMonth;
    return 0;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {successBanner && (
        <div className="flex items-center gap-3 rounded-xl border border-vault-green/30 bg-vault-green/10 px-5 py-4 text-vault-green">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-semibold">Payment successful!</p>
            <p className="text-sm opacity-80">Your plan is being activated — this page will update automatically.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">{name ? `Hey, ${name} 👋` : "Dashboard"}</h1>
          <p className="text-vault-text-dim mt-1">Your bot activity this month.</p>
        </div>
        {tier === "free" && (
          <Link href="/dashboard/billing" className="flex items-center gap-2 bg-vault-accent/10 border border-vault-accent/30 text-vault-accent px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-vault-accent/20 transition-colors">
            ⚡ Upgrade to unlock full access
          </Link>
        )}
      </div>

      <div className="card-surface rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div>
          <p className="text-xs text-vault-text-dim uppercase tracking-widest font-mono mb-1">Current Plan</p>
          <p className="font-display text-xl font-bold capitalize">{tier}</p>
        </div>
        <div className="h-px sm:h-8 sm:w-px bg-vault-border" />
        <div>
          <p className="text-xs text-vault-text-dim uppercase tracking-widest font-mono mb-1">Billing</p>
          <p className="font-medium">{TIER_LIMITS[tier].price === 0 ? "Free" : TIER_LIMITS[tier].price === null ? "Custom" : `$${TIER_LIMITS[tier].price}/month`}</p>
        </div>
        <Link href="/dashboard/billing" className="sm:ml-auto text-sm text-vault-accent hover:text-vault-accent-dim flex items-center gap-1">
          Manage billing <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div>
        <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-vault-accent" /> Bot Usage — This Month
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {bots.map((bot) => {
            const Icon = bot.icon;
            const used = usage[bot.key] ?? 0;
            const limit = getLimit(bot.key);
            const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
            const isNearLimit = pct >= 80;
            const accent = bot.color === "cyan" ? "text-vault-accent" : "text-vault-green";
            const bar = bot.color === "cyan" ? "bg-vault-accent" : "bg-vault-green";
            return (
              <Link key={bot.slug} href={`/dashboard/bots/${bot.slug}`} className="card-surface rounded-2xl p-5 hover:border-vault-accent/30 transition-all group block">
                <div className="flex items-start justify-between mb-4">
                  <Icon className={`w-6 h-6 ${accent}`} />
                  <ArrowRight className="w-4 h-4 text-vault-muted group-hover:text-vault-text-dim transition-colors" />
                </div>
                <h3 className="font-display font-semibold text-sm mb-1">{bot.name}</h3>
                <div className="flex items-end justify-between mb-2">
                  <span className="font-mono text-2xl font-bold">{used}</span>
                  <span className="text-xs text-vault-text-dim">/ {limit === 999999 ? "∞" : limit}</span>
                </div>
                <div className="w-full h-1.5 bg-vault-border rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${isNearLimit ? "bg-red-400" : bar}`} style={{ width: `${pct}%` }} />
                </div>
                {isNearLimit && <p className="text-xs text-red-400 mt-1">Near limit — upgrade soon</p>}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="card-surface rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold mb-5">Quick Launch</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {bots.map((bot) => {
            const Icon = bot.icon;
            const cls = bot.color === "cyan" ? "text-vault-accent border-vault-accent/20 hover:bg-vault-accent/5" : "text-vault-green border-vault-green/20 hover:bg-vault-green/5";
            return (
              <Link key={bot.slug} href={`/dashboard/bots/${bot.slug}`} className={`flex items-center gap-3 border rounded-xl px-4 py-3 transition-all ${cls}`}>
                <Icon className="w-5 h-5 shrink-0" />
                <span className="font-medium text-sm text-vault-text">{bot.name}</span>
                <ArrowRight className="w-4 h-4 ml-auto opacity-50" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
