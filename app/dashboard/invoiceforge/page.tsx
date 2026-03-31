"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  FileText, Plus, Trash2, Loader2, Printer, Lock, Download, ChevronDown,
} from "lucide-react";
import Link from "next/link";

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

const STATUS_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  draft:   { bg: "rgba(74,90,120,0.15)",  color: "var(--text-secondary)", border: "rgba(74,90,120,0.3)" },
  sent:    { bg: "rgba(59,130,246,0.1)",   color: "var(--accent-blue)",    border: "rgba(59,130,246,0.25)" },
  viewed:  { bg: "rgba(139,92,246,0.1)",   color: "var(--accent-purple)",  border: "rgba(139,92,246,0.25)" },
  overdue: { bg: "rgba(239,68,68,0.1)",    color: "var(--accent-red)",     border: "rgba(239,68,68,0.25)" },
  paid:    { bg: "rgba(16,185,129,0.1)",   color: "var(--accent-green)",   border: "rgba(16,185,129,0.25)" },
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--bg-input)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  padding: "10px 14px",
  color: "var(--text-primary)",
  fontSize: "13px",
  outline: "none",
  fontFamily: "var(--font-body)",
};

export default function InvoiceForgePage() {
  const [view, setView] = useState<"list" | "form" | "preview">("list");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generatingScope, setGeneratingScope] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [generatedInvoice, setGeneratedInvoice] = useState<{
    id: string; invoiceNumber: string; total: number;
  } | null>(null);

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
    const { data } = await supabase
      .from("invoices").select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
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
          invoiceData: { clientName: form.clientName, clientCompany: form.clientCompany, lineItems: form.lineItems },
        }),
      });
      const data = await res.json();
      if (data.scope) setForm((f) => ({ ...f, aiScope: data.scope }));
    } catch {}
    setGeneratingScope(false);
  }

  async function handleGenerate() {
    setGenerating(true); setError(null); setBlocked(false);
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
    } catch { setError("Network error."); }
    finally { setGenerating(false); }
  }

  async function updateStatus(id: string, status: string) {
    await fetch("/api/bots/invoiceforge", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    loadInvoices();
  }

  const filteredInvoices = filterStatus === "all"
    ? invoices
    : invoices.filter((i) => i.status === filterStatus);

  const totalOutstanding = invoices
    .filter((i) => i.status === "sent")
    .reduce((s, i) => s + (i.total_amount ?? 0), 0);
  const totalPaidThisMonth = invoices
    .filter((i) => {
      const d = new Date(i.created_at), now = new Date();
      return i.status === "paid" && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, i) => s + (i.total_amount ?? 0), 0);
  const overdueCount = invoices.filter((i) => i.status === "overdue").length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 page-enter">
      <style>{`@media print { .no-print { display: none !important; } }`}</style>

      {/* Page header */}
      <div className="no-print">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}
            >
              <FileText className="w-5 h-5" style={{ color: "var(--accent-green)" }} />
            </div>
            <div>
              <h1
                className="font-display font-extrabold text-3xl"
                style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
              >
                InvoiceForge
              </h1>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Create professional invoices and proposals with AI.
              </p>
            </div>
          </div>
          {/* Tab switcher */}
          <div className="flex gap-2">
            {(["list", "form"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={
                  view === v
                    ? { background: "var(--accent-green)", color: "#0A0F1A", border: "1px solid var(--accent-green)" }
                    : { background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" }
                }
              >
                {v === "list" ? "All Invoices" : "New Invoice"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Upgrade banner */}
      {blocked && (
        <div
          className="no-print rounded-xl px-5 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.25)", borderRadius: "12px" }}
        >
          <Lock className="w-5 h-5 shrink-0" style={{ color: "var(--accent-blue)" }} />
          <div>
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
              You&apos;ve used your free InvoiceForge trials.
            </p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Subscribe to create unlimited invoices.</p>
          </div>
          <Link
            href="/dashboard/billing"
            className="sm:ml-auto px-4 py-2 rounded-lg text-sm font-medium transition-all hover:-translate-y-px whitespace-nowrap"
            style={{ background: "var(--accent-blue)", color: "#0A0F1A" }}
          >
            Subscribe Now
          </Link>
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {view === "list" && (
        <div className="space-y-6">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Outstanding", value: `$${totalOutstanding.toLocaleString()}`, color: "var(--accent-blue)" },
              { label: "Paid This Month", value: `$${totalPaidThisMonth.toLocaleString()}`, color: "var(--accent-green)" },
              { label: "Overdue", value: overdueCount, color: "var(--accent-red)" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl p-5"
                style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px" }}
              >
                <p className="text-xs font-mono uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
                  {s.label}
                </p>
                <p className="font-display text-2xl font-bold" style={{ color: s.color, fontFamily: "var(--font-mono)" }}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {["all", "draft", "sent", "viewed", "paid", "overdue"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
                style={
                  filterStatus === s
                    ? { background: "var(--accent-blue)", color: "#0A0F1A", border: "1px solid var(--accent-blue)" }
                    : { background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" }
                }
              >
                {s}
              </button>
            ))}
          </div>

          {/* Table */}
          {filteredInvoices.length === 0 ? (
            <div
              className="rounded-xl p-12 text-center"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px" }}
            >
              <FileText className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--text-tertiary)" }} />
              <p className="font-medium mb-1" style={{ color: "var(--text-primary)" }}>No invoices yet</p>
              <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>Create your first invoice to get started.</p>
              <button
                onClick={() => setView("form")}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:-translate-y-px"
                style={{ background: "var(--accent-green)", color: "#0A0F1A" }}
              >
                Create Invoice
              </button>
            </div>
          ) : (
            <div
              className="rounded-xl overflow-hidden"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px" }}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Invoice #", "Client", "Amount", "Status", "Due Date", "Actions"].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs uppercase tracking-wider"
                        style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv) => {
                    const s = STATUS_STYLES[inv.status] ?? STATUS_STYLES.draft;
                    return (
                      <tr key={inv.id} style={{ borderBottom: "1px solid rgba(31,46,69,0.5)" }}>
                        <td
                          className="px-4 py-3 text-xs font-mono font-bold"
                          style={{ color: "var(--accent-green)", fontFamily: "var(--font-mono)" }}
                        >
                          {inv.invoice_number}
                        </td>
                        <td className="px-4 py-3" style={{ color: "var(--text-primary)" }}>
                          {inv.client_name}
                          {inv.client_company && (
                            <span className="text-xs ml-1" style={{ color: "var(--text-tertiary)" }}>
                              · {inv.client_company}
                            </span>
                          )}
                        </td>
                        <td
                          className="px-4 py-3 font-bold font-mono"
                          style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}
                        >
                          {inv.currency} {(inv.total_amount ?? 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="text-xs font-medium px-2.5 py-1 rounded-full capitalize"
                            style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm" style={{ color: "var(--text-secondary)" }}>
                          {inv.due_date ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="relative inline-block">
                            <select
                              value={inv.status}
                              onChange={(e) => updateStatus(inv.id, e.target.value)}
                              className="appearance-none pr-6 pl-3 py-1.5 text-xs rounded-lg"
                              style={{
                                background: "var(--bg-elevated)",
                                border: "1px solid var(--border)",
                                color: "var(--text-secondary)",
                                outline: "none",
                                fontFamily: "var(--font-body)",
                              }}
                            >
                              {["draft", "sent", "viewed", "paid", "overdue"].map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: "var(--text-tertiary)" }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── FORM VIEW ── */}
      {view === "form" && (
        <div
          className="rounded-xl p-6 space-y-6"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px" }}
        >
          {/* Business + Client */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business */}
            <div className="space-y-3">
              <h3 className="font-display font-bold text-base" style={{ color: "var(--text-primary)" }}>Your Business</h3>
              {[
                { field: "businessName",    label: "Business Name",  ph: "Acme Agency" },
                { field: "businessAddress", label: "Address",        ph: "123 Main St, City, State" },
                { field: "businessEmail",   label: "Email",          ph: "hello@yourbusiness.com" },
                { field: "businessPhone",   label: "Phone",          ph: "+1 (555) 000-0000" },
              ].map(({ field, label, ph }) => (
                <div key={field}>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>{label}</label>
                  <input
                    type="text"
                    value={form[field as keyof typeof form] as string}
                    onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                    placeholder={ph}
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = "var(--border-active)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-blue-glow)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
                  />
                </div>
              ))}
            </div>
            {/* Client */}
            <div className="space-y-3">
              <h3 className="font-display font-bold text-base" style={{ color: "var(--text-primary)" }}>Client</h3>
              {[
                { field: "clientName",    label: "Client Name *", ph: "John Smith" },
                { field: "clientCompany", label: "Company",       ph: "Client Co." },
                { field: "clientAddress", label: "Address",       ph: "456 Oak Ave" },
                { field: "clientEmail",   label: "Email",         ph: "client@example.com" },
              ].map(({ field, label, ph }) => (
                <div key={field}>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>{label}</label>
                  <input
                    type="text"
                    value={form[field as keyof typeof form] as string}
                    onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                    placeholder={ph}
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = "var(--border-active)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-blue-glow)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Meta row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Document Type</label>
              <select
                value={form.documentType}
                onChange={(e) => setForm((f) => ({ ...f, documentType: e.target.value as "invoice" | "proposal" }))}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                <option value="invoice">Invoice</option>
                <option value="proposal">Project Proposal</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Invoice #</label>
              <input
                type="text"
                value={form.invoiceNumber}
                onChange={(e) => setForm((f) => ({ ...f, invoiceNumber: e.target.value }))}
                placeholder="Auto-generated"
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = "var(--border-active)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-blue-glow)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Issue Date</label>
              <input type="date" value={form.issueDate} onChange={(e) => setForm((f) => ({ ...f, issueDate: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Due Date</label>
              <input type="date" value={form.dueDate} onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))} style={inputStyle} />
            </div>
          </div>

          {/* Line items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-base" style={{ color: "var(--text-primary)" }}>Line Items</h3>
              <button
                onClick={addLine}
                className="flex items-center gap-1.5 text-xs font-medium transition-colors"
                style={{ color: "var(--accent-green)" }}
              >
                <Plus className="w-3.5 h-3.5" /> Add Item
              </button>
            </div>
            <div className="space-y-2">
              <div
                className="grid grid-cols-12 gap-2 text-xs font-mono uppercase tracking-wider px-1"
                style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}
              >
                <span className="col-span-6">Description</span>
                <span className="col-span-2">Qty</span>
                <span className="col-span-3">Unit Price</span>
                <span className="col-span-1" />
              </div>
              {form.lineItems.map((li, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <input
                    className="col-span-6"
                    style={inputStyle}
                    value={li.description}
                    onChange={(e) => updateLineItem(idx, "description", e.target.value)}
                    placeholder="Service or product..."
                    onFocus={(e) => { e.target.style.borderColor = "var(--border-active)"; }}
                    onBlur={(e) => { e.target.style.borderColor = "var(--border)"; }}
                  />
                  <input
                    type="number"
                    className="col-span-2"
                    style={inputStyle}
                    value={li.quantity}
                    onChange={(e) => updateLineItem(idx, "quantity", parseFloat(e.target.value) || 0)}
                  />
                  <input
                    type="number"
                    className="col-span-3"
                    style={inputStyle}
                    value={li.unitPrice}
                    onChange={(e) => updateLineItem(idx, "unitPrice", parseFloat(e.target.value) || 0)}
                  />
                  <button
                    onClick={() => removeLine(idx)}
                    className="col-span-1 flex justify-center transition-colors"
                    style={{ color: "var(--text-tertiary)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-red)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Currency / Tax / Notes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Currency</label>
              <select
                value={form.currency}
                onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Tax Rate (%)</label>
              <input
                type="number"
                value={form.taxRate}
                onChange={(e) => setForm((f) => ({ ...f, taxRate: parseFloat(e.target.value) || 0 }))}
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = "var(--border-active)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--border)"; }}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Notes / Payment Terms</label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="e.g. Payment due within 30 days..."
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = "var(--border-active)"; e.target.style.boxShadow = "0 0 0 3px var(--accent-blue-glow)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
              />
            </div>
          </div>

          {/* AI Scope (proposals) */}
          {form.documentType === "proposal" && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                  AI Project Scope{" "}
                  <span style={{ color: "var(--text-tertiary)" }}>(Pro only)</span>
                </label>
                <button
                  onClick={generateScope}
                  disabled={generatingScope}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all disabled:opacity-50"
                  style={{ background: "var(--accent-green)", color: "#0A0F1A" }}
                >
                  {generatingScope && <Loader2 className="w-3 h-3 animate-spin" />}
                  Generate with AI
                </button>
              </div>
              <textarea
                value={form.aiScope}
                onChange={(e) => setForm((f) => ({ ...f, aiScope: e.target.value }))}
                rows={4}
                placeholder="AI-generated scope will appear here, or type your own..."
                style={{ ...inputStyle, resize: "none", padding: "12px 14px" }}
                onFocus={(e) => { e.target.style.borderColor = "var(--border-active)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--border)"; }}
              />
            </div>
          )}

          {/* Total + submit */}
          <div
            className="flex items-center justify-between pt-5"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <div className="space-y-1 text-right">
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Subtotal:{" "}
                <span className="font-mono font-medium" style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                  {form.currency} {subtotal.toFixed(2)}
                </span>
              </p>
              {form.taxRate > 0 && (
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Tax ({form.taxRate}%):{" "}
                  <span className="font-mono font-medium" style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                    {form.currency} {taxAmount.toFixed(2)}
                  </span>
                </p>
              )}
              <p className="text-lg font-display font-bold" style={{ color: "var(--text-primary)" }}>
                Total:{" "}
                <span style={{ fontFamily: "var(--font-mono)" }}>{form.currency} {total.toFixed(2)}</span>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleGenerate}
                disabled={generating || !form.clientName}
                className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all hover:-translate-y-px disabled:opacity-50"
                style={{ background: "var(--accent-green)", color: "#0A0F1A", borderRadius: "8px" }}
              >
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {generating ? "Saving..." : "Generate Invoice"}
              </button>
            </div>
          </div>

          {error && (
            <p
              className="text-sm px-4 py-3 rounded-lg"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "var(--accent-red)",
              }}
            >
              {error}
            </p>
          )}
        </div>
      )}

      {/* ── PREVIEW VIEW ── */}
      {view === "preview" && generatedInvoice && (
        <div>
          <div className="no-print mb-4 flex gap-3">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:-translate-y-px"
              style={{ background: "var(--accent-blue)", color: "#0A0F1A" }}
            >
              <Printer className="w-4 h-4" /> Download as PDF
            </button>
            <button
              onClick={() => setView("list")}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
            >
              Back to Invoices
            </button>
          </div>

          {/* White invoice doc */}
          <div className="bg-white text-gray-900 rounded-2xl p-10 shadow-2xl" style={{ fontFamily: "Georgia, serif" }}>
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

            {form.aiScope && (
              <div className="mb-8 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-2">Project Scope</h3>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{form.aiScope}</p>
              </div>
            )}

            <table className="w-full mb-6">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  {["Description", "Qty", "Unit Price", "Amount"].map((h, i) => (
                    <th
                      key={h}
                      className={`py-2 text-xs uppercase tracking-wider text-gray-500 ${i === 0 ? "text-left" : "text-right"}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
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
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span><span>{form.currency} {subtotal.toFixed(2)}</span>
                </div>
                {form.taxRate > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax ({form.taxRate}%)</span><span>{form.currency} {taxAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-gray-900 border-t-2 border-gray-200 pt-2">
                  <span>Total</span><span>{form.currency} {total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {form.notes && (
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Notes</p>
                <p className="text-gray-700 text-sm">{form.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
