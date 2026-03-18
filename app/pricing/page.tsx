import Link from "next/link";
import { ArrowRight, Check, Zap } from "lucide-react";

const pricingBots = [
  { name: "SiteBuilder Pro", replaces: "Proposal writing + client tracking",  starter: 49, pro: 99,  starterSlug: "sitebuilder-starter", proSlug: "sitebuilder-pro"   },
  { name: "ReviewBot",        replaces: "Manual review management",            starter: 29, pro: 49,  starterSlug: "reviewbot-starter",   proSlug: "reviewbot-pro"     },
  { name: "InvoiceForge",     replaces: "Invoice tools + follow-up chasing",  starter: 29, pro: 49,  starterSlug: "invoiceforge-starter", proSlug: "invoiceforge-pro"  },
  { name: "ClauseCheck",      replaces: "Basic contract review time",         starter: 29, pro: 49,  starterSlug: "clausecheck-starter",  proSlug: "clausecheck-pro"   },
  { name: "WeeklyPulse",      replaces: "Business reporting & analysis",      starter: 19, pro: 39,  starterSlug: "weeklypulse-starter",  proSlug: "weeklypulse-pro"   },
  { name: "EmailCoach",       replaces: "Difficult email drafting",           starter: 19, pro: 39,  starterSlug: "emailcoach-starter",   proSlug: "emailcoach-pro"    },
];

