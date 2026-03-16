import Link from "next/link";
import { ArrowRight, Zap, Target, MessageSquare, Globe, Check, ChevronRight, Clock, Lightbulb } from "lucide-react";
import WishlistForm from "@/app/components/WishlistForm";

const bots = [
  {
    icon: Target,
    name: "LeadGen Pro",
    slug: "leadgen",
    tagline: "Find & close leads on autopilot",
    description: "Scrapes verified contact emails, AI-qualifies against your ICP, and sends personalized 3-email drip sequences automatically. Stop hunting — start closing.",
    color: "cyan",
  },
  {
    icon: Zap,
    name: "ContentBlast",
    slug: "contentblast",
    tagline: "Publish everywhere, instantly",
    description: "Generates AI-written content for Twitter/X, LinkedIn, and blog — then posts it automatically. Schedule entire campaigns with cron. Show up online without showing up.",
    color: "green",
  },
  {
    icon: MessageSquare,
    name: "SupportDesk",
    slug: "supportdesk",
    tagline: "24/7 AI support inbox",
    description: "Monitors your inbox via IMAP, generates grounded AI replies from your knowledge base, and escalates low-confidence tickets to you. Sleep. It's covered.",
    color: "cyan",
  },
  {
    icon: Globe,
    name: "SiteBuilder Pro",
    slug: "sitebuilder",
    tagline: "Find clients, build demos, close deals",
    description: "Discovers local businesses with weak sites, generates custom demo sites with AI, sends proposals, and tracks deals in a built-in CRM. A full sales pipeline on autopilot.",
    color: "green",
  },
];

const roadmap = [
  { name: "BVP ResumeRank", description: "AI resume screener — filter 200 applicants to the top 5 in seconds." },
  { name: "BVP BriefForge", description: "AI content brief generator — stop staring at a blank doc." },
  { name: "BVP WeeklyPulse", description: "Automated business reports delivered to your inbox every Monday." },
  { name: "BVP ChatEmbed", description: "Drop an AI chatbot widget on any site. No code, no dev." },
  { name: "BVP ClauseCheck", description: "AI contract scanner — know what you're signing before you sign it." },
  { name: "BVP OutreachPersonalizer", description: "AI cold email personalizer — 1,000 emails that feel 1-on-1." },
  { name: "BVP PriceWatch", description: "Competitor price tracker — always know when to move." },
  { name: "BVP NicheBoard", description: "Niche job board with AI candidate matching — built for specific industries." },
];

const plans = [
  {
    name: "Free",
    price: "0",
    description: "Try it out — no card needed",
    features: ["Access to dashboard", "1 bot run to test the waters", "All 4 bots included"],
    cta: "Start Free",
    href: "/auth/signup",
    highlight: false,
  },
  {
    name: "Starter",
    price: "49",
    description: "Perfect for solopreneurs",
    features: ["25 leads/run", "10 content blasts/mo", "50 support tickets/mo", "10 site prospects/mo", "Blog content", "Demo site generation", "All 4 bots included"],
    cta: "Get Started",
    href: "/auth/signup?plan=starter",
    highlight: false,
  },
  {
    name: "Growth",
    price: "149",
    description: "For growing businesses",
    badge: "Most Popular",
    features: ["250 leads/run + AI qualification", "100 blasts/mo — all platforms", "500 tickets/mo + IMAP", "100 prospects/mo + Pipeline CRM", "Full 3-email drip sequences", "Cron scheduling", "All 4 bots included"],
    cta: "Get Growth",
    href: "/auth/signup?plan=growth",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Unlimited scale",
    features: ["Everything in Growth", "Unlimited usage", "Priority support", "Custom integrations", "Dedicated onboarding", "All current + future bots"],
    cta: "Contact Us",
    href: "mailto:hello@botvaultpro.com",
    highlight: false,
  },
];

