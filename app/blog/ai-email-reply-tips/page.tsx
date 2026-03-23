import Link from "next/link";
import { Metadata } from "next";
import { ArrowRight, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "How to Reply to Difficult Emails Professionally (With AI Examples)",
  description: "Late payments, difficult clients, awkward negotiations — here's exactly how to handle the emails you dread, with real examples and AI-written replies.",
  keywords: ["how to reply to difficult emails", "professional email response", "how to write a professional email", "ai email writer", "difficult client email examples"],
};

const scenarios = [
  {
    title: "The Late Payment Email",
    situation: "A client is 3 weeks past due. You've already sent one reminder. You need to be firm without burning the relationship.",
    wrong: "Hey just following up again on the invoice, totally understand if you're busy! Let me know if there's anything I can do to help.",
    right: `Hi [Client],

I'm following up on Invoice #1042 for $3,400, which was due on March 1st — it's now 21 days past due.

Could you confirm the payment status and let me know when I can expect the transfer? If there's an issue with the invoice or payment process, I'm happy to resolve it quickly.

If I don't hear back by Friday, I'll need to pause work on the current project until the outstanding balance is cleared.

[Your name]`,
    lesson: "Be specific (invoice number, amount, date). Give a clear deadline. State consequences calmly without being hostile.",
  },
  {
    title: "The Scope Creep Request",
    situation: "A client is asking for something that's clearly outside what you agreed to — and framing it like it's included.",
    wrong: "Sure I can take a look at that, no problem!",
    right: `Hi [Client],

Thanks for sending this over. Just to make sure we're aligned — this falls outside the scope of our original agreement, which covered [original scope].

Happy to take this on as a separate project. Based on the requirements you've described, I'd estimate [X hours/days] at my standard rate of [$X/hour], bringing the additional cost to approximately $[amount].

Let me know if you'd like to move forward, and I'll send over a quick addendum to the contract.

[Your name]`,
    lesson: "Don't apologize for enforcing scope. Reference the original agreement. Offer a clear path forward with pricing.",
  },
  {
    title: "The Negative Review / Complaint",
    situation: "A customer sent a detailed complaint email. They're angry but have some legitimate points.",
    wrong: "I'm so sorry about this, we really dropped the ball here and I completely understand your frustration and will make this right somehow.",
    right: `Hi [Customer],

Thank you for taking the time to write this out — I've read it carefully and I hear you.

[Acknowledge the specific issue without over-apologizing]: The [specific problem] shouldn't have happened, and I understand why that was frustrating.

Here's what I'm doing to address it: [specific action]. And here's what I'd like to offer you: [specific resolution — discount, refund, redo, etc.].

I'd like to make this right. Can we schedule a quick call this week to make sure we get there?

[Your name]`,
    lesson: "Acknowledge the specific complaint. Avoid generic over-apologizing. Offer a concrete resolution. Propose next action.",
  },
  {
    title: "The Unreasonable Demand",
    situation: "A client is asking for something you can't (or won't) do — but you want to keep the relationship.",
    wrong: "Unfortunately that's not possible for us at this time. Sorry about that.",
    right: `Hi [Client],

Thanks for raising this. I've given it some thought and here's where I land:

[The specific request] isn't something I'm able to take on [because / under these terms / at this stage]. Here's why briefly: [one sentence reason].

What I can offer instead: [alternative that addresses the underlying need, or a compromise].

Does that work for what you need? Happy to jump on a call if it's easier to discuss.

[Your name]`,
    lesson: "Give a real reason (briefly). Don't just say no — offer a path forward. Keep the door open.",
  },
];

