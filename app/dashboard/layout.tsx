"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { Menu } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";

interface BotSub {
  bot_slug: string;
  status: string;
}

// Must match FREE_TRIAL_LIMITS in lib/entitlements.ts
const TRIAL_ELIGIBLE: Record<string, number> = {
  emailcoach: 3,
  weeklypulse: 2,
  clausecheck: 2,
  invoiceforge: 3,
  reviewbot: 3,
  sitebuilder: 2,
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subscriptions, setSubscriptions] = useState<BotSub[]>([]);
  const [trialBots, setTrialBots] = useState<string[]>([]);
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? "");

      const [{ data: subs }, { data: trials }] = await Promise.all([
        supabase.from("bot_subscriptions").select("bot_slug, status").eq("user_id", user.id),
        supabase.from("free_trials").select("bot_slug, uses_remaining").eq("user_id", user.id),
      ]);

      setSubscriptions(subs ?? []);

      // Bots accessible via trial: trial-eligible, not subscribed, and uses_remaining > 0 (or no row yet)
      const activeSlugs = new Set(
        (subs ?? []).filter(s => s.status === "active" || s.status === "trialing").map(s => s.bot_slug)
      );
      const trialMap = new Map((trials ?? []).map(t => [t.bot_slug, t.uses_remaining]));

      const unlocked = Object.entries(TRIAL_ELIGIBLE)
        .filter(([slug, limit]) => {
          if (activeSlugs.has(slug)) return false;
          const remaining = trialMap.has(slug) ? (trialMap.get(slug) ?? 0) : limit;
          return remaining > 0;
        })
        .map(([slug]) => slug);

      setTrialBots(unlocked);
    }
    loadUser();
  }, []);

  return (
    <div className="flex h-screen bg-vault-bg overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar - desktop */}
      <div className="hidden md:flex shrink-0">
        <Sidebar subscriptions={subscriptions} trialBots={trialBots} email={email} />
      </div>

      {/* Sidebar - mobile */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Sidebar subscriptions={subscriptions} trialBots={trialBots} email={email} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center gap-4 px-4 py-3 border-b border-vault-border bg-vault-surface">
          <button onClick={() => setSidebarOpen(true)} className="text-vault-text-dim hover:text-vault-text">
            <Menu className="w-6 h-6" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2 font-display font-bold">
            <Image src="/BVP_Bot_Tranparent.png" alt="Bot Vault Pro mascot" width={50} height={50} className="h-12 w-auto object-contain" />
            <span className="text-gradient-cyan">Bot</span><span className="text-vault-text"> Vault Pro</span>
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
