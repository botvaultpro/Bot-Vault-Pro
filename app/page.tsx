import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, LayoutPanelLeft, Star, BarChart2, Mail,
  ShieldCheck, FileText, Zap, Check, ChevronRight,
} from "lucide-react";
import WishlistForm from "@/app/components/WishlistForm";

const BOTS = [
  {
    icon: LayoutPanelLeft,
    name: "SiteBuilder Pro",
    slug: "sitebuilder",
    starter: "$49/mo",
    pro: "$99/mo",
    description:
      "Generate a live website sample for any local business in 30 seconds. Auto-create a professional sales proposal. Track every prospect from first contact to closed deal.",
    tagline: "Your pipeline, your proposals, your clients — all in one place.",
  },
  {
    icon: Star,
    name: "ReviewBot",
    slug: "reviewbot",
    starter: "$29/mo",
    pro: "$49/mo",
    description:
      "Connects to your Google Business Profile and auto-drafts a personalized reply for every new review. Approve with one click or let it publish automatically.",
    tagline: "Replies to reviews while you sleep.",
  },
  {
    icon: BarChart2,
    name: "WeeklyPulse",
    slug: "weeklypulse",
    starter: "$19/mo",
    pro: "$39/mo",
    description:
      "Enter your numbers once a week. Get a plain-English business health report delivered to your inbox every Monday — with trend analysis.",
    tagline: "Shows up in your inbox Monday morning.",
  },
  {
    icon: Mail,
    name: "EmailCoach",
    slug: "emailcoach",
    starter: "$19/mo",
    pro: "$39/mo",
    description:
      "Paste any difficult email and get three ready-to-send replies. Over time it learns your tone and writes more like you.",
    tagline: "Gets smarter every time you use it.",
  },
  {
    icon: ShieldCheck,
    name: "ClauseCheck",
    slug: "clausecheck",
    starter: "$29/mo",
    pro: "$49/mo",
    description:
      "Upload any contract. Get flagged risk clauses, plain-English explanations, and missing protections. Builds a personal risk profile.",
    tagline: "Every contract makes the next analysis smarter.",
  },
  {
    icon: FileText,
    name: "InvoiceForge",
    slug: "invoiceforge",
    starter: "$29/mo",
    pro: "$49/mo",
    description:
      "Build professional invoices, send directly from the app, track when clients open them, and trigger automatic overdue reminders.",
    tagline: "Sends. Tracks. Follows up. Automatically.",
  },
];

const GUMROAD_PRODUCTS = [
  {
    name: "BVP AI Readiness Assessment",
    category: "Assessment Tool",
    description: "Find out exactly where your business stands with AI — and what to implement first. A structured audit that scores your operations across 5 key areas and gives you a prioritized action plan.",
    price: "Starting at $27",
    live: true,
  },
  {
    name: "BVP Profit Leak Audit",
    category: "Profit Tool",
    description: "The average trades business loses $40K–$120K per year to invisible profit leaks. This audit identifies every leak in your pricing, collections, follow-up, and scheduling — and shows you how to plug them.",
    price: "Starting at $27",
    live: true,
  },
  {
    name: "BVP Estimating & Sales Audit",
    category: "Sales Tool",
    description: "Stop leaving money on the table. Audit your estimating process, close rate, and sales approach to find where you're losing jobs you should be winning — and fix it fast.",
    price: "Starting at $27",
    live: false,
  },
  {
    name: "BVP Business Health Scorecard",
    category: "Business Tool",
    description: "A comprehensive scorecard that grades your business across operations, cash flow, customer experience, and growth — with specific recommendations to move from surviving to scaling.",
    price: "Starting at $27",
    live: true,
  },
  {
    name: "BVP AI Setup Guide",
    category: "Setup Guide",
    description: "Step-by-step guide to setting up your first AI agent for your trades business. No tech experience required. Get your AI running in an afternoon and start saving hours every week.",
    price: "Starting at $47",
    live: false,
  },
  {
    name: "BVP AI Agent Factory",
    category: "Advanced Guide",
    description: "Build a fleet of AI agents that run your back office. This advanced guide walks you through creating, configuring, and deploying multiple AI agents for estimating, follow-up, invoicing, and more.",
    price: "Starting at $97",
    live: false,
  },
];

