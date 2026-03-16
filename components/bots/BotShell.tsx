"use client";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { type Tier } from "@/lib/tier-limits";
import { type ReactNode } from "react";

interface BotShellProps {
  name: string;
  description: string;
  icon: ReactNode;
  tier: Tier;
  requiredTier?: Tier;
  children: ReactNode;
  accentColor?: "cyan" | "green";
}

const tierOrder: Tier[] = ["free", "starter", "growth", "enterprise"];

export default function BotShell({ name, description, icon, tier, requiredTier = "starter", children, accentColor = "cyan" }: BotShellProps) {
  const userTierIndex = tierOrder.indexOf(tier);
  const requiredTierIndex = tierOrder.indexOf(requiredTier);
  const hasAccess = userTierIndex >= requiredTierIndex;
  const accent = accentColor === "cyan" ? "text-vault-accent" : "text-vault-green";
  const border = accentColor === "cyan" ? "border-vault-accent/20 bg-vault-accent/5" : "border-vault-green/20 bg-vault-green/5";

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/dashboard" className="text-vault-text-dim hover:text-vault-text transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className={`flex items-center justify-center w-10 h-10 rounded-xl border ${border}`}>
          <span className={accent}>{icon}</span>
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">{name}</h1>
          <p className="text-vault-text-dim text-sm">{description}</p>
        </div>
      </div>

      {tier === "free" && (
        <div className="bg-vault-accent/5 border border-vault-accent/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 text-vault-accent">
            <Lock className="w-4 h-4 shrink-0" />
            <span className="text-sm font-semibold">Free tier — 1 run only.</span>
          </div>
          <p className="text-sm text-vault-text-dim">Upgrade to Starter ($49/mo) to unlock full usage.</p>
          <Link href="/dashboard/billing" className="sm:ml-auto text-sm bg-vault-accent text-vault-bg font-bold px-4 py-2 rounded-lg hover:bg-vault-accent-dim transition-colors whitespace-nowrap">
            Upgrade Now
          </Link>
        </div>
      )}

      {!hasAccess ? (
        <div className="card-surface rounded-2xl p-12 text-center">
          <Lock className="w-12 h-12 text-vault-muted mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold mb-2">Upgrade Required</h2>
          <p className="text-vault-text-dim mb-6">This feature requires the <span className="text-vault-text capitalize">{requiredTier}</span> plan or higher.</p>
          <Link href="/dashboard/billing" className="inline-flex items-center gap-2 bg-vault-accent text-vault-bg font-bold px-6 py-3 rounded-xl hover:bg-vault-accent-dim transition-colors">
            View Plans
          </Link>
        </div>
      ) : (
        <div>{children}</div>
      )}
    </div>
  );
}
