"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { type Tier } from "@/lib/tier-limits";
import { PLANS } from "@/lib/stripe";
import { Check, Loader2, CreditCard, Zap } from "lucide-react";

export default function BillingPage() {
  const [tier, setTier] = useState<Tier>("free");
  const [loading, setLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("subscriptions").select("tier, stripe_subscription_id").eq("user_id", user.id).eq("status", "active").single();
      if (data?.tier) setTier(data.tier as Tier);
      if (data?.stripe_subscription_id) setSubscriptionId(data.stripe_subscription_id);
    }
    load();
  }, []);

  async function handleSubscribe(priceId: string, planId: string) {
    setLoading(planId);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setCheckoutError(data.error ?? "Something went wrong. Please try again.");
        setLoading(null);
      }
    } catch {
      setCheckoutError("Network error. Please try again.");
      setLoading(null);
    }
  }

  async function handlePortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      setPortalLoading(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold">Billing</h1>
        <p className="text-vault-text-dim mt-1">Manage your subscription and usage limits.</p>
      </div>

      {subscriptionId && (
        <div className="card-surface rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-vault-accent" />
            <div>
              <p className="font-semibold text-vault-text">Active subscription</p>
              <p className="text-sm text-vault-text-dim capitalize">Plan: <span className="text-vault-text">{tier}</span></p>
            </div>
          </div>
          <button
            onClick={handlePortal}
            disabled={portalLoading}
            className="sm:ml-auto flex items-center gap-2 border border-vault-border text-vault-text-dim px-4 py-2.5 rounded-lg text-sm hover:border-vault-accent hover:text-vault-accent transition-colors"
          >
            {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
            Manage Billing
          </button>
        </div>
      )}

      {checkoutError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {checkoutError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = plan.id === tier;
          const isHigher = ["starter", "growth", "enterprise"].indexOf(plan.id) > ["free", "starter", "growth", "enterprise"].indexOf(tier);

          return (
            <div key={plan.id} className={`relative rounded-2xl p-6 flex flex-col transition-all ${plan.popular ? "bg-vault-accent/5 border-2 border-vault-accent/50" : "card-surface hover:border-vault-accent/20"}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-vault-accent text-vault-bg text-xs font-display font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Most Popular
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 right-4 bg-vault-green text-vault-bg text-xs font-bold px-3 py-1 rounded-full">
                  Current Plan
                </div>
              )}
              <div className="mb-6">
                <h3 className="font-display text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-vault-text-dim text-sm mb-4">{plan.description}</p>
                <div className="flex items-end gap-1">
                  {plan.price !== null && <span className="text-vault-text-dim">$</span>}
                  <span className="font-display text-4xl font-extrabold">{plan.price ?? "Custom"}</span>
                  {plan.price !== null && <span className="text-vault-text-dim text-sm mb-1">/mo</span>}
                </div>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-vault-text-dim">
                    <Check className="w-4 h-4 text-vault-green mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <div className="w-full text-center py-3 rounded-xl text-sm font-semibold bg-vault-green/10 text-vault-green border border-vault-green/20">
                  ✓ Your Current Plan
                </div>
              ) : plan.id === "enterprise" ? (
                <a href="mailto:hello@botvaultpro.com" className="w-full text-center py-3 rounded-xl text-sm font-semibold border border-vault-border text-vault-text hover:border-vault-accent hover:text-vault-accent transition-colors">
                  Contact Us
                </a>
              ) : (
                <button
                  onClick={() => handleSubscribe(plan.priceId, plan.id)}
                  disabled={loading === plan.id}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-display font-bold transition-all disabled:opacity-50 ${isHigher ? "bg-vault-accent text-vault-bg hover:bg-vault-accent-dim" : "border border-vault-border text-vault-text hover:border-vault-accent hover:text-vault-accent"}`}
                >
                  {loading === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : isHigher ? "Upgrade" : "Switch Plan"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