const targetCustomers = [
  { label: "Solopreneurs", emoji: "🧠" },
  { label: "Freelancers", emoji: "💻" },
  { label: "Small business owners", emoji: "🏪" },
  { label: "Side hustlers", emoji: "🚀" },
  { label: "Early-stage startups", emoji: "⚡" },
  { label: "Anyone who can't afford an agency", emoji: "💰" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-vault-bg overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-vault-border bg-vault-bg/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <span className="font-display font-bold text-xl tracking-tight">
            <span className="text-gradient-cyan">Bot</span>
            <span className="text-vault-text"> Vault Pro</span>
          </span>
          <div className="hidden md:flex items-center gap-8 text-sm text-vault-text-dim">
            <a href="#bots" className="hover:text-vault-accent transition-colors">Bots</a>
            <a href="#roadmap" className="hover:text-vault-accent transition-colors">Roadmap</a>
            <a href="#pricing" className="hover:text-vault-accent transition-colors">Pricing</a>
            <a href="#build" className="hover:text-vault-accent transition-colors">Request a Bot</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-vault-text-dim hover:text-vault-text transition-colors hidden sm:block">
              Log in
            </Link>
            <Link href="/auth/signup" className="text-sm bg-vault-accent text-vault-bg font-semibold px-4 py-2 rounded-lg hover:bg-vault-accent-dim transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern bg-grid-size opacity-100 pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-glow-cyan pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-vault-surface border border-vault-border rounded-full px-4 py-1.5 text-sm text-vault-text-dim mb-8">
            <span className="w-2 h-2 rounded-full bg-vault-green animate-pulse-slow" />
            Always building — new automations every quarter
          </div>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight mb-6">
            Your unfair advantage.
            <br />
            <span className="text-gradient-cyan">AI automation</span>
            <br />
            for people who wear every hat.
          </h1>
          <p className="text-vault-text-dim text-lg sm:text-xl max-w-2xl mx-auto mb-6">
            You&apos;re running leads, writing content, handling support, and chasing clients — all at once.
            Bot Vault Pro automates the grind so you can focus on growth.
          </p>
          <p className="text-vault-text-dim text-base max-w-xl mx-auto mb-10">
            4 production-ready AI bots today. More launching every quarter. One subscription. No agency. No code.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-vault-accent text-vault-bg font-display font-bold px-8 py-4 rounded-xl text-lg hover:bg-vault-accent-dim transition-all hover:scale-105">
              Start for free <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#bots" className="w-full sm:w-auto flex items-center justify-center gap-2 border border-vault-border text-vault-text-dim px-8 py-4 rounded-xl text-lg hover:border-vault-accent hover:text-vault-accent transition-all">
              See what&apos;s in the vault <ChevronRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="py-16 px-4 sm:px-6 border-t border-vault-border">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-vault-text-dim text-sm uppercase tracking-widest font-mono mb-6">Built for</p>
          <div className="flex flex-wrap justify-center gap-3">
            {targetCustomers.map((c) => (
              <div key={c.label} className="flex items-center gap-2 bg-vault-surface border border-vault-border rounded-full px-4 py-2 text-sm text-vault-text">
                <span>{c.emoji}</span>
                <span>{c.label}</span>
              </div>
            ))}
          </div>
          <p className="text-vault-text-dim text-base mt-8 max-w-2xl mx-auto">
            If you&apos;ve ever thought <em>&ldquo;I wish I had someone to handle this&rdquo;</em> — that&apos;s exactly what we built.
            AI that works for you around the clock, at a fraction of what an agency charges.
          </p>
        </div>
      </section>

      {/* About / Company positioning */}
      <section className="py-20 px-4 sm:px-6 border-t border-vault-border">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-vault-accent font-mono text-sm uppercase tracking-widest mb-4">What we do</p>
              <h2 className="font-display text-4xl font-bold mb-6 leading-tight">
                We build AI automation for real business problems.
              </h2>
              <p className="text-vault-text-dim leading-relaxed mb-4">
                Bot Vault Pro is an AI automation company. We identify the most painful, time-consuming tasks that small businesses and independent operators face — and we build AI systems that replace them entirely.
              </p>
              <p className="text-vault-text-dim leading-relaxed mb-4">
                Our 4 founding bots target lead generation, content publishing, customer support, and client acquisition. But we&apos;re not stopping there. Every quarter we ship new automations. Our goal is simple: give small operators the same leverage as a 10-person team.
              </p>
              <p className="text-vault-text-dim leading-relaxed">
                No agency markups. No developers needed. No six-month implementation projects. Just plug in, configure, and let the bots run.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { title: "Any industry, any workflow", body: "We build for e-commerce, agencies, service businesses, SaaS founders, coaches, consultants — wherever there&apos;s a repetitive process, there&apos;s a bot waiting to own it." },
                { title: "Always expanding", body: "Our product roadmap is driven by what customers actually need. Submit a request. Vote on ideas. We build what the market demands." },
                { title: "Production-ready from day one", body: "These aren&apos;t demos or prototypes. Every bot in the vault is battle-tested, production-grade, and designed to run unsupervised." },
              ].map((item) => (
                <div key={item.title} className="card-surface rounded-xl p-5">
                  <h3 className="font-display font-bold text-vault-text mb-1">{item.title}</h3>
                  <p className="text-vault-text-dim text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: item.body }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Current Bots */}
      <section id="bots" className="py-24 px-4 sm:px-6 border-t border-vault-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-vault-accent font-mono text-sm uppercase tracking-widest mb-3">Available now</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold mb-4">4 founding bots. One vault.</h2>
            <p className="text-vault-text-dim text-lg max-w-2xl mx-auto">
              Each bot owns a critical business function and runs on autopilot — so you don&apos;t have to.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bots.map((bot) => {
              const Icon = bot.icon;
              const accentClass = bot.color === "cyan" ? "text-vault-accent border-vault-accent/20 bg-vault-accent/5" : "text-vault-green border-vault-green/20 bg-vault-green/5";
              return (
                <div key={bot.slug} className="card-surface rounded-2xl p-8 hover:border-vault-accent/30 transition-all group">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl border ${accentClass} mb-6`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-2">{bot.name}</h3>
                  <p className={`text-sm font-mono mb-4 ${bot.color === "cyan" ? "text-vault-accent" : "text-vault-green"}`}>{bot.tagline}</p>
                  <p className="text-vault-text-dim leading-relaxed">{bot.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Roadmap — In Development */}
      <section id="roadmap" className="py-24 px-4 sm:px-6 border-t border-vault-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-vault-accent font-mono text-sm uppercase tracking-widest mb-3">What&apos;s next</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold mb-4">In development.</h2>
            <p className="text-vault-text-dim text-lg max-w-2xl mx-auto">
              We&apos;re always building. Here&apos;s what&apos;s on the production floor right now.
              Early subscribers get access to every new bot as it ships — no extra charge.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {roadmap.map((item) => (
              <div key={item.name} className="card-surface rounded-xl p-5 relative overflow-hidden group hover:border-vault-accent/30 transition-all">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1 bg-vault-green/10 border border-vault-green/20 text-vault-green text-xs font-mono font-semibold px-2 py-0.5 rounded-full">
                    <Clock className="w-3 h-3" /> Coming Soon
                  </span>
                </div>
                <h3 className="font-display font-bold text-vault-text text-sm mb-2">{item.name}</h3>
                <p className="text-vault-text-dim text-xs leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-vault-text-dim text-sm mt-8">
            Want to influence what we build?{" "}
            <a href="#build" className="text-vault-accent hover:underline">Submit your idea below.</a>
          </p>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 sm:px-6 border-t border-vault-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-vault-accent font-mono text-sm uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold mb-4">Simple, honest pricing.</h2>
            <p className="text-vault-text-dim text-lg max-w-xl mx-auto">
              No hidden fees. No surprise overages. All bots included in every paid plan.
            </p>
          </div>

          {/* Pricing transparency notice */}
          <div className="max-w-3xl mx-auto mb-10">
            <div className="flex items-start gap-4 bg-vault-accent/5 border border-vault-accent/20 rounded-xl px-6 py-5">
              <Lightbulb className="w-5 h-5 text-vault-accent mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-vault-text mb-1">Lock in all-inclusive pricing now.</p>
                <p className="text-vault-text-dim text-sm leading-relaxed">
                  Our current plans give you access to <strong className="text-vault-text">every bot in the vault</strong> — all 4 today, and every new bot we ship. As the product grows,
                  we&apos;ll introduce per-bot plans to give customers more flexibility. But{" "}
                  <strong className="text-vault-text">early subscribers keep their all-inclusive rate for life</strong>. If you&apos;re here now, this is the best deal you&apos;ll ever get.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div key={plan.name} className={`relative rounded-2xl p-6 flex flex-col ${plan.highlight ? "bg-vault-accent/5 border-2 border-vault-accent/50" : "card-surface"}`}>
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-vault-accent text-vault-bg text-xs font-display font-bold px-3 py-1 rounded-full">
                    {plan.badge}
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-display text-xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-vault-text-dim text-sm mb-4">{plan.description}</p>
                  <div className="flex items-end gap-1">
                    {plan.price !== "Custom" && <span className="text-vault-text-dim text-lg">$</span>}
                    <span className="font-display text-4xl font-extrabold">{plan.price}</span>
                    {plan.price !== "Custom" && <span className="text-vault-text-dim text-sm mb-1">/mo</span>}
                  </div>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-vault-text-dim">
                      <Check className="w-4 h-4 text-vault-green mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className={`w-full text-center py-3 rounded-xl font-display font-semibold text-sm transition-all ${plan.highlight ? "bg-vault-accent text-vault-bg hover:bg-vault-accent-dim" : "border border-vault-border text-vault-text hover:border-vault-accent hover:text-vault-accent"}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Wishlist / Build for me */}
      <section id="build" className="py-24 px-4 sm:px-6 border-t border-vault-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-vault-accent font-mono text-sm uppercase tracking-widest mb-3">Community-driven</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold mb-4">What should we build next?</h2>
            <p className="text-vault-text-dim text-lg max-w-2xl mx-auto">
              Our roadmap is driven by what you actually need. Describe the automation or bot you wish existed,
              and we&apos;ll factor it into our build queue. The most-requested ideas ship first.
            </p>
          </div>
          <div className="card-surface rounded-2xl p-8 max-w-xl mx-auto">
            <WishlistForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-vault-border py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-vault-text-dim text-sm">
          <span className="font-display font-bold text-vault-text">
            <span className="text-gradient-cyan">Bot</span> Vault Pro
          </span>
          <span>© 2025 Bot Vault Pro. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-vault-accent transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-vault-accent transition-colors">Terms</Link>
            <a href="mailto:hello@botvaultpro.com" className="hover:text-vault-accent transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
