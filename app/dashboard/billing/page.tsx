"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Check, Loader2, CreditCard, Globe, Star, FileText,
  Scale, BarChart2, Mail, Zap, Lock, CheckCircle2,
} from "lucide-react";
import clsx from "clsx";

type BotSub = { bot_slug: string; tier: string; status: string };

// Hardcoded price IDs (created via scripts/create-stripe-products.js)
const BOT_CONFIGS = [
  {
    slug: "sitebuilder",
    name: "SiteBuilder Pro",
    Icon: Globe,
    iconColor: "text-vault-green",
    borderColor: "border-vault-green/20",
    bgColor: "bg-vault-green/5",
    badgeClass: "bg-vault-green/10 text-vault-green border-vault-green/20",
    description: "Generate AI websites and sales proposals in minutes",
    starter: {
      price: 49,
      priceId: "price_1TC4mPEXeLLfaSZwkXkHnUSx",
      features: ["10 site generations/mo", "AI proposal generator", "Client pipeline CRM", "PDF download"],
    },
    pro: {
      price: 99,
      priceId: "price_1TC4mPEXeLLfaSZwx6lPsVKl",
      features: ["Unlimited generations", "Everything in Starter", "Priority generation", "Advanced analytics"],
    },
  },
  {
    slug: "reviewbot",
    name: "ReviewBot",
    Icon: Star,
    iconColor: "text-yellow-400",
    borderColor: "border-yellow-400/20",
    bgColor: "bg-yellow-400/5",
    badgeClass: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
    description: "Monitor and auto-reply to Google Business reviews with AI",
    starter: {
      price: 29,
      priceId: "price_1TC4mQEXeLLfaSZwchiUc8Tc",
      features: ["1 location", "Manual approval only", "50 replies/month", "AI-crafted replies"],
    },
    pro: {
      price: 49,
      priceId: "price_1TC4mQEXeLLfaSZw3HCVFito",
      features: ["3 locations", "Auto-publish mode", "Unlimited replies", "Weekly summary email"],
    },
  },
  {
    slug: "invoiceforge",
    name: "InvoiceForge",
    Icon: FileText,
    iconColor: "text-blue-400",
    borderColor: "border-blue-400/20",
    bgColor: "bg-blue-400/5",
    badgeClass: "bg-blue-400/10 text-blue-400 border-blue-400/20",
    description: "Create professional invoices and project proposals with AI",
    starter: {
      price: 29,
      priceId: "price_1TC4mREXeLLfaSZwNgj7FlD0",
      features: ["10 invoices/month", "PDF download", "Payment status tracking", "All currencies"],
    },
    pro: {
      price: 49,
      priceId: "price_1TC4mSEXeLLfaSZwkdPWUJ65",
      features: ["Unlimited invoices", "AI proposal generation", "Overdue email alerts", "Everything in Starter"],
    },
  },
  {
    slug: "clausecheck",
    name: "ClauseCheck",
    Icon: Scale,
    iconColor: "text-orange-400",
    borderColor: "border-orange-400/20",
    bgColor: "bg-orange-400/5",
    badgeClass: "bg-orange-400/10 text-orange-400 border-orange-400/20",
    description: "Upload any contract and get instant AI risk analysis",
    starter: {
      price: 29,
      priceId: "price_1TC4mTEXeLLfaSZwIAftWeQp",
      features: ["5 analyses/month", "Plain-English summary", "Risk flag detection", "Missing protections"],
    },
    pro: {
      price: 49,
      priceId: "price_1TC4mTEXeLLfaSZwkfdqTnzv",
      features: ["Unlimited analyses", "Risk level badges", "Export report", "Analysis history"],
    },
  },
  {
    slug: "weeklypulse",
    name: "WeeklyPulse",
    Icon: BarChart2,
    iconColor: "text-purple-400",
    borderColor: "border-purple-400/20",
    bgColor: "bg-purple-400/5",
    badgeClass: "bg-purple-400/10 text-purple-400 border-purple-400/20",
    description: "Weekly AI business health report delivered every Monday",
    starter: {
      price: 19,
      priceId: "price_1TC4mUEXeLLfaSZwXOcWLRoq",
      features: ["Manual report generation", "AI analysis", "Report history", "Weekly snapshot"],
    },
    pro: {
      price: 39,
      priceId: "price_1TC4mVEXeLLfaSZwOLZtqs5T",
      features: ["Automated Monday email", "12-week history", "Industry benchmarks", "Everything in Starter"],
    },
  },
  {
    slug: "emailcoach",
    name: "EmailCoach",
    Icon: Mail,
    iconColor: "text-vault-accent",
    borderColor: "border-vault-accent/20",
    bgColor: "bg-vault-accent/5",
    badgeClass: "bg-vault-accent/10 text-vault-accent border-vault-accent/20",
    description: "Get 3 AI-crafted reply options for any difficult email",
    starter: {
      price: 19,
      priceId: "price_1TC4mWEXeLLfaSZwY9kehrMp",
      features: ["20 generations/month", "3 reply styles", "Copy-to-clipboard", "Goal-based replies"],
    },
    pro: {
      price: 39,
      priceId: "price_1TC4mXEXeLLfaSZwwAyObExO",
      features: ["Unlimited generations", "Reply history", "Tone customization", "Everything in Starter"],
    },
  },
];

