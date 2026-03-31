"use client";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  ShieldCheck, Upload, Loader2, AlertTriangle, Shield,
  HelpCircle, FileText, Lock, Printer, ChevronDown, ChevronUp,
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

type RiskFlag = {
  clause_title: string;
  flagged_text: string;
  explanation: string;
  risk_level: "Low" | "Medium" | "High";
};

type Analysis = {
  summary: string;
  risk_flags: RiskFlag[];
  missing_protections: string[];
  questions_to_ask: string[];
};

type HistoryItem = {
  id: string;
  document_name: string;
  summary: string;
  risk_flags: RiskFlag[];
  created_at: string;
};

const RISK_STYLES: Record<string, { bg: string; border: string; color: string }> = {
  Low:    { bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.25)",  color: "var(--accent-green)" },
  Medium: { bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.25)",  color: "var(--accent-amber)" },
  High:   { bg: "rgba(239,68,68,0.08)",   border: "rgba(239,68,68,0.25)",   color: "var(--accent-red)" },
};

export default function ClauseCheckPage() {
  const [file, setFile]                   = useState<File | null>(null);
  const [context, setContext]             = useState("");
  const [analyzing, setAnalyzing]         = useState(false);
  const [progress, setProgress]           = useState("");
  const [analysis, setAnalysis]           = useState<Analysis | null>(null);
  const [error, setError]                 = useState<string | null>(null);
  const [blocked, setBlocked]             = useState(false);
  const [history, setHistory]             = useState<HistoryItem[]>([]);
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);
  const [dragging, setDragging]           = useState(false);
  const fileInputRef                      = useRef<HTMLInputElement>(null);

  useEffect(() => { loadHistory(); }, []);

  async function loadHistory() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("contract_analyses")
      .select("id, document_name, summary, risk_flags, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    setHistory(data ?? []);
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") setFile(dropped);
    else setError("Please upload a PDF file.");
  }

  async function handleAnalyze() {
    if (!file) return;
    setAnalyzing(true);
    setError(null);
    setBlocked(false);
    setProgress("Reading document...");

    const PROGRESS_STEPS = ["Reading document...", "Identifying clauses...", "Generating report..."];
    let step = 0;
    const progressInterval = setInterval(() => {
      step = (step + 1) % PROGRESS_STEPS.length;
      setProgress(PROGRESS_STEPS[step]);
    }, 2500);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < uint8.length; i++) binary += String.fromCharCode(uint8[i]);
      const base64 = btoa(binary);

      const res = await fetch("/api/bots/clausecheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentName: file.name, documentBase64: base64, context }),
      });

      const data = await res.json();
      if (res.status === 403) { setBlocked(true); return; }
      if (!res.ok) { setError(data.error ?? "Analysis failed."); return; }
      setAnalysis(data.analysis);
      loadHistory();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      clearInterval(progressInterval);
      setAnalyzing(false);
      setProgress("");
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 page-enter">
      <style>{`@media print { .no-print { display: none !important; } }`}</style>

      {/* Page Header */}
      <div className="no-print flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}
        >
          <ShieldCheck className="w-5 h-5" style={{ color: "var(--accent-amber)" }} />
        </div>
        <div>
          <h1
            className="font-display font-extrabold text-3xl"
            style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          >
            ClauseCheck
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            AI Contract Risk Scanner — instant analysis of any legal document.
          </p>
        </div>
      </div>

      {/* Legal disclaimer */}
      <div
        className="no-print rounded-xl px-4 py-3 flex items-start gap-3"
        style={{
          background: "rgba(245,158,11,0.05)",
          border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: "12px",
        }}
      >
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--accent-amber)" }} />
        <p className="text-sm" style={{ color: "var(--accent-amber)" }}>
          ClauseCheck is <strong>not legal advice</strong>. Always consult a licensed attorney for legal decisions.
        </p>
      </div>

      {/* Blocked */}
      {blocked && (
        <div
          className="no-print rounded-xl px-5 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          style={{
            background: "rgba(245,158,11,0.06)",
            border: "1px solid rgba(245,158,11,0.25)",
            borderRadius: "12px",
          }}
        >
          <Lock className="w-5 h-5 shrink-0" style={{ color: "var(--accent-amber)" }} />
          <div>
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
              You&apos;ve used your 1 free ClauseCheck analysis.
            </p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Subscribe to analyze unlimited contracts.</p>
          </div>
          <Link
            href="/dashboard/billing"
            className="sm:ml-auto px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all hover:-translate-y-px"
            style={{ background: "var(--accent-amber)", color: "#0A0F1A" }}
          >
            Subscribe Now
          </Link>
        </div>
      )}

      {/* Upload zone */}
      <div
        className="no-print rounded-xl p-6 space-y-4"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px" }}
      >
        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all"
          style={{
            borderColor: dragging
              ? "var(--accent-amber)"
              : file
                ? "var(--accent-green)"
                : "var(--border)",
            background: dragging
              ? "rgba(245,158,11,0.04)"
              : file
                ? "rgba(16,185,129,0.04)"
                : "var(--bg-input)",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <FileText className="w-10 h-10" style={{ color: "var(--accent-green)" }} />
              <p className="font-medium" style={{ color: "var(--text-primary)" }}>{file.name}</p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {(file.size / 1024 / 1024).toFixed(2)} MB · Click to change
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Upload className="w-10 h-10" style={{ color: "var(--text-tertiary)" }} />
              <div>
                <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                  Drop your contract PDF here or click to browse
                </p>
                <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
                  Max 10MB · Contracts, leases, NDAs, service agreements
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Context */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
            What is this contract for?{" "}
            <span style={{ color: "var(--text-tertiary)" }}>(optional)</span>
          </label>
          <input
            type="text"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g. Freelance client agreement, apartment lease, vendor NDA..."
            style={{
              width: "100%",
              background: "var(--bg-input)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "12px 16px",
              color: "var(--text-primary)",
              fontSize: "14px",
              outline: "none",
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

        {/* Progress */}
        {analyzing && progress && (
          <div className="flex items-center gap-3">
            <Loader2 className="w-4 h-4 animate-spin" style={{ color: "var(--accent-amber)" }} />
            <span className="text-sm" style={{ color: "var(--accent-amber)" }}>{progress}</span>
          </div>
        )}

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
          onClick={handleAnalyze}
          disabled={analyzing || !file}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all hover:-translate-y-px disabled:opacity-50"
          style={{ background: "var(--accent-amber)", color: "#0A0F1A", borderRadius: "8px" }}
        >
          {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          {analyzing ? progress || "Analyzing..." : "Analyze Contract"}
        </button>
      </div>

      {/* Analysis results */}
      {analysis && (
        <div className="space-y-6">
          <div className="flex items-center justify-between no-print">
            <h2 className="font-display font-bold text-xl" style={{ color: "var(--text-primary)" }}>
              Analysis Results
            </h2>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-all"
              style={{
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              <Printer className="w-4 h-4" /> Export Report
            </button>
          </div>

          {/* Summary */}
          <div
            className="rounded-xl p-6"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px" }}
          >
            <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <FileText className="w-5 h-5" style={{ color: "var(--accent-blue)" }} /> Summary
            </h3>
            <p style={{ color: "var(--text-secondary)" }}>{analysis.summary}</p>
          </div>

          {/* Risk Flags */}
          <div
            className="rounded-xl p-6"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px" }}
          >
            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <AlertTriangle className="w-5 h-5" style={{ color: "var(--accent-red)" }} />
              Risk Flags ({analysis.risk_flags.length})
            </h3>
            {analysis.risk_flags.length === 0 ? (
              <p style={{ color: "var(--text-secondary)" }}>No significant risk flags found.</p>
            ) : (
              <div className="space-y-4">
                {analysis.risk_flags.map((flag, i) => {
                  const rs = RISK_STYLES[flag.risk_level] ?? RISK_STYLES.Low;
                  return (
                    <div
                      key={i}
                      className="rounded-xl p-4"
                      style={{ border: "1px solid var(--border)", background: "var(--bg-input)" }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                          {flag.clause_title}
                        </h4>
                        <span
                          className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0"
                          style={{ background: rs.bg, border: `1px solid ${rs.border}`, color: rs.color }}
                        >
                          {flag.risk_level}
                        </span>
                      </div>
                      <blockquote
                        className="text-xs rounded-lg p-3 mb-2 italic border-l-2"
                        style={{
                          background: "var(--bg-primary)",
                          borderLeftColor: "var(--border-active)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        &ldquo;{flag.flagged_text}&rdquo;
                      </blockquote>
                      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{flag.explanation}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Missing Protections */}
            <div
              className="rounded-xl p-6"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px" }}
            >
              <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                <Shield className="w-5 h-5" style={{ color: "var(--accent-green)" }} /> Missing Protections
              </h3>
              {analysis.missing_protections.length === 0 ? (
                <p style={{ color: "var(--text-secondary)" }}>No major missing protections found.</p>
              ) : (
                <ul className="space-y-2">
                  {analysis.missing_protections.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                      <span style={{ color: "var(--accent-blue)" }}>•</span> {p}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Questions */}
            <div
              className="rounded-xl p-6"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px" }}
            >
              <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                <HelpCircle className="w-5 h-5" style={{ color: "var(--accent-blue)" }} /> Questions To Ask Your Lawyer
              </h3>
              <ol className="space-y-2">
                {analysis.questions_to_ask.map((q, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <span className="font-bold shrink-0" style={{ color: "var(--accent-blue)", fontFamily: "var(--font-mono)" }}>
                      {i + 1}.
                    </span>
                    {q}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Scan history */}
      {history.length > 0 && (
        <div
          className="no-print rounded-xl p-6"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px" }}
        >
          <h2 className="font-display font-bold text-lg mb-4" style={{ color: "var(--text-primary)" }}>
            Scan History
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
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-elevated)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-4 h-4 shrink-0" style={{ color: "var(--accent-amber)" }} />
                    <span className="text-sm truncate" style={{ color: "var(--text-primary)" }}>
                      {item.document_name}
                    </span>
                    {(item.risk_flags?.length ?? 0) > 0 && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full shrink-0"
                        style={{
                          background: "rgba(239,68,68,0.1)",
                          border: "1px solid rgba(239,68,68,0.2)",
                          color: "var(--accent-red)",
                        }}
                      >
                        {item.risk_flags.length} flags
                      </span>
                    )}
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
                    className="px-4 pb-4 border-t pt-3"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>{item.summary}</p>
                    <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                      {item.risk_flags?.length ?? 0} risk flags found
                    </p>
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
