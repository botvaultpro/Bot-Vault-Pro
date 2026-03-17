"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Mail, Copy, Check, Loader2, ChevronDown, ChevronUp, Lock } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

const GOALS = [
  "De-escalate",
  "Negotiate",
  "Decline Politely",
  "Accept and Confirm",
  "Request More Info",
  "Other",
];

type Reply = { approach: string; body: string };
type ReplySet = { professional: Reply; direct: Reply; diplomatic: Reply };

type HistoryItem = {
  id: string;
  original_email: string;
  goal: string;
  reply_professional: string;
  reply_direct: string;
  reply_diplomatic: string;
  created_at: string;
};

export default function EmailCoachPage() {
  const [originalEmail, setOriginalEmail] = useState("");
  const [goal, setGoal] = useState(GOALS[0]);
  const [context, setContext] = useState("");
  const [generating, setGenerating] = useState(false);
  const [replies, setReplies] = useState<ReplySet | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("email_replies")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    setHistory(data ?? []);
  }

  async function handleGenerate() {
    if (!originalEmail.trim()) return;
    setGenerating(true);
    setError(null);
    setBlocked(false);
    try {
      const res = await fetch("/api/bots/emailcoach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalEmail, goal, context }),
      });
      const data = await res.json();
      if (res.status === 403) {
        setBlocked(true);
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setReplies(data.replies);
      loadHistory();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function copyText(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  const replyCards = replies ? [
    { key: "professional", label: "Professional", color: "border-vault-accent/30 bg-vault-accent/5", textColor: "text-vault-accent", ...replies.professional },
    { key: "direct", label: "Direct", color: "border-vault-green/30 bg-vault-green/5", textColor: "text-vault-green", ...replies.direct },
    { key: "diplomatic", label: "Diplomatic", color: "border-purple-400/30 bg-purple-400/5", textColor: "text-purple-400", ...replies.diplomatic },
  ] : [];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold flex items-center gap-3">
          <Mail className="w-7 h-7 text-vault-accent" />
          EmailCoach
        </h1>
        <p className="text-vault-text-dim mt-1">Paste any email and get 3 AI-crafted reply options instantly.</p>
      </div>

      {blocked && (
        <div className="rounded-xl border border-vault-accent/30 bg-vault-accent/5 px-5 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Lock className="w-6 h-6 text-vault-accent shrink-0" />
          <div>
            <p className="font-semibold text-vault-text">You&apos;ve used your 3 free EmailCoach trials.</p>
            <p className="text-sm text-vault-text-dim">Subscribe to keep generating unlimited replies.</p>
          </div>
          <Link
            href="/dashboard/billing"
            className="sm:ml-auto bg-vault-accent text-vault-bg px-4 py-2 rounded-lg text-sm font-bold hover:bg-vault-accent/90 transition-colors whitespace-nowrap"
          >
            Subscribe Now
          </Link>
        </div>
      )}

      <div className="card-surface rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-vault-text mb-2">
            The Email You Need To Reply To
          </label>
          <textarea
            value={originalEmail}
            onChange={(e) => setOriginalEmail(e.target.value)}
            placeholder="Paste the email you received here..."
            rows={8}
            className="w-full bg-vault-bg border border-vault-border rounded-xl px-4 py-3 text-sm text-vault-text placeholder:text-vault-text-dim focus:outline-none focus:border-vault-accent resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-vault-text mb-2">Your Goal</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-vault-bg border border-vault-border rounded-xl px-4 py-3 text-sm text-vault-text focus:outline-none focus:border-vault-accent"
            >
              {GOALS.map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-vault-text mb-2">
              Background Context <span className="text-vault-text-dim">(optional)</span>
            </label>
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g. long-term client, first-time contact, urgent..."
              className="w-full bg-vault-bg border border-vault-border rounded-xl px-4 py-3 text-sm text-vault-text placeholder:text-vault-text-dim focus:outline-none focus:border-vault-accent"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">{error}</p>
        )}

        <button
          onClick={handleGenerate}
          disabled={generating || !originalEmail.trim()}
          className="flex items-center gap-2 bg-vault-accent text-vault-bg px-6 py-3 rounded-xl font-display font-bold text-sm hover:bg-vault-accent/90 transition-colors disabled:opacity-50"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
          {generating ? "Generating Replies..." : "Generate Replies"}
        </button>
      </div>

      {replies && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {replyCards.map((card) => (
            <div key={card.key} className={clsx("rounded-2xl border p-5 flex flex-col gap-3", card.color)}>
              <div className="flex items-center justify-between">
                <span className={clsx("text-xs font-mono font-bold uppercase tracking-wider", card.textColor)}>
                  {card.label}
                </span>
                <button
                  onClick={() => copyText(card.body, card.key)}
                  className="flex items-center gap-1.5 text-xs text-vault-text-dim hover:text-vault-text transition-colors"
                >
                  {copied === card.key ? <Check className="w-3.5 h-3.5 text-vault-green" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied === card.key ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="text-xs text-vault-text-dim italic">{card.approach}</p>
              <div className="text-sm text-vault-text whitespace-pre-wrap flex-1 bg-vault-bg/50 rounded-xl p-3 text-xs leading-relaxed">
                {card.body}
              </div>
            </div>
          ))}
        </div>
      )}

      {history.length > 0 && (
        <div className="card-surface rounded-2xl p-6">
          <h2 className="font-display text-lg font-bold mb-4">Recent History</h2>
          <div className="space-y-2">
            {history.map((item) => (
              <div key={item.id} className="border border-vault-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedHistory(expandedHistory === item.id ? null : item.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-vault-border/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono bg-vault-accent/10 text-vault-accent px-2 py-0.5 rounded-full shrink-0">
                      {item.goal}
                    </span>
                    <span className="text-sm text-vault-text truncate">
                      {item.original_email.substring(0, 80)}...
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-xs text-vault-text-dim">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                    {expandedHistory === item.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>
                {expandedHistory === item.id && (
                  <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-vault-border pt-3">
                    {[
                      { label: "Professional", text: item.reply_professional, color: "text-vault-accent" },
                      { label: "Direct", text: item.reply_direct, color: "text-vault-green" },
                      { label: "Diplomatic", text: item.reply_diplomatic, color: "text-purple-400" },
                    ].map(({ label, text, color }) => (
                      <div key={label}>
                        <p className={clsx("text-xs font-bold mb-1", color)}>{label}</p>
                        <p className="text-xs text-vault-text-dim whitespace-pre-wrap bg-vault-bg/50 rounded-lg p-2 leading-relaxed">
                          {text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
