"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Mail, Copy, Check, Loader2, ChevronDown, ChevronUp, Lock } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

const GOALS = [
  { label: "Reply Professionally", value: "Reply Professionally" },
  { label: "Decline Politely",     value: "Decline Politely" },
  { label: "Follow Up Firmly",     value: "Follow Up Firmly" },
  { label: "Request Clarification",value: "Request Clarification" },
  { label: "Express Gratitude",    value: "Express Gratitude" },
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
  const [goal, setGoal]                   = useState(GOALS[0].value);
  const [context, setContext]             = useState("");
  const [generating, setGenerating]       = useState(false);
  const [replies, setReplies]             = useState<ReplySet | null>(null);
  const [copied, setCopied]               = useState<string | null>(null);
  const [error, setError]                 = useState<string | null>(null);
  const [blocked, setBlocked]             = useState(false);
  const [history, setHistory]             = useState<HistoryItem[]>([]);
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);

  useEffect(() => { loadHistory(); }, []);

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
      if (res.status === 403) { setBlocked(true); return; }
      if (!res.ok) { setError(data.error ?? "Something went wrong."); return; }
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
    {
      key: "professional",
      label: "Professional",
      borderColor: "rgba(59,130,246,0.3)",
      bg: "rgba(59,130,246,0.05)",
      labelColor: "var(--accent-blue)",
      ...replies.professional,
    },
    {
      key: "direct",
      label: "Direct",
      borderColor: "rgba(16,185,129,0.3)",
      bg: "rgba(16,185,129,0.05)",
      labelColor: "var(--accent-green)",
      ...replies.direct,
    },
    {
      key: "diplomatic",
      label: "Diplomatic",
      borderColor: "rgba(139,92,246,0.3)",
      bg: "rgba(139,92,246,0.05)",
      labelColor: "var(--accent-purple)",
      ...replies.diplomatic,
    },
  ] : [];

  return (
    <div className="max-w-5xl mx-auto space-y-8 page-enter">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}
          >
            <Mail className="w-5 h-5" style={{ color: "var(--accent-blue)" }} />
          </div>
          <div>
            <h1
              className="font-display font-extrabold text-3xl"
              style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
            >
              EmailCoach
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Paste any email and get 3 AI-crafted reply options instantly.
            </p>
          </div>
        </div>
      </div>

      {/* Upgrade banner */}
      {blocked && (
        <div
          className="rounded-xl px-5 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          style={{
            background: "rgba(59,130,246,0.06)",
            border: "1px solid rgba(59,130,246,0.25)",
            borderRadius: "12px",
          }}
        >
          <Lock className="w-5 h-5 shrink-0" style={{ color: "var(--accent-blue)" }} />
          <div>
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
              You&apos;ve used your free EmailCoach trials.
            </p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Subscribe to keep generating unlimited replies.
            </p>
          </div>
          <Link
            href="/dashboard/billing"
            className="sm:ml-auto px-4 py-2 rounded-lg text-sm font-medium transition-all hover:-translate-y-px whitespace-nowrap"
            style={{ background: "var(--accent-blue)", color: "#0A0F1A" }}
          >
            Subscribe Now
          </Link>
        </div>
      )}

      {/* Input panel */}
      <div
        className="rounded-xl p-6 space-y-5"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px" }}
      >
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
            The Email You Need To Reply To
          </label>
          <textarea
            value={originalEmail}
            onChange={(e) => setOriginalEmail(e.target.value)}
            placeholder="Paste the email you received here..."
            rows={8}
            className="w-full text-sm resize-none"
            style={{
              background: "var(--bg-input)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "12px 16px",
              color: "var(--text-primary)",
              outline: "none",
              fontFamily: "var(--font-body)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--border-active)";
              e.target.style.boxShadow = "0 0 0 3px var(--accent-blue-glow)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--border)";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Goal pills */}
        <div>
          <label className="block text-sm font-medium mb-3" style={{ color: "var(--text-primary)" }}>
            Your Goal
          </label>
          <div className="flex flex-wrap gap-2">
            {GOALS.map((g) => (
              <button
                key={g.value}
                onClick={() => setGoal(g.value)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={
                  goal === g.value
                    ? {
                        background: "var(--accent-blue)",
                        color: "#0A0F1A",
                        border: "1px solid var(--accent-blue)",
                      }
                    : {
                        background: "var(--bg-elevated)",
                        color: "var(--text-secondary)",
                        border: "1px solid var(--border)",
                      }
                }
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-primary)" }}>
            Background Context{" "}
            <span style={{ color: "var(--text-tertiary)" }}>(optional)</span>
          </label>
          <input
            type="text"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g. long-term client, first-time contact, urgent..."
            style={{
              width: "100%",
              background: "var(--bg-input)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "12px 16px",
              color: "var(--text-primary)",
              fontSize: "14px",
              outline: "none",
              fontFamily: "var(--font-body)",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--border-active)";
              e.target.style.boxShadow = "0 0 0 3px var(--accent-blue-glow)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--border)";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {error && (
          <p
            className="text-sm px-4 py-3 rounded-lg"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.25)",
              color: "var(--accent-red)",
            }}
          >
            {error}
          </p>
        )}

        <button
          onClick={handleGenerate}
          disabled={generating || !originalEmail.trim()}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all hover:-translate-y-px disabled:opacity-50"
          style={{
            background: "var(--accent-blue)",
            color: "#0A0F1A",
            borderRadius: "8px",
          }}
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
          {generating ? "Generating Replies..." : "Generate Replies"}
        </button>
      </div>

      {/* Reply cards */}
      {replies && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {replyCards.map((card) => (
            <div
              key={card.key}
              className="rounded-xl p-5 flex flex-col gap-3"
              style={{
                background: card.bg,
                border: `1px solid ${card.borderColor}`,
                borderRadius: "12px",
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-mono font-bold uppercase tracking-wider"
                  style={{ color: card.labelColor, fontFamily: "var(--font-mono)" }}
                >
                  {card.label}
                </span>
                <button
                  onClick={() => copyText(card.body, card.key)}
                  className="flex items-center gap-1.5 text-xs transition-colors"
                  style={{ color: copied === card.key ? "var(--accent-green)" : "var(--text-secondary)" }}
                >
                  {copied === card.key ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copied === card.key ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="text-xs italic" style={{ color: "var(--text-tertiary)" }}>
                {card.approach}
              </p>
              <div
                className="text-xs leading-relaxed flex-1 rounded-lg p-3 whitespace-pre-wrap"
                style={{
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                {card.body}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Session history */}
      {history.length > 0 && (
        <div
          className="rounded-xl p-6"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px" }}
        >
          <h2
            className="font-display font-bold text-lg mb-4"
            style={{ color: "var(--text-primary)" }}
          >
            Session History
          </h2>
          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="rounded-xl overflow-hidden"
                style={{ border: "1px solid var(--border)" }}
              >
                <button
                  onClick={() => setExpandedHistory(expandedHistory === item.id ? null : item.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors"
                  style={{ color: "var(--text-primary)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-elevated)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="text-xs font-mono px-2 py-0.5 rounded-full shrink-0"
                      style={{
                        background: "var(--accent-blue-glow)",
                        color: "var(--accent-blue)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {item.goal}
                    </span>
                    <span className="text-sm truncate" style={{ color: "var(--text-secondary)" }}>
                      {item.original_email.substring(0, 80)}...
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                    {expandedHistory === item.id ? (
                      <ChevronUp className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
                    ) : (
                      <ChevronDown className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
                    )}
                  </div>
                </button>

                {expandedHistory === item.id && (
                  <div
                    className="px-4 pb-4 grid grid-cols-1 md:grid-cols-3 gap-3 border-t pt-3"
                    style={{ borderColor: "var(--border)" }}
                  >
                    {[
                      { label: "Professional", text: item.reply_professional, color: "var(--accent-blue)" },
                      { label: "Direct",       text: item.reply_direct,       color: "var(--accent-green)" },
                      { label: "Diplomatic",   text: item.reply_diplomatic,   color: "var(--accent-purple)" },
                    ].map(({ label, text, color }) => (
                      <div key={label}>
                        <p className="text-xs font-bold mb-1" style={{ color }}>{label}</p>
                        <p
                          className="text-xs whitespace-pre-wrap rounded-lg p-2 leading-relaxed"
                          style={{
                            background: "var(--bg-input)",
                            color: "var(--text-secondary)",
                          }}
                        >
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