function BillingInner() {
  const [subscriptions, setSubscriptions] = useState<BotSub[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("success") === "true") setSuccessBanner(true);
    loadSubscriptions();
  }, [searchParams]);

  async function loadSubscriptions() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("bot_subscriptions")
      .select("bot_slug, tier, status")
      .eq("user_id", user.id);
    setSubscriptions(data ?? []);
  }

  function getSubForBot(slug: string) {
    return subscriptions.find((s) => s.bot_slug === slug);
  }

  async function handleSubscribe(priceId: string, botSlug: string, tier: string) {
    const key = `${botSlug}-${tier}`;
    setLoading(key);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, botSlug, tier }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(null);
      }
    } catch {
      setError("Network error. Please try again.");
      setLoading(null);
    }
  }

  async function handlePortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const { url } = await res.json();
      if (url) window.location.href = url;
      else setPortalLoading(false);
    } catch {
      setPortalLoading(false);
    }
  }

  const activeCount = subscriptions.filter((s) => s.status === "active").length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">Billing</h1>
          <p className="text-vault-text-dim mt-1">Subscribe to individual bots. Pay only for what you use.</p>
        </div>
        <button
          onClick={handlePortal}
          disabled={portalLoading}
          className="flex items-center gap-2 border border-vault-border text-vault-text-dim px-4 py-2.5 rounded-lg text-sm hover:border-vault-accent hover:text-vault-accent transition-colors"
        >
          {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
          Manage Billing
        </button>
      </div>

      {successBanner && (
        <div className="flex items-center gap-3 rounded-xl border border-vault-green/30 bg-vault-green/10 px-5 py-4 text-vault-green">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-semibold">Payment successful!</p>
            <p className="text-sm opacity-80">Your bot is being activated — refresh if it doesn&apos;t appear immediately.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Bundle banner */}
      <div className="rounded-xl border border-vault-accent/30 bg-vault-accent/5 px-5 py-4 flex items-center gap-3">
        <Zap className="w-5 h-5 text-vault-accent shrink-0" />
        <div>
          <p className="font-semibold text-vault-text">Subscribe to 3 or more bots and save 20% automatically.</p>
          <p className="text-sm text-vault-text-dim">No coupon needed — discount applied at checkout when you reach 3 bots.</p>
        </div>
        {activeCount >= 3 && (
          <span className="ml-auto text-xs bg-vault-green/10 text-vault-green border border-vault-green/20 px-2 py-1 rounded-full font-semibold whitespace-nowrap">
            Bundle active ✓
          </span>
        )}
      </div>

      {/* Bot cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {BOT_CONFIGS.map((bot) => {
          const { Icon } = bot;
          const sub = getSubForBot(bot.slug);
          const isActive = sub?.status === "active" || sub?.status === "trialing";

          return (
            <div key={bot.slug} className={clsx(
              "rounded-2xl border p-6 transition-all",
              isActive ? "border-vault-green/30 bg-vault-green/5" : "card-surface"
            )}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={clsx("w-10 h-10 rounded-xl border flex items-center justify-center", bot.borderColor, bot.bgColor)}>
                    <Icon className={clsx("w-5 h-5", bot.iconColor)} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold">{bot.name}</h3>
                    <p className="text-sm text-vault-text-dim">{bot.description}</p>
                  </div>
                </div>
                {isActive && (
                  <span className={clsx("text-xs font-semibold px-2.5 py-1 rounded-full border capitalize shrink-0 ml-2", bot.badgeClass)}>
                    Active — {sub?.tier}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                {(["starter", "pro"] as const).map((tierKey) => {
                  const tierConfig = bot[tierKey];
                  const isCurrentTier = isActive && sub?.tier === tierKey;
                  const loadingKey = `${bot.slug}-${tierKey}`;

                  return (
                    <div key={tierKey} className={clsx(
                      "rounded-xl border p-4 flex flex-col",
                      isCurrentTier ? "border-vault-green/40 bg-vault-green/5" : "border-vault-border bg-vault-bg/50"
                    )}>
                      <div className="flex items-baseline justify-between mb-3">
                        <span className="text-xs font-mono uppercase tracking-wider text-vault-text-dim capitalize">{tierKey}</span>
                        <span className="font-display font-bold text-xl">
                          ${tierConfig.price}<span className="text-xs text-vault-text-dim font-normal">/mo</span>
                        </span>
                      </div>
                      <ul className="space-y-1.5 mb-4 flex-1">
                        {tierConfig.features.map((f) => (
                          <li key={f} className="flex items-start gap-1.5 text-xs text-vault-text-dim">
                            <Check className="w-3 h-3 text-vault-green mt-0.5 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      {isCurrentTier ? (
                        <div className="text-center text-xs font-semibold text-vault-green py-2 rounded-lg bg-vault-green/10 border border-vault-green/20">
                          ✓ Current Plan
                        </div>
                      ) : isActive ? (
                        <button
                          onClick={() => handleSubscribe(tierConfig.priceId, bot.slug, tierKey)}
                          disabled={loading === loadingKey}
                          className="text-xs font-semibold py-2 rounded-lg border border-vault-border text-vault-text-dim hover:border-vault-accent hover:text-vault-accent transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                        >
                          {loading === loadingKey && <Loader2 className="w-3 h-3 animate-spin" />}
                          Switch to {tierKey}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSubscribe(tierConfig.priceId, bot.slug, tierKey)}
                          disabled={loading === loadingKey}
                          className={clsx(
                            "text-xs font-semibold py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5",
                            tierKey === "pro"
                              ? "bg-vault-accent text-vault-bg hover:bg-vault-accent/90"
                              : "border border-vault-border text-vault-text-dim hover:border-vault-accent hover:text-vault-accent"
                          )}
                        >
                          {loading === loadingKey && <Loader2 className="w-3 h-3 animate-spin" />}
                          Subscribe
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {!isActive && (
                <p className="mt-3 text-xs text-vault-text-dim flex items-center gap-1.5">
                  <Lock className="w-3 h-3" />
                  Free trial available — try before you subscribe
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense>
      <BillingInner />
    </Suspense>
  );
}
