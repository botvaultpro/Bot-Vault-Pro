"use client";
import { useEffect, useRef, useState } from "react";
import {
  Globe, Play, Loader2, FileText, Download, X,
  CheckCircle2, ArrowLeft, Lock, ExternalLink, GitBranch,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { type Tier, TIER_LIMITS } from "@/lib/tier-limits";

const BUSINESS_TYPES = [
  { value: "restaurant", label: "Restaurant / Café" },
  { value: "retail", label: "Retail Store" },
  { value: "law_firm", label: "Law Firm" },
  { value: "medical_dental", label: "Medical / Dental" },
  { value: "real_estate", label: "Real Estate" },
  { value: "construction", label: "Construction / Contractor" },
  { value: "salon_spa", label: "Salon / Spa" },
  { value: "auto_shop", label: "Auto Shop" },
  { value: "gym_fitness", label: "Gym / Fitness" },
  { value: "accounting", label: "Accounting / Finance" },
  { value: "consulting", label: "Consulting" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "nonprofit", label: "Nonprofit" },
  { value: "photography", label: "Photography" },
  { value: "landscaping", label: "Landscaping" },
  { value: "cleaning", label: "Cleaning Service" },
  { value: "plumbing_hvac", label: "Plumbing / HVAC" },
  { value: "marketing_agency", label: "Marketing Agency" },
  { value: "insurance", label: "Insurance" },
  { value: "other", label: "Other" },
];

interface FormData {
  businessName: string;
  location: string;
  businessType: string;
  currentSite: string;
  freelancerName: string;
}

type Step = "form" | "generating-site" | "preview" | "generating-proposal" | "proposal";

export default function SiteBuilderPage() {
  const [tier, setTier] = useState<Tier>("free");
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState<FormData>({
    businessName: "",
    location: "",
    businessType: "",
    currentSite: "",
    freelancerName: "",
  });
  const [generatedHtml, setGeneratedHtml] = useState<string>("");
  const [sitePreviewId, setSitePreviewId] = useState<string | null>(null);
  const [proposalContent, setProposalContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const proposalRef = useRef<HTMLDivElement>(null);

  const [trialRemaining, setTrialRemaining] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("subscriptions")
        .select("tier")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();
      if (data?.tier) setTier(data.tier as Tier);

      // Check bot_subscriptions for trial/access status
      const { data: sub } = await supabase
        .from("bot_subscriptions")
        .select("status")
        .eq("user_id", user.id)
        .eq("bot_slug", "sitebuilder")
        .in("status", ["active", "trialing"])
        .maybeSingle();
      if (sub) return;
      const { data: trial } = await supabase
        .from("free_trials")
        .select("uses_remaining")
        .eq("user_id", user.id)
        .eq("bot_slug", "sitebuilder")
        .maybeSingle();
      const remaining = trial?.uses_remaining ?? 2;
      if (remaining > 0) setTrialRemaining(remaining);
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
      if (!res.ok) {
        setError(data.error ?? "Generation failed.");
        setStep("form");
        return;
      }
      setGeneratedHtml(data.html);
      setSitePreviewId(data.sitePreviewId);
      setStep("preview");
    } catch {
      setError("Network error. Please try again.");
      setStep("form");
    }
  }

  async function handleGenerateProposal() {
    setStep("generating-proposal");
    setError(null);
    try {
      const res = await fetch("/api/bots/sitebuilder/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sitePreviewId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Proposal generation failed.");
        setStep("preview");
        return;
      }
      setProposalContent(data.proposalContent);
      setStep("proposal");
      setShowProposalModal(true);
    } catch {
      setError("Network error. Please try again.");
      setStep("preview");
    }
  }

  function handlePrintProposal() {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Proposal — ${form.businessName}</title>
  <style>
    @media print { body { margin: 0; } @page { margin: 1.5cm; } }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  </style>
</head>
<body>${proposalContent}</body>
</html>`);
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
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-vault-text-dim hover:text-vault-text transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center justify-center w-10 h-10 rounded-xl border border-vault-green/20 bg-vault-green/5">
          <Globe className="w-5 h-5 text-vault-green" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">SiteBuilder Pro</h1>
          <p className="text-vault-text-dim text-sm">
            Generate demo sites, proposals, and manage your web design pipeline.
          </p>
        </div>
        <Link
          href="/dashboard/sitebuilder/pipeline"
          className="ml-auto flex items-center gap-2 border border-vault-green/30 text-vault-green px-3 py-2 rounded-lg text-sm hover:bg-vault-green/10 transition-colors"
        >
          <GitBranch className="w-4 h-4" />
          Pipeline
        </Link>
      </div>

      {/* Tier stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Prospects / Mo", value: limits.prospectsPerMonth === 999999 ? "∞" : String(limits.prospectsPerMonth), on: undefined },
          { label: "AI Scoring", value: limits.aiScoring ? "On" : "Off", on: limits.aiScoring },
          { label: "Demo Gen", value: limits.demoGeneration ? "On" : "Off", on: limits.demoGeneration },
          { label: "CRM Pipeline", value: limits.pipelineCRM ? "On" : "Off", on: limits.pipelineCRM },
        ].map((s) => (
          <div key={s.label} className="card-surface rounded-xl p-4">
            <p className="text-xs text-vault-text-dim font-mono uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`font-display text-2xl font-bold ${s.on === undefined ? "text-vault-green" : s.on ? "text-vault-green" : "text-vault-muted"}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Trial banner */}
      {trialRemaining !== null && (
        <div className="bg-vault-green/5 border border-vault-green/20 rounded-xl p-4 flex items-center gap-3">
          <span className="text-sm text-vault-text">
            <span className="font-semibold text-vault-green">{trialRemaining} free site{trialRemaining !== 1 ? "s" : ""} remaining</span>
            {" — "}
            <Link href="/dashboard/billing" className="text-vault-green underline">Subscribe for unlimited access</Link>
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* ── STEP: Form ── */}
      {(step === "form" || step === "generating-site") && (
        <div className="card-surface rounded-2xl p-6">
          <h2 className="font-display text-lg font-bold mb-1">Analyze & Generate Demo Site</h2>
          <p className="text-vault-text-dim text-sm mb-6">
            Enter a local business. Get a custom HTML demo site saved to your pipeline.
          </p>
          <form onSubmit={handleGenerateSite} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-vault-text-dim mb-2">
                  Business Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  required
                  placeholder="Joe's Plumbing"
                  className="w-full bg-vault-bg border border-vault-border rounded-lg px-4 py-3 text-vault-text placeholder-vault-muted focus:outline-none focus:border-vault-green transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-vault-text-dim mb-2">
                  Location <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  required
                  placeholder="Austin, TX"
                  className="w-full bg-vault-bg border border-vault-border rounded-lg px-4 py-3 text-vault-text placeholder-vault-muted focus:outline-none focus:border-vault-green transition-colors text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-vault-text-dim mb-2">
                Business Type <span className="text-red-400">*</span>
              </label>
              <select
                value={form.businessType}
                onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                required
                className="w-full bg-vault-bg border border-vault-border rounded-lg px-4 py-3 text-vault-text focus:outline-none focus:border-vault-green transition-colors text-sm"
              >
                <option value="">Select business type…</option>
                {BUSINESS_TYPES.map((bt) => (
                  <option key={bt.value} value={bt.value}>{bt.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-vault-text-dim mb-2">
                  Current Website <span className="text-vault-muted text-xs">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.currentSite}
                  onChange={(e) => setForm({ ...form, currentSite: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full bg-vault-bg border border-vault-border rounded-lg px-4 py-3 text-vault-text placeholder-vault-muted focus:outline-none focus:border-vault-green transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-vault-text-dim mb-2">
                  Your Name / Agency <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.freelancerName}
                  onChange={(e) => setForm({ ...form, freelancerName: e.target.value })}
                  required
                  placeholder="Jane Smith Web Design"
                  className="w-full bg-vault-bg border border-vault-border rounded-lg px-4 py-3 text-vault-text placeholder-vault-muted focus:outline-none focus:border-vault-green transition-colors text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={step === "generating-site"}
              className="flex items-center gap-2 bg-vault-green text-vault-bg font-display font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === "generating-site" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Site… (30–60 sec)
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Analyze & Build Demo Site
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* ── STEP: Preview + Proposal ── */}
      {(step === "preview" || step === "generating-proposal" || step === "proposal") && (
        <div className="space-y-4">
          <div className="card-surface rounded-2xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 text-vault-green">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-display font-semibold">
                  Demo site generated for {form.businessName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadHtml}
                  className="flex items-center gap-1.5 text-xs border border-vault-border text-vault-text-dim px-3 py-2 rounded-lg hover:border-vault-green hover:text-vault-green transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download HTML
                </button>
                <button
                  onClick={() => { setStep("form"); setGeneratedHtml(""); setSitePreviewId(null); setProposalContent(""); }}
                  className="flex items-center gap-1.5 text-xs border border-vault-border text-vault-text-dim px-3 py-2 rounded-lg hover:border-vault-accent hover:text-vault-accent transition-colors"
                >
                  New Site
                </button>
              </div>
            </div>

            {/* iframe with browser chrome */}
            <div className="relative rounded-xl overflow-hidden border border-vault-border" style={{ height: "620px" }}>
              <div className="absolute top-0 left-0 right-0 z-10 bg-gray-100 border-b border-gray-200 px-4 py-2 flex items-center gap-2">
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
            <div className="card-surface rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4">
              <div>
                <h3 className="font-display font-bold text-lg">Ready to close the deal?</h3>
                <p className="text-vault-text-dim text-sm mt-1">
                  Generate a professional sales proposal with 3 pricing tiers — ready to send in minutes.
                </p>
              </div>
              <button
                onClick={handleGenerateProposal}
                className="sm:ml-auto flex items-center gap-2 bg-vault-accent text-vault-bg font-display font-bold px-5 py-3 rounded-xl hover:bg-vault-accent-dim transition-all whitespace-nowrap"
              >
                <FileText className="w-4 h-4" />
                Generate Proposal
              </button>
            </div>
          )}

          {step === "generating-proposal" && (
            <div className="card-surface rounded-2xl p-6 flex items-center gap-3 text-vault-text-dim">
              <Loader2 className="w-5 h-5 animate-spin text-vault-accent" />
              <span>Generating your sales proposal… (15–30 sec)</span>
            </div>
          )}

          {step === "proposal" && (
            <div className="card-surface rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-2 text-vault-green">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-display font-semibold">Proposal ready!</span>
              </div>
              <div className="flex gap-2 sm:ml-auto">
                <button
                  onClick={() => setShowProposalModal(true)}
                  className="flex items-center gap-2 border border-vault-accent text-vault-accent px-4 py-2.5 rounded-lg text-sm hover:bg-vault-accent/10 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Proposal
                </button>
                <button
                  onClick={handlePrintProposal}
                  className="flex items-center gap-2 bg-vault-accent text-vault-bg font-bold px-4 py-2.5 rounded-lg text-sm hover:bg-vault-accent-dim transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Save as PDF
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
                <h2 className="font-bold text-gray-900 text-lg">
                  Sales Proposal — {form.businessName}
                </h2>
                <p className="text-sm text-gray-500">Prepared by {form.freelancerName}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintProposal}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
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
