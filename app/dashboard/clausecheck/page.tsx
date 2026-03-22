"use client";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Scale, Upload, Loader2, AlertTriangle, Shield, HelpCircle, FileText, Lock, Printer, ChevronDown, ChevronUp } from "lucide-react";
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

const RISK_COLORS: Record<string, string> = {
  Low: "bg-vault-green/10 text-vault-green border-vault-green/20",
  Medium: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
  High: "bg-red-400/10 text-red-400 border-red-400/20",
};

export default function ClauseCheckPage() {
  const [file, setFile] = useState<File | null>(null);
  const [context, setContext] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [trialRemaining, setTrialRemaining] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadHistory(); loadAccess(); }, []);

  async function loadAccess() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: sub } = await supabase
      .from("bot_subscriptions")
      .select("status")
      .eq("user_id", user.id)
      .eq("bot_slug", "clausecheck")
      .in("status", ["active", "trialing"])
      .maybeSingle();
    if (sub) return;
    const { data: trial } = await supabase
      .from("free_trials")
      .select("uses_remaining")
      .eq("user_id", user.id)
      .eq("bot_slug", "clausecheck")
      .maybeSingle();
    const remaining = trial?.uses_remaining ?? 2;
    if (remaining <= 0) {
      setBlocked(true);
    } else {
      setTrialRemaining(remaining);
    }
  }

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

    try {
      // Read PDF as text using FileReader (base64) — send to API
      const arrayBuffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      let binary = "";
      for (let i = 0; i < uint8.length; i++) binary += String.fromCharCode(uint8[i]);
      const base64 = btoa(binary);

      const res = await fetch("/api/bots/clausecheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentName: file.name,
          documentBase64: base64,
          context,
        }),
      });

      const data = await res.json();
      if (res.status === 403) { setBlocked(true); return; }
      if (!res.ok) { setError(data.error ?? "Analysis failed."); return; }
      setAnalysis(data.analysis);
      loadHistory();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  }

  function exportReport() {
    window.print();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <style>{`@media print { .no-print { display: none !important; } .print-only { display: block !important; } }`}</style>

      <div className="no-print">
        <h1 className="font-display text-3xl font-bold flex items-center gap-3">
          <Scale className="w-7 h-7 text-orange-400" />
          ClauseCheck
        </h1>
        <p className="text-vault-text-dim mt-1">AI Contract Risk Scanner — instant analysis of any legal document.</p>
      </div>

      {/* Disclaimer */}
      <div className="no-print rounded-xl border border-orange-400/20 bg-orange-400/5 px-4 py-3 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
        <p className="text-sm text-orange-400">
          ClauseCheck is <strong>not legal advice</strong>. Always consult a licensed attorney for legal decisions.
        </p>
      </div>

      {blocked && (
        <div className="no-print rounded-xl border border-orange-400/30 bg-orange-400/5 px-5 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Lock className="w-6 h-6 text-orange-400 shrink-0" />
          <div>
            <p className="font-semibold text-vault-text">You&apos;ve used your free ClauseCheck analyses.</p>
            <p className="text-sm text-vault-text-dim">Subscribe to analyze unlimited contracts.</p>
          </div>
          <Link href="/dashboard/billing" className="sm:ml-auto bg-orange-400 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-400/90 transition-colors whitespace-nowrap">
            Subscribe Now
          </Link>
        </div>
      )}

      {!blocked && trialRemaining !== null && (
        <div className="no-print rounded-xl border border-orange-400/20 bg-orange-400/5 px-5 py-3 flex items-center gap-3">
          <span className="text-sm text-vault-text">
            <span className="font-semibold text-orange-400">{trialRemaining} free analysis{trialRemaining !== 1 ? "s" : ""} remaining</span>
            {" — "}
            <Link href="/dashboard/billing" className="text-orange-400 underline">Subscribe for unlimited access</Link>
          </span>
        </div>
      )}

      <div className="no-print card-surface rounded-2xl p-6 space-y-4">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
          className={clsx(
            "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all",
            dragging ? "border-orange-400 bg-orange-400/5" : file ? "border-vault-green bg-vault-green/5" : "border-vault-border hover:border-vault-accent hover:bg-vault-accent/5"
          )}
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
              <FileText className="w-8 h-8 text-vault-green" />
              <p className="font-medium text-vault-text">{file.name}</p>
              <p className="text-sm text-vault-text-dim">{(file.size / 1024 / 1024).toFixed(2)} MB · Click to change</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-8 h-8 text-vault-text-dim" />
              <p className="font-medium text-vault-text">Drag & drop or click to upload PDF</p>
              <p className="text-sm text-vault-text-dim">Max 10MB · Contracts, leases, NDAs, service agreements</p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-vault-text mb-2">
            What is this contract for? <span className="text-vault-text-dim">(optional)</span>
          </label>
          <input
            type="text"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g. Freelance client agreement, apartment lease, vendor NDA..."
            className="w-full bg-vault-bg border border-vault-border rounded-xl px-4 py-3 text-sm text-vault-text placeholder:text-vault-text-dim focus:outline-none focus:border-vault-accent"
          />
        </div>

        {error && <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">{error}</p>}

        <button
          onClick={handleAnalyze}
          disabled={analyzing || !file}
          className="flex items-center gap-2 bg-orange-400 text-white px-6 py-3 rounded-xl font-display font-bold text-sm hover:bg-orange-400/90 transition-colors disabled:opacity-50"
        >
          {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scale className="w-4 h-4" />}
          {analyzing ? "Reading your document..." : "Analyze Contract"}
        </button>
      </div>

      {analysis && (
        <div className="space-y-6">
          <div className="flex items-center justify-between no-print">
            <h2 className="font-display text-xl font-bold">Analysis Results</h2>
            <button onClick={exportReport} className="flex items-center gap-2 text-sm text-vault-text-dim hover:text-vault-text border border-vault-border px-3 py-2 rounded-lg transition-colors">
              <Printer className="w-4 h-4" /> Export Report
            </button>
          </div>

          <div className="card-surface rounded-2xl p-6">
            <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-vault-accent" /> Summary
            </h3>
            <p className="text-vault-text-dim leading-relaxed">{analysis.summary}</p>
          </div>

          <div className="card-surface rounded-2xl p-6">
            <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" /> Risk Flags ({analysis.risk_flags.length})
            </h3>
            {analysis.risk_flags.length === 0 ? (
              <p className="text-vault-text-dim">No significant risk flags found.</p>
            ) : (
              <div className="space-y-4">
                {analysis.risk_flags.map((flag, i) => (
                  <div key={i} className="border border-vault-border rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h4 className="font-semibold text-vault-text">{flag.clause_title}</h4>
                      <span className={clsx("text-xs font-bold px-2.5 py-1 rounded-full border shrink-0", RISK_COLORS[flag.risk_level])}>
                        {flag.risk_level}
                      </span>
                    </div>
                    <blockquote className="text-xs text-vault-text-dim bg-vault-bg/50 rounded-lg p-3 mb-2 italic border-l-2 border-vault-border">
                      &ldquo;{flag.flagged_text}&rdquo;
                    </blockquote>
                    <p className="text-sm text-vault-text-dim">{flag.explanation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card-surface rounded-2xl p-6">
              <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-vault-green" /> Missing Protections
              </h3>
              {analysis.missing_protections.length === 0 ? (
                <p className="text-vault-text-dim">No major missing protections found.</p>
              ) : (
                <ul className="space-y-2">
                  {analysis.missing_protections.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-vault-text-dim">
                      <span className="text-vault-accent mt-0.5">•</span> {p}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="card-surface rounded-2xl p-6">
              <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-400" /> Questions To Ask
              </h3>
              <ol className="space-y-2">
                {analysis.questions_to_ask.map((q, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-vault-text-dim">
                    <span className="text-blue-400 font-bold shrink-0">{i + 1}.</span> {q}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="no-print card-surface rounded-2xl p-6">
          <h2 className="font-display text-lg font-bold mb-4">Analysis History</h2>
          <div className="space-y-2">
            {history.map((item) => (
              <div key={item.id} className="border border-vault-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedHistory(expandedHistory === item.id ? null : item.id)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-vault-border/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="w-4 h-4 text-orange-400 shrink-0" />
                    <span className="text-sm text-vault-text truncate">{item.document_name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-xs text-vault-text-dim">{new Date(item.created_at).toLocaleDateString()}</span>
                    {expandedHistory === item.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>
                {expandedHistory === item.id && (
                  <div className="px-4 pb-4 border-t border-vault-border pt-3">
                    <p className="text-sm text-vault-text-dim mb-2">{item.summary}</p>
                    <p className="text-xs text-vault-text-dim">{item.risk_flags?.length ?? 0} risk flags found</p>
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
