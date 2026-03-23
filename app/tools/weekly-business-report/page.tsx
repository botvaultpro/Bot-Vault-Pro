import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart2, Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Free Weekly Business Report — WeeklyPulse Demo",
  description:
    "Get a plain-English weekly business health report. Enter your revenue, customers, and hours — AI calculates your health score, trend analysis, and #1 priority. Free, no account needed.",
  keywords: [
    "weekly business report",
    "business health report",
    "small business analytics",
    "business performance report",
    "weekly business review",
    "business kpi tracker",
    "solopreneur analytics",
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "WeeklyPulse — Free Business Health Report",
  description: "Enter your weekly numbers. Get a plain-English business health report with trend analysis and your #1 priority for next week.",
  url: "https://botvaultpro.com/tools/weekly-business-report",
  applicationCategory: "BusinessApplication",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: "3 free reports per day" },
};

const metrics = [
  { name: "Health Score", desc: "An overall 1-100 score with one-sentence explanation of what's driving it." },
  { name: "Profit Margin", desc: "Your net margin %, contextualized — is 18% margin good or bad for your business type?" },
  { name: "Revenue Per Hour", desc: "How much you earned per hour of work this week. Tracks whether you're working smarter over time." },
  { name: "Net Customer Change", desc: "New customers minus churned customers. The single most predictive metric for next quarter's revenue." },
  { name: "Lead Conversion Rate", desc: "What % of your new leads became customers. Tells you if your sales process is working." },
  { name: "Trend Analysis", desc: "2-3 specific signals — what's improving, what's concerning — based on week-over-week patterns." },
  { name: "Priority Action", desc: "One single concrete action to take next week. Not a list — one thing." },
  { name: "30-Second Summary", desc: "The full picture in 2-3 sentences. For when you're too busy to read the whole report." },
];

const whoItsFor = [
  {
    role: "Freelancers",
    before: "Check bank account once a month to see if things are ok",
    after: "Get a Monday report showing revenue trend, hours efficiency, and whether client pipeline is healthy",
  },
  {
    role: "E-commerce owners",
    before: "Log into 3 different dashboards and manually compare numbers",
    after: "Enter weekly numbers once — get a unified health score with trend context",
  },
  {
    role: "Service business owners",
    before: "Notice customer decline 6 weeks after it started",
    after: "Get alerted week 2 when churn starts outpacing acquisition",
  },
  {
    role: "Side hustlers",
    before: "No idea if the side hustle is growing or just feeling busy",
    after: "Clear data on whether revenue per hour is improving — the only number that matters",
  },
];

