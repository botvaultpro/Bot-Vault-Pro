"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BarChart2, Loader2, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Lock, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

type Report = {
  weekly_snapshot: string;
  whats_working: string[];
  needs_attention: string[];
  one_thing_to_do: string;
  next_week_watchlist: string[];
};

type HistoryItem = {
  id: string;
  week_ending: string;
  revenue: number;
  report_content: string;
  created_at: string;
};

export default function WeeklyPulsePage() {
  const [form, setForm] = useState({
    weekEnding: new Date().toISOString().split("T")[0],
    revenue: "",
    expenses: "",
    newCustomers: "",
    returningCustomers: "",
    refunds: "",
    topProduct: "",
    biggestChallenge: "",
    wins: "",
    industry: "",
  });
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);

  useEffect(() => { loadHistory(); }, []);

  async function loadHistory() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("pulse_reports")
      .select("id, week_ending, revenue, report_content, created_at")
      .eq("user_id", user.id)
      .order("week_ending", { ascending: false })
      .limit(12);
    setHistory(data ?? []);
  }

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    setBlocked(false);
    try {
      const res = await fetch("/api/bots/weeklypulse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekEnding: form.weekEnding,
          revenue: parseFloat(form.revenue) || 0,
          expenses: parseFloat(form.expenses) || 0,
          newCustomers: parseInt(form.newCustomers) || 0,
          returningCustomers: parseInt(form.returningCustomers) || 0,
          refunds: parseInt(form.refunds) || 0,
          topProduct: form.topProduct,
          biggestChallenge: form.biggestChallenge,
          wins: form.wins,
          industry: form.industry,
        }),
      });
      const data = await res.json();
      if (res.status === 403) { setBlocked(true); return; }
      if (!res.ok) { setError(data.error ?? "Generation failed."); return; }
      setReport(data.report);
      loadHistory();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold flex items-center gap-3">
          <BarChart2 className="w-7 h-7 text-purple-400" />
          WeeklyPulse
        </h1>
        <p className="text-vault-text-dim mt-1">Enter your weekly numbers and get an AI business health report.</p>
      </div>

      {blocked && (
        <div className="rounded-xl border border-purple-400/30 bg-purple-400/5 px-5 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Lock className="w-6 h-6 text-purple-400 shrink-0" />
          <div>
            <p className="font-semibold text-vault-text">You&apos;ve used your 3 free WeeklyPulse reports.</p>
            <p className="text-sm text-vault-text-dim">Subscribe to keep generating weekly reports and enable Monday email delivery.</p>
          </div>
          <Link href="/dashboard/billing" className="sm:ml-auto bg-purple-400 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-purple-400/90 transition-colors whitespace-nowrap">
            Subscribe Now
          </Link>
        </div>
      )}

      <div className="card-surface rounded-2xl p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-vault-text mb-2">Week Ending Date</label>
            <input type="date" value={form.weekEnding} onChange={(e) => update("weekEnding", e.target.value)}
              className="w-full bg-vault-bg border border-vault-border rounded-xl px-4 py-3 text-sm text-vault-text focus:outline-none focus:border-vault-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-vault-text mb-2">Industry / Business Type</label>
            <input type="text" value={form.industry} onChange={(e) => update("industry", e.target.value)}
              placeholder="e.g. Restaurant, SaaS, Retail..." className="w-full bg-vault-bg border border-vault-border rounded-xl px-4 py-3 text-sm text-vault-text placeholder:text-vault-text-dim focus:outline-none focus:border-vault-accent" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { field: "revenue", label: "Total Revenue ($)", placeholder: "0.00" },
            { field: "expenses", label: "Total Expenses ($)", placeholder: "0.00" },
            { field: "newCustomers", label: "New Customers (#)", placeholder: "0" },
            { field: "returningCustomers", label: "Returning Customers (#)", placeholder: "0" },
            { field: "refunds", label: "Refunds / Cancellations (#)", placeholder: "0" },
          ].map(({ field, label, placeholder }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-vault-text mb-2">{label}</label>
              <input type="number" value={form[field as keyof typeof form]} onChange={(e) => update(field, e.target.value)}
                placeholder={placeholder} className="w-full bg-vault-bg border border-vault-border rounded-xl px-4 py-3 text-sm text-vault-text placeholder:text-vault-text-dim focus:outline-none focus:border-vault-accent" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { field: "topProduct", label: "Top Selling Product / Service", placeholder: "e.g. Monthly retainer, Product X..." },
            { field: "biggestChallenge", label: "Biggest Challenge This Week", placeholder: "e.g. Late deliveries, low traffic..." },
            { field: "wins", label: "Wins or Highlights", placeholder: "e.g. Landed new client, hit revenue goal..." },
          ].map(({ field, label, placeholder }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-vault-text mb-2">{label}</label>
              <input type="text" value={form[field as keyof typeof form]} onChange={(e) => update(field, e.target.value)}
                placeholder={placeholder} className="w-full bg-vault-bg border border-vault-border rounded-xl px-4 py-3 text-sm text-vault-text placeholder:text-vault-text-dim focus:outline-none focus:border-vault-accent" />
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">{error}</p>}

        <button onClick={handleGenerate} disabled={generating || !form.revenue}
          className="flex items-center gap-2 bg-purple-400 text-white px-6 py-3 rounded-xl font-display font-bold text-sm hover:bg-purple-400/90 transition-colors disabled:opacity-50">
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart2 className="w-4 h-4" />}
          {generating ? "Generating Report..." : "Generate Report"}
        </button>
      </div>

      {report && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 card-surface rounded-2xl p-6">
            <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-purple-400" /> Weekly Snapshot
            </h3>
            <p className="text-vault-text-dim leading-relaxed">{report.weekly_snapshot}</p>
          </div>

          <div className="card-surface rounded-2xl p-6">
            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-vault-green" /> What&apos;s Working
            </h3>
            <ul className="space-y-2">
              {report.whats_working.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-vault-text-dim">
                  <CheckCircle2 className="w-4 h-4 text-vault-green mt-0.5 shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="card-surface rounded-2xl p-6">
            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-400" /> Needs Attention
            </h3>
            <ul className="space-y-2">
              {report.needs_attention.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-vault-text-dim">
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="card-surface rounded-2xl p-6 border border-purple-400/20 bg-purple-400/5">
            <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-purple-400" /> One Thing To Do This Week
            </h3>
            <p className="text-vault-text font-medium leading-relaxed">{report.one_thing_to_do}</p>
          </div>

          <div className="card-surface rounded-2xl p-6">
            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-400" /> Next Week Watch List
            </h3>
            <ul className="space-y-2">
              {report.next_week_watchlist.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-vault-text-dim">
                  <span className="text-yellow-400 mt-0.5 shrink-0">→</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="card-surface rounded-2xl p-6">
          <h2 className="font-display text-lg font-bold mb-4">Report History</h2>
          <div className="space-y-2">
            {history.map((item) => {
              let parsedReport: Report | null = null;
              try { parsedReport = JSON.parse(item.report_content); } catch {}
              return (
                <div key={item.id} className="border border-vault-border rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandedHistory(expandedHistory === item.id ? null : item.id)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-vault-border/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-vault-text">Week of {item.week_ending}</span>
                      <span className="text-xs text-vault-text-dim bg-vault-border px-2 py-0.5 rounded-full">${item.revenue?.toLocaleString()}</span>
                    </div>
                    {expandedHistory === item.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {expandedHistory === item.id && parsedReport && (
                    <div className="px-4 pb-4 border-t border-vault-border pt-3">
                      <p className="text-sm text-vault-text-dim">{parsedReport.weekly_snapshot}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
