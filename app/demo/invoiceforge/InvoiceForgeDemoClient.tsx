"use client";
import { useState } from "react";
import Link from "next/link";
import { FileText, Plus, Trash2, ArrowRight, Lock, CheckCircle2, Loader2, Copy, Check } from "lucide-react";

interface Service { description: string; amount: string }

interface InvoiceResult {
  invoice: {
    invoice_number: string;
    subject_line: string;
    cover_note: string;
    payment_terms: string;
    follow_up_note: string;
  };
  totalAmount: number;
  services: Service[];
  clientName: string;
  clientEmail: string;
  businessName: string;
  dueDate: string;
}

const DEMO_KEY = "bvp_invoiceforge_demo_count";
const DEMO_LIMIT = 3;
function getRemaining(): number {
  if (typeof window === "undefined") return DEMO_LIMIT;
  return DEMO_LIMIT - Number(localStorage.getItem(DEMO_KEY) ?? "0");
}
function markUsed() {
  if (typeof window === "undefined") return;
  const used = Number(localStorage.getItem(DEMO_KEY) ?? "0");
  localStorage.setItem(DEMO_KEY, String(used + 1));
}

export default function InvoiceForgeDemoClient() {
  const [businessName, setBusinessName] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [dueDate, setDueDate] = useState("Net 30");
  const [services, setServices] = useState<Service[]>([{ description: "", amount: "" }]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InvoiceResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const remaining = getRemaining();
  const total = services.reduce((s, row) => s + (Number(row.amount) || 0), 0);

  function addService() {
    setServices((prev) => [...prev, { description: "", amount: "" }]);
  }
  function removeService(i: number) {
    setServices((prev) => prev.filter((_, idx) => idx !== i));
  }
  function updateService(i: number, field: keyof Service, value: string) {
    setServices((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  }

  async function handleGenerate() {
    if (!clientName || !services[0]?.description || remaining <= 0) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/demo/invoiceforge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, clientName, clientEmail, services, notes, dueDate }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message ?? data.error ?? "Generation failed."); return; }
      setResult(data);
      markUsed();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyText(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="min-h-screen bg-vault-bg">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-vault-border bg-vault-bg/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-xl tracking-tight">
            <span className="text-gradient-cyan">Bot</span><span className="text-vault-text"> Vault Pro</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/demo" className="text-sm text-vault-text-dim hover:text-vault-text transition-colors hidden sm:block">All Demos</Link>
            <Link href="/auth/signup" className="text-sm bg-vault-accent text-vault-bg font-semibold px-4 py-2 rounded-lg">Get Started Free</Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-400/10 border border-blue-400/20 mb-4">
              <FileText className="w-7 h-7 text-blue-400" />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">Free AI Invoice Generator</h1>
            <p className="text-vault-text-dim text-lg mb-4">Fill in your details. Get a professional invoice with AI-written payment terms in 60 seconds.</p>
            <div className="inline-flex items-center gap-2 text-sm text-vault-green border border-vault-green/30 bg-vault-green/5 px-3 py-1.5 rounded-full">
              <CheckCircle2 className="w-4 h-4" />
              {remaining > 0 ? `${remaining} free ${remaining === 1 ? "invoice" : "invoices"} remaining — no account needed` : "Free demo used"}
            </div>
          </div>

          {!result ? (
            <div className="card-surface rounded-2xl p-8 space-y-5">
              {remaining <= 0 && (
                <div className="bg-vault-accent/5 border border-vault-accent/30 rounded-xl p-5 text-center">
                  <Lock className="w-8 h-8 text-vault-accent mx-auto mb-3" />
                  <p className="font-semibold text-vault-text mb-1">You&apos;ve used your free demo invoices</p>
                  <p className="text-sm text-vault-text-dim mb-4">Create a free account to get 3 more. Subscribe for unlimited.</p>
                  <Link href="/auth/signup" className="inline-flex items-center gap-2 bg-vault-accent text-vault-bg font-bold px-5 py-2.5 rounded-xl text-sm">
                    Get Free Account <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}

              {remaining > 0 && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-vault-text mb-1.5">Your Business Name</label>
                      <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Acme Design Co." className="w-full bg-vault-bg border border-vault-border rounded-xl px-4 py-2.5 text-sm text-vault-text placeholder:text-vault-text-dim focus:outline-none focus:border-vault-accent transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-vault-text mb-1.5">Client Name <span className="text-red-400">*</span></label>
                      <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="John Smith / Acme Corp" className="w-full bg-vault-bg border border-vault-border rounded-xl px-4 py-2.5 text-sm text-vault-text placeholder:text-vault-text-dim focus:outline-none focus:border-vault-accent transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-vault-text mb-1.5">Client Email</label>
                      <input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="client@company.com" className="w-full bg-vault-bg border border-vault-border rounded-xl px-4 py-2.5 text-sm text-vault-text placeholder:text-vault-text-dim focus:outline-none focus:border-vault-accent transition-colors" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-vault-text mb-1.5">Payment Terms</label>
                      <select value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-vault-bg border border-vault-border rounded-xl px-4 py-2.5 text-sm text-vault-text focus:outline-none focus:border-vault-accent transition-colors">
                        {["Net 7", "Net 14", "Net 30", "Net 45", "Due on receipt", "50% upfront, 50% on completion"].map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-vault-text">Services / Line Items <span className="text-red-400">*</span></label>
                      <button onClick={addService} className="flex items-center gap-1 text-xs text-vault-accent hover:opacity-80 transition-opacity">
                        <Plus className="w-3.5 h-3.5" /> Add line
                      </button>
                    </div>
                    <div className="space-y-2">
                      {services.map((s, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input value={s.description} onChange={(e) => updateService(i, "description", e.target.value)} placeholder="Service description" className="flex-1 bg-vault-bg border border-vault-border rounded-xl px-4 py-2.5 text-sm text-vault-text placeholder:text-vault-text-dim focus:outline-none focus:border-vault-accent transition-colors" />
                          <div className="relative w-28 shrink-0">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-vault-text-dim text-sm">$</span>
                            <input value={s.amount} onChange={(e) => updateService(i, "amount", e.target.value)} placeholder="0.00" type="number" min="0" className="w-full bg-vault-bg border border-vault-border rounded-xl pl-7 pr-3 py-2.5 text-sm text-vault-text focus:outline-none focus:border-vault-accent transition-colors" />
                          </div>
                          {services.length > 1 && <button onClick={() => removeService(i)} className="text-vault-text-dim hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>}
                        </div>
                      ))}
                    </div>
                    {total > 0 && (
                      <div className="flex justify-end mt-2">
                        <span className="text-sm font-bold text-vault-text">Total: ${total.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-vault-text mb-1.5">Notes <span className="text-vault-text-dim font-normal">(optional)</span></label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any additional notes for the client..." rows={2} className="w-full bg-vault-bg border border-vault-border rounded-xl px-4 py-3 text-sm text-vault-text placeholder:text-vault-text-dim resize-none focus:outline-none focus:border-vault-accent transition-colors" />
                  </div>

                  {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl">{error}</div>}

                  <button
                    onClick={handleGenerate}
                    disabled={!clientName || !services[0]?.description || loading}
                    className="w-full bg-blue-500 text-white font-display font-bold py-4 rounded-xl text-base hover:bg-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating invoice...</> : <>Generate Invoice Free <ArrowRight className="w-5 h-5" /></>}
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              {/* Invoice preview */}
              <div className="card-surface rounded-2xl p-8 border border-blue-400/20">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-xs text-vault-text-dim uppercase tracking-widest mb-1">Invoice</p>
                    <p className="font-display text-2xl font-bold text-vault-text">{result.invoice.invoice_number}</p>
                    {result.businessName && <p className="text-sm text-vault-text-dim mt-1">{result.businessName}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-vault-text-dim uppercase tracking-widest mb-1">Bill To</p>
                    <p className="font-semibold text-vault-text">{result.clientName}</p>
                    {result.clientEmail && <p className="text-sm text-vault-text-dim">{result.clientEmail}</p>}
                  </div>
                </div>

                <div className="border-t border-vault-border pt-4 mb-4">
                  {result.services.map((s, i) => (
                    <div key={i} className="flex justify-between py-2 text-sm">
                      <span className="text-vault-text-dim">{s.description}</span>
                      <span className="font-semibold text-vault-text">${Number(s.amount).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 border-t border-vault-border mt-2 font-bold">
                    <span className="text-vault-text">Total</span>
                    <span className="text-blue-400 text-lg">${result.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="bg-vault-bg rounded-xl p-4 mb-4">
                  <p className="text-xs text-vault-text-dim uppercase tracking-widest mb-2">Payment Terms</p>
                  <p className="text-sm text-vault-text-dim">{result.invoice.payment_terms}</p>
                </div>
              </div>

              {/* AI cover note */}
              <div className="card-surface rounded-2xl p-6 border border-blue-400/20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-vault-text">AI-Written Cover Note</h3>
                  <button onClick={() => copyText(result.invoice.cover_note, "cover")} className="flex items-center gap-1.5 text-xs text-blue-400 border border-blue-400/30 px-3 py-1 rounded-lg hover:bg-blue-400/10 transition-colors">
                    {copied === "cover" ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                  </button>
                </div>
                <p className="text-sm text-vault-text-dim leading-relaxed">{result.invoice.cover_note}</p>
              </div>

              {/* Follow-up */}
              <div className="card-surface rounded-2xl p-6 border border-yellow-400/20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-vault-text">Follow-Up Reminder (if unpaid)</h3>
                  <button onClick={() => copyText(result.invoice.follow_up_note, "followup")} className="flex items-center gap-1.5 text-xs text-yellow-400 border border-yellow-400/30 px-3 py-1 rounded-lg hover:bg-yellow-400/10 transition-colors">
                    {copied === "followup" ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                  </button>
                </div>
                <p className="text-sm text-vault-text-dim leading-relaxed">{result.invoice.follow_up_note}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => { setResult(null); }} className="flex-1 text-sm text-vault-text-dim border border-vault-border rounded-xl py-3 hover:border-vault-accent hover:text-vault-accent transition-colors">
                  Create another invoice
                </button>
                <Link href="/auth/signup" className="flex-1 flex items-center justify-center gap-2 bg-vault-accent text-vault-bg font-bold rounded-xl py-3 text-sm hover:bg-vault-accent-dim transition-colors">
                  Get unlimited invoices free <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="rounded-2xl border border-blue-400/20 bg-blue-400/5 p-6 text-center">
                <p className="font-semibold text-vault-text mb-1">InvoiceForge does the follow-up for you</p>
                <p className="text-sm text-vault-text-dim mb-4">Subscribe and it tracks when clients open your invoice — and automatically sends reminders on overdue payments. You never have to chase again.</p>
                <Link href="/auth/signup" className="inline-flex items-center gap-2 bg-vault-accent text-vault-bg font-bold px-6 py-2.5 rounded-xl text-sm">
                  Start free — $29/mo after trial <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
