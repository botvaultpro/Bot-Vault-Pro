import Link from "next/link";
import { Metadata } from "next";
import { ArrowRight, AlertTriangle, CheckCircle2, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "How to Review a Contract Without a Lawyer: 12-Point Checklist",
  description: "Before you sign, run through these 12 checks. They catch the clauses that cost freelancers and small businesses the most money. Includes a free AI contract review tool.",
  keywords: ["how to review a contract", "contract review checklist", "freelancer contract tips", "what to look for in a contract", "contract red flags"],
  openGraph: {
    title: "How to Review a Contract Without a Lawyer: 12-Point Checklist",
    description: "The 12 things to check before you sign any contract — written for freelancers and small business owners, not lawyers.",
  },
};

const checklist = [
  {
    num: "01",
    title: "Identify all parties clearly",
    risk: "Medium",
    body: "Make sure every party is identified by their full legal name — not a trade name or abbreviation. \"John Smith DBA Acme Designs\" is different from \"Acme Designs LLC.\" Who you're actually contracting with matters when you need to enforce the agreement.",
  },
  {
    num: "02",
    title: "Check the scope of work",
    risk: "High",
    body: "The scope defines what you're actually agreeing to do (or pay for). Vague scope = scope creep. Look for language like \"and any related services\" or \"as reasonably requested\" — these are open-ended commitments that can expand without additional payment.",
  },
  {
    num: "03",
    title: "Find the payment terms",
    risk: "High",
    body: "What's the payment schedule? When exactly are invoices due? What happens if payment is late — is there a late fee? Are there any conditions the other party can use to delay payment, like approval gates or \"satisfactory completion\" clauses?",
  },
  {
    num: "04",
    title: "Look for auto-renewal clauses",
    risk: "High",
    body: "Many service contracts auto-renew for another full term unless you cancel within a specific window — sometimes as short as 30 days before the renewal date. Miss it and you're locked in. These are often buried in the \"Term\" or \"Termination\" section.",
  },
  {
    num: "05",
    title: "Check who owns the intellectual property",
    risk: "High",
    body: "If you're a freelancer or agency producing creative work, code, or content — who owns it? Many contracts default to the client owning everything you produce, including work that wasn't specifically scoped. Look for \"work for hire\" language and negotiate to keep ownership of reusable components.",
  },
  {
    num: "06",
    title: "Find the termination clause",
    risk: "Medium",
    body: "Can either party terminate for any reason? Or only for cause? What's the notice period? Are there kill fees? A \"termination for convenience\" clause means either party can walk away at any time — that's fine if it's mutual, but check whether it's one-sided.",
  },
  {
    num: "07",
    title: "Check the liability cap",
    risk: "High",
    body: "What's the maximum you could be liable for if something goes wrong? Ideally, your liability is capped at the total contract value. Unlimited liability exposure is a major red flag — especially in software, professional services, and anything that touches customer data.",
  },
  {
    num: "08",
    title: "Read the indemnification clause",
    risk: "High",
    body: "Indemnification means you agree to cover the other party's legal costs if they get sued because of you. That's normal. But watch for one-sided indemnification — where you indemnify them but they don't indemnify you — and \"third-party claim\" language that can go very broad.",
  },
  {
    num: "09",
    title: "Check for non-compete and non-solicit",
    risk: "Medium",
    body: "Non-compete clauses restrict you from working with competitors or in the same industry. Non-solicit clauses prevent you from hiring or working with the other party's employees or clients. Check the duration and geographic scope — a 2-year nationwide non-compete for a freelance project is unreasonable.",
  },
  {
    num: "10",
    title: "Find the governing law and dispute resolution",
    risk: "Low",
    body: "Which state's laws apply? Where would disputes be resolved? If you're in California and the contract requires disputes to be litigated in New York, that's a practical burden. Arbitration clauses are common and worth understanding — they waive your right to a jury trial.",
  },
  {
    num: "11",
    title: "Check for confidentiality obligations",
    risk: "Medium",
    body: "What are you agreeing to keep confidential, and for how long? Are there carve-outs for publicly available information? Does confidentiality survive termination? These clauses can restrict what you can say about past clients or work — including in your portfolio.",
  },
  {
    num: "12",
    title: "Look for amendment and waiver clauses",
    risk: "Low",
    body: "How can the contract be changed? Is a verbal agreement or email confirmation enough, or does every change need to be in writing and signed by both parties? No-waiver clauses mean that if one party doesn't enforce a right once, they don't lose the right to enforce it later.",
  },
];

