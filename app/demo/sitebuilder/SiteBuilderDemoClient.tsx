"use client";
import { useState } from "react";
import Link from "next/link";
import { Globe, Play, Loader2, ExternalLink, Smartphone, Monitor, RefreshCw } from "lucide-react";
import DemoEmailCapture from "@/app/components/DemoEmailCapture";

const BUSINESS_TYPES = [
  "Restaurant / Café",
  "Law Firm",
  "Dental / Medical",
  "Real Estate Agency",
  "Construction / Contractor",
  "Gym / Fitness Studio",
  "Salon / Spa",
  "Auto Shop",
  "Retail Store",
  "Accounting / Financial",
  "Plumbing / HVAC",
  "Photography Studio",
];

const COLORS = [
  { label: "Ocean Blue", value: "blue", hex: "#2563EB" },
  { label: "Forest Green", value: "green", hex: "#16A34A" },
  { label: "Royal Purple", value: "purple", hex: "#7C3AED" },
  { label: "Sunset Orange", value: "orange", hex: "#EA580C" },
  { label: "Crimson Red", value: "red", hex: "#DC2626" },
  { label: "Teal", value: "teal", hex: "#0D9488" },
];

export default function SiteBuilderDemoClient() {
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [location, setLocation] = useState("");
  const [tagline, setTagline] = useState("");
  const [primaryColor, setPrimaryColor] = useState("blue");
  const [html, setHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [generatedName, setGeneratedName] = useState("");

  async function handleGenerate() {
    if (!businessName.trim() || !businessType) return;
    setLoading(true);
    setError(null);
    setHtml(null);

    try {
      const res = await fetch("/api/demo/sitebuilder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName: businessName.trim(), businessType, location, tagline, primaryColor }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Generation failed. Please try again.");
      } else {
        setHtml(data.html);
        setGeneratedName(data.businessName);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-vault-bg">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-vault-border bg-vault-bg/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-xl tracking-tight">
            <span className="text-gradient-cyan">Bot</span>
            <span className="text-vault-text"> Vault Pro</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/demo" className="text-sm text-vault-text-dim hover:text-vault-text transition-colors hidden sm:block">
              ← All demos
            </Link>
            <Link href="/auth/signup" className="text-sm bg-vault-accent text-vault-bg font-semibold px-4 py-2 rounded-lg">
              Try Free
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-vault-green/10 border border-vault-green/20 rounded-full px-4 py-1.5 text-vault-green text-sm font-mono mb-4">
              <Globe className="w-3.5 h-3.5" />
              SiteBuilder Pro — Free Demo
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">
              Generate a professional website in 60 seconds
            </h1>
            <p className="text-vault-text-dim max-w-xl mx-auto">
              Enter your business details and watch AI build a real, deployable website. Free demo — 2 generations, no account required.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Form */}
            <div className="lg:col-span-2 space-y-4">
              <div className="card-surface rounded-2xl p-6 space-y-4">
                <h2 className="font-display font-bold text-lg">Your business details</h2>

                <div>
                  <label className="block text-sm text-vault-text-dim mb-1.5">Business Name <span className="text-vault-accent">*</span></label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Murphy's Auto Repair"
                    className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2.5 text-sm text-vault-text placeholder-vault-text-dim focus:outline-none focus:border-vault-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm text-vault-text-dim mb-1.5">Business Type <span className="text-vault-accent">*</span></label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2.5 text-sm text-vault-text focus:outline-none focus:border-vault-accent transition-colors"
                  >
                    <option value="">Select type...</option>
                    {BUSINESS_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-vault-text-dim mb-1.5">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Austin, TX"
                    className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2.5 text-sm text-vault-text placeholder-vault-text-dim focus:outline-none focus:border-vault-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm text-vault-text-dim mb-1.5">Tagline / Description</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Honest repairs, fair prices"
                    className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2.5 text-sm text-vault-text placeholder-vault-text-dim focus:outline-none focus:border-vault-accent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm text-vault-text-dim mb-2">Brand Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setPrimaryColor(c.value)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${primaryColor === c.value ? "border-white scale-110" : "border-transparent"}`}
                        style={{ backgroundColor: c.hex }}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={loading || !businessName.trim() || !businessType}
                  className="w-full flex items-center justify-center gap-2 bg-vault-green text-vault-bg font-semibold py-3 rounded-xl hover:bg-vault-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Generating website…</>
                  ) : html ? (
                    <><RefreshCw className="w-4 h-4" /> Regenerate</>
                  ) : (
                    <><Play className="w-4 h-4" /> Generate Website</>
                  )}
                </button>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-400">
                    {error}
                  </div>
                )}
              </div>

              {/* What you get */}
              <div className="card-surface rounded-2xl p-5">
                <p className="text-sm font-semibold text-vault-text mb-3">What SiteBuilder Pro does:</p>
                <ul className="space-y-2">
                  {[
                    "Generates full HTML/CSS website in 60s",
                    "Customized for your business type",
                    "Mobile-responsive by default",
                    "Download or get hosted version",
                    "Automated outreach to local prospects",
                    "Unlimited generations with subscription",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-vault-text-dim">
                      <span className="text-vault-green mt-0.5">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Preview */}
            <div className="lg:col-span-3">
              <div className="card-surface rounded-2xl overflow-hidden h-full flex flex-col">
                {/* Preview header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-vault-border bg-vault-surface">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/60" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                      <div className="w-3 h-3 rounded-full bg-green-500/60" />
                    </div>
                    <span className="text-xs text-vault-text-dim font-mono ml-2">
                      {html ? `${generatedName.toLowerCase().replace(/\s+/g, "-")}.com` : "your-business.com"}
                    </span>
                  </div>
                  {html && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewMode("desktop")}
                        className={`p-1.5 rounded transition-colors ${viewMode === "desktop" ? "text-vault-accent" : "text-vault-text-dim hover:text-vault-text"}`}
                        title="Desktop view"
                      >
                        <Monitor className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode("mobile")}
                        className={`p-1.5 rounded transition-colors ${viewMode === "mobile" ? "text-vault-accent" : "text-vault-text-dim hover:text-vault-text"}`}
                        title="Mobile view"
                      >
                        <Smartphone className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Preview content */}
                <div className="flex-1 bg-gray-100 flex items-center justify-center min-h-[500px] p-4">
                  {loading ? (
                    <div className="text-center">
                      <Loader2 className="w-10 h-10 animate-spin text-vault-green mx-auto mb-4" />
                      <p className="text-vault-text-dim text-sm">Generating your website…</p>
                      <p className="text-vault-text-dim text-xs mt-1">Usually takes 15–30 seconds</p>
                    </div>
                  ) : html ? (
                    <div className={`w-full h-full flex items-start justify-center transition-all ${viewMode === "mobile" ? "max-w-sm mx-auto" : ""}`}>
                      <iframe
                        srcDoc={html}
                        className="w-full rounded border border-gray-200 shadow-xl"
                        style={{ height: "520px" }}
                        title="Generated website preview"
                        sandbox="allow-scripts"
                      />
                    </div>
                  ) : (
                    <div className="text-center max-w-xs">
                      <Globe className="w-12 h-12 text-vault-text-dim/30 mx-auto mb-4" />
                      <p className="text-vault-text-dim text-sm">
                        Fill in your business details and click <strong>Generate Website</strong> to see your AI-built site here.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* After result: email capture + CTA */}
          {html && (
            <div className="mt-8 space-y-4">
              <DemoEmailCapture source="demo-sitebuilder" />

              <div className="card-surface rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="font-display font-bold text-lg">Ready to deploy real sites?</p>
                  <p className="text-vault-text-dim text-sm mt-1">
                    Subscribers get unlimited generations, automated prospect outreach, and downloadable HTML packages.
                  </p>
                </div>
                <Link
                  href="/auth/signup"
                  className="shrink-0 bg-vault-green text-vault-bg font-semibold px-6 py-3 rounded-xl hover:bg-vault-green/90 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <ExternalLink className="w-4 h-4" /> Start Free Trial
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
