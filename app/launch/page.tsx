import Link from "next/link";
import { Metadata } from "next";
import { ArrowRight, Scale, Mail, FileText, BarChart2, Star, Globe, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Bot Vault Pro — AI Business Automation Suite for Small Teams",
  description: "6 AI-powered bots that run your business while you sleep. Contract review, email replies, invoicing, reviews, weekly reports, and client proposals — all automated.",
};

const bots = [
  { icon: Scale,    color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20", name: "ClauseCheck",    price: "$29/mo", blurb: "Upload any contract → plain-English risk flags in 30 seconds.",       demo: "/demo/clausecheck" },
  { icon: Mail,     color: "text-vault-accent", bg: "bg-vault-accent/10", border: "border-vault-accent/20", name: "EmailCoach",    price: "$19/mo", blurb: "Paste any difficult email → 3 ready-to-send reply options.",        demo: "/demo/emailcoach" },
  { icon: FileText, color: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400/20",   name: "InvoiceForge",  price: "$29/mo", blurb: "Generate invoices, track opens, auto-send payment reminders.",     demo: "/demo/invoiceforge" },
  { icon: BarChart2,color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20", name: "WeeklyPulse",   price: "$19/mo", blurb: "Enter your numbers → business health report every Monday morning.", demo: null },
  { icon: Star,     color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20", name: "ReviewBot",     price: "$29/mo", blurb: "Monitors Google reviews 24/7, auto-drafts and publishes replies.",  demo: null },
  { icon: Globe,    color: "text-vault-green", bg: "bg-vault-green/10", border: "border-vault-green/20", name: "SiteBuilder Pro", price: "$49/mo", blurb: "Find local businesses, generate custom site demos, close deals.",    demo: null },
];

export default function LaunchPage() {
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
        <div className="max-w-3xl mx-auto space-y-16">

          {/* Hero */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-sm text-vault-accent border border-vault-accent/30 bg-vault-accent/5 px-3 py-1.5 rounded-full mb-6">
              🚀 Now live — free trials on all bots
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-5 leading-tight">
              6 AI bots that run your business.<br />
              <span className="text-gradient-cyan">While you sleep.</span>
            </h1>
            <p className="text-vault-text-dim text-xl max-w-2xl mx-auto mb-8">
              Bot Vault Pro is a suite of AI automation tools built for solo operators, freelancers, and small businesses. Not prompts — actual systems that take action on their own.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/signup" className="inline-flex items-center gap-2 bg-vault-accent text-vault-bg font-display font-bold px-8 py-4 rounded-xl text-lg hover:bg-vault-accent-dim transition-all hover:scale-105">
                Start Free — No Credit Card <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/demo" className="text-vault-text-dim hover:text-vault-text transition-colors text-sm">
                Try a live demo first →
              </Link>
            </div>
          </div>

          {/* The problem */}
          <div className="card-surface rounded-2xl p-8">
            <h2 className="font-display text-2xl font-bold mb-4">The problem with ChatGPT for business</h2>
            <p className="text-vault-text-dim leading-relaxed mb-4">
              ChatGPT is great for one-off questions. But it forgets everything, can&apos;t connect to your real systems, and requires you to do the work every single time. It&apos;s a tool, not a system.
            </p>
            <p className="text-vault-text-dim leading-relaxed">
              <strong className="text-vault-text">Bot Vault Pro is different.</strong> Our bots remember your business, connect to your real systems (Gmail, Google Business, your data), and take action automatically. You set them up once. They run forever.
            </p>
          </div>

          {/* The 6 bots */}
          <div>
            <h2 className="font-display text-2xl font-bold mb-6 text-center">The vault — 6 bots, 6 business problems solved</h2>
            <div className="space-y-4">
              {bots.map((bot) => {
                const Icon = bot.icon;
                return (
                  <div key={bot.name} className={`rounded-xl border p-5 flex items-start gap-4 ${bot.border} ${bot.bg}`}>
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${bot.border}`}>
                      <Icon className={`w-5 h-5 ${bot.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`font-bold text-vault-text`}>{bot.name}</span>
                        <span className={`text-xs font-semibold ${bot.color}`}>{bot.price}</span>
                      </div>
                      <p className="text-sm text-vault-text-dim">{bot.blurb}</p>
                    </div>
                    {bot.demo && (
                      <Link href={bot.demo} className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border ${bot.border} ${bot.color} hover:opacity-80 transition-opacity flex items-center gap-1`}>
                        Try demo <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing */}
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold mb-3">Simple pricing</h2>
            <p className="text-vault-text-dim mb-6">Subscribe to just the bots you need. Every bot starts with a free trial — no credit card required.</p>
            <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
              {[
                { name: "EmailCoach", price: "$19/mo" },
                { name: "WeeklyPulse", price: "$19/mo" },
                { name: "ClauseCheck", price: "$29/mo" },
                { name: "InvoiceForge", price: "$29/mo" },
                { name: "ReviewBot", price: "$29/mo" },
                { name: "SiteBuilder Pro", price: "$49/mo" },
              ].map((b) => (
                <div key={b.name} className="flex items-center gap-2 bg-vault-surface border border-vault-border rounded-full px-4 py-2 text-sm">
                  <span className="text-vault-text font-semibold">{b.name}</span>
                  <span className="text-vault-accent font-mono">{b.price}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-vault-text-dim mb-8">Subscribe to 3+ bots and get 20% off automatically — no code needed.</p>
            <Link href="/auth/signup" className="inline-flex items-center gap-2 bg-vault-accent text-vault-bg font-display font-bold px-8 py-4 rounded-xl text-lg hover:bg-vault-accent-dim transition-all hover:scale-105">
              Start Free Today <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Why we built this */}
          <div className="card-surface rounded-2xl p-8">
            <h2 className="font-display text-2xl font-bold mb-4">Why we built this</h2>
            <p className="text-vault-text-dim leading-relaxed mb-4">
              Small business owners and freelancers can&apos;t afford a marketing team, a bookkeeper, a legal reviewer, and a customer success manager. But they need all of those things.
            </p>
            <p className="text-vault-text-dim leading-relaxed mb-4">
              AI has the capability to do all of these jobs. But generic AI chat interfaces aren&apos;t built for it — they require you to be the prompt engineer, the executor, and the reviewer every single time.
            </p>
            <p className="text-vault-text-dim leading-relaxed">
              Bot Vault Pro wraps that AI capability into opinionated, domain-specific tools that just work. You describe your business once. The bots handle the rest.
            </p>
          </div>

          {/* Live demos CTA */}
          <div className="rounded-2xl border border-vault-accent/30 bg-vault-accent/5 p-8 text-center">
            <h2 className="font-display text-2xl font-bold mb-3">See it before you commit</h2>
            <p className="text-vault-text-dim mb-6">Three of our bots have live demos — no account required. Upload a real contract, paste a real email, or build a real invoice.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/demo/clausecheck" className="inline-flex items-center gap-2 border border-orange-400/40 text-orange-400 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-400/10 transition-colors">
                <Scale className="w-4 h-4" /> Try ClauseCheck
              </Link>
              <Link href="/demo/emailcoach" className="inline-flex items-center gap-2 border border-vault-accent/40 text-vault-accent px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-vault-accent/10 transition-colors">
                <Mail className="w-4 h-4" /> Try EmailCoach
              </Link>
              <Link href="/demo/invoiceforge" className="inline-flex items-center gap-2 border border-blue-400/40 text-blue-400 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-400/10 transition-colors">
                <FileText className="w-4 h-4" /> Try InvoiceForge
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
