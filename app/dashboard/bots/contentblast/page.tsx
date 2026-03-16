"use client";
import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { type Tier, TIER_LIMITS } from "@/lib/tier-limits";
import BotShell from "@/components/bots/BotShell";
import BotRunner from "@/components/bots/BotRunner";

const fields = [
  { name: "topic", label: "Content Topic", type: "text" as const, placeholder: "5 ways AI is transforming customer support in 2025", required: true },
  { name: "brandVoice", label: "Brand Voice", type: "textarea" as const, placeholder: "Professional but approachable. Use short sentences. No jargon.", required: true, rows: 2 },
  { name: "platforms", label: "Platforms", type: "select" as const, options: [{ value: "blog", label: "Blog Post Only" }, { value: "twitter", label: "Twitter/X Thread" }, { value: "linkedin", label: "LinkedIn Post" }, { value: "all", label: "All Platforms" }], required: true },
];

export default function ContentBlastPage() {
  const [tier, setTier] = useState<Tier>("free");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("subscriptions").select("tier").eq("user_id", user.id).eq("status", "active").single();
      if (data?.tier) setTier(data.tier as Tier);
    }
    load();
  }, []);

  const limits = TIER_LIMITS[tier].contentblast;

  return (
    <BotShell name="ContentBlast" description="Generate and publish AI content across all platforms." icon={<Zap className="w-5 h-5" />} tier={tier} accentColor="green">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card-surface rounded-xl p-4">
          <p className="text-xs text-vault-text-dim font-mono uppercase tracking-widest mb-1">Blasts / Month</p>
          <p className="font-display text-2xl font-bold text-vault-green">{limits.blastsPerMonth === 999999 ? "∞" : limits.blastsPerMonth}</p>
        </div>
        <div className="card-surface rounded-xl p-4">
          <p className="text-xs text-vault-text-dim font-mono uppercase tracking-widest mb-1">Platforms</p>
          <p className="font-display text-lg font-bold text-vault-green">{limits.platforms.join(", ")}</p>
        </div>
        <div className="card-surface rounded-xl p-4">
          <p className="text-xs text-vault-text-dim font-mono uppercase tracking-widest mb-1">Scheduling</p>
          <p className="font-display text-2xl font-bold">{limits.cronScheduling ? <span className="text-vault-green">On</span> : <span className="text-vault-muted">Off</span>}</p>
        </div>
      </div>
      <BotRunner
        botSlug="contentblast"
        fields={fields}
        title="Generate Content"
        description="Enter your topic and brand voice. Get a complete content package ready to publish."
        buttonLabel="Generate Content"
      />
    </BotShell>
  );
}
