"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  BarChart2, Loader2, TrendingUp, TrendingDown,
  AlertCircle, CheckCircle2, Lock, ChevronDown, ChevronUp,
} from "lucide-react";
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

const inputStyle = {
  width: "100%",
  background: "var(--bg-input)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  padding: "12px 16px",
  color: "var(--text-primary)",
  fontSize: "14px",
  outline: "none",
  fontFamily: "var(--font-body)",
};

export default function WeeklyPulsePage() {
  const [form, setForm] = useState({
    weekEnding:          new Date().toISOString().split("T")[0],
    revenue:             "",
    expenses:            "",
    newCustomers:        "",
    returningCustomers:  "",
    refunds:             "",
    topProduct:          "",
    biggestChallenge:    "",
    wins:                "",
    industry:            "",
  });
  const [generating, setGenerating]       = useState(false);
  const [report, setReport]               = useState<Report | null>(null);
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
          weekEnding:         form.weekEnding,
          revenue:            parseFloat(form.revenue) || 0,
          expenses:           parseFloat(form.expenses) || 0,
          newCustomers:       parseInt(form.newCustomers) || 0,
          returningCustomers: parseInt(form.returningCustomers) || 0,
          refunds:            parseInt(form.refunds) || 0,
          topProduct:         form.topProduct,
          biggestChallenge:   form.biggestChallenge,
          wins:               form.wins,
          industry:           form.industry,
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
    <div className="max-w-5xl mx-auto space-y-8 page-enter">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}
        >
          <BarChart2 className="w-5 h-5" style={{ color: "var(--accent-purple)" }} />
        </div>
        <div>
          <h1
            className="font-display font-extrabold text-3xl"
            style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          >
            WeeklyPulse
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Enter your weekly numbers and get an AI business health report.
          </p>
        </div>
      </div>

      {/* Blocked */}
      {blocked && (
        <div
          className="rounded-xl px-5 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          style={{
            background: "rgba(139,92,246,0.06)",
            border: "1px solid rgba(139,92,246,0.25)",
            borderRadius: "12px",
          }}
        >
          <Lock className="w-5 h-5 shrink-0" style={{ color: "var(--accent-purple)" }} />
          <div>
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
              You&apos;ve used your free WeeklyPulse reports.
            </p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Subscribe to keep generating reports and enable Monday email delivery.
            </p>
          </div>
          <Link
            href="/dashboard/billing"
            className="sm:ml-auto px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all hover:-translate-y-px"
            style={{ background: "var(--accent-purple)", color: "white" }}
          >
            Subscribe Now
          </Link>
        </div>
      )}

      {/* Form */}
      <div
        className="rounded-xl p-6 space-y-6"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px" }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Week Ending Date
            </label>
            <input
              type="date"
              value={form.weekEnding}
              onChange={(e) => update("weekEnding", e.target.value)}
              style={inputStyle}
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
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Industry / Business Type
            </label>
            <input
              type="text"
              value={form.industry}
              onChange={(e) => update("industry", e.target.value)}
              placeholder="e.g. Restaurant, SaaS, Retail..."
              style={inputStyle}
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
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { field: "revenue",            label: "Total Revenue ($)",            placeholder: "0.00" },
            { field: "expenses",           label: "Total Expenses ($)",           placeholder: "0.00" },
            { field: "newCustomers",       label: "New Customers (#)",            placeholder: "0" },
            { field: "returningCustomers", label: "Returning Customers (#)",      placeholder: "0" },
            { field: "refunds",            label: "Refunds / Cancellations (#)", placeholder: "0" },
          ].map(({ field, label, placeholder }) => (
            <div key={field}>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                {label}
              </label>
              <input
                type="number"
                value={form[field as keyof typeof form]}
                onChange={(e) => update(field, e.target.value)}
                placeholder={placeholder}
                style={inputStyle}
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
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { field: "topProduct",        label: "Top Selling Product / Service", placeholder: "e.g. Monthly retainer..." },
            { field: "biggestChallenge",  label: "Biggest Challenge This Week",   placeholder: "e.g. Late deliveries..." },
            { field: "wins",              label: "Wins or Highlights",            placeholder: "e.g. Landed new client..." },
          ].map(({ field, label, placeholder }) => (
            <div key={field}>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                {label}
              </label>
              <input
                type="text"
                value={form[field as keyof typeof form]}
                onChange={(e) => update(field, e.target.value)}
                placeholder={placeholder}
                style={inputStyle}
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
          ))}
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
          disabled={generating || !form.revenue}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all hover:-translate-y-px disabled:opacity-50"
          style={{ background: "var(--accent-purple)", color: "white", borderRadius: "8px" }}
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart2 className="w-4 h-4" />}
          {generating ? "Generating Report..." : "Generate Report"}
        </button>
      </div>

      {/* Report output */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className="md:col-span-2 rounded-xl p-6"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px" }}
          >
            <h3
              className="font-display font-bold text-lg mb-3 flex items-center gap-2"
              style={{ color: "var(--text-primary)" }}
            >
              <BarChart2 className="w-5 h-5" style={{ color: "var(--accent-purple)" }} />
              Weekly Snapshot
            </h3>
            <p style={{ color: "var(--text-secondary)" }}>{report.weekly_snapshot}</p>
          </div>

          <div
            className="rounded-xl p-6"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px" }}
          >
            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <TrendingUp className="w-5 h-5" style={{ color: "var(--accent-green)" }} /> What&apos;s Working
            </h3>
            <ul className="space-y-2">
              {report.whats_working.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--accent-green)" }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div
            className="rounded-xl p-6"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px" }}
          >
            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <TrendingDown className="w-5 h-5" style={{ color: "var(--accent-red)" }} /> Needs Attention
            </h3>
            <ul className="space-y-2">
              {report.needs_attention.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--accent-red)" }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div
            className="rounded-xl p-6"
            style={{
              background: "rgba(139,92,246,0.05)",
              border: "1px solid rgba(139,92,246,0.2)",
              borderRadius: "12px",
            }}
          >
            <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <CheckCircle2 className="w-5 h-5" style={{ color: "var(--accent-purple)" }} /> One Thing To Do This Week
            </h3>
            <p className="font-medium" style={{ color: "var(--text-primary)" }}>{report.one_thing_to_do}</p>
          </div>

          <div
            className="rounded-xl p-6"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px" }}
          >
            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <AlertCircle className="w-5 h-5" style={{ color: "var(--accent-amber)" }} /> Next Week Watch List
            </h3>
            <ul className="space-y-2">
              {report.next_week_watchlist.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <span style={{ color: "var(--accent-amber)" }}>→</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div
          className="rounded-xl p-6"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px" }}
        >
          <h2 className="font-display font-bold text-lg mb-4" style={{ color: "var(--text-primary)" }}>
            Report History
          </h2>
          <div className="space-y-2">
            {history.map((item) => {
              let parsedReport: Report | null = null;
              try { parsedReport = JSON.parse(item.report_content); } catch {}
              return (
                <div
                  key={item.id}
                  className="rounded-xl overflow-hidden"
                  style={{ border: "1px solid var(--border)" }}
                >
                  <button
                    onClick={() => setExpandedHistory(expandedHistory === item.id ? null : item.id)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors"
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-elevated)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        Week of {item.week_ending}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-mono"
                        style={{
                          background: "var(--bg-elevated)",
                          border: "1px solid var(--border)",
                          color: "var(--text-secondary)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        ${item.revenue?.toLocaleString()}
                      </span>
                    </div>
                    {expandedHistory === item.id ? (
                      <ChevronUp className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
                    ) : (
                      <ChevronDown className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
                    )}
                  </button>
                  {expandedHistory === item.id && parsedReport && (
                    <div
                      className="px-4 pb-4 border-t pt-3"
                      style={{ borderColor: "var(--border)" }}
                    >
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {parsedReport.weekly_snapshot}
                      </p>
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