const PIPELINE_COLS = [
  {
    id: "planned", label: "Planned", accent: "#4a5a7a",
    items: [
      { name: "Real Estate Prompt Pack",  cat: "Prompt Pack", cc: "#00a8ff", price: "$49",    desc: "AI prompts for listings, client comms, and deal management." },
      { name: "Law Firm Prompt Pack",     cat: "Prompt Pack", cc: "#00a8ff", price: "$69",    desc: "Client intake, case summaries, billing, and professional comms." },
      { name: "Business Operations AI",   cat: "AI Tool",     cc: "#7c4dff", price: "$49/mo", desc: "Operations, scheduling, and customer management — any industry." },
      { name: "Marketing AI Tool",        cat: "AI Tool",     cc: "#7c4dff", price: "$69/mo", desc: "Blogs, social, email campaigns, ad copy — all on-brand in seconds." },
      { name: "Full Prompt Pack Bundle",  cat: "Bundle",      cc: "#00e676", price: "$179",   desc: "All 6 prompt packs at 40% off. Best value for multi-industry use." },
    ],
  },
  {
    id: "dev", label: "In Development", accent: "#00a8ff",
    items: [
      { name: "Trades AI Tool — Pro",    cat: "AI Tool",  cc: "#7c4dff", price: "$99/mo",  desc: "Full automation suite — estimates, follow-ups, collections on autopilot." },
      { name: "Restaurant Prompt Pack",  cat: "Prompt Pack", cc: "#00a8ff", price: "$49",  desc: "Menu copy, review responses, staff comms, supplier negotiations." },
      { name: "Trades Bot",              cat: "Bot",      cc: "#e040fb", price: "$149/mo", desc: "The flagship. Autonomous AI — estimates, invoices, follows up 24/7." },
    ],
  },
  {
    id: "testing", label: "Testing", accent: "#ffd740",
    items: [
      { name: "Trades AI Tool — Starter",      cat: "AI Tool", cc: "#7c4dff", price: "$49/mo", desc: "AI assistant for job estimates, invoices, and customer messaging." },
      { name: "ChatGPT & Claude Setup Guide",  cat: "Playbook", cc: "#ffd740", price: "$49",   desc: "Set up AI tools for your trades business — no tech background needed." },
    ],
  },
  {
    id: "soon", label: "Coming Soon", accent: "#e040fb",
    items: [
      { name: "Trades Pro Prompt Pack",    cat: "Prompt Pack", cc: "#00a8ff", price: "$49",  desc: "150+ AI prompts for contractors — estimates, proposals, collections." },
      { name: "Trades Starter Kit Bundle", cat: "Bundle",      cc: "#00e676", price: "$129", desc: "Prompt Pack + Profit Playbook + bonus templates. Best starting point." },
    ],
  },
  {
    id: "live", label: "Live Now", accent: "#00e676",
    items: [
      { name: "Trades Profit Playbook", cat: "Playbook", cc: "#ffd740", price: "$99", desc: "11-chapter guide to recovering lost revenue — leak audit, estimating, follow-up." },
      { name: "Operations Toolkit",     cat: "Toolkit",  cc: "#ff6e6e", price: "$49", desc: "Job tracker, estimating calculator, invoice log, and profit dashboard." },
    ],
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Subscribe to a bot",
    description:
      "Pick the automation that fixes your biggest pain point. Every bot has a free trial — no credit card required to start.",
    icon: Zap,
  },
  {
    step: "02",
    title: "Configure once",
    description:
      "Connect your accounts, set your preferences, and define your workflow. Takes minutes, not days.",
    icon: Check,
  },
  {
    step: "03",
    title: "It runs forever",
    description:
      "Your bot handles the task automatically while you focus on the work that actually requires you.",
    icon: ArrowRight,
  },
];

