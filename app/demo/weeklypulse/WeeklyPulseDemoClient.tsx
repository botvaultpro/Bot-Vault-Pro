"use client";
import { useState } from "react";
import Link from "next/link";
import { BarChart2, ArrowRight, RefreshCw, AlertCircle } from "lucide-react";
import DemoEmailCapture from "@/app/components/DemoEmailCapture";

const MAX_FREE = 3;
const LS_KEY = "weeklypulse_demo_count";

function getUsageCount(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(LS_KEY) ?? "0", 10);
}

function incrementUsage() {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, String(getUsageCount() + 1));
}

export default function WeeklyPulseDemoClient() {
  const [form, setForm] = useState({
    revenue: "",
    expenses: "",
    newCustomers: "",
    churnedCustomers: "",
    leads: "",
    hoursWorked: "",
    biggestWin: "",
    biggestChallenge: "",
  });
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usageCount, setUsageCount] = useState(getUsageCount);

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (usageCount >= MAX_FREE) return;

    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const res = await fetch("/api/demo/weeklypulse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
      } else {
        setReport(data.report);
        incrementUsage();
        setUsageCount(getUsageCount());
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const remaining = MAX_FREE - usageCount;
  const isBlocked = usageCount >= MAX_FREE;

  return (
    <div className="min-h-screen bg-vault-bg">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-vault-border bg-vault-bg/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-xl tracking-tight">
            <span className="text-gradient-cyan">Bot</span>
            <span className="text-vault-text"> Vault Pro</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/demo" className="text-sm text-vault-text-dim hover:text-vault-accent transition-colors hidden sm:block">
              ← All Demos
            </Link>
            <Link href="/auth/signup" className="text-sm bg-vault-accent text-vault-bg font-semibold px-4 py-2 rounded-lg hover:bg-vault-accent-dim transition-colors">
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-24 px-4 sm:px-6 max-w-3xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10 pt-8">
          <div className="inline-flex items-center gap-2 bg-purple-400/10 border border-purple-400/20 rounded-full px-4 py-1.5 text-sm text-purple-400 mb-4">
            <BarChart2 className="w-4 h-4" /> WeeklyPulse Demo — Free
          </div>
          <h1 className="font-display text-4xl font-bold mb-3">Your Weekly Business Health Report</h1>
          <p className="text-vault-text-dim text-lg max-w-xl mx-auto">
            Enter this week&apos;s numbers. Get a plain-English health score, key insights, and your #1 priority for next week.
          </p>
          {!isBlocked && (
            <p className="text-vault-text-dim text-sm mt-2">
              {remaining} free {remaining === 1 ? "report" : "reports"} remaining today
            </p>
          )}
        </div>

        {isBlocked ? (
          <div className="card-surface rounded-2xl p-8 text-center space-y-4 mb-8">
            <AlertCircle className="w-10 h-10 text-yellow-400 mx-auto" />
            <h2 className="font-display text-xl font-bold">You&apos;ve used your 3 free reports</h2>
            <p className="text-vault-text-dim">Sign up free to get unlimited reports — plus automatic weekly delivery every Monday.</p>
            <Link href="/auth/signup" className="inline-flex items-center gap-2 bg-vault-accent text-vault-bg font-bold px-6 py-3 rounded-xl hover:bg-vault-accent-dim transition-all">
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card-surface rounded-2xl p-6 mb-6 space-y-6">
            {/* Core financials */}
            <div>
              <h2 className="font-display font-bold text-sm uppercase tracking-wider text-vault-text-dim mb-4">This Week&apos;s Numbers</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { field: "revenue", label: "Revenue ($)", placeholder: "e.g. 4800" },
                  { field: "expenses", label: "Expenses ($)", placeholder: "e.g. 1200" },
                  { field: "newCustomers", label: "New Customers", placeholder: "e.g. 3" },
                  { field: "churnedCustomers", label: "Churned Customers", placeholder: "e.g. 1" },
                  { field: "leads", label: "New Leads", placeholder: "e.g. 12" },
                  { field: "hoursWorked", label: "Hours Worked", placeholder: "e.g. 45" },
                ].map(({ field, label, placeholder }) => (
                  <div key={field}>
                    <label className="block text-xs text-vault-text-dim mb-1">{label}</label>
                    <input
                      type="number"
                      min="0"
                      placeholder={placeholder}
                      value={form[field as keyof typeof form]}
                      onChange={set(field)}
                      className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm text-vault-text placeholder:text-vault-text-dim focus:outline-none focus:border-vault-accent"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Qualitative */}
            <div>
              <h2 className="font-display font-bold text-sm uppercase tracking-wider text-vault-text-dim mb-4">Context (Optional)</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-vault-text-dim mb-1">Biggest win this week</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Closed our biggest client ever"
                    value={form.biggestWin}
                    onChange={set("biggestWin")}
                    className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm text-vault-text placeholder:text-vault-text-dim focus:outline-none focus:border-vault-accent resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-vault-text-dim mb-1">Biggest challenge this week</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Shipping delays affecting customer satisfaction"
                    value={form.biggestChallenge}
                    onChange={set("biggestChallenge")}
                    className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm text-vault-text placeholder:text-vault-text-dim focus:outline-none focus:border-vault-accent resize-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-purple-500 text-white font-display font-bold py-4 rounded-xl text-lg hover:bg-purple-600 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <><RefreshCw className="w-5 h-5 animate-spin" /> Analyzing your business...</>
              ) : (
                <>Generate Health Report <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>
        )}

        {error && (
          <div className="card-surface border border-red-400/20 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {report && (
          <div className="space-y-6">
            {/* Report */}
            <div className="card-surface rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 className="w-5 h-5 text-purple-400" />
                <h2 className="font-display font-bold text-lg">Your Business Health Report</h2>
              </div>
              <div className="prose prose-invert prose-sm max-w-none">
                {report.split("\n").map((line, i) => {
                  if (line.startsWith("## ")) {
                    return <h3 key={i} className="font-display font-bold text-vault-text text-base mt-5 mb-2 first:mt-0">{line.replace("## ", "")}</h3>;
                  }
                  if (line.startsWith("- ")) {
                    return <p key={i} className="text-vault-text-dim text-sm flex gap-2"><span className="text-vault-accent shrink-0">·</span>{line.slice(2)}</p>;
                  }
                  if (line.startsWith("**") && line.endsWith("**")) {
                    return <p key={i} className="font-bold text-vault-text text-sm">{line.replace(/\*\*/g, "")}</p>;
                  }
                  if (line.trim() === "") return <div key={i} className="h-1" />;
                  return <p key={i} className="text-vault-text-dim text-sm">{line}</p>;
                })}
              </div>
            </div>

            {/* Email capture */}
            <DemoEmailCapture
              source="weeklypulse"
              headline="Get this report delivered every Monday"
              subline="WeeklyPulse sends your business health report automatically — no logging in, no remembering to check."
            />

            {/* Upgrade CTA */}
            <div className="bg-purple-400/5 border border-purple-400/20 rounded-2xl p-6 text-center">
              <h3 className="font-display font-bold text-lg mb-2">Make this automatic</h3>
              <p className="text-vault-text-dim text-sm mb-4">
                WeeklyPulse sends this report to your inbox every Monday. You don&apos;t have to think about it.
                <br />Trend analysis builds over time — it compares each week to the last four.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/auth/signup" className="inline-flex items-center justify-center gap-2 bg-vault-accent text-vault-bg font-bold px-6 py-3 rounded-xl hover:bg-vault-accent-dim transition-all">
                  Start Free Trial — $19/mo <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* How it works */}
        {!report && (
          <div className="mt-8 card-surface rounded-2xl p-6">
            <h2 className="font-display font-bold mb-4">What you get</h2>
            <div className="space-y-3">
              {[
                { label: "Health Score", desc: "An overall 1-100 business health score with plain-English explanation" },
                { label: "Key Metrics", desc: "Profit margin, revenue per hour, customer retention, and lead conversion" },
                { label: "Trend Signals", desc: "2-3 specific signals — what's working, what's concerning" },
                { label: "Priority Action", desc: "The single most important thing to do next week" },
                { label: "30-Second Summary", desc: "The whole picture in 2-3 sentences for when you're busy" },
              ].map((item) => (
                <div key={item.label} className="flex gap-3">
                  <span className="text-vault-accent font-mono text-sm shrink-0 mt-0.5">→</span>
                  <div>
                    <span className="text-vault-text text-sm font-semibold">{item.label}: </span>
                    <span className="text-vault-text-dim text-sm">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
