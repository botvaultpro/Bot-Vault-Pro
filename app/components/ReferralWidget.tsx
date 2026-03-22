"use client";
import { useEffect, useState } from "react";
import { Copy, Check, Gift, Users } from "lucide-react";

interface ReferralData {
  code: string;
  referralLink: string;
  stats: { total: number; rewarded: number; pending: number };
}

export default function ReferralWidget() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/referral")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function copyLink() {
    if (!data) return;
    await navigator.clipboard.writeText(data.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="card-surface rounded-2xl p-6 animate-pulse">
        <div className="h-4 w-32 bg-vault-border rounded mb-2" />
        <div className="h-8 w-48 bg-vault-border rounded" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="card-surface rounded-2xl p-6 border border-vault-border">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-vault-accent/10 flex items-center justify-center shrink-0">
          <Gift className="w-5 h-5 text-vault-accent" />
        </div>
        <div>
          <h3 className="font-display font-bold text-vault-text">Refer a Friend, Get a Month Free</h3>
          <p className="text-sm text-vault-text-dim mt-0.5">
            Share your link. When they subscribe to any bot, you both get 1 month free.
          </p>
        </div>
      </div>

      {/* Referral link */}
      <div className="flex items-center gap-2 bg-vault-bg rounded-xl border border-vault-border p-3 mb-4">
        <span className="flex-1 text-sm text-vault-text-dim font-mono truncate">
          {data.referralLink}
        </span>
        <button
          onClick={copyLink}
          className="shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-vault-accent/10 text-vault-accent hover:bg-vault-accent/20 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-vault-text-dim" />
          <span className="text-sm text-vault-text-dim">
            <span className="font-bold text-vault-text">{data.stats.total}</span> referred
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Gift className="w-4 h-4 text-vault-green" />
          <span className="text-sm text-vault-text-dim">
            <span className="font-bold text-vault-green">{data.stats.rewarded}</span> free months earned
          </span>
        </div>
        {data.stats.pending > 0 && (
          <div className="text-sm text-vault-text-dim">
            <span className="font-bold text-yellow-400">{data.stats.pending}</span> pending
          </div>
        )}
      </div>
    </div>
  );
}