export default function LandingPage() {
  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ background: "var(--bg-primary)" }}
    >

      {/* ── 1. Sticky Nav ──────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-md"
        style={{ background: "rgba(10,15,26,0.85)", borderColor: "var(--border)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/BVP_Bot_Tranparent.png"
              alt="Bot Vault Pro"
              width={28}
              height={28}
              className="object-contain"
            />
            <span className="font-display font-extrabold text-lg tracking-tight">
              <span style={{ color: "var(--text-primary)" }}>Bot </span>
              <span style={{ color: "var(--accent-blue)" }}>Vault</span>
              <span style={{ color: "var(--text-primary)" }}> Pro</span>
            </span>
          </Link>

          {/* Center links */}
          <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: "var(--text-secondary)" }}>
            <a href="#bots"      className="hover:text-white transition-colors">Bots</a>
            <a href="#products"  className="hover:text-white transition-colors">Products</a>
            <a href="#pipeline"  className="hover:text-white transition-colors">Pipeline</a>
            <a href="#features"  className="hover:text-white transition-colors">How It Works</a>
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="hidden sm:block text-sm transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm font-medium px-4 py-2 rounded-lg transition-all hover:-translate-y-px"
              style={{
                background: "var(--accent-blue)",
                color: "#0A0F1A",
                fontFamily: "var(--font-body)",
              }}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* ── 2. Hero ────────────────────────────────────────────────────── */}
      <section
        className="relative pt-36 pb-28 px-4 sm:px-6 overflow-hidden"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        {/* Background accent */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(59,130,246,0.08) 0%, transparent 65%)",
          }}
        />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Status pill */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm mb-8"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: "var(--accent-green)", animation: "statusPulse 2s ease-in-out infinite" }}
            />
            Always building — new automations every quarter
          </div>

          {/* Headline with cycling animation */}
          <h1
            className="font-display font-extrabold text-5xl sm:text-6xl md:text-7xl leading-tight mb-6"
            style={{ letterSpacing: "-0.02em", color: "var(--text-primary)" }}
          >
            Stop Prompting.{" "}
            <br className="hidden sm:block" />
            Start{" "}
            <span className="typing-cycle" aria-label="Automating" />
            <span style={{ color: "var(--accent-blue)" }}>.</span>
          </h1>

          <p
            className="text-lg sm:text-xl max-w-2xl mx-auto mb-10"
            style={{ color: "var(--text-secondary)" }}
          >
            Six AI bots that run the parts of your business you&apos;re handling manually right now.
            Set them up once — they run forever.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-medium text-lg transition-all hover:-translate-y-px"
              style={{
                background: "var(--accent-blue)",
                color: "#0A0F1A",
                fontFamily: "var(--font-body)",
              }}
            >
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#bots"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-lg text-lg transition-all hover:-translate-y-px"
              style={{
                background: "transparent",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
              }}
            >
              See All Bots <ChevronRight className="w-5 h-5" />
            </a>
          </div>

          <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            No credit card required. Free trial on every bot.
          </p>
        </div>
      </section>

      {/* ── 3. Bot Showcase ────────────────────────────────────────────── */}
      <section
        id="bots"
        className="py-24 px-4 sm:px-6"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p
              className="text-sm font-mono uppercase tracking-widest mb-3"
              style={{ color: "var(--accent-blue)", fontFamily: "var(--font-mono)" }}
            >
              Available now
            </p>
            <h2
              className="font-display font-extrabold text-4xl sm:text-5xl mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              Six bots. Six business problems solved.
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
              Each bot owns a critical business function and runs on autopilot.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {BOTS.map((bot) => {
              const Icon = bot.icon;
              return (
                <div
                  key={bot.slug}
                  className="card-hover rounded-xl p-7 transition-all"
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{
                        background: "var(--accent-blue-glow)",
                        border: "1px solid rgba(59,130,246,0.25)",
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: "var(--accent-blue)" }} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-mono"
                        style={{ color: "var(--accent-blue)", fontFamily: "var(--font-mono)" }}
                      >
                        {bot.starter}
                      </span>
                    </div>
                  </div>
                  <h3
                    className="font-display font-bold text-xl mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {bot.name}
                  </h3>
                  <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text-secondary)" }}>
                    {bot.description}
                  </p>
                  <p className="text-sm italic" style={{ color: "var(--text-tertiary)" }}>
                    {bot.tagline}
                  </p>
                  <Link
                    href="/auth/signup"
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium transition-all hover:-translate-y-px"
                    style={{ color: "var(--accent-blue)" }}
                  >
                    Try Free <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. Gumroad Products ────────────────────────────────────────── */}
      <section
        id="products"
        className="py-24 px-4 sm:px-6"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-mono uppercase tracking-widest mb-3" style={{ color: "#ff6b00", fontFamily: "var(--font-mono)" }}>
              The Vault
            </p>
            <h2 className="font-display font-extrabold text-4xl sm:text-5xl mb-4" style={{ color: "var(--text-primary)" }}>
              Instant-Download Tools
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
              Tools built to recover money you&apos;re already losing — and save hours you can&apos;t get back. Every product ships instantly. Start using it today.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {GUMROAD_PRODUCTS.map((p) => (
              <div
                key={p.name}
                className="flex flex-col rounded-xl overflow-hidden transition-all hover:-translate-y-1"
                style={{
                  background: "var(--bg-surface)",
                  border: p.live ? "1px solid rgba(255,107,0,0.35)" : "1px solid var(--border)",
                  borderRadius: "12px",
                  boxShadow: p.live ? "0 0 0 1px rgba(255,107,0,0.1)" : "none",
                }}
              >
                {/* Orange accent top bar */}
                <div style={{ height: "3px", background: p.live ? "linear-gradient(90deg,#ff6b00,#ffaa44)" : "#ff6b00", flexShrink: 0 }} />
                <div className="flex flex-col flex-1 p-6">
                  {p.live && (
                    <div className="inline-flex items-center gap-1.5 mb-2 w-fit rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wider"
                      style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#22c55e" }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#22c55e", animation: "statusPulse 2s ease-in-out infinite" }} />
                      Live on Gumroad
                    </div>
                  )}
                  <div className="inline-block mb-3 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider w-fit"
                    style={{ background: "rgba(255,107,0,0.12)", border: "1px solid rgba(255,107,0,0.25)", color: "#ff6b00" }}>
                    {p.category}
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2" style={{ color: "var(--text-primary)" }}>{p.name}</h3>
                  <p className="text-sm leading-relaxed flex-1" style={{ color: "var(--text-secondary)" }}>{p.description}</p>
                </div>
                <div className="px-6 pb-6 flex items-center justify-between">
                  <span className="font-mono font-bold" style={{ color: "#ff6b00", fontFamily: "var(--font-mono)" }}>{p.price}</span>
                  <a
                    href="https://botvaultpro.gumroad.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all hover:-translate-y-px"
                    style={{ background: "#ff6b00", color: "#fff" }}
                  >
                    Buy Now <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <a
              href="https://botvaultpro.gumroad.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all hover:-translate-y-px"
              style={{ border: "2px solid #ff6b00", color: "#ff6b00", background: "transparent" }}
            >
              View All Products on Gumroad <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── 5. Production Line ─────────────────────────────────────────── */}
      <section
        id="pipeline"
        className="py-24 px-4 sm:px-6"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-surface)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-mono uppercase tracking-widest mb-3" style={{ color: "var(--accent-blue)", fontFamily: "var(--font-mono)" }}>
              We build in public
            </p>
            <h2 className="font-display font-extrabold text-4xl sm:text-5xl mb-4" style={{ color: "var(--text-primary)" }}>
              BVP Production Line
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
              Every product we&apos;re working on — from idea to live. Drop your email on anything coming soon to get notified first.
            </p>
          </div>

          {/* Kanban board */}
          <div className="overflow-x-auto pb-4" style={{ WebkitOverflowScrolling: "touch" }}>
            <div className="flex gap-3" style={{ minWidth: "max-content" }}>
              {PIPELINE_COLS.map((col) => (
                <div key={col.id} style={{ width: "230px", flexShrink: 0 }}>
                  {/* Column header */}
                  <div
                    className="flex items-center gap-2 px-3 py-2.5 rounded-t-lg"
                    style={{
                      background: "var(--bg-primary)",
                      border: "1px solid var(--border)",
                      borderTop: `3px solid ${col.accent}`,
                      borderBottom: "none",
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{
                        background: col.accent,
                        boxShadow: col.id === "live" ? `0 0 8px ${col.accent}` : "none",
                        animation: col.id === "live" ? "statusPulse 2s ease-in-out infinite" : "none",
                      }}
                    />
                    <span className="text-xs font-bold uppercase tracking-wider flex-1" style={{ color: col.accent }}>
                      {col.label}
                    </span>
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-tertiary)" }}>
                      {col.items.length}
                    </span>
                  </div>
                  {/* Column body */}
                  <div
                    className="rounded-b-lg p-2 flex flex-col gap-2"
                    style={{ background: "var(--bg-primary)", border: "1px solid var(--border)", borderTop: "none", minHeight: "120px" }}
                  >
                    {col.items.map((item) => (
                      <div
                        key={item.name}
                        className="rounded-lg p-3 transition-all hover:-translate-y-px"
                        style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)" }}
                      >
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: item.cc }} />
                          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: item.cc }}>{item.cat}</span>
                        </div>
                        <p className="text-sm font-bold leading-snug mb-1" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}>{item.name}</p>
                        <p className="text-xs leading-relaxed mb-2" style={{ color: "var(--text-tertiary)" }}>{item.desc}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold" style={{ color: "#00b4ff", fontFamily: "var(--font-mono)" }}>{item.price}</span>
                          {col.id === "live" && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase px-1.5 py-0.5 rounded-full"
                              style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#22c55e" }}>
                              <span className="w-1 h-1 rounded-full" style={{ background: "#22c55e", animation: "statusPulse 2s ease-in-out infinite" }} />
                              Live
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-8">
            <a
              href="/bvp-production-line.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all hover:-translate-y-px"
              style={{ border: "1px solid var(--border)", color: "var(--text-secondary)", background: "transparent" }}
            >
              View Full Interactive Production Line <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── 6. How it Works ────────────────────────────────────────────── */}
      <section
        id="features"
        className="py-24 px-4 sm:px-6"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p
              className="text-sm font-mono uppercase tracking-widest mb-3"
              style={{ color: "var(--accent-blue)", fontFamily: "var(--font-mono)" }}
            >
              Simple process
            </p>
            <h2
              className="font-display font-extrabold text-4xl sm:text-5xl"
              style={{ color: "var(--text-primary)" }}
            >
              How it works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="relative p-8 rounded-xl"
                  style={{
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                  }}
                >
                  <div
                    className="text-5xl font-mono font-bold mb-6 opacity-10 absolute top-6 right-6"
                    style={{ fontFamily: "var(--font-mono)", color: "var(--accent-blue)" }}
                  >
                    {step.step}
                  </div>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-5"
                    style={{
                      background: "var(--accent-blue-glow)",
                      border: "1px solid rgba(59,130,246,0.25)",
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: "var(--accent-blue)" }} />
                  </div>
                  <h3
                    className="font-display font-bold text-lg mb-3"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5. Bundle Banner ───────────────────────────────────────────── */}
      <section
        id="pricing"
        className="py-16 px-4 sm:px-6"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="max-w-4xl mx-auto">
          <div
            className="rounded-xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6"
            style={{
              background: "rgba(245,158,11,0.06)",
              border: "1px solid rgba(245,158,11,0.25)",
              borderRadius: "12px",
            }}
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🎁</span>
                <h3
                  className="font-display font-bold text-xl"
                  style={{ color: "var(--text-primary)" }}
                >
                  Bundle Discount
                </h3>
              </div>
              <p style={{ color: "var(--text-secondary)" }}>
                Subscribe to <strong style={{ color: "var(--accent-amber)" }}>3 or more bots</strong> and{" "}
                <strong style={{ color: "var(--accent-amber)" }}>BUNDLE20</strong> applies automatically.{" "}
                Save 20% every month — no coupon needed.
              </p>
            </div>
            <Link
              href="/auth/signup"
              className="shrink-0 px-6 py-3 rounded-lg font-medium transition-all hover:-translate-y-px"
              style={{
                background: "var(--accent-amber)",
                color: "#0A0F1A",
                fontFamily: "var(--font-body)",
              }}
            >
              Get the Bundle
            </Link>
          </div>
        </div>
      </section>

      {/* ── Wishlist / Build for me ──────────────────────────────────── */}
      <section id="build" className="py-24 px-4 sm:px-6" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p
              className="text-sm font-mono uppercase tracking-widest mb-3"
              style={{ color: "var(--accent-blue)", fontFamily: "var(--font-mono)" }}
            >
              Community-driven
            </p>
            <h2
              className="font-display font-extrabold text-4xl sm:text-5xl mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              What should we build next?
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
              Our roadmap is driven by what you actually need. Submit your idea below and we&apos;ll factor it in.
            </p>
          </div>
          <div
            className="rounded-xl p-8 max-w-xl mx-auto"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px" }}
          >
            <WishlistForm />
          </div>
        </div>
      </section>

      {/* ── 6. Footer ──────────────────────────────────────────────────── */}
      <footer
        className="py-12 px-4 sm:px-6"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <Image
              src="/BVP_Bot_Tranparent.png"
              alt="Bot Vault Pro"
              width={24}
              height={24}
              className="object-contain"
            />
            <span className="font-display font-bold">
              <span style={{ color: "var(--text-primary)" }}>Bot </span>
              <span style={{ color: "var(--accent-blue)" }}>Vault</span>
              <span style={{ color: "var(--text-primary)" }}> Pro</span>
            </span>
            <span className="text-xs ml-2" style={{ color: "var(--text-tertiary)" }}>
              AI automation for real businesses.
            </span>
          </div>

          <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            © 2026 Bot Vault Pro. All rights reserved.
          </span>

          <div className="flex items-center gap-6 text-sm" style={{ color: "var(--text-secondary)" }}>
            <Link href="/pricing"  className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/privacy"  className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms"    className="hover:text-white transition-colors">Terms</Link>
            <a href="https://botvaultpro.gumroad.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Shop</a>
            <a href="mailto:botvaultpro@outlook.com" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
