"use client";
import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { type Tier, TIER_LIMITS } from "@/lib/tier-limits";
import BotShell from "@/components/bots/BotShell";
import BotRunner from "@/components/bots/BotRunner";

const fields = [
  { name: "businessName", label: "Business Name", type: "text" as const, placeholder: "Joe's Plumbing", required: true },
  { name: "location", label: "Location", type: "text" as const, placeholder: "Austin, TX", required: true },
  { name: "businessType", label: "Business Type", type: "select" as const, required: true, options: [
    { value: "plumbing", label: "Plumbing" }, { value: "restaurant", label: "Restaurant" },
    { value: "salon", label: "Hair Salon" }, { value: "dental", label: "Dental / Medical" },
    { value: "realEstate", label: "Real Estate" }, { value: "retail", label: "Retail Store" },
    { value: "contractor", label: "General Contractor" }, { value: "gym", label: "Gym / Fitness" },
    { value: "other", label: "Other" },
  ]},
  { name: "currentSite", label: "Current Website (optional)", type: "text" as const, placeholder: "http://joesplumbing.com (leave blank if none)" },
  { name: "freelancerName", label: "Your Name / Agency", type: "text" as const, placeholder: "Jane Smith Web Design", required: true },
];

export default function SiteBuilderPage() {
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

  const limits = TIER_LIMITS[tier].sitebuilder;

  return (
    <BotShell name="SiteBuilder Pro" description="Find weak sites, build demos, close web design clients." icon={<Globe className="w-5 h-5" />} tier={tier} accentColor="green">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="card-surface rounded-xl p-4">
          <p className="text-xs text-vault-text-dim font-mono uppercase tracking-widest mb-1">Prospects / Mo</p>
          <p className="font-display text-2xl font-bold text-vault-green">{limits.prospectsPerMonth === 999999 ? "∞" : limits.prospectsPerMonth}</p>
        </div>
        <div className="card-surface rounded-xl p-4">
          <p className="text-xs text-vault-text-dim font-mono uppercase tracking-widest mb-1">AI Scoring</p>
          <p className="font-display text-2xl font-bold">{limits.aiScoring ? <span className="text-vault-green">On</span> : <span className="text-vault-muted">Off</span>}</p>
        </div>
        <div className="card-surface rounded-xl p-4">
          <p className="text-xs text-vault-text-dim font-mono uppercase tracking-widest mb-1">Demo Gen</p>
          <p className="font-display text-2xl font-bold">{limits.demoGeneration ? <span className="text-vault-green">On</span> : <span className="text-vault-muted">Off</span>}</p>
        </div>
        <div className="card-surface rounded-xl p-4">
          <p className="text-xs text-vault-text-dim font-mono uppercase tracking-widest mb-1">CRM Pipeline</p>
          <p className="font-display text-2xl font-bold">{limits.pipelineCRM ? <span className="text-vault-green">On</span> : <span className="text-vault-muted">Off</span>}</p>
        </div>
      </div>
      <BotRunner
        botSlug="sitebuilder"
        fields={fields}
        title="Analyze & Generate Demo Site"
        description="Enter a local business. Get a site quality analysis, custom HTML demo, and a ready-to-send proposal email."
        buttonLabel="Analyze & Build Demo"
      />
    </BotShell>
  );
}
