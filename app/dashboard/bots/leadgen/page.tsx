"use client";
import { useEffect, useState } from "react";
import { Target } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { type Tier, TIER_LIMITS } from "@/lib/tier-limits";
import BotShell from "@/components/bots/BotShell";
import BotRunner from "@/components/bots/BotRunner";

const fields = [
  { name: "domains", label: "Target Domains", type: "textarea" as const, placeholder: "acme.com\nstartupxyz.com\ntechcorp.io", required: true, rows: 4, },
  { name: "icp", label: "Ideal Customer Profile", type: "textarea" as const, placeholder: "B2B SaaS companies with 10-200 employees, focused on sales automation...", required: true, rows: 3, },
  { name: "tone", label: "Email Tone", type: "select" as const, options: [{ value: "professional", label: "Professional" }, { value: "friendly", label: "Friendly & Casual" }, { value: "direct", label: "Direct & Concise" }], required: true, },
];

export default function LeadGenPage() {
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

  const limits = TIER_LIMITS[tier].leadgen;

  return (
    <BotShell name="LeadGen Pro" description="Find, qualify, and reach out to leads automatically." icon={<Target className="w-5 h-5" />} tier={tier} accentColor="cyan">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card-surface rounded-xl p-4">
          <p className="text-xs text-vault-text-dim font-mono uppercase tracking-widest mb-1">Leads / Run</p>
          <p className="font-display text-2xl font-bold text-vault-accent">{limits.leadsPerRun === 999999 ? "∞" : limits.leadsPerRun}</p>
        </div>
        <div className="card-surface rounded-xl p-4">
          <p className="text-xs text-vault-text-dim font-mono uppercase tracking-widest mb-1">AI Qualification</p>
          <p className="font-display text-2xl font-bold">{limits.aiQualification ? <span className="text-vault-green">On</span> : <span className="text-vault-muted">Off</span>}</p>
        </div>
        <div className="card-surface rounded-xl p-4">
          <p className="text-xs text-vault-text-dim font-mono uppercase tracking-widest mb-1">Email Steps</p>
          <p className="font-display text-2xl font-bold text-vault-accent">{limits.emailSteps}</p>
        </div>
      </div>
      <BotRunner
        botSlug="leadgen"
        fields={fields}
        title="Run Lead Generation"
        description="Enter target domains and your ICP. The bot will find contacts, qualify them, and draft your outreach sequence."
        buttonLabel="Generate Leads"
      />
    </BotShell>
  );
}
