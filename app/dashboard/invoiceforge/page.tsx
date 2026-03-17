"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FileText, Plus, Trash2, Loader2, Printer, Lock, Download } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

type LineItem = { description: string; quantity: number; unitPrice: number };
type Invoice = {
  id: string;
  invoice_number: string;
  client_name: string;
  client_company: string;
  document_type: string;
  issue_date: string;
  due_date: string;
  total_amount: number;
  status: string;
  currency: string;
  created_at: string;
};

const CURRENCIES = ["USD", "EUR", "GBP", "CAD"];
const STATUS_COLORS: Record<string, string> = {
  draft: "bg-vault-border text-vault-text-dim",
  sent: "bg-blue-400/10 text-blue-400 border border-blue-400/20",
  paid: "bg-vault-green/10 text-vault-green border border-vault-green/20",
  overdue: "bg-red-400/10 text-red-400 border border-red-400/20",
};

export default function InvoiceForgePage() {
  const [view, setView] = useState<"form" | "preview" | "list">("list");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generatingScope, setGeneratingScope] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [generatedInvoice, setGeneratedInvoice] = useState<{ id: string; invoiceNumber: string; total: number } | null>(null);

  const [form, setForm] = useState({
    businessName: "", businessAddress: "", businessEmail: "", businessPhone: "", logoUrl: "",
    clientName: "", clientCompany: "", clientAddress: "", clientEmail: "",
    documentType: "invoice" as "invoice" | "proposal",
    invoiceNumber: "", issueDate: new Date().toISOString().split("T")[0], dueDate: "",
    lineItems: [{ description: "", quantity: 1, unitPrice: 0 }] as LineItem[],
    taxRate: 0, notes: "", currency: "USD", aiScope: "",
  });

  useEffect(() => { loadInvoices(); }, []);

  async function loadInvoices() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("invoices").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setInvoices(data ?? []);
  }

  function updateLineItem(idx: number, field: keyof LineItem, value: string | number) {
    setForm((f) => {
      const items = [...f.lineItems];
      items[idx] = { ...items[idx], [field]: value };
      return { ...f, lineItems: items };
    });
  }

  function addLine() {
    setForm((f) => ({ ...f, lineItems: [...f.lineItems, { description: "", quantity: 1, unitPrice: 0 }] }));
  }

  function removeLine(idx: number) {
    setForm((f) => ({ ...f, lineItems: f.lineItems.filter((_, i) => i !== idx) }));
  }

  const subtotal = form.lineItems.reduce((s, li) => s + li.quantity * li.unitPrice, 0);
  const taxAmount = subtotal * (form.taxRate / 100);
  const total = subtotal + taxAmount;

  async function generateScope() {
    setGeneratingScope(true);
    try {
      const res = await fetch("/api/bots/invoiceforge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_scope",
          invoiceData: {
            clientName: form.clientName,
            clientCompany: form.clientCompany,
            lineItems: form.lineItems,
          },
        }),
      });
      const data = await res.json();
      if (data.scope) setForm((f) => ({ ...f, aiScope: data.scope }));
    } catch {}
    setGeneratingScope(false);
  }

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    setBlocked(false);
    try {
      const res = await fetch("/api/bots/invoiceforge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save", invoiceData: form }),
      });
      const data = await res.json();
      if (res.status === 403) { setBlocked(true); return; }
      if (!res.ok) { setError(data.error ?? "Failed."); return; }
      setGeneratedInvoice(data);
      setView("preview");
      loadInvoices();
    } catch {
      setError("Network error.");
    } finally {
      setGenerating(false);
    }
  }

  async function updateStatus(id: string, status: string) {
    await fetch("/api/bots/invoiceforge", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    loadInvoices();
  }

  const filteredInvoices = filterStatus === "all" ? invoices : invoices.filter((i) => i.status === filterStatus);
  const totalOutstanding = invoices.filter((i) => i.status === "sent").reduce((s, i) => s + (i.total_amount ?? 0), 0);
  const totalPaidThisMonth = invoices.filter((i) => {
    const d = new Date(i.created_at);
    const now = new Date();
    return i.status === "paid" && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((s, i) => s + (i.total_amount ?? 0), 0);
  const overdueCount = invoices.filter((i) => i.status === "overdue").length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <style>{`@media print { .no-print { display: none !important; } }`}</style>

      <div className="no-print flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold flex items-center gap-3">
            <FileText className="w-7 h-7 text-blue-400" /> InvoiceForge
          </h1>
          <p className="text-vault-text-dim mt-1">Create professional invoices and proposals with AI.</p>
        </div>
        <div className="flex gap-2">
          {(["list", "form"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={clsx("px-4 py-2 rounded-lg text-sm font-medium transition-colors", view === v ? "bg-vault-accent text-vault-bg" : "border border-vault-border text-vault-text-dim hover:border-vault-accent hover:text-vault-accent")}>
              {v === "list" ? "All Invoices" : "New Invoice"}
            </button>
          ))}
        </div>
      </div>

      {blocked && (
        <div className="no-print rounded-xl border border-blue-400/30 bg-blue-400/5 px-5 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Lock className="w-6 h-6 text-blue-400 shrink-0" />
          <div>
            <p className="font-semibold text-vault-text">You&apos;ve used your 3 free InvoiceForge invoices.</p>
            <p className="text-sm text-vault-text-dim">Subscribe to create unlimited invoices.</p>
          </div>
          <Link href="/dashboard/billing" className="sm:ml-auto bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-400/90 transition-colors whitespace-nowrap">
            Subscribe Now
          </Link>
        </div>
      )}

      {view === "list" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="card-surface rounded-xl p-4"><p className="text-xs text-vault-text-dim mb-1">Outstanding</p><p className="font-display text-2xl font-bold text-blue-400">${totalOutstanding.toLocaleString()}</p></div>
            <div className="card-surface rounded-xl p-4"><p className="text-xs text-vault-text-dim mb-1">Paid This Month</p><p className="font-display text-2xl font-bold text-vault-green">${totalPaidThisMonth.toLocaleString()}</p></div>
            <div className="card-surface rounded-xl p-4"><p className="text-xs text-vault-text-dim mb-1">Overdue</p><p className="font-display text-2xl font-bold text-red-400">{overdueCount}</p></div>
          </div>

          <div className="flex items-center gap-2">
            {["all", "draft", "sent", "paid", "overdue"].map((s) => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={clsx("px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors", filterStatus === s ? "bg-vault-accent text-vault-bg" : "border border-vault-border text-vault-text-dim hover:border-vault-accent")}>
                {s}
              </button>
            ))}
          </div>

          {filteredInvoices.length === 0 ? (
            <div className="card-surface rounded-2xl p-10 text-center">
              <FileText className="w-10 h-10 text-vault-text-dim mx-auto mb-3" />
              <p className="text-vault-text-dim">No invoices yet. Create your first one.</p>
              <button onClick={() => setView("form")} className="mt-4 bg-vault-accent text-vault-bg px-4 py-2 rounded-lg text-sm font-bold hover:bg-vault-accent/90 transition-colors">
                Create Invoice
              </button>
            </div>
          ) : (
            <div className="card-surface rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-vault-border">
                  {["Invoice #", "Client", "Amount", "Status", "Due Date", "Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-mono text-vault-text-dim uppercase tracking-wider">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-vault-border/50 hover:bg-vault-border/20">
                      <td className="px-4 py-3 font-mono text-vault-accent">{inv.invoice_number}</td>
                      <td className="px-4 py-3 text-vault-text">{inv.client_name}{inv.client_company && <span className="text-vault-text-dim"> · {inv.client_company}</span>}</td>
                      <td className="px-4 py-3 font-bold">{inv.currency} {(inv.total_amount ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={clsx("text-xs font-semibold px-2 py-1 rounded-full capitalize", STATUS_COLORS[inv.status])}>{inv.status}</span>
                      </td>
                      <td className="px-4 py-3 text-vault-text-dim">{inv.due_date ?? "—"}</td>
                      <td className="px-4 py-3">
                        <select value={inv.status} onChange={(e) => updateStatus(inv.id, e.target.value)}
                          className="bg-vault-bg border border-vault-border rounded-lg px-2 py-1 text-xs text-vault-text focus:outline-none">
                          {["draft", "sent", "paid", "overdue"].map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {view === "form" && (
        <div className="card-surface rounded-2xl p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-display font-bold text-lg">Your Business</h3>
              {[
                { field: "businessName", label: "Business Name", placeholder: "Acme Agency" },
                { field: "businessAddress", label: "Address", placeholder: "123 Main St, City, State" },
                { field: "businessEmail", label: "Email", placeholder: "hello@yourbusiness.com" },
                { field: "businessPhone", label: "Phone", placeholder: "+1 (555) 000-0000" },
              ].map(({ field, label, placeholder }) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-vault-text mb-1">{label}</label>
                  <input type="text" value={form[field as keyof typeof form] as string}
                    onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm text-vault-text placeholder:text-vault-text-dim focus:outline-none focus:border-vault-accent" />
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <h3 className="font-display font-bold text-lg">Client</h3>
              {[
                { field: "clientName", label: "Client Name*", placeholder: "John Smith" },
                { field: "clientCompany", label: "Company", placeholder: "Client Co." },
                { field: "clientAddress", label: "Address", placeholder: "456 Oak Ave" },
                { field: "clientEmail", label: "Email", placeholder: "client@example.com" },
              ].map(({ field, label, placeholder }) => (
                <div key={field}>
                  <label className="block text-xs font-medium text-vault-text mb-1">{label}</label>
                  <input type="text" value={form[field as keyof typeof form] as string}
                    onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm text-vault-text placeholder:text-vault-text-dim focus:outline-none focus:border-vault-accent" />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-vault-text mb-1">Document Type</label>
              <select value={form.documentType} onChange={(e) => setForm((f) => ({ ...f, documentType: e.target.value as "invoice" | "proposal" }))}
                className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm text-vault-text focus:outline-none focus:border-vault-accent">
                <option value="invoice">Invoice</option>
                <option value="proposal">Project Proposal</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-vault-text mb-1">Invoice #</label>
              <input type="text" value={form.invoiceNumber} onChange={(e) => setForm((f) => ({ ...f, invoiceNumber: e.target.value }))}
                placeholder="Auto-generated" className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm text-vault-text placeholder:text-vault-text-dim focus:outline-none focus:border-vault-accent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-vault-text mb-1">Issue Date</label>
              <input type="date" value={form.issueDate} onChange={(e) => setForm((f) => ({ ...f, issueDate: e.target.value }))}
                className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm text-vault-text focus:outline-none focus:border-vault-accent" />
            </div>
            <div>
              <label className="block text-xs font-medium text-vault-text mb-1">Due Date</label>
              <input type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm text-vault-text focus:outline-none focus:border-vault-accent" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display font-bold text-lg">Line Items</h3>
              <button onClick={addLine} className="flex items-center gap-1 text-xs text-vault-accent hover:text-vault-accent/80">
                <Plus className="w-3.5 h-3.5" /> Add Item
              </button>
            </div>
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-xs font-mono text-vault-text-dim px-2">
                <span className="col-span-6">Description</span><span className="col-span-2">Qty</span><span className="col-span-3">Unit Price</span>
              </div>
              {form.lineItems.map((li, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <input className="col-span-6 bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm text-vault-text focus:outline-none focus:border-vault-accent"
                    value={li.description} onChange={(e) => updateLineItem(idx, "description", e.target.value)} placeholder="Service or product..." />
                  <input type="number" className="col-span-2 bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm text-vault-text focus:outline-none focus:border-vault-accent"
                    value={li.quantity} onChange={(e) => updateLineItem(idx, "quantity", parseFloat(e.target.value) || 0)} />
                  <input type="number" className="col-span-3 bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm text-vault-text focus:outline-none focus:border-vault-accent"
                    value={li.unitPrice} onChange={(e) => updateLineItem(idx, "unitPrice", parseFloat(e.target.value) || 0)} />
                  <button onClick={() => removeLine(idx)} className="col-span-1 flex justify-center text-vault-text-dim hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-vault-text mb-1">Currency</label>
              <select value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm text-vault-text focus:outline-none focus:border-vault-accent">
                {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-vault-text mb-1">Tax Rate (%)</label>
              <input type="number" value={form.taxRate} onChange={(e) => setForm((f) => ({ ...f, taxRate: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm text-vault-text focus:outline-none focus:border-vault-accent" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-vault-text mb-1">Notes / Payment Terms</label>
              <input type="text" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="e.g. Payment due within 30 days..." className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm text-vault-text placeholder:text-vault-text-dim focus:outline-none focus:border-vault-accent" />
            </div>
          </div>

          {form.documentType === "proposal" && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-vault-text">AI Project Scope <span className="text-vault-text-dim">(Pro only)</span></label>
                <button onClick={generateScope} disabled={generatingScope} className="flex items-center gap-1 text-xs bg-vault-accent text-vault-bg px-3 py-1.5 rounded-lg hover:bg-vault-accent/90 disabled:opacity-50">
                  {generatingScope ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                  Generate with AI
                </button>
              </div>
              <textarea value={form.aiScope} onChange={(e) => setForm((f) => ({ ...f, aiScope: e.target.value }))}
                rows={4} placeholder="AI-generated scope will appear here, or type your own..."
                className="w-full bg-vault-bg border border-vault-border rounded-xl px-4 py-3 text-sm text-vault-text placeholder:text-vault-text-dim focus:outline-none focus:border-vault-accent resize-none" />
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-vault-border">
            <div className="text-right space-y-1">
              <p className="text-sm text-vault-text-dim">Subtotal: <span className="text-vault-text font-medium">{form.currency} {subtotal.toFixed(2)}</span></p>
              {form.taxRate > 0 && <p className="text-sm text-vault-text-dim">Tax ({form.taxRate}%): <span className="text-vault-text font-medium">{form.currency} {taxAmount.toFixed(2)}</span></p>}
              <p className="text-lg font-display font-bold text-vault-text">Total: {form.currency} {total.toFixed(2)}</p>
            </div>
            <button onClick={handleGenerate} disabled={generating || !form.clientName}
              className="flex items-center gap-2 bg-blue-400 text-white px-6 py-3 rounded-xl font-display font-bold text-sm hover:bg-blue-400/90 transition-colors disabled:opacity-50">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {generating ? "Saving..." : "Generate Invoice"}
            </button>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
      )}

      {view === "preview" && generatedInvoice && (
        <div>
          <div className="no-print mb-4 flex gap-3">
            <button onClick={() => window.print()} className="flex items-center gap-2 bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-400/90">
              <Printer className="w-4 h-4" /> Download as PDF
            </button>
            <button onClick={() => setView("list")} className="border border-vault-border text-vault-text-dim px-4 py-2 rounded-lg text-sm hover:border-vault-accent hover:text-vault-accent">
              Back to Invoices
            </button>
          </div>
          <div className="bg-white text-gray-900 rounded-2xl p-10 shadow-lg" style={{ fontFamily: "Georgia, serif" }}>
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{form.businessName}</h1>
                <p className="text-gray-600 text-sm mt-1">{form.businessAddress}</p>
                <p className="text-gray-600 text-sm">{form.businessEmail} · {form.businessPhone}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600 uppercase">{form.documentType}</p>
                <p className="text-gray-500 text-sm">#{generatedInvoice.invoiceNumber}</p>
                <p className="text-gray-500 text-sm">Issued: {form.issueDate}</p>
                {form.dueDate && <p className="text-gray-500 text-sm">Due: {form.dueDate}</p>}
              </div>
            </div>
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Bill To</p>
              <p className="font-bold text-gray-900">{form.clientName}</p>
              {form.clientCompany && <p className="text-gray-600">{form.clientCompany}</p>}
              <p className="text-gray-600 text-sm">{form.clientAddress}</p>
              {form.clientEmail && <p className="text-gray-600 text-sm">{form.clientEmail}</p>}
            </div>
            {form.aiScope && <div className="mb-8 p-4 bg-blue-50 rounded-lg"><h3 className="font-bold text-gray-900 mb-2">Project Scope</h3><p className="text-gray-700 text-sm whitespace-pre-wrap">{form.aiScope}</p></div>}
            <table className="w-full mb-6">
              <thead><tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 text-xs uppercase tracking-wider text-gray-500">Description</th>
                <th className="text-right py-2 text-xs uppercase tracking-wider text-gray-500">Qty</th>
                <th className="text-right py-2 text-xs uppercase tracking-wider text-gray-500">Unit Price</th>
                <th className="text-right py-2 text-xs uppercase tracking-wider text-gray-500">Amount</th>
              </tr></thead>
              <tbody>
                {form.lineItems.map((li, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-3 text-gray-800">{li.description}</td>
                    <td className="py-3 text-right text-gray-600">{li.quantity}</td>
                    <td className="py-3 text-right text-gray-600">{form.currency} {li.unitPrice.toFixed(2)}</td>
                    <td className="py-3 text-right font-medium">{form.currency} {(li.quantity * li.unitPrice).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>{form.currency} {subtotal.toFixed(2)}</span></div>
                {form.taxRate > 0 && <div className="flex justify-between text-sm text-gray-600"><span>Tax ({form.taxRate}%)</span><span>{form.currency} {taxAmount.toFixed(2)}</span></div>}
                <div className="flex justify-between text-lg font-bold text-gray-900 border-t-2 border-gray-200 pt-2"><span>Total</span><span>{form.currency} {total.toFixed(2)}</span></div>
              </div>
            </div>
            {form.notes && <div className="mt-8 p-4 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Notes</p><p className="text-gray-700 text-sm">{form.notes}</p></div>}
          </div>
        </div>
      )}
    </div>
  );
}
