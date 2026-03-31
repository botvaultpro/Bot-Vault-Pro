"use client";
import { useEffect, useRef, useState } from "react";
import {
  Globe, Play, Loader2, FileText, Download, X,
  CheckCircle2, Lock, ExternalLink, GitBranch,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { type Tier, TIER_LIMITS } from "@/lib/tier-limits";

const BUSINESS_TYPES = [
  { value: "restaurant",       label: "Restaurant / Café" },
  { value: "retail",           label: "Retail Store" },
  { value: "law_firm",         label: "Law Firm" },
  { value: "medical_dental",   label: "Medical / Dental" },
  { value: "real_estate",      label: "Real Estate" },
  { value: "construction",     label: "Construction / Contractor" },
  { value: "salon_spa",        label: "Salon / Spa" },
  { value: "auto_shop",        label: "Auto Shop" },
  { value: "gym_fitness",      label: "Gym / Fitness" },
  { value: "accounting",       label: "Accounting / Finance" },
  { value: "consulting",       label: "Consulting" },
  { value: "ecommerce",        label: "E-commerce" },
  { value: "nonprofit",        label: "Nonprofit" },
  { value: "photography",      label: "Photography" },
  { value: "landscaping",      label: "Landscaping" },
  { value: "cleaning",         label: "Cleaning Service" },
  { value: "plumbing_hvac",    label: "Plumbing / HVAC" },
  { value: "marketing_agency", label: "Marketing Agency" },
  { value: "insurance",        label: "Insurance" },
  { value: "other",            label: "Other" },
];

interface FormData {
  businessName: string;
  location: string;
  businessType: string;
  currentSite: string;
  freelancerName: string;
}

type Step = "form" | "generating-site" | "preview" | "generating-proposal" | "proposal";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--bg-input)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  padding: "12px 16px",
  color: "var(--text-primary)",
  fontSize: "14px",
  outline: "none",
  fontFamily: "var(--font-body)",
};

