"use client";
import { useState } from "react";
import { Play, Loader2, AlertCircle, CheckCircle2, Copy, Check } from "lucide-react";
import Link from "next/link";

interface Field {
  name: string;
  label: string;
  type: "text" | "textarea" | "select";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  rows?: number;
}

interface BotRunnerProps {
  botSlug: string;
  fields: Field[];
  title: string;
  description: string;
  buttonLabel?: string;
}

export default function BotRunner({ botSlug, fields, title, description, buttonLabel = "Run Bot" }: BotRunnerProps) {
  const [form, setForm] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleRun(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/bots/${botSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
      } else {
        setResult(data.output);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="card-surface rounded-2xl p-6">
        <h2 className="font-display text-lg font-bold mb-1">{title}</h2>
        <p className="text-vault-text-dim text-sm mb-6">{description}</p>
        <form onSubmit={handleRun} className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-vault-text-dim mb-2">
                {field.label} {field.required && <span className="text-red-400">*</span>}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  value={form[field.name] ?? ""}
                  onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                  required={field.required}
                  rows={field.rows ?? 4}
                  placeholder={field.placeholder}
                  className="w-full bg-vault-bg border border-vault-border rounded-lg px-4 py-3 text-vault-text placeholder-vault-muted focus:outline-none focus:border-vault-accent transition-colors resize-none font-body text-sm"
                />
              ) : field.type === "select" ? (
                <select
                  value={form[field.name] ?? ""}
                  onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                  required={field.required}
                  className="w-full bg-vault-bg border border-vault-border rounded-lg px-4 py-3 text-vault-text focus:outline-none focus:border-vault-accent transition-colors"
                >
                  <option value="">Select...</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={form[field.name] ?? ""}
                  onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                  required={field.required}
                  placeholder={field.placeholder}
                  className="w-full bg-vault-bg border border-vault-border rounded-lg px-4 py-3 text-vault-text placeholder-vault-muted focus:outline-none focus:border-vault-accent transition-colors"
                />
              )}
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-vault-accent text-vault-bg font-display font-bold px-6 py-3 rounded-xl hover:bg-vault-accent-dim transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Running...</> : <><Play className="w-4 h-4" /> {buttonLabel}</>}
          </button>
        </form>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-semibold text-sm">Error</p>
            <p className="text-red-300 text-sm mt-1">{error}</p>
            {error.includes("limit") && (
              <Link href="/dashboard/billing" className="inline-block mt-3 text-sm bg-vault-accent text-vault-bg font-bold px-4 py-2 rounded-lg hover:bg-vault-accent-dim transition-colors">
                Upgrade Plan
              </Link>
            )}
          </div>
        </div>
      )}

      {result && (
        <div className="card-surface rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-vault-green">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-display font-semibold">Output</span>
            </div>
            <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-vault-text-dim hover:text-vault-text border border-vault-border rounded-lg px-3 py-1.5 transition-colors">
              {copied ? <><Check className="w-3 h-3 text-vault-green" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
            </button>
          </div>
          <pre className="font-mono text-sm text-vault-text bg-vault-bg rounded-lg p-4 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
            {result}
          </pre>
        </div>
      )}
    </div>
  );
}
