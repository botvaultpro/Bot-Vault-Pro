import Link from "next/link";
import { ArrowRight, Check, FileText, Clock, DollarSign, Bell } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free AI Invoice Generator — Create Professional Invoices in Seconds",
  description:
    "Generate professional invoices instantly with AI. Add line items, auto-calculate totals, write follow-up reminders, and collect payments faster. Free to try — no account required.",
  keywords: [
    "ai invoice generator",
    "free invoice generator",
    "invoice maker",
    "professional invoice template",
    "create invoice online",
    "invoice follow up email",
    "overdue invoice reminder",
    "freelance invoice generator",
  ],
};

const features = [
  {
    icon: FileText,
    title: "Professional invoices in seconds",
    body: "Enter your line items, rates, and client details. AI formats a clean, professional invoice instantly — no templates to fiddle with.",
  },
  {
    icon: DollarSign,
    title: "Auto-calculated totals",
    body: "Subtotals, tax, discounts, and final totals are calculated automatically. No spreadsheets, no errors, no embarrassing math mistakes.",
  },
  {
    icon: Clock,
    title: "Payment terms and due dates",
    body: "Set Net 15, Net 30, or custom terms. The invoice includes clear payment instructions so clients know exactly what to pay and when.",
  },
  {
    icon: Bell,
    title: "AI-written follow-up reminders",
    body: "Get a ready-to-send follow-up email for every invoice — professional enough to preserve the relationship, firm enough to get paid.",
  },
];

const useCases = [
  { role: "Freelancers", problem: "Spend too long writing invoices", solution: "Generate in 60 seconds, send immediately" },
  { role: "Consultants", problem: "Forget to follow up on overdue invoices", solution: "AI writes the reminder — you just hit send" },
  { role: "Service businesses", problem: "Generic invoice templates look unprofessional", solution: "Clean, branded invoices that look like you hired a designer" },
  { role: "Side hustlers", problem: "Don't know what payment terms to use", solution: "AI sets standard terms and explains them to your client" },
];

const faqs = [
  {
    q: "Is this actually free?",
    a: "Yes. The demo is completely free — no account, no credit card. You get 3 free invoice generations per day. For unlimited invoices, auto-sending, and payment tracking, upgrade to InvoiceForge ($29/mo).",
  },
  {
    q: "What does the AI actually do?",
    a: "It takes your line items and client details, formats a professional invoice, calculates all totals accurately, writes clear payment instructions, and generates a polished follow-up reminder email.",
  },
  {
    q: "Can I export or download the invoice?",
    a: "In the demo you can copy the invoice text. InvoiceForge Pro generates PDF invoices, sends them directly to clients via email, and tracks when they're opened.",
  },
  {
    q: "What if my client doesn't pay?",
    a: "InvoiceForge automatically sends overdue reminders on your schedule — 7 days, 14 days, 30 days overdue. You set it once and never think about it again.",
  },
  {
    q: "Do I need accounting software?",
    a: "No. InvoiceForge handles the invoice creation, sending, and follow-up cycle end-to-end. It's not accounting software — it's an automation that handles the most painful part: getting paid.",
  },
];