export default function SiteBuilderPage() {
  const [tier, setTier] = useState<Tier>("free");
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState<FormData>({
    businessName: "", location: "", businessType: "",
    currentSite: "", freelancerName: "",
  });
  const [generatedHtml, setGeneratedHtml] = useState<string>("");
  const [sitePreviewId, setSitePreviewId] = useState<string | null>(null);
  const [proposalContent, setProposalContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const proposalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("subscriptions").select("tier")
        .eq("user_id", user.id).eq("status", "active").single();
      if (data?.tier) setTier(data.tier as Tier);
    }
    load();
  }, []);

  const limits = TIER_LIMITS[tier].sitebuilder;

  async function handleGenerateSite(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStep("generating-site");
    try {
      const res = await fetch("/api/bots/sitebuilder/generate-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Generation failed."); setStep("form"); return; }
      setGeneratedHtml(data.html);
      setSitePreviewId(data.sitePreviewId);
      setStep("preview");
    } catch { setError("Network error. Please try again."); setStep("form"); }
  }

  async function handleGenerateProposal() {
    setStep("generating-proposal"); setError(null);
    try {
      const res = await fetch("/api/bots/sitebuilder/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sitePreviewId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Proposal generation failed."); setStep("preview"); return; }
      setProposalContent(data.proposalContent);
      setStep("proposal");
      setShowProposalModal(true);
    } catch { setError("Network error. Please try again."); setStep("preview"); }
  }

  function handlePrintProposal() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8" /><title>Proposal — ${form.businessName}</title><style>@media print { body { margin: 0; } @page { margin: 1.5cm; } } body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }</style></head><body>${proposalContent}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  }

  function handleDownloadHtml() {
    const blob = new Blob([generatedHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.businessName.replace(/\s+/g, "-").toLowerCase()}-site.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}
          >
            <Globe className="w-5 h-5" style={{ color: "var(--accent-green)" }} />
          </div>
          <div>
            <h1
              className="font-display font-extrabold text-3xl"
              style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
            >
              SiteBuilder Pro
            </h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Generate demo sites, proposals, and manage your web design pipeline.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/sitebuilder/pipeline"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:-translate-y-px"
          style={{
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.25)",
            color: "var(--accent-green)",
          }}
        >
          <GitBranch className="w-4 h-4" />
          Pipeline
        </Link>
      </div>

      {/* Tier stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Prospects / Mo", value: limits.prospectsPerMonth === 999999 ? "∞" : String(limits.prospectsPerMonth), active: true },
          { label: "AI Scoring",     value: limits.aiScoring     ? "On" : "Off", active: limits.aiScoring },
          { label: "Demo Gen",       value: limits.demoGeneration ? "On" : "Off", active: limits.demoGeneration },
          { label: "CRM Pipeline",   value: limits.pipelineCRM   ? "On" : "Off", active: limits.pipelineCRM },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-5"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px" }}
          >
            <p
              className="text-xs font-mono uppercase tracking-wider mb-1"
              style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}
            >
              {s.label}
            </p>
            <p
              className="font-display text-2xl font-bold"
              style={{ color: s.active ? "var(--accent-green)" : "var(--text-tertiary)" }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Free tier notice */}
      {tier === "free" && (
        <div
          className="rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3"
          style={{
            background: "rgba(59,130,246,0.06)",
            border: "1px solid rgba(59,130,246,0.25)",
            borderRadius: "12px",
          }}
        >
          <Lock className="w-4 h-4 shrink-0" style={{ color: "var(--accent-blue)" }} />
          <div>
            <span className="text-sm font-semibold" style={{ color: "var(--accent-blue)" }}>Free tier — 1 run only.</span>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Upgrade to Starter ($49/mo) for full access.</p>
          </div>
          <Link
            href="/dashboard/billing"
            className="sm:ml-auto text-sm px-4 py-2 rounded-lg font-medium transition-all hover:-translate-y-px whitespace-nowrap"
            style={{ background: "var(--accent-blue)", color: "#0A0F1A" }}
          >
            Upgrade Now
          </Link>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
            color: "var(--accent-red)",
          }}
        >
          {error}
        </div>
      )}

      {/* ── FORM step ── */}
      {(step === "form" || step === "generating-site") && (
        <div
          className="rounded-xl p-6"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px" }}
        >
          <h2 className="font-display font-bold text-lg mb-1" style={{ color: "var(--text-primary)" }}>
            Analyze & Generate Demo Site
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
            Enter a local business. Get a custom HTML demo site saved to your pipeline.
          </p>
          <form onSubmit={handleGenerateSite} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Business Name <span style={{ color: "var(--accent-red)" }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  required
                  placeholder="Joe's Plumbing"
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = "var(--accent-green)"; e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.1)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Location <span style={{ color: "var(--accent-red)" }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required
                  placeholder="Austin, TX"
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = "var(--accent-green)"; e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.1)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Business Type <span style={{ color: "var(--accent-red)" }}>*</span>
              </label>
              <select
                value={form.businessType}
                onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                required
                style={{ ...inputStyle, cursor: "pointer" }}
                onFocus={(e) => { e.target.style.borderColor = "var(--accent-green)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--border)"; }}
              >
                <option value="">Select business type…</option>
                {BUSINESS_TYPES.map((bt) => (
                  <option key={bt.value} value={bt.value}>{bt.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Current Website{" "}
                  <span style={{ color: "var(--text-tertiary)", fontSize: "11px" }}>(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.currentSite}
                  onChange={(e) => setForm({ ...form, currentSite: e.target.value })}
                  placeholder="https://example.com"
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = "var(--accent-green)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "var(--border)"; }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                  Your Name / Agency <span style={{ color: "var(--accent-red)" }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.freelancerName}
                  onChange={(e) => setForm({ ...form, freelancerName: e.target.value })}
                  required
                  placeholder="Jane Smith Web Design"
                  style={inputStyle}
                  onFocus={(e) => { e.target.style.borderColor = "var(--accent-green)"; e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.1)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={step === "generating-site"}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{ background: "var(--accent-green)", color: "#0A0F1A", borderRadius: "8px" }}
            >
              {step === "generating-site" ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Generating Site… (30–60 sec)</>
              ) : (
                <><Play className="w-4 h-4" /> Analyze & Build Demo Site</>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ── PREVIEW + PROPOSAL step ── */}
      {(step === "preview" || step === "generating-proposal" || step === "proposal") && (
        <div className="space-y-4">
          <div
            className="rounded-xl p-5"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px" }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2" style={{ color: "var(--accent-green)" }}>
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-display font-semibold">
                  Demo site generated for {form.businessName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadHtml}
                  className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-medium transition-all"
                  style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent-green)"; e.currentTarget.style.color = "var(--accent-green)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                >
                  <Download className="w-3.5 h-3.5" /> Download HTML
                </button>
                <button
                  onClick={() => { setStep("form"); setGeneratedHtml(""); setSitePreviewId(null); setProposalContent(""); }}
                  className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-medium transition-all"
                  style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent-blue)"; e.currentTarget.style.color = "var(--accent-blue)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                >
                  New Site
                </button>
              </div>
            </div>

            {/* iframe with browser chrome */}
            <div
              className="relative rounded-xl overflow-hidden"
              style={{ height: "620px", border: "1px solid var(--border)" }}
            >
              <div
                className="absolute top-0 left-0 right-0 z-10 px-4 py-2 flex items-center gap-2"
                style={{ background: "#f3f4f6", borderBottom: "1px solid #e5e7eb" }}
              >
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400 block" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400 block" />
                  <span className="w-3 h-3 rounded-full bg-green-400 block" />
                </div>
                <div className="flex-1 bg-white rounded border border-gray-300 px-3 py-1 text-xs text-gray-400 font-mono">
                  {form.businessName.toLowerCase().replace(/\s+/g, "")}.com — preview
                </div>
              </div>
              <iframe
                srcDoc={generatedHtml}
                sandbox="allow-scripts allow-same-origin"
                className="w-full h-full border-0 pt-10"
                title={`${form.businessName} demo site`}
              />
            </div>
          </div>

          {/* Proposal CTA */}
          {step === "preview" && (
            <div
              className="rounded-xl p-6 flex flex-col sm:flex-row sm:items-center gap-4"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px" }}
            >
              <div>
                <h3 className="font-display font-bold text-lg" style={{ color: "var(--text-primary)" }}>
                  Ready to close the deal?
                </h3>
                <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                  Generate a professional sales proposal with 3 pricing tiers — ready to send in minutes.
                </p>
              </div>
              <button
                onClick={handleGenerateProposal}
                className="sm:ml-auto flex items-center gap-2 px-5 py-3 rounded-lg font-medium text-sm transition-all hover:-translate-y-px whitespace-nowrap"
                style={{ background: "var(--accent-blue)", color: "#0A0F1A", borderRadius: "8px" }}
              >
                <FileText className="w-4 h-4" /> Generate Proposal
              </button>
            </div>
          )}

          {step === "generating-proposal" && (
            <div
              className="rounded-xl p-6 flex items-center gap-3"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px" }}
            >
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--accent-blue)" }} />
              <span style={{ color: "var(--text-secondary)" }}>Generating your sales proposal… (15–30 sec)</span>
            </div>
          )}

          {step === "proposal" && (
            <div
              className="rounded-xl p-6 flex flex-col sm:flex-row sm:items-center gap-4"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px" }}
            >
              <div className="flex items-center gap-2" style={{ color: "var(--accent-green)" }}>
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-display font-semibold">Proposal ready!</span>
              </div>
              <div className="flex gap-2 sm:ml-auto">
                <button
                  onClick={() => setShowProposalModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{ background: "var(--bg-elevated)", color: "var(--accent-blue)", border: "1px solid rgba(59,130,246,0.3)" }}
                >
                  <ExternalLink className="w-4 h-4" /> View Proposal
                </button>
                <button
                  onClick={handlePrintProposal}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:-translate-y-px"
                  style={{ background: "var(--accent-blue)", color: "#0A0F1A" }}
                >
                  <Download className="w-4 h-4" /> Save as PDF
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Proposal Modal ── */}
      {showProposalModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
              <div>
                <h2 className="font-bold text-gray-900 text-lg">Sales Proposal — {form.businessName}</h2>
                <p className="text-sm text-gray-500">Prepared by {form.freelancerName}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintProposal}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </button>
                <button
                  onClick={() => setShowProposalModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div
              ref={proposalRef}
              className="overflow-y-auto flex-1 p-8"
              dangerouslySetInnerHTML={{ __html: proposalContent }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