export default function WeeklyBusinessReportPage() {
  return (
    <div className="min-h-screen bg-vault-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-vault-border bg-vault-bg/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-xl tracking-tight">
            <span className="text-gradient-cyan">Bot</span>
            <span className="text-vault-text"> Vault Pro</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/demo/weeklypulse" className="text-sm text-vault-text-dim hover:text-vault-accent transition-colors hidden sm:block">Try Free Demo</Link>
            <Link href="/auth/signup" className="text-sm bg-vault-accent text-vault-bg font-semibold px-4 py-2 rounded-lg">Start Free</Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-24 px-4 sm:px-6 max-w-4xl mx-auto space-y-20">
        {/* Hero */}
        <div className="text-center pt-8">
          <div className="inline-flex items-center gap-2 bg-purple-400/10 border border-purple-400/20 rounded-full px-4 py-1.5 text-sm text-purple-400 mb-6">
            <BarChart2 className="w-4 h-4" /> Free Weekly Business Report
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-6 leading-tight">
            Know If Your Business Is Healthy<br />
            <span className="text-purple-400">Before Problems Become Visible</span>
          </h1>
          <p className="text-vault-text-dim text-lg max-w-2xl mx-auto mb-8">
            Enter your weekly numbers. Get a plain-English health report with a 1-100 score, trend analysis, and one concrete priority — in under 60 seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/demo/weeklypulse"
              className="inline-flex items-center justify-center gap-2 bg-purple-500 text-white font-display font-bold px-8 py-4 rounded-xl text-lg hover:bg-purple-600 transition-all hover:scale-105"
            >
              Get Your Free Report <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <p className="text-vault-text-dim text-sm mt-4">No account · No credit card · 3 free reports per day</p>
        </div>

        {/* The problem */}
        <div className="card-surface rounded-2xl p-8">
          <h2 className="font-display text-2xl font-bold mb-4">Most small business owners are flying blind</h2>
          <p className="text-vault-text-dim leading-relaxed mb-4">
            Here&apos;s the typical pattern: revenue dips for 3 weeks. The owner notices when the bank account feels light. By then, the trend has been building for a month. The fix takes another month to show results. That&apos;s a quarter lost.
          </p>
          <p className="text-vault-text-dim leading-relaxed mb-4">
            The problem isn&apos;t lack of data — it&apos;s that nobody is analyzing it weekly and telling you what it means in plain English.
          </p>
          <p className="text-vault-text-dim leading-relaxed">
            WeeklyPulse fixes this by turning your raw numbers into a structured health report every Monday morning — whether you ask for it or not.
          </p>
        </div>

        {/* What's in the report */}
        <div>
          <h2 className="font-display text-3xl font-bold text-center mb-10">What&apos;s in every report</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {metrics.map((m) => (
              <div key={m.name} className="card-surface rounded-xl p-5">
                <p className="font-display font-bold text-vault-text mb-1">{m.name}</p>
                <p className="text-vault-text-dim text-sm leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Before/after */}
        <div>
          <h2 className="font-display text-3xl font-bold text-center mb-10">Before and after</h2>
          <div className="space-y-4">
            {whoItsFor.map((item) => (
              <div key={item.role} className="card-surface rounded-xl p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-mono text-purple-400 mb-1">{item.role}</p>
                </div>
                <div>
                  <p className="text-xs text-red-400 font-semibold mb-1">Before</p>
                  <p className="text-vault-text-dim text-sm">{item.before}</p>
                </div>
                <div>
                  <p className="text-xs text-vault-green font-semibold mb-1">After WeeklyPulse</p>
                  <p className="text-vault-text-dim text-sm">{item.after}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demo CTA */}
        <div className="bg-purple-400/5 border border-purple-400/20 rounded-2xl p-8 text-center">
          <h2 className="font-display text-3xl font-bold mb-4">Try it right now</h2>
          <p className="text-vault-text-dim mb-6 max-w-xl mx-auto">
            Enter this week&apos;s numbers. Get a full health report in 30 seconds. Free, no account required.
          </p>
          <Link
            href="/demo/weeklypulse"
            className="inline-flex items-center gap-2 bg-purple-500 text-white font-display font-bold px-8 py-4 rounded-xl text-lg hover:bg-purple-600 transition-all hover:scale-105"
          >
            Generate Free Report <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Full version */}
        <div className="card-surface rounded-2xl p-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="flex-1">
              <p className="text-sm font-mono text-purple-400 uppercase tracking-wider mb-2">WeeklyPulse — $19/mo</p>
              <h2 className="font-display text-2xl font-bold mb-3">Make it automatic</h2>
              <p className="text-vault-text-dim leading-relaxed mb-4">
                The free demo generates one report when you ask. WeeklyPulse Pro sends it to your inbox every Monday — automatically, without you logging in or entering data again.
              </p>
              <ul className="space-y-2 mb-6">
                {[
                  "Automated Monday morning delivery to your inbox",
                  "Trend analysis comparing each week to the last 4",
                  "Health score history — see your business trajectory",
                  "Integrates with your real revenue sources",
                  "Alert when any metric drops more than 15% week-over-week",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-vault-text-dim">
                    <Check className="w-4 h-4 text-vault-green shrink-0" /> {item}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup" className="inline-flex items-center gap-2 bg-vault-accent text-vault-bg font-bold px-6 py-3 rounded-xl hover:bg-vault-accent-dim transition-all">
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="w-full sm:w-48 shrink-0 bg-vault-bg rounded-xl p-4 border border-vault-border text-center">
              <p className="text-vault-text-dim text-xs mb-2">WeeklyPulse</p>
              <p className="font-display text-3xl font-bold text-purple-400">$19</p>
              <p className="text-vault-text-dim text-sm">/month</p>
              <p className="text-xs text-vault-text-dim mt-2">Free trial included</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-vault-border py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-vault-text-dim text-sm">
          <Link href="/" className="font-display font-bold text-vault-text"><span className="text-gradient-cyan">Bot</span> Vault Pro</Link>
          <span>© 2026 Bot Vault Pro. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/pricing" className="hover:text-vault-accent transition-colors">Pricing</Link>
            <Link href="/demo" className="hover:text-vault-accent transition-colors">Demos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
