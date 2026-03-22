import Link from "next/link";
import { Metadata } from "next";
import { ArrowRight, Mail, Check, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Free AI Email Writer — Get 3 Professional Reply Options Instantly",
  description: "Paste any difficult email and get 3 ready-to-send AI reply options. Professional, assertive, or diplomatic tone. EmailCoach by Bot Vault Pro. Free trial included.",
  keywords: ["ai email writer", "email reply generator", "professional email writer", "ai email assistant", "how to reply to difficult emails"],
};

const scenarios = [
  "Negotiating better rates with a client",
  "Responding to a complaint without escalating",
  "Following up on an overdue invoice (without burning the relationship)",
  "Declining a request professionally",
  "Asking for a raise or better terms",
  "Handling a difficult customer professionally",
  "Responding to criticism without getting defensive",
  "Writing a firm but polite rejection",
];

export default function AiEmailWriterPage() {
  return (
    <div className="min-h-screen bg-vault-bg">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-vault-border bg-vault-bg/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-xl tracking-tight">
            <span className="text-gradient-cyan">Bot</span>
            <span className="text-vault-text"> Vault Pro</span>
          </Link>
          <Link href="/auth/signup" className="text-sm bg-vault-accent text-vault-bg font-semibold px-4 py-2 rounded-lg">
            Try Free
          </Link>
        </div>
      </nav>

      <div className="pt-28 pb-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-20">

          {/* Hero */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-sm text-vault-accent border border-vault-accent/30 bg-vault-accent/5 px-3 py-1.5 rounded-full mb-6">
              <Mail className="w-4 h-4" /> Powered by EmailCoach AI
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Stop stressing over<br />
              <span className="text-vault-accent">difficult emails.</span>
            </h1>
            <p className="text-vault-text-dim text-xl max-w-2xl mx-auto mb-8">
              Paste any email. Get 3 ready-to-send reply options — professional, assertive, or diplomatic — in seconds. Free trial included.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/signup" className="inline-flex items-center gap-2 bg-vault-accent text-vault-bg font-display font-bold px-8 py-4 rounded-xl text-lg hover:bg-vault-accent-dim transition-all hover:scale-105">
                Try EmailCoach Free <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <p className="text-vault-text-dim text-sm mt-4">3 free replies included · No credit card required</p>
          </div>

          {/* How it works */}
          <div>
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl font-bold mb-3">How it works</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { step: "1", title: "Paste the email", desc: "Copy any email you've received — a complaint, a negotiation, an awkward request." },
                { step: "2", title: "Set your goal", desc: "Tell EmailCoach what outcome you want: stay professional, be firm, de-escalate, etc." },
                { step: "3", title: "Get 3 replies", desc: "Three ready-to-send options. Pick the one that fits. Edit or send directly." },
              ].map((step) => (
                <div key={step.step} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-vault-accent/10 border border-vault-accent/30 flex items-center justify-center mx-auto mb-4">
                    <span className="font-display font-bold text-vault-accent">{step.step}</span>
                  </div>
                  <h3 className="font-display font-bold text-vault-text mb-2">{step.title}</h3>
                  <p className="text-vault-text-dim text-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Scenarios */}
          <div>
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl font-bold mb-3">Works for the emails you dread</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {scenarios.map((s) => (
                <div key={s} className="flex items-center gap-2 p-3 card-surface rounded-xl">
                  <Zap className="w-4 h-4 text-vault-accent shrink-0" />
                  <span className="text-sm text-vault-text-dim">{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold mb-6">EmailCoach pricing</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="rounded-2xl border border-vault-border p-6">
                <p className="text-vault-text-dim font-mono text-xs uppercase tracking-widest mb-1">Starter</p>
                <div className="flex items-end gap-2 mb-4">
                  <span className="font-display text-4xl font-bold text-vault-text">$19</span>
                  <span className="text-vault-text-dim mb-1">/mo</span>
                </div>
                <ul className="space-y-2 mb-6 text-left">
                  {["Unlimited email replies", "3 tone options per email", "Email history", "3 free replies to start"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-vault-text-dim">
                      <Check className="w-4 h-4 text-vault-green shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup" className="block w-full text-center border border-vault-accent text-vault-accent font-semibold px-6 py-2.5 rounded-xl hover:bg-vault-accent/10 transition-colors text-sm">
                  Start Free
                </Link>
              </div>
              <div className="rounded-2xl border border-vault-accent/30 bg-vault-accent/5 p-6">
                <p className="text-vault-accent font-mono text-xs uppercase tracking-widest mb-1">Pro</p>
                <div className="flex items-end gap-2 mb-4">
                  <span className="font-display text-4xl font-bold text-vault-accent">$39</span>
                  <span className="text-vault-text-dim mb-1">/mo</span>
                </div>
                <ul className="space-y-2 mb-6 text-left">
                  {["Everything in Starter", "Gmail inbox connection", "Tone learning over time", "Auto-draft suggestions"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-vault-text-dim">
                      <Check className="w-4 h-4 text-vault-accent shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup" className="block w-full text-center bg-vault-accent text-vault-bg font-bold px-6 py-2.5 rounded-xl hover:bg-vault-accent-dim transition-colors text-sm">
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