export default function AIInvoiceGeneratorPage() {
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
            <Link href="/demo/invoiceforge" className="text-sm text-vault-text-dim hover:text-vault-accent transition-colors hidden sm:block">
              Try Free Demo
            </Link>
            <Link href="/auth/signup" className="text-sm bg-vault-accent text-vault-bg font-semibold px-4 py-2 rounded-lg hover:bg-vault-accent-dim transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-20">

          {/* Hero */}
          <div className="text-center pt-8">
            <div className="inline-flex items-center gap-2 bg-blue-400/10 border border-blue-400/20 rounded-full px-4 py-1.5 text-sm text-blue-400 mb-6">
              <FileText className="w-4 h-4" /> Free AI Invoice Generator
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-6 leading-tight">
              Stop Losing Money to<br />
              <span className="text-blue-400">Slow Invoicing and Late Payments</span>
            </h1>
            <p className="text-vault-text-dim text-lg max-w-2xl mx-auto mb-8">
              Generate a professional invoice in 60 seconds. Get an AI-written follow-up reminder ready to send. No templates, no spreadsheets, no chasing clients manually.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/demo/invoiceforge"
                className="inline-flex items-center justify-center gap-2 bg-blue-500 text-white font-display font-bold px-8 py-4 rounded-xl text-lg hover:bg-blue-600 transition-all hover:scale-105"
              >
                Generate Free Invoice <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/auth/signup"
                className="inline-flex items-center justify-center gap-2 border border-vault-border text-vault-text-dim px-8 py-4 rounded-xl text-lg hover:border-vault-accent hover:text-vault-accent transition-all"
              >
                Start Full Trial
              </Link>
            </div>
            <p className="text-vault-text-dim text-sm mt-4">No account required · 3 free invoices per day</p>
          </div>

          {/* The real problem */}
          <div className="card-surface rounded-2xl p-8">
            <h2 className="font-display text-2xl font-bold mb-4">The invoicing problem nobody talks about</h2>
            <p className="text-vault-text-dim leading-relaxed mb-4">
              You did the work. You sent the invoice. And then... nothing. Two weeks later you&apos;re awkwardly emailing &ldquo;just checking in on the invoice I sent...&rdquo; — because you didn&apos;t want to sound pushy, but you also really need to get paid.
            </p>
            <p className="text-vault-text-dim leading-relaxed mb-4">
              The average freelancer or small business owner has <strong className="text-vault-text">3-4 overdue invoices at any given time</strong>. That&apos;s money you&apos;ve already earned sitting in someone else&apos;s account.
            </p>
            <p className="text-vault-text-dim leading-relaxed">
              The fix isn&apos;t working harder. It&apos;s automating the follow-up so it happens whether you remember or not.
            </p>
          </div>

          {/* Features */}
          <div>
            <h2 className="font-display text-3xl font-bold text-center mb-10">What the AI invoice generator does</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.title} className="card-surface rounded-xl p-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <h3 className="font-display font-bold mb-2">{f.title}</h3>
                    <p className="text-vault-text-dim text-sm leading-relaxed">{f.body}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Use cases */}
          <div>
            <h2 className="font-display text-3xl font-bold text-center mb-10">Who this is for</h2>
            <div className="space-y-4">
              {useCases.map((u) => (
                <div key={u.role} className="card-surface rounded-xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-mono text-blue-400 mb-1">{u.role}</p>
                    <p className="text-vault-text-dim text-sm">{u.problem}</p>
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-2">
                    <Check className="w-4 h-4 text-vault-green shrink-0" />
                    <p className="text-vault-text text-sm">{u.solution}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Demo CTA */}
          <div className="bg-blue-400/5 border border-blue-400/20 rounded-2xl p-8 text-center">
            <h2 className="font-display text-3xl font-bold mb-4">Try it right now — free</h2>
            <p className="text-vault-text-dim mb-6 max-w-xl mx-auto">
              Enter your line items and client info. Get a professional invoice + follow-up email in under 60 seconds. No account required.
            </p>
            <Link
              href="/demo/invoiceforge"
              className="inline-flex items-center gap-2 bg-blue-500 text-white font-display font-bold px-8 py-4 rounded-xl text-lg hover:bg-blue-600 transition-all hover:scale-105"
            >
              Generate Your Invoice Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Upgrade pitch */}
          <div className="card-surface rounded-2xl p-8">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="flex-1">
                <p className="text-sm font-mono text-blue-400 uppercase tracking-wider mb-2">InvoiceForge — $29/mo</p>
                <h2 className="font-display text-2xl font-bold mb-3">From &ldquo;generate&rdquo; to &ldquo;automatically paid&rdquo;</h2>
                <p className="text-vault-text-dim leading-relaxed mb-4">
                  The free demo generates invoices. InvoiceForge sends them, tracks when clients open them, and follows up automatically when they&apos;re overdue — without you lifting a finger.
                </p>
                <ul className="space-y-2 mb-6">
                  {[
                    "Unlimited invoices, sent directly from the app",
                    "Email open tracking — know when clients read it",
                    "Automatic overdue reminders on your schedule",
                    "Invoice history and payment status dashboard",
                    "PDF generation and custom branding",
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
                <p className="text-vault-text-dim text-xs mb-2">InvoiceForge</p>
                <p className="font-display text-3xl font-bold text-blue-400">$29</p>
                <p className="text-vault-text-dim text-sm">/month</p>
                <p className="text-xs text-vault-text-dim mt-2">Free trial included</p>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="font-display text-3xl font-bold text-center mb-10">Frequently asked questions</h2>
            <div className="space-y-4 max-w-2xl mx-auto">
              {faqs.map((faq) => (
                <div key={faq.q} className="card-surface rounded-xl p-6">
                  <h3 className="font-display font-bold mb-2">{faq.q}</h3>
                  <p className="text-vault-text-dim text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold mb-4">Get paid faster, starting today.</h2>
            <p className="text-vault-text-dim mb-8">3 free invoice generations. No account needed.</p>
            <Link href="/demo/invoiceforge" className="inline-flex items-center gap-2 bg-vault-accent text-vault-bg font-display font-bold px-8 py-4 rounded-xl text-lg hover:bg-vault-accent-dim transition-all hover:scale-105">
              Try the Free Invoice Generator <ArrowRight className="w-5 h-5" />
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
            <Link href="/pricing" className="hover:text-vault-accent transition-colors">Pricing</Link>
            <Link href="/demo" className="hover:text-vault-accent transition-colors">Demos</Link>
            <Link href="/privacy" className="hover:text-vault-accent transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-vault-accent transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