const freeTrials = [
  { bot: "SiteBuilder Pro", trial: "2 free site generations" },
  { bot: "EmailCoach",      trial: "3 free reply sets" },
  { bot: "WeeklyPulse",     trial: "3 free reports" },
  { bot: "ClauseCheck",     trial: "1 free contract analysis" },
  { bot: "InvoiceForge",    trial: "3 free invoices" },
  { bot: "ReviewBot",       trial: "Setup and connect — see your reviews live" },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-vault-bg overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-vault-border bg-vault-bg/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-xl tracking-tight">
            <span className="text-gradient-cyan">Bot</span>
            <span className="text-vault-text"> Vault Pro</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-vault-text-dim">
            <Link href="/#bots" className="hover:text-vault-accent transition-colors">Bots</Link>
            <Link href="/pricing" className="text-vault-accent">Pricing</Link>
            <Link href="/#roadmap" className="hover:text-vault-accent transition-colors">Roadmap</Link>
            <Link href="/#build" className="hover:text-vault-accent transition-colors">Request a Bot</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-vault-text-dim hover:text-vault-text transition-colors hidden sm:block">
              Log in
            </Link>
            <Link href="/auth/signup" className="text-sm bg-vault-accent text-vault-bg font-semibold px-4 py-2 rounded-lg hover:bg-vault-accent-dim transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-16">

          {/* Header */}
          <div className="text-center pt-8">
            <p className="text-vault-accent font-mono text-sm uppercase tracking-widest mb-3">Pricing</p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4 leading-tight">
              One subscription per bot.<br />Pay for what you use. Cancel anytime.
            </h1>
            <p className="text-vault-text-dim text-lg max-w-2xl mx-auto">
              No bundles forcing you to pay for tools you don&apos;t need. Subscribe to the ones that solve your problems today — add more when you&apos;re ready.
            </p>
          </div>

          {/* Bundle callout */}
          <div className="flex items-start gap-4 bg-vault-accent/5 border border-vault-accent/30 rounded-2xl px-6 py-5 max-w-2xl mx-auto">
            <Zap className="w-5 h-5 text-vault-accent mt-0.5 shrink-0" />
            <p className="text-vault-text">
              <strong className="text-vault-accent">Subscribe to 3+ bots — get 20% off automatically.</strong>{" "}
              No code needed. Discount applies at checkout when you add your third bot.
            </p>
          </div>

          {/* Pricing table */}
          <div>
            <div className="rounded-2xl border border-vault-border overflow-hidden">
              {/* Header row */}
              <div className="grid grid-cols-4 bg-vault-surface border-b border-vault-border">
                <div className="px-4 sm:px-6 py-4 text-sm font-semibold text-vault-text">Bot</div>
                <div className="px-4 sm:px-6 py-4 text-sm font-semibold text-vault-text-dim border-l border-vault-border">What It Replaces</div>
                <div className="px-4 sm:px-6 py-4 text-sm font-semibold text-vault-text-dim text-center border-l border-vault-border">Starter</div>
                <div className="px-4 sm:px-6 py-4 text-sm font-semibold text-vault-accent text-center border-l border-vault-border">Pro</div>
              </div>
              {pricingBots.map((bot, i) => (
                <div key={bot.name} className={`grid grid-cols-4 border-b border-vault-border last:border-0 ${i % 2 === 0 ? "" : "bg-vault-surface/30"}`}>
                  <div className="px-4 sm:px-6 py-5 text-sm font-bold text-vault-text flex items-center">{bot.name}</div>
                  <div className="px-4 sm:px-6 py-5 text-sm text-vault-text-dim border-l border-vault-border flex items-center">{bot.replaces}</div>
                  <div className="px-4 sm:px-6 py-5 text-center border-l border-vault-border flex flex-col items-center justify-center gap-2">
                    <span className="font-display text-xl font-bold text-vault-text">${bot.starter}<span className="text-sm font-normal text-vault-text-dim">/mo</span></span>
                    <Link href="/auth/signup" className="text-xs text-vault-accent border border-vault-accent/30 px-3 py-1 rounded-full hover:bg-vault-accent/10 transition-colors">
                      Start Free
                    </Link>
                  </div>
                  <div className="px-4 sm:px-6 py-5 text-center border-l border-vault-border flex flex-col items-center justify-center gap-2">
                    <span className="font-display text-xl font-bold text-vault-accent">${bot.pro}<span className="text-sm font-normal text-vault-text-dim">/mo</span></span>
                    <Link href="/auth/signup" className="text-xs bg-vault-accent text-vault-bg px-3 py-1 rounded-full hover:bg-vault-accent-dim transition-colors font-semibold">
                      Start Free
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Starter vs Pro explanation */}
          <div className="card-surface rounded-2xl p-8 max-w-3xl mx-auto">
            <h2 className="font-display text-2xl font-bold mb-4">Starter vs. Pro — what&apos;s the difference?</h2>
            <p className="text-vault-text-dim leading-relaxed">
              <strong className="text-vault-text">Starter</strong> gives you the core AI feature — the output, the history, the basics.{" "}
              <strong className="text-vault-text">Pro</strong> unlocks automation and integration: automated email delivery, real system connections, unlimited usage, and the features that make the bot truly hands-off.
              If you want the bot to run without you thinking about it, that&apos;s Pro.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className="bg-vault-bg rounded-xl p-4 border border-vault-border">
                <h3 className="font-semibold text-vault-text mb-3">Starter includes</h3>
                <ul className="space-y-2">
                  {["Core AI feature", "Usage history", "Basic output", "Free trial included"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-vault-text-dim">
                      <Check className="w-4 h-4 text-vault-green shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-vault-accent/5 rounded-xl p-4 border border-vault-accent/20">
                <h3 className="font-semibold text-vault-accent mb-3">Pro adds</h3>
                <ul className="space-y-2">
                  {["Automated delivery & scheduling", "Real system integrations", "Unlimited usage", "Hands-off operation"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-vault-text-dim">
                      <Check className="w-4 h-4 text-vault-accent shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Free trial table */}
          <div>
            <div className="text-center mb-8">
              <h2 className="font-display text-3xl font-bold mb-2">Every bot comes with a free trial.</h2>
              <p className="text-vault-text-dim">No credit card required to start.</p>
            </div>
            <div className="rounded-2xl border border-vault-border overflow-hidden max-w-2xl mx-auto">
              <div className="grid grid-cols-2 bg-vault-surface border-b border-vault-border">
                <div className="px-6 py-4 text-sm font-semibold text-vault-text">Bot</div>
                <div className="px-6 py-4 text-sm font-semibold text-vault-text-dim border-l border-vault-border">Free Trial</div>
              </div>
              {freeTrials.map((row, i) => (
                <div key={row.bot} className={`grid grid-cols-2 border-b border-vault-border last:border-0 ${i % 2 === 0 ? "" : "bg-vault-surface/30"}`}>
                  <div className="px-6 py-4 text-sm font-semibold text-vault-text">{row.bot}</div>
                  <div className="px-6 py-4 text-sm text-vault-text-dim border-l border-vault-border">
                    <span className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-vault-green shrink-0" /> {row.trial}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center py-8">
            <h2 className="font-display text-3xl font-bold mb-4">Ready to stop doing it manually?</h2>
            <p className="text-vault-text-dim mb-8">Sign up free. No credit card. Start with any bot.</p>
            <Link href="/auth/signup" className="inline-flex items-center gap-2 bg-vault-accent text-vault-bg font-display font-bold px-8 py-4 rounded-xl text-lg hover:bg-vault-accent-dim transition-all hover:scale-105">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-vault-border py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-vault-text-dim text-sm">
          <Link href="/" className="font-display font-bold text-vault-text">
            <span className="text-gradient-cyan">Bot</span> Vault Pro
          </Link>
          <span>© 2026 Bot Vault Pro. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/pricing" className="text-vault-accent">Pricing</Link>
            <Link href="/privacy" className="hover:text-vault-accent transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-vault-accent transition-colors">Terms</Link>
            <a href="mailto:hello@botvaultpro.com" className="hover:text-vault-accent transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
