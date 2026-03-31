"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Check, Loader2, CreditCard, LayoutPanelLeft, Star, FileText,
  ShieldCheck, BarChart2, Mail, Zap, Lock, CheckCircle2,
} from "lucide-react";
import clsx from "clsx";

type BotSub = { bot_slug: string; tier: string; status: string };

const BOT_CONFIGS = [
  {
    slug: "sitebuilder",
    name: "SiteBuilder Pro",
    Icon: LayoutPanelLeft,
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
    Icon: ShieldCheck,
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
  const [loading, setLoading]             = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError]                 = useState<string | null>(null);
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
    <div className="max-w-7xl mx-auto space-y-8 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className="font-display font-extrabold text-3xl"
            style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          >
            Your Bots
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Subscribe to individual bots. Bundle 3+ and save 20% automatically.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="text-sm font-mono px-3 py-1.5 rounded-lg"
            style={{
              fontFamily: "var(--font-mono)",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            {activeCount} of 6 active
          </span>
          <button
            onClick={handlePortal}
            disabled={portalLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:-translate-y-px"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
            Manage Billing
          </button>
        </div>
      </div>

      {successBanner && (
        <div
          className="flex items-center gap-3 rounded-xl px-5 py-4"
          style={{
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.25)",
            borderRadius: "12px",
          }}
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: "var(--accent-green)" }} />
          <div>
            <p className="font-semibold" style={{ color: "var(--accent-green)" }}>Payment successful!</p>
            <p className="text-sm opacity-80" style={{ color: "var(--accent-green)" }}>
              Your bot is being activated — refresh if it doesn&apos;t appear immediately.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
            color: "var(--accent-red)",
            borderRadius: "12px",
          }}
        >
          {error}
        </div>
      )}

      {/* Bundle banner */}
      <div
        className="rounded-xl px-5 py-4 flex items-center gap-3"
        style={{
          background: "rgba(245,158,11,0.06)",
          border: "1px solid rgba(245,158,11,0.25)",
          borderRadius: "12px",
        }}
      >
        <Zap className="w-5 h-5 shrink-0" style={{ color: "var(--accent-amber)" }} />
        <div>
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
            🎁 Bundle Discount: Subscribe to 3 or more bots and BUNDLE20 applies automatically. Save 20% every month.
          </p>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            No coupon needed — discount applied at checkout when you reach 3 bots.
          </p>
        </div>
        {activeCount >= 3 && (
          <span
            className="ml-auto text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap shrink-0"
            style={{
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.25)",
              color: "var(--accent-green)",
            }}
          >
            Bundle active ✓
          </span>
        )}
      </div>

      {/* Bot cards grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {BOT_CONFIGS.map((bot) => {
          const { Icon } = bot;
          const sub = getSubForBot(bot.slug);
          const isActive = sub?.status === "active" || sub?.status === "trialing";

          return (
            <div
              key={bot.slug}
              className="rounded-xl p-6 transition-all"
              style={{
                background: isActive ? "rgba(59,130,246,0.04)" : "var(--bg-surface)",
                border: `1px solid ${isActive ? "rgba(59,130,246,0.25)" : "var(--border)"}`,
                borderRadius: "12px",
              }}
            >
              {/* Bot header */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      background: isActive ? "var(--accent-blue-glow)" : "var(--bg-elevated)",
                      border: `1px solid ${isActive ? "rgba(59,130,246,0.25)" : "var(--border)"}`,
                    }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: isActive ? "var(--accent-blue)" : "var(--text-secondary)" }}
                    />
                  </div>
                  <div>
                    <h3
                      className="font-display font-bold text-lg"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {bot.name}
                    </h3>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {bot.description}
                    </p>
                  </div>
                </div>
                {isActive && (
                  <span
                    className="text-xs font-medium px-2.5 py-1 rounded-full border capitalize shrink-0 ml-2"
                    style={{
                      background: "rgba(16,185,129,0.1)",
                      border: "1px solid rgba(16,185,129,0.25)",
                      color: "var(--accent-green)",
                    }}
                  >
                    Active — {sub?.tier}
                  </span>
                )}
              </div>

              {/* Tier cards side by side */}
              <div className="grid grid-cols-2 gap-3">
                {(["starter", "pro"] as const).map((tierKey) => {
                  const tierConfig = bot[tierKey];
                  const isCurrentTier = isActive && sub?.tier === tierKey;
                  const loadingKey = `${bot.slug}-${tierKey}`;
                  const isPro = tierKey === "pro";

                  return (
                    <div
                      key={tierKey}
                      className="rounded-xl p-4 flex flex-col"
                      style={{
                        background: isCurrentTier
                          ? "rgba(16,185,129,0.06)"
                          : isPro
                            ? "rgba(139,92,246,0.04)"
                            : "var(--bg-elevated)",
                        border: `1px solid ${
                          isCurrentTier
                            ? "rgba(16,185,129,0.3)"
                            : isPro
                              ? "rgba(139,92,246,0.2)"
                              : "var(--border)"
                        }`,
                        borderRadius: "12px",
                        position: "relative",
                      }}
                    >
                      {isPro && (
                        <span
                          className="absolute top-2 right-2 text-xs font-bold px-1.5 py-0.5 rounded"
                          style={{
                            background: "rgba(139,92,246,0.15)",
                            color: "var(--accent-purple)",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          PRO
                        </span>
                      )}

                      <div className="flex items-baseline justify-between mb-3">
                        <span
                          className="text-xs font-mono uppercase tracking-wider capitalize"
                          style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}
                        >
                          {tierKey}
                        </span>
                        <span
                          className="font-bold text-xl price-display"
                          style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}
                        >
                          ${tierConfig.price}
                          <span className="text-xs font-normal" style={{ color: "var(--text-secondary)" }}>/mo</span>
                        </span>
                      </div>

                      <ul className="space-y-1.5 mb-4 flex-1">
                        {tierConfig.features.map((f) => (
                          <li key={f} className="flex items-start gap-1.5 text-xs" style={{ color: "var(--text-secondary)" }}>
                            <Check className="w-3 h-3 mt-0.5 shrink-0" style={{ color: "var(--accent-green)" }} />
                            {f}
                          </li>
                        ))}
                      </ul>

                      {isCurrentTier ? (
                        <div
                          className="text-center text-xs font-semibold py-2 rounded-lg"
                          style={{
                            background: "rgba(16,185,129,0.1)",
                            border: "1px solid rgba(16,185,129,0.2)",
                            color: "var(--accent-green)",
                          }}
                        >
                          ✓ Current Plan
                        </div>
                      ) : isActive ? (
                        <button
                          onClick={() => handleSubscribe(tierConfig.priceId, bot.slug, tierKey)}
                          disabled={loading === loadingKey}
                          className="text-xs font-medium py-2 rounded-lg transition-all hover:-translate-y-px disabled:opacity-50 flex items-center justify-center gap-1.5"
                          style={{
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--border)",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {loading === loadingKey && <Loader2 className="w-3 h-3 animate-spin" />}
                          Switch to {tierKey}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSubscribe(tierConfig.priceId, bot.slug, tierKey)}
                          disabled={loading === loadingKey}
                          className={clsx(
                            "text-xs font-medium py-2 rounded-lg transition-all hover:-translate-y-px disabled:opacity-50 flex items-center justify-center gap-1.5"
                          )}
                          style={
                            isPro
                              ? {
                                  background: "var(--accent-blue)",
                                  color: "#0A0F1A",
                                }
                              : {
                                  background: "var(--bg-elevated)",
                                  border: "1px solid var(--border)",
                                  color: "var(--text-secondary)",
                                }
                          }
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
                <p className="mt-3 text-xs flex items-center gap-1.5" style={{ color: "var(--text-tertiary)" }}>
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
