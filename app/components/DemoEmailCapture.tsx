"use client";
import { useState } from "react";
import { ArrowRight, Mail } from "lucide-react";

interface Props {
  source: string;
  headline?: string;
  subline?: string;
}

export default function DemoEmailCapture({
  source,
  headline = "Get this report every Monday — automatically",
  subline = "Subscribe free and WeeklyPulse delivers your business health report to your inbox every week.",
}: Props) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/demo/capture-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, source }),
      });
      if (res.ok) {
        setStatus("done");
        if (typeof window !== "undefined") {
          localStorage.setItem(`demo_email_captured_${source}`, "1");
        }
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="bg-vault-accent/5 border border-vault-accent/20 rounded-xl p-6 text-center">
        <div className="w-10 h-10 rounded-full bg-vault-green/20 flex items-center justify-center mx-auto mb-3">
          <Mail className="w-5 h-5 text-vault-green" />
        </div>
        <p className="font-display font-bold text-vault-text mb-1">You&apos;re on the list.</p>
        <p className="text-vault-text-dim text-sm">
          Check your inbox — we&apos;ll send you a full walkthrough plus your first automated report.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-vault-accent/5 border border-vault-accent/20 rounded-xl p-6">
      <h3 className="font-display font-bold text-vault-text mb-1">{headline}</h3>
      <p className="text-vault-text-dim text-sm mb-4">{subline}</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Your name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-vault-bg border border-vault-border rounded-lg px-4 py-2.5 text-sm text-vault-text placeholder:text-vault-text-dim focus:outline-none focus:border-vault-accent"
        />
        <div className="flex gap-2">
          <input
            type="email"
            required
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-vault-bg border border-vault-border rounded-lg px-4 py-2.5 text-sm text-vault-text placeholder:text-vault-text-dim focus:outline-none focus:border-vault-accent"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="flex items-center gap-2 bg-vault-accent text-vault-bg font-bold px-4 py-2.5 rounded-lg text-sm hover:bg-vault-accent-dim transition-colors disabled:opacity-50"
          >
            {status === "loading" ? "..." : <><ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
        {status === "error" && (
          <p className="text-red-400 text-xs">Something went wrong. Try again.</p>
        )}
        <p className="text-vault-text-dim text-xs">No spam. Unsubscribe anytime. Free trial starts immediately.</p>
      </form>
    </div>
  );
}