export default function ContractReviewPost() {
  return (
    <div className="min-h-screen bg-vault-bg">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-vault-border bg-vault-bg/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-xl tracking-tight">
            <span className="text-gradient-cyan">Bot</span><span className="text-vault-text"> Vault Pro</span>
          </Link>
          <Link href="/auth/signup" className="text-sm bg-vault-accent text-vault-bg font-semibold px-4 py-2 rounded-lg">Try Free</Link>
        </div>
      </nav>

      <div className="pt-28 pb-24 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="mb-10">
            <Link href="/blog" className="text-sm text-vault-text-dim hover:text-vault-accent transition-colors mb-4 inline-block">← Blog</Link>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full border text-orange-400 bg-orange-400/10 border-orange-400/20">Contracts</span>
              <span className="text-xs text-vault-text-dim">March 2026 · 8 min read</span>
            </div>
            <h1 className="font-display text-4xl font-bold mb-4 leading-tight">
              How to Review a Contract (Without a Lawyer): A 12-Point Checklist
            </h1>
            <p className="text-vault-text-dim text-lg leading-relaxed">
              Before you sign anything, run through these 12 checks. They catch the clauses that cost freelancers and small businesses the most money.
            </p>
          </div>

          {/* Intro */}
          <div className="prose-vault space-y-4 mb-10">
            <p className="text-vault-text-dim leading-relaxed">
              Most people sign contracts without reading them. Either they trust the other party, or the document is too long and confusing, or they don&apos;t know what to look for. Then something goes wrong, and they discover what they actually agreed to.
            </p>
            <p className="text-vault-text-dim leading-relaxed">
              You don&apos;t need a law degree to review a contract. You need to know which sections matter, what red flags look like, and what questions to ask. This checklist covers the 12 things worth your attention in any business contract.
            </p>

            {/* AI tool CTA */}
            <div className="bg-orange-400/5 border border-orange-400/30 rounded-xl p-5 my-6">
              <div className="flex items-start gap-3">
                <Scale className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-vault-text mb-1">Have a contract to review right now?</p>
                  <p className="text-sm text-vault-text-dim mb-3">Upload it to ClauseCheck and get AI-powered risk flags in 30 seconds — free, no account required.</p>
                  <Link href="/demo/clausecheck" className="inline-flex items-center gap-2 text-sm font-semibold text-orange-400 border border-orange-400/30 px-4 py-2 rounded-lg hover:bg-orange-400/10 transition-colors">
                    Try free contract review <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Checklist */}
          <div className="space-y-6 mb-12">
            {checklist.map((item) => {
              const riskColor = item.risk === "High"
                ? "text-red-400 bg-red-400/10 border-red-400/20"
                : item.risk === "Medium"
                ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
                : "text-blue-400 bg-blue-400/10 border-blue-400/20";
              return (
                <div key={item.num} className="card-surface rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <span className="font-mono text-sm font-bold text-vault-text-dim shrink-0 mt-0.5">{item.num}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="font-display font-bold text-vault-text">{item.title}</h2>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${riskColor}`}>{item.risk}</span>
                      </div>
                      <p className="text-vault-text-dim text-sm leading-relaxed">{item.body}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* After the checklist */}
          <div className="space-y-4 mb-10">
            <h2 className="font-display text-2xl font-bold">After you run the checklist</h2>
            <p className="text-vault-text-dim leading-relaxed">
              Once you&apos;ve identified the issues, write down your questions and bring them to the negotiation. Most business contracts are negotiable — especially scope, payment terms, liability caps, and auto-renewal windows.
            </p>
            <p className="text-vault-text-dim leading-relaxed">
              For high-stakes contracts (large dollar amounts, long terms, significant IP transfer), it&apos;s worth having a lawyer review after you&apos;ve done your own pass. Use this checklist to prepare smart questions — you&apos;ll save time and money at the consultation.
            </p>
            <div className="flex items-start gap-3 p-4 bg-vault-surface/50 rounded-xl border border-vault-border">
              <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-sm text-vault-text-dim">
                <strong className="text-vault-text">This is not legal advice.</strong> This checklist is for educational purposes. For any contract involving significant financial risk, consult a licensed attorney in your jurisdiction.
              </p>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="rounded-2xl border border-orange-400/30 bg-orange-400/5 p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-orange-400/10 border border-orange-400/20 flex items-center justify-center mx-auto mb-4">
              <Scale className="w-6 h-6 text-orange-400" />
            </div>
            <h3 className="font-display text-2xl font-bold mb-2">Let AI do this checklist for you</h3>
            <p className="text-vault-text-dim mb-6">
              ClauseCheck runs all 12 of these checks automatically — and 20 more — in 30 seconds. Upload any PDF contract and get flagged risks, missing protections, and questions to ask before you sign.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/demo/clausecheck" className="inline-flex items-center gap-2 bg-orange-400 text-vault-bg font-display font-bold px-6 py-3 rounded-xl hover:bg-orange-300 transition-colors">
                Try Free — No Account Needed <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/pricing" className="text-sm text-vault-text-dim hover:text-vault-text transition-colors">
                See ClauseCheck pricing →
              </Link>
            </div>
            <p className="text-xs text-vault-text-dim mt-4">$29/month after free trial · Cancel anytime</p>
          </div>

          {/* Related */}
          <div className="mt-12 pt-8 border-t border-vault-border">
            <p className="text-xs text-vault-text-dim uppercase tracking-widest mb-4">More from Bot Vault Pro</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/blog/ai-email-reply-tips" className="flex-1 card-surface rounded-xl p-4 hover:border-vault-accent/30 transition-all">
                <p className="text-xs text-vault-accent mb-1">Email</p>
                <p className="font-semibold text-vault-text text-sm">How to Reply to Difficult Emails Professionally</p>
              </Link>
              <Link href="/tools/ai-email-writer" className="flex-1 card-surface rounded-xl p-4 hover:border-vault-accent/30 transition-all">
                <p className="text-xs text-vault-accent mb-1">Tool</p>
                <p className="font-semibold text-vault-text text-sm">Free AI Email Reply Generator</p>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
