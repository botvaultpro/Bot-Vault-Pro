import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

export const metadata: Metadata = {
  title: "How to Write a Professional Invoice (With Examples) — Bot Vault Pro",
  description:
    "Learn exactly how to write a professional invoice that gets paid faster. Includes required fields, payment terms, follow-up templates, and a free AI invoice generator.",
  keywords: [
    "how to write an invoice",
    "professional invoice",
    "invoice template",
    "invoice payment terms",
    "how to invoice a client",
    "freelance invoice",
    "invoice follow up",
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How to Write a Professional Invoice (With Examples)",
  description:
    "Learn exactly how to write a professional invoice that gets paid faster. Includes required fields, payment terms, and follow-up templates.",
  author: { "@type": "Organization", name: "Bot Vault Pro" },
  publisher: { "@type": "Organization", name: "Bot Vault Pro", url: "https://botvaultpro.com" },
  datePublished: "2026-03-01",
  dateModified: "2026-03-01",
};

const requiredFields = [
  { field: "Invoice number", why: "Unique identifier for tracking and accounting. Start with INV-001 or use the date format INV-2026-03-01." },
  { field: "Issue date", why: "When the invoice was created. Important for payment terms calculation." },
  { field: "Due date", why: "Explicit deadline. Never write 'upon receipt' — always use a specific date. Net 15 or Net 30 is standard." },
  { field: "Your business name + contact info", why: "Full legal name, email, phone. Clients need to know who to pay and how to reach you with questions." },
  { field: "Client name + billing address", why: "Must match the legal entity. 'John Smith' and 'Smith Consulting LLC' are different billing targets." },
  { field: "Line item descriptions", why: "Specific, not vague. 'Website design — 12 hours @ $85/hr' not 'Design work'." },
  { field: "Quantities and rates", why: "Each line item needs a quantity, unit price, and line total. Makes disputes impossible." },
  { field: "Subtotal, tax, and total", why: "Separate these clearly. Show the math. Never just show the final number." },
  { field: "Payment methods accepted", why: "Bank transfer, PayPal, credit card — list exactly what you accept. Remove any friction from paying you." },
  { field: "Late payment terms", why: "Optional but powerful: '1.5% monthly interest after due date' reduces late payments significantly." },
];

const paymentTerms = [
  { term: "Due on receipt", best: "Small jobs under $500 with new clients", risk: "Vague — 'receipt' is undefined. Use a date instead." },
  { term: "Net 7", best: "Ongoing clients, small invoices", risk: "Tight turnaround — only works if your relationship is solid." },
  { term: "Net 15", best: "Most freelance and service work", risk: "Balanced. Standard enough that clients expect it." },
  { term: "Net 30", best: "Enterprise clients, large projects", risk: "Industry standard for B2B. Expect most invoices to hit day 28-30." },
  { term: "50% upfront / 50% on completion", best: "Projects over $2,000", risk: "Protects you from non-payment. Non-negotiable for large engagements." },
];

const mistakes = [
  { mistake: "Vague line items", fix: "Be specific. 'Logo design — 3 concepts + 2 revision rounds' vs 'Design services'." },
  { mistake: "No due date", fix: "Always put a specific calendar date. 'Net 30 from March 1 = Due March 31.'" },
  { mistake: "Missing payment instructions", fix: "Add your bank details, PayPal, or a payment link directly on the invoice." },
  { mistake: "Not following up", fix: "Send a reminder 3 days before due date, the day it's due, and 7 days after. Be consistent, not aggressive." },
  { mistake: "Sending as a Word doc", fix: "Send PDF. Word docs can be edited. PDFs look professional and can't be tampered with." },
  { mistake: "Forgetting late fees", fix: "State your late fee policy on every invoice, even if you never enforce it. It changes behavior." },
];

export default function HowToWriteInvoicePage() {
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
            <Link href="/blog" className="text-sm text-vault-text-dim hover:text-vault-accent transition-colors hidden sm:block">← Blog</Link>
            <Link href="/auth/signup" className="text-sm bg-vault-accent text-vault-bg font-semibold px-4 py-2 rounded-lg hover:bg-vault-accent-dim transition-colors">
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      <article className="pt-24 pb-24 px-4 sm:px-6 max-w-3xl mx-auto">
        <div className="pt-8 mb-10">
          <div className="flex items-center gap-2 text-sm text-vault-text-dim mb-4">
            <Link href="/blog" className="hover:text-vault-accent transition-colors">Blog</Link>
            <span>/</span>
            <span>Invoicing</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4 leading-tight">
            How to Write a Professional Invoice<br />
            <span className="text-blue-400">(That Actually Gets Paid)</span>
          </h1>
          <p className="text-vault-text-dim text-lg leading-relaxed">
            Most unpaid invoices aren&apos;t unpaid because the client is dishonest. They&apos;re unpaid because the invoice was confusing, lacked payment instructions, or nobody followed up. Here&apos;s how to write one that removes every excuse not to pay.
          </p>
        </div>

        {/* Required fields */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-bold mb-6">The 10 required fields on every invoice</h2>
          <p className="text-vault-text-dim mb-6">Skip any of these and you&apos;re giving your client a reason to delay. Every field has a purpose.</p>
          <div className="space-y-4">
            {requiredFields.map((item, i) => (
              <div key={item.field} className="card-surface rounded-xl p-5 flex gap-4">
                <span className="font-display font-bold text-blue-400 text-sm w-6 shrink-0 mt-0.5">{i + 1}.</span>
                <div>
                  <p className="font-display font-bold text-vault-text mb-1">{item.field}</p>
                  <p className="text-vault-text-dim text-sm leading-relaxed">{item.why}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Payment terms */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-bold mb-6">Which payment terms should you use?</h2>
          <p className="text-vault-text-dim mb-6">The right payment terms depend on your client relationship and invoice size. Here&apos;s a quick decision guide:</p>
          <div className="rounded-2xl border border-vault-border overflow-hidden">
            <div className="grid grid-cols-3 bg-vault-surface border-b border-vault-border text-xs font-semibold text-vault-text-dim">
              <div className="px-4 py-3">Term</div>
              <div className="px-4 py-3 border-l border-vault-border">Best for</div>
              <div className="px-4 py-3 border-l border-vault-border">Note</div>
            </div>
            {paymentTerms.map((row, i) => (
              <div key={row.term} className={`grid grid-cols-3 border-b border-vault-border last:border-0 ${i % 2 === 0 ? "" : "bg-vault-surface/30"}`}>
                <div className="px-4 py-4 text-sm font-bold text-blue-400">{row.term}</div>
                <div className="px-4 py-4 text-sm text-vault-text-dim border-l border-vault-border">{row.best}</div>
                <div className="px-4 py-4 text-sm text-vault-text-dim border-l border-vault-border">{row.risk}</div>
              </div>
            ))}
          </div>
          <p className="text-vault-text-dim text-sm mt-4">
            <strong className="text-vault-text">Rule of thumb:</strong> new client or project over $1,000 = get 50% upfront. Always.
          </p>
        </section>

        {/* Example invoice */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-bold mb-6">What a good invoice looks like</h2>
          <div className="bg-vault-surface border border-vault-border rounded-2xl p-6 font-mono text-sm">
            <div className="flex justify-between mb-6">
              <div>
                <p className="font-bold text-vault-text">INVOICE</p>
                <p className="text-vault-text-dim">INV-2026-047</p>
              </div>
              <div className="text-right">
                <p className="text-vault-text-dim">Issue date: March 1, 2026</p>
                <p className="text-blue-400 font-bold">Due: March 31, 2026</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6 mb-6 text-xs">
              <div>
                <p className="text-vault-text-dim uppercase tracking-wider mb-1">From</p>
                <p className="text-vault-text">Sarah Chen Design</p>
                <p className="text-vault-text-dim">sarah@sarahchendesign.com</p>
                <p className="text-vault-text-dim">+1 415 555 0192</p>
              </div>
              <div>
                <p className="text-vault-text-dim uppercase tracking-wider mb-1">Bill To</p>
                <p className="text-vault-text">Acme Corp Ltd</p>
                <p className="text-vault-text-dim">accounts@acmecorp.com</p>
                <p className="text-vault-text-dim">123 Business Ave, NY 10001</p>
              </div>
            </div>
            <div className="border-t border-vault-border pt-4 mb-4">
              <div className="grid grid-cols-4 text-xs text-vault-text-dim uppercase tracking-wider mb-2">
                <span className="col-span-2">Description</span>
                <span className="text-right">Rate</span>
                <span className="text-right">Amount</span>
              </div>
              {[
                { desc: "Brand identity design — logo, palette, type system", rate: "$85/hr × 16hrs", amount: "$1,360.00" },
                { desc: "Brand guidelines document (PDF)", rate: "flat", amount: "$400.00" },
                { desc: "Revision round 2 (per contract)", rate: "$85/hr × 2hrs", amount: "$170.00" },
              ].map((line) => (
                <div key={line.desc} className="grid grid-cols-4 text-xs py-2 border-b border-vault-border/50 last:border-0">
                  <span className="col-span-2 text-vault-text">{line.desc}</span>
                  <span className="text-right text-vault-text-dim">{line.rate}</span>
                  <span className="text-right text-vault-text">{line.amount}</span>
                </div>
              ))}
            </div>
            <div className="text-xs text-right space-y-1 mb-4">
              <div className="flex justify-end gap-8"><span className="text-vault-text-dim">Subtotal</span><span className="text-vault-text">$1,930.00</span></div>
              <div className="flex justify-end gap-8"><span className="text-vault-text-dim">Tax (0%)</span><span className="text-vault-text">$0.00</span></div>
              <div className="flex justify-end gap-8 font-bold text-blue-400 text-sm"><span>Total Due</span><span>$1,930.00</span></div>
            </div>
            <div className="border-t border-vault-border pt-4 text-xs text-vault-text-dim">
              <p className="mb-1"><strong className="text-vault-text">Payment:</strong> Bank transfer to Chase ···4821 | Routing: 021000021</p>
              <p>Late payments accrue 1.5% monthly interest after March 31, 2026.</p>
            </div>
          </div>
        </section>

        {/* Common mistakes */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-bold mb-6">6 invoicing mistakes that delay payment</h2>
          <div className="space-y-4">
            {mistakes.map((item) => (
              <div key={item.mistake} className="card-surface rounded-xl p-5">
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-red-400 font-bold text-sm shrink-0 mt-0.5">✗</span>
                  <p className="font-display font-bold text-vault-text text-sm">{item.mistake}</p>
                </div>
                <div className="flex items-start gap-3 ml-6">
                  <span className="text-vault-green font-bold text-sm shrink-0 mt-0.5">✓</span>
                  <p className="text-vault-text-dim text-sm">{item.fix}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Follow-up section */}
        <section className="mb-12">
          <h2 className="font-display text-2xl font-bold mb-4">The follow-up sequence that gets you paid</h2>
          <p className="text-vault-text-dim mb-6">
            Most people send one invoice and wait. Professionals follow up on a schedule. Here&apos;s the exact sequence that works without damaging the relationship:
          </p>
          <div className="space-y-3">
            {[
              { day: "Day 0", action: "Send invoice with a warm, professional cover note. Confirm receipt." },
              { day: "Day −3", action: "Brief reminder: 'Just flagging that INV-047 ($1,930) is due in 3 days. Let me know if you need anything.'" },
              { day: "Day 0 (due)", action: "If unpaid: 'INV-047 was due today. Please let me know the status or if there's an issue I can help resolve.'" },
              { day: "Day +7", action: "Firmer: 'INV-047 is now 7 days overdue. Please process payment by [specific date] to avoid a late fee.'" },
              { day: "Day +14", action: "Final notice: 'This is a final reminder before I engage collections. Payment of $1,930 + $28.95 late fee is now due.'" },
            ].map((step) => (
              <div key={step.day} className="flex gap-4 card-surface rounded-xl p-4">
                <span className="font-mono text-xs text-blue-400 font-bold w-16 shrink-0 mt-0.5">{step.day}</span>
                <p className="text-vault-text-dim text-sm">{step.action}</p>
              </div>
            ))}
          </div>
          <p className="text-vault-text-dim text-sm mt-4 italic">
            This sequence has a 94%+ collection rate before day +14. Consistency is the key — not tone.
          </p>
        </section>

        {/* CTA */}
        <div className="bg-blue-400/5 border border-blue-400/20 rounded-2xl p-8 text-center mb-10">
          <h2 className="font-display text-2xl font-bold mb-3">Stop writing invoices manually</h2>
          <p className="text-vault-text-dim mb-6 max-w-xl mx-auto">
            InvoiceForge generates professional invoices, sends them for you, tracks when clients open them, and fires automatic reminders on overdue payments. You never have to think about it.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/demo/invoiceforge" className="inline-flex items-center justify-center gap-2 bg-blue-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-600 transition-all">
              Try Free Invoice Generator <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/auth/signup" className="inline-flex items-center justify-center gap-2 border border-vault-border text-vault-text-dim px-6 py-3 rounded-xl hover:border-vault-accent hover:text-vault-accent transition-all">
              Start Full Trial — $29/mo
            </Link>
          </div>
        </div>

        {/* Checklist */}
        <section>
          <h2 className="font-display text-2xl font-bold mb-4">Invoice checklist before you hit send</h2>
          <div className="card-surface rounded-2xl p-6">
            <ul className="space-y-2">
              {[
                "Invoice number assigned",
                "Issue date and due date both specified (not 'upon receipt')",
                "Your full business name and contact info",
                "Client's correct legal entity name and billing address",
                "All line items are specific (not 'design work')",
                "Quantities, rates, and line totals all match",
                "Subtotal, tax, and total clearly separated",
                "Payment method instructions included",
                "Late fee policy stated",
                "Saved as PDF (not Word)",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-vault-text-dim">
                  <Check className="w-4 h-4 text-vault-green shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </article>

      <footer className="border-t border-vault-border py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-vault-text-dim text-sm">
          <Link href="/" className="font-display font-bold text-vault-text"><span className="text-gradient-cyan">Bot</span> Vault Pro</Link>
          <span>© 2026 Bot Vault Pro. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/blog" className="hover:text-vault-accent transition-colors">Blog</Link>
            <Link href="/demo" className="hover:text-vault-accent transition-colors">Demos</Link>
            <Link href="/pricing" className="hover:text-vault-accent transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
