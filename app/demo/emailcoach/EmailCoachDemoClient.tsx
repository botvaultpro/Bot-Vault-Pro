"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, Copy, Check, ArrowRight, Lock, CheckCircle2, Loader2 } from "lucide-react";
import clsx from "clsx";

interface Reply { approach: string; body: string }
interface ReplySet { professional: Reply; direct: Reply; diplomatic: Reply }

const GOALS = [
  "De-escalate a difficult situation",
  "Negotiate better terms",
  "Decline politely",
  "Follow up on overdue payment",
  "Request more information",
  "Accept and confirm",
  "Set a boundary professionally",
  "Other",
];

const DEMO_KEY = "bvp_emailcoach_demo_count";
const DEMO_LIMIT = 3;

function getRemainingDemo(): number {
  if (typeof window === "undefined") return DEMO_LIMIT;
  return DEMO_LIMIT - Number(localStorage.getItem(DEMO_KEY) ?? "0");
}
function markDemoUsed() {
  if (typeof window === "undefined") return;
  const used = Number(localStorage.getItem(DEMO_KEY) ?? "0");
  localStorage.setItem(DEMO_KEY, String(used + 1));
}

export default function EmailCoachDemoClient() {
  const [originalEmail, setOriginalEmail] = useState("");
  const [goal, setGoal] = useState(GOALS[0]);
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [replies, setReplies] = useState<ReplySet | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const remaining = getRemainingDemo();

  async function handleGenerate() {
    if (!originalEmail.trim() || remaining <= 0) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/demo/emailcoach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalEmail, goal, context }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? data.error ?? "Generation failed.");
        return;
      }
      setReplies(data.replies);
      markDemoUsed();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyReply(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  const replyCards: { key: keyof ReplySet; label: string; color: string; border: string; bg: string }[] = [
    { key: "professional", label: "Professional", color: "text-vault-accent", border: "border-vault-accent/30", bg: "bg-vault-accent/5" },
    { key: "direct",       label: "Direct",       color: "text-vault-green",  border: "border-vault-green/30",  bg: "bg-vault-green/5"  },
    { key: "diplomatic",   label: "Diplomatic",   color: "text-purple-400",   border: "border-purple-400/30",   bg: "bg-purple-400/5"   },
  ];

  return (
    <div className="min-h-screen bg-vault-bg">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-vault-border bg-vault-bg/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-xl tracking-tight">
            <span className="text-gradient-cyan">Bot</span>
            <span className="text-vault-text"> Vault Pro</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/demo" className="text-sm text-vault-text-dim hover:text-vault-text transition-colors hidden sm:block">All Demos</Link>
            <Link href="/auth/signup" className="text-sm bg-vault-accent text-vault-bg font-semibold px-4 py-2 rounded-lg">Get Started Free</Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">

          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-vault-accent/10 border border-vault-accent/20 mb-4">
              <Mail className="w-7 h-7 text-vault-accent" />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">Free AI Email Reply Generator</h1>
            <p className="text-vault-text-dim text-lg mb-4">Paste any difficult email. Get 3 ready-to-send replies in seconds.</p>
            <div className="inline-flex items-center gap-2 text-sm text-vault-green border border-vault-green/30 bg-vault-green/5 px-3 py-1.5 rounded-full">
              <CheckCircle2 className="w-4 h-4" />
              {remaining > 0 ? `${remaining} free ${remaining === 1 ? "reply" : "replies"} remaining — no account needed` : "Free demo used"}
            </div>
          </div>

          {!replies ? (
            <div className="card-surface rounded-2xl p-8 space-y-5">
              {remaining <= 0 && (
                <div className="bg-vault-accent/5 border border-vault-accent/30 rounded-xl p-5 text-center">
                  <Lock className="w-8 h-8 text-vault-accent mx-auto mb-3" />
                  <p className="font-semibold text-vault-text mb-1">You&apos;ve used your free demo replies</p>
                  <p className="text-sm text-vault-text-dim mb-4">Create a free account to get 3 more. Subscribe for unlimited.</p>
                  <Link href="/auth/signup" className="inline-flex items-center gap-2 bg-vault-accent text-vault-bg font-bold px-5 py-2.5 rounded-xl text-sm">
                    Get Free Account <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {remaining > 0 && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-vault-text mb-2">Paste the email you received</label>
                    <textarea
                      value={originalEmail}
                      onChange={(e) => setOriginalEmail(e.target.value)}
                      placeholder="Paste the full email here..."
                      rows={6}
                      className="w-full bg-vault-bg border border-vault-border rounded-xl px-4 py-3 text-sm text-vault-text placeholder:text-vault-text-dim resize-none focus:outline-none focus:border-vault-accent transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-vault-text mb-2">Your goal</label>
                    <select
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      className="w-full bg-vault-bg border border-vault-border rounded-xl px-4 py-3 text-sm text-vault-text focus:outline-none focus:border-vault-accent transition-colors"
                    >
                      {GOALS.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-vault-text mb-2">
                      Context <span className="text-vault-text-dim font-normal">(optional)</span>
                    </label>
                    <textarea
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder="e.g. This is a client who's been late on two payments. I want to stay professional but be firm."
                      rows={2}
                      className="w-full bg-vault-bg border border-vault-border rounded-xl px-4 py-3 text-sm text-vault-text placeholder:text-vault-text-dim resize-none focus:outline-none focus:border-vault-accent transition-colors"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>
                  )}

                  <button
                    onClick={handleGenerate}
                    disabled={!originalEmail.trim() || loading}
                    className="w-full bg-vault-accent text-vault-bg font-display font-bold py-4 rounded-xl text-base hover:bg-vault-accent-dim transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating replies...</>
                      : <>Generate 3 Replies Free <ArrowRight className="w-5 h-5" /></>
                    }
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {replyCards.map(({ key, label, color, border, bg }) => {
                const reply = replies[key];
                const isCopied = copied === key;
                return (
                  <div key={key} className={clsx("rounded-2xl border p-6", border, bg)}>
                    <div className="flex items-center justify-between mb-3">
                      <span className={clsx("text-sm font-bold uppercase tracking-wide", color)}>{label}</span>
                      <span className="text-xs text-vault-text-dim">{reply.approach}</span>
                    </div>
                    <pre className="text-sm text-vault-text whitespace-pre-wrap font-sans leading-relaxed mb-4">{reply.body}</pre>
                    <button
                      onClick={() => copyReply(reply.body, key)}
                      className={clsx(
                        "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors",
                        isCopied ? "bg-vault-green/20 text-vault-green" : `border ${border} ${color} hover:opacity-80`
                      )}
                    >
                      {isCopied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy reply</>}
                    </button>
                  </div>
                );
              })}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => { setReplies(null); setOriginalEmail(""); }}
                  className="flex-1 text-sm text-vault-text-dim border border-vault-border rounded-xl py-3 hover:border-vault-accent hover:text-vault-accent transition-colors"
                >
                  Try another email
                </button>
                <Link
                  href="/auth/signup"
                  className="flex-1 flex items-center justify-center gap-2 bg-vault-accent text-vault-bg font-bold rounded-xl py-3 text-sm hover:bg-vault-accent-dim transition-colors"
                >
                  Get unlimited replies free <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="rounded-2xl border border-vault-accent/30 bg-vault-accent/5 p-6 text-center">
                <p className="font-semibold text-vault-text mb-1">EmailCoach gets smarter over time</p>
                <p className="text-sm text-vault-text-dim mb-4">Create an account and it learns your tone. Connect Gmail and it drafts replies directly in your inbox.</p>
                <Link href="/auth/signup" className="inline-flex items-center gap-2 bg-vault-accent text-vault-bg font-bold px-6 py-2.5 rounded-xl text-sm">
                  Start free — $19/mo after trial <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
