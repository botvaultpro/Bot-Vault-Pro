import Link from "next/link";
import { Metadata } from "next";
import { ArrowRight, Scale, Check, AlertTriangle, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Free AI Contract Review — Spot Risky Clauses Before You Sign",
  description: "Upload any contract and get instant AI-powered risk analysis. ClauseCheck flags dangerous clauses, missing protections, and questions to ask in plain English. Free trial included.",
  keywords: ["free contract review", "AI contract analysis", "contract risk checker", "review contract online", "contract red flags"],
};

const useCases = [
  { title: "Freelancer & Client Agreements", desc: "Spot non-compete clauses, IP ownership traps, and late payment terms before you sign a client contract." },
  { title: "Vendor & Supplier Contracts", desc: "Identify auto-renewal traps, price escalation clauses, and liability caps in vendor agreements." },
  { title: "Employment Contracts", desc: "Understand non-solicitation clauses, termination terms, and equity vesting schedules before accepting." },
  { title: "Lease Agreements", desc: "Flag excessive penalties, tenant liability clauses, and missing maintenance obligations in commercial leases." },
  { title: "Software & SaaS Agreements", desc: "Review data ownership, uptime SLAs, and termination for convenience clauses in tech contracts." },
  { title: "Partnership & Investment Docs", desc: "Understand dilution provisions, drag-along rights, and board control clauses in investment agreements." },
];

const faqs = [
  {
    q: "Is this really free?",
    a: "Yes. ClauseCheck includes a free trial that gives you 1 full contract analysis at no cost, no credit card required. After your free analysis, you can subscribe for $29/month for unlimited reviews.",
  },
  {
    q: "How does it work?",
    a: "Upload your PDF contract. Our AI reads the full document, identifies risky clauses, explains each risk in plain English, flags missing protections, and gives you specific questions to ask before signing.",
  },
  {
    q: "Is my contract kept private?",
    a: "Yes. Your document is analyzed privately. For demo users, contracts are not stored. For registered users, your analyses are stored securely and accessible only to you.",
  },
  {
    q: "Can it replace a lawyer?",
    a: "ClauseCheck is designed to help you understand what you're signing — not to replace professional legal advice. For high-stakes contracts, we recommend using ClauseCheck to prepare smart questions, then consulting a lawyer.",
  },
  {
    q: "What file types are supported?",
    a: "Currently PDF files with selectable text. Scanned PDFs (image-only) are not supported yet.",
  },
];

