"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { Upload, Scale, AlertTriangle, CheckCircle2, ArrowRight, Lock, ChevronDown, ChevronUp } from "lucide-react";
import clsx from "clsx";
import DemoEmailCapture from "@/app/components/DemoEmailCapture";

interface RiskFlag {
  clause_title: string;
  flagged_text: string;
  explanation: string;
  risk_level: "Low" | "Medium" | "High";
}

interface Analysis {
  summary: string;
  risk_flags: RiskFlag[];
  missing_protections: string[];
  questions_to_ask: string[];
}

const RISK_COLORS = {
  High: { text: "text-red-400", border: "border-red-400/30", bg: "bg-red-400/5", badge: "bg-red-400/10 text-red-400" },
  Medium: { text: "text-yellow-400", border: "border-yellow-400/30", bg: "bg-yellow-400/5", badge: "bg-yellow-400/10 text-yellow-400" },
  Low: { text: "text-blue-400", border: "border-blue-400/30", bg: "bg-blue-400/5", badge: "bg-blue-400/10 text-blue-400" },
};

// Demo key stored in localStorage so guests get exactly 1 free analysis
const DEMO_KEY = "bvp_clausecheck_demo_used";

function getRemainingDemo(): boolean {
  if (typeof window === "undefined") return true;
  return !localStorage.getItem(DEMO_KEY);
}

function markDemoUsed() {
  if (typeof window === "undefined") return;
  localStorage.setItem(DEMO_KEY, "1");
}

