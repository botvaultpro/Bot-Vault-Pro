"use client";
import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { type Tier, TIER_LIMITS } from "@/lib/tier-limits";
import BotShell from "@/components/bots/BotShell";
import BotRunner from "@/components/bots/BotRunner";

const fields = [
  { name: "question", label: "Customer Message", type: "textarea" as const, placeholder: "What is your refund policy? I purchased 3 days ago and it's not working...", required: true, rows: 4 },
  { name: "companyName", label: "Company Name", type: "text" as const, placeholder: "Acme Corp", required: true },
  { name: "knowledgeBase", label: "Knowledge Base (paste key info)", type: "textarea" as const, placeholder: "Refund policy: 30 days, no questions asked. Contact support@acme.com...", required: true, rows: 5 },
  { name: "tone", label: "Reply Tone", type: "select" as const, options: [{ value: "professional", label: "Professional" }, { value: "friendly", label: "Friendly" }, { value: "concise", label: "Brief & Direct" }] },
];

export default function SupportDeskPage() {
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

  const limits = TIER_LIMITS[tier].supportdesk;

  return (
    <BotShell name="SupportDesk" description="AI-powered support replies grounded in your knowledge base." icon={<MessageSquare className="w-5 h-5" />} tier={tier} accentColor="cyan">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card-surface rounded-xl p-4">
          <p className="text-xs text-vault-text-dim font-mono uppercase tracking-widest mb-1">Tickets / Month</p>
          <p className="font-display text-2xl font-bold text-vault-accent">{limits.ticketsPerMonth === 999999 ? "∞" : limits.ticketsPerMonth}</p>
        </div>
        <div className="card-surface rounded-xl p-4">
          <p className="text-xs text-vault-text-dim font-mono uppercase tracking-widest mb-1">IMAP Inbox</p>
          <p className="font-display text-2xl font-bold">{limits.imapPolling ? <span className="text-vault-green">On</span> : <span className="text-vault-muted">Off</span>}</p>
        </div>
        <div className="card-surface rounded-xl p-4">
          <p className="text-xs text-vault-text-dim font-mono uppercase tracking-widest mb-1">KB Files</p>
          <p className="font-display text-2xl font-bold text-vault-accent">{limits.knowledgeBaseFiles === 999999 ? "∞" : limits.knowledgeBaseFiles}</p>
        </div>
      </div>
      <BotRunner
        botSlug="supportdesk"
        fields={fields}
        title="Generate Support Reply"
        description="Paste a customer message and your knowledge base. Get a confident, grounded reply."
        buttonLabel="Generate Reply"
      />
    </BotShell>
  );
}