export default function FreeContractReviewPage() {
  return (
    <div className="min-h-screen bg-vault-bg">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-vault-border bg-vault-bg/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-xl tracking-tight">
            <span className="text-gradient-cyan">Bot</span>
            <span className="text-vault-text"> Vault Pro</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/signup" className="text-sm bg-vault-accent text-vault-bg font-semibold px-4 py-2 rounded-lg">
              Try Free
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-28 pb-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-20">

          {/* Hero */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-sm text-vault-accent border border-vault-accent/30 bg-vault-accent/5 px-3 py-1.5 rounded-full mb-6">
              <Scale className="w-4 h-4" /> Powered by ClauseCheck AI
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Never sign a contract blind<br />
              <span className="text-orange-400">again.</span>
            </h1>
            <p className="text-vault-text-dim text-xl max-w-2xl mx-auto mb-8">
              Upload any contract. Get plain-English risk flags, missing protections, and smart questions to ask — in 30 seconds. Free trial included.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/demo/clausecheck" className="inline-flex items-center gap-2 bg-orange-400 text-vault-bg font-display font-bold px-8 py-4 rounded-xl text-lg hover:bg-orange-300 transition-all hover:scale-105">
                Analyze a Contract Free <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/auth/signup" className="text-vault-text-dim hover:text-vault-text transition-colors text-sm">
                Create free account →
              </Link>
            </div>
            <p className="text-vault-text-dim text-sm mt-4">No credit card · No account required for demo</p>
          </div>

          {/* What it catches */}
          <div>
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl font-bold mb-3">What ClauseCheck catches</h2>
              <p className="text-vault-text-dim">The clauses that catch businesses off guard — flagged before you sign.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { flag: "Auto-renewal traps", desc: "Contracts that renew automatically with steep cancellation penalties" },
                { flag: "Unlimited liability", desc: "Missing caps that expose you to unlimited financial risk" },
                { flag: "IP ownership grabs", desc: "Clauses that transfer your intellectual property to the other party" },
                { flag: "One-sided termination", desc: "Terms that let them cancel anytime but lock you in for months" },
                { flag: "Vague payment terms", desc: "Missing due dates, late fees, and dispute resolution for invoices" },
                { flag: "Non-compete overreach", desc: "Unreasonably broad restrictions on your future work" },
                { flag: "Indemnification traps", desc: "Clauses that make you responsible for the other party's mistakes" },
                { flag: "Missing governing law", desc: "No specification of which state/jurisdiction applies" },
              ].map((item) => (
                <div key={item.flag} className="flex items-start gap-3 p-4 bg-vault-surface/50 rounded-xl border border-vault-border">
                  <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-vault-text text-sm">{item.flag}</p>
                    <p className="text-vault-text-dim text-xs mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Use cases */}
          <div>
            <div className="text-center mb-10">
              <h2 className="font-display text-3xl font-bold mb-3">Works for every contract type</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {useCases.map((uc) => (
                <div key={uc.title} className="card-surface rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-orange-400" />
                    <h3 className="font-semibold text-vault-text text-sm">{uc.title}</h3>
                  </div>
                  <p className="text-vault-text-dim text-sm">{uc.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA banner */}
          <div className="rounded-2xl border border-orange-400/30 bg-orange-400/5 p-10 text-center">
            <h2 className="font-display text-3xl font-bold mb-3">Have a contract to review?</h2>
            <p className="text-vault-text-dim mb-6 max-w-lg mx-auto">
              Upload it now. Your first analysis is completely free. No account, no credit card.
            </p>
            <Link href="/demo/clausecheck" className="inline-flex items-center gap-2 bg-orange-400 text-vault-bg font-display font-bold px-8 py-4 rounded-xl text-lg hover:bg-orange-300 transition-all">
              Analyze My Contract Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Pricing */}
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold mb-6">Simple pricing. No lawyer fees.</h2>
            <div className="inline-block rounded-2xl border border-vault-border p-8 max-w-sm w-full">
              <p className="text-vault-accent font-mono text-sm uppercase tracking-widest mb-1">ClauseCheck</p>
              <div className="flex items-end gap-2 justify-center mb-4">
                <span className="font-display text-5xl font-bold text-vault-text">$29</span>
                <span className="text-vault-text-dim mb-2">/month</span>
              </div>
              <ul className="space-y-3 mb-6 text-left">
                {["Unlimited contract analyses", "Risk scoring per clause", "Plain-English explanations", "Missing protection detection", "Smart questions generator", "Full analysis history"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-vault-text-dim">
                    <Check className="w-4 h-4 text-vault-green shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup" className="block w-full text-center bg-vault-accent text-vault-bg font-display font-bold px-6 py-3 rounded-xl hover:bg-vault-accent-dim transition-colors">
                Start Free Trial
              </Link>
              <p className="text-xs text-vault-text-dim mt-3">1 free analysis included · Cancel anytime</p>
            </div>
          </div>

          {/* FAQs */}
          <div>
            <h2 className="font-display text-3xl font-bold text-center mb-8">Frequently asked questions</h2>
            <div className="space-y-4 max-w-2xl mx-auto">
              {faqs.map((faq) => (
                <div key={faq.q} className="card-surface rounded-xl p-5">
                  <h3 className="font-semibold text-vault-text mb-2">{faq.q}</h3>
                  <p className="text-vault-text-dim text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