export default function EmailReplyTipsPost() {
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

          <div className="mb-10">
            <Link href="/blog" className="text-sm text-vault-text-dim hover:text-vault-accent transition-colors mb-4 inline-block">← Blog</Link>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full border text-vault-accent bg-vault-accent/10 border-vault-accent/20">Email</span>
              <span className="text-xs text-vault-text-dim">March 2026 · 6 min read</span>
            </div>
            <h1 className="font-display text-4xl font-bold mb-4 leading-tight">
              How to Reply to Difficult Emails Professionally
            </h1>
            <p className="text-vault-text-dim text-lg leading-relaxed">
              Late payments, difficult clients, awkward negotiations — here&apos;s exactly how to handle the emails you dread writing, with real before/after examples.
            </p>
          </div>

          <div className="space-y-4 mb-10">
            <p className="text-vault-text-dim leading-relaxed">
              Most professional communication failures aren&apos;t about what you said — they&apos;re about how you said it. Too apologetic and you get walked over. Too aggressive and you burn a relationship. The right tone is direct, specific, and solution-oriented.
            </p>
            <p className="text-vault-text-dim leading-relaxed">
              Here are four of the most common difficult email scenarios, with real examples of what not to say — and what to say instead.
            </p>

            <div className="bg-vault-accent/5 border border-vault-accent/30 rounded-xl p-5 my-6">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-vault-accent shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-vault-text mb-1">Need a reply right now?</p>
                  <p className="text-sm text-vault-text-dim mb-3">Paste your email into EmailCoach and get 3 AI-written reply options in seconds — free, no account required.</p>
                  <Link href="/demo/emailcoach" className="inline-flex items-center gap-2 text-sm font-semibold text-vault-accent border border-vault-accent/30 px-4 py-2 rounded-lg hover:bg-vault-accent/10 transition-colors">
                    Try free email reply generator <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-10 mb-12">
            {scenarios.map((s, i) => (
              <div key={i}>
                <h2 className="font-display text-xl font-bold mb-2">{s.title}</h2>
                <p className="text-vault-text-dim text-sm mb-4 italic">{s.situation}</p>

                <div className="space-y-3">
                  <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-4">
                    <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">❌ Don&apos;t send this</p>
                    <p className="text-sm text-vault-text-dim italic">&ldquo;{s.wrong}&rdquo;</p>
                  </div>
                  <div className="rounded-xl border border-vault-green/20 bg-vault-green/5 p-4">
                    <p className="text-xs font-semibold text-vault-green uppercase tracking-wider mb-2">✓ Send this instead</p>
                    <pre className="text-sm text-vault-text-dim whitespace-pre-wrap font-sans leading-relaxed">{s.right}</pre>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-vault-text-dim">
                    <span className="font-semibold text-vault-accent shrink-0">Why it works:</span>
                    <span>{s.lesson}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4 mb-10">
            <h2 className="font-display text-2xl font-bold">The pattern behind every good difficult email</h2>
            <ol className="space-y-3">
              {[
                { n: "1.", t: "Acknowledge without over-apologizing.", d: "Validate the issue once. Don't grovel." },
                { n: "2.", t: "Be specific.", d: "Reference exact amounts, dates, deliverables. Vague emails don't move things forward." },
                { n: "3.", t: "State your position clearly.", d: "What you can do, what you can't, and why — briefly." },
                { n: "4.", t: "Offer a next step.", d: "Every email should end with a clear action. A question, a call, a deadline." },
                { n: "5.", t: "Keep it short.", d: "Long emails signal anxiety. Short emails signal confidence." },
              ].map((item) => (
                <li key={item.n} className="flex items-start gap-3 card-surface rounded-xl p-4">
                  <span className="font-mono font-bold text-vault-accent shrink-0">{item.n}</span>
                  <div>
                    <span className="font-semibold text-vault-text">{item.t}</span>{" "}
                    <span className="text-vault-text-dim text-sm">{item.d}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-2xl border border-vault-accent/30 bg-vault-accent/5 p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-vault-accent/10 border border-vault-accent/20 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-vault-accent" />
            </div>
            <h3 className="font-display text-2xl font-bold mb-2">EmailCoach writes these for you</h3>
            <p className="text-vault-text-dim mb-6">
              Paste any email you&apos;ve received. Tell it your goal. Get three ready-to-send reply options in seconds — professional, direct, and diplomatic. Free trial included.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/demo/emailcoach" className="inline-flex items-center gap-2 bg-vault-accent text-vault-bg font-display font-bold px-6 py-3 rounded-xl hover:bg-vault-accent-dim transition-colors">
                Try Free — No Account Needed <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/pricing" className="text-sm text-vault-text-dim hover:text-vault-text transition-colors">
                See EmailCoach pricing →
              </Link>
            </div>
            <p className="text-xs text-vault-text-dim mt-4">$19/month after free trial · Cancel anytime</p>
          </div>

          <div className="mt-12 pt-8 border-t border-vault-border">
            <p className="text-xs text-vault-text-dim uppercase tracking-widest mb-4">More from Bot Vault Pro</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/blog/how-to-review-a-contract" className="flex-1 card-surface rounded-xl p-4 hover:border-vault-accent/30 transition-all">
                <p className="text-xs text-orange-400 mb-1">Contracts</p>
                <p className="font-semibold text-vault-text text-sm">How to Review a Contract: 12-Point Checklist</p>
              </Link>
              <Link href="/tools/free-contract-review" className="flex-1 card-surface rounded-xl p-4 hover:border-vault-accent/30 transition-all">
                <p className="text-xs text-orange-400 mb-1">Tool</p>
                <p className="font-semibold text-vault-text text-sm">Free AI Contract Risk Checker</p>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