export default function ClauseCheckDemoClient() {
  const [file, setFile] = useState<File | null>(null);
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const demoAvailable = getRemainingDemo();

  async function handleAnalyze() {
    if (!file) return;
    if (!demoAvailable) return;

    setLoading(true);
    setError("");

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await fetch("/api/demo/clausecheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentBase64: base64,
          documentName: file.name,
          context: context || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Analysis failed. Please try again.");
        return;
      }

      setAnalysis(data.analysis);
      markDemoUsed();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const highCount = analysis?.risk_flags.filter((f) => f.risk_level === "High").length ?? 0;
  const medCount = analysis?.risk_flags.filter((f) => f.risk_level === "Medium").length ?? 0;

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
            <Link href="/demo" className="text-sm text-vault-text-dim hover:text-vault-text transition-colors hidden sm:block">
              All Demos
            </Link>
            <Link href="/auth/signup" className="text-sm bg-vault-accent text-vault-bg font-semibold px-4 py-2 rounded-lg hover:bg-vault-accent-dim transition-colors">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-400/10 border border-orange-400/20 mb-4">
              <Scale className="w-7 h-7 text-orange-400" />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">
              Free Contract Risk Checker
            </h1>
            <p className="text-vault-text-dim text-lg mb-4">
              Upload any contract. Get plain-English risk flags in 30 seconds.
            </p>
            <div className="inline-flex items-center gap-2 text-sm text-vault-green border border-vault-green/30 bg-vault-green/5 px-3 py-1.5 rounded-full">
              <CheckCircle2 className="w-4 h-4" /> Free demo — no account required
            </div>
          </div>

          {!analysis ? (
            <div className="card-surface rounded-2xl p-8 space-y-6">
              {!demoAvailable && (
                <div className="bg-vault-accent/5 border border-vault-accent/30 rounded-xl p-5 text-center">
                  <Lock className="w-8 h-8 text-vault-accent mx-auto mb-3" />
                  <p className="font-semibold text-vault-text mb-1">You&apos;ve used your free demo</p>
                  <p className="text-sm text-vault-text-dim mb-4">Create a free account to get 1 more free analysis, then subscribe for unlimited access.</p>
                  <Link href="/auth/signup" className="inline-flex items-center gap-2 bg-vault-accent text-vault-bg font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-vault-accent-dim transition-colors">
                    Get Free Account <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {demoAvailable && (
                <>
                  {/* File upload */}
                  <div>
                    <label className="block text-sm font-semibold text-vault-text mb-2">Contract PDF</label>
                    <div
                      className={clsx(
                        "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
                        file ? "border-vault-accent/50 bg-vault-accent/5" : "border-vault-border hover:border-vault-accent/30"
                      )}
                      onClick={() => fileRef.current?.click()}
                    >
                      <input
                        ref={fileRef}
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      />
                      <Upload className={clsx("w-8 h-8 mx-auto mb-3", file ? "text-vault-accent" : "text-vault-text-dim")} />
                      {file ? (
                        <p className="text-vault-text font-semibold">{file.name}</p>
                      ) : (
                        <>
                          <p className="text-vault-text font-semibold">Drop your PDF here</p>
                          <p className="text-vault-text-dim text-sm mt-1">or click to browse · PDF only · Max 10MB</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Context */}
                  <div>
                    <label className="block text-sm font-semibold text-vault-text mb-2">
                      Context <span className="text-vault-text-dim font-normal">(optional)</span>
                    </label>
                    <textarea
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder="e.g. I'm a freelancer reviewing a client services agreement. I care most about payment terms and IP ownership."
                      rows={3}
                      className="w-full bg-vault-bg border border-vault-border rounded-xl px-4 py-3 text-sm text-vault-text placeholder:text-vault-text-dim resize-none focus:outline-none focus:border-vault-accent transition-colors"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">
                      {error}
                    </div>
                  )}

                  <button
                    onClick={handleAnalyze}
                    disabled={!file || loading}
                    className="w-full bg-vault-accent text-vault-bg font-display font-bold py-4 rounded-xl text-base hover:bg-vault-accent-dim transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-vault-bg/30 border-t-vault-bg rounded-full animate-spin" />
                        Analyzing your contract...
                      </>
                    ) : (
                      <>Analyze Contract for Free <ArrowRight className="w-5 h-5" /></>
                    )}
                  </button>

                  <p className="text-center text-xs text-vault-text-dim">
                    Your document is analyzed privately and not stored. Results shown only to you.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Score summary */}
              <div className="card-surface rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-xl font-bold">Risk Summary</h2>
                  <div className="flex items-center gap-3">
                    {highCount > 0 && (
                      <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-400/10 text-red-400">
                        <AlertTriangle className="w-3.5 h-3.5" /> {highCount} High
                      </span>
                    )}
                    {medCount > 0 && (
                      <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-400/10 text-yellow-400">
                        {medCount} Medium
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-vault-text-dim text-sm leading-relaxed">{analysis.summary}</p>
              </div>

              {/* Risk flags */}
              {analysis.risk_flags.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-display text-lg font-bold">Flagged Clauses ({analysis.risk_flags.length})</h3>
                  {analysis.risk_flags.map((flag, i) => {
                    const colors = RISK_COLORS[flag.risk_level];
                    const isOpen = expanded === i;
                    return (
                      <div key={i} className={`rounded-xl border p-4 ${colors.border} ${colors.bg}`}>
                        <button
                          className="w-full flex items-start justify-between gap-3 text-left"
                          onClick={() => setExpanded(isOpen ? null : i)}
                        >
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full mt-0.5 ${colors.badge}`}>
                              {flag.risk_level}
                            </span>
                            <span className={`font-semibold text-sm ${colors.text}`}>{flag.clause_title}</span>
                          </div>
                          {isOpen ? <ChevronUp className="w-4 h-4 text-vault-text-dim shrink-0 mt-0.5" /> : <ChevronDown className="w-4 h-4 text-vault-text-dim shrink-0 mt-0.5" />}
                        </button>
                        {isOpen && (
                          <div className="mt-3 space-y-3 border-t border-vault-border/50 pt-3">
                            {flag.flagged_text && (
                              <div>
                                <p className="text-xs font-semibold text-vault-text-dim uppercase tracking-wider mb-1">Flagged Text</p>
                                <p className="text-xs text-vault-text-dim italic bg-vault-bg rounded-lg p-3 leading-relaxed">
                                  &ldquo;{flag.flagged_text}&rdquo;
                                </p>
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-semibold text-vault-text-dim uppercase tracking-wider mb-1">Why It Matters</p>
                              <p className="text-sm text-vault-text-dim leading-relaxed">{flag.explanation}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Missing protections */}
              {analysis.missing_protections.length > 0 && (
                <div className="card-surface rounded-2xl p-6">
                  <h3 className="font-display text-lg font-bold mb-3">Missing Protections</h3>
                  <ul className="space-y-2">
                    {analysis.missing_protections.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-vault-text-dim">
                        <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Questions to ask */}
              {analysis.questions_to_ask.length > 0 && (
                <div className="card-surface rounded-2xl p-6">
                  <h3 className="font-display text-lg font-bold mb-3">Questions to Ask Before Signing</h3>
                  <ol className="space-y-2">
                    {analysis.questions_to_ask.map((q, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-vault-text-dim">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-vault-accent/10 text-vault-accent text-xs font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        {q}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Email capture */}
              <DemoEmailCapture
                source="clausecheck"
                headline="Get notified when we add new contract templates"
                subline="Plus a free walkthrough of ClauseCheck Pro — see how it builds a risk profile across all your contracts."
              />

              {/* CTA — convert to signup */}
              <div className="rounded-2xl border border-vault-accent/30 bg-vault-accent/5 p-8 text-center">
                <h3 className="font-display text-2xl font-bold mb-2">Want to analyze more contracts?</h3>
                <p className="text-vault-text-dim mb-2">Create a free account to get 1 more analysis. Subscribe to ClauseCheck for unlimited access.</p>
                <p className="text-vault-text-dim text-sm mb-6">
                  ClauseCheck builds a risk profile across every contract you review — so each analysis gets smarter over time.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link href="/auth/signup" className="inline-flex items-center gap-2 bg-vault-accent text-vault-bg font-display font-bold px-6 py-3 rounded-xl hover:bg-vault-accent-dim transition-all">
                    Create Free Account <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link href="/pricing" className="text-sm text-vault-text-dim hover:text-vault-text transition-colors">
                    See pricing →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
