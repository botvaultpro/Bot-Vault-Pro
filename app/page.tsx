import Link from "next/link";
import { ArrowRight, Zap, Target, MessageSquare, Globe, Check, ChevronRight } from "lucide-react";

const bots = [
  {
    icon: Target,
    name: "LeadGen Pro",
    slug: "leadgen",
    tagline: "Find & close leads on autopilot",
    description: "Scrapes verified contact emails, AI-qualifies against your ICP, and sends personalized 3-email drip sequences automatically.",
    color: "cyan",
  },
  {
    icon: Zap,
    name: "ContentBlast",
    slug: "contentblast",
    tagline: "Publish everywhere, instantly",
    description: "Generates AI-written content for Twitter/X, LinkedIn, and blog — then posts it automatically. Schedule entire campaigns with cron.",
    color: "green",
  },
  {
    icon: MessageSquare,
    name: "SupportDesk",
    slug: "supportdesk",
    tagline: "24/7 AI support inbox",
    description: "Monitors your inbox via IMAP, generates grounded AI replies from your knowledge base, and escalates low-confidence tickets to humans.",
    color: "cyan",
  },
  {
    icon: Globe,
    name: "SiteBuilder Pro",
    slug: "sitebuilder",
    tagline: "Find clients, build demos, close deals",
    description: "Discovers local businesses with weak sites, generates custom demo sites with AI, sends proposals, and tracks deals in a built-in CRM.",
    color: "green",
  },
];

const plans = [
  {
    name: "Free",
    price: "0",
    description: "Try it out",
    features: ["Account + dashboard access", "1 bot run (minimal)"],
    cta: "Start Free",
    href: "/auth/signup",
    highlight: false,
  },
  {
    name: "Starter",
    price: "49",
    description: "For individuals",
    features: ["25 leads/run", "10 content blasts/mo", "50 support tickets/mo", "10 site prospects/mo", "Blog content", "Demo site generation"],
    cta: "Get Started",
    href: "/auth/signup?plan=starter",
    highlight: false,
  },
  {
    name: "Growth",
    price: "149",
    description: "For growing teams",
    badge: "Most Popular",
    features: ["250 leads/run + AI qualification", "100 blasts/mo — all platforms", "500 tickets/mo + IMAP", "100 prospects/mo + Pipeline CRM", "Full 3-email drip sequences", "Cron scheduling"],
    cta: "Get Growth",
    href: "/auth/signup?plan=growth",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Unlimited scale",
    features: ["Everything in Growth", "Unlimited usage", "Priority support", "Custom integrations", "Dedicated onboarding"],
    cta: "Contact Us",
    href: "mailto:hello@botvaultpro.com",
    highlight: false,
  },
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
            <a href="#pricing" className="hover:text-vault-accent transition-colors">Pricing</a>
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
            4 AI bots. One subscription.
          </div>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight mb-6">
            Automate your
            <br />
            <span className="text-gradient-cyan">entire business</span>
            <br />
            with AI bots
          </h1>
          <p className="text-vault-text-dim text-lg sm:text-xl max-w-2xl mx-auto mb-10">
            LeadGen, ContentBlast, SupportDesk, and SiteBuilder Pro — four production-ready AI automation bots in one vault. No code required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-vault-accent text-vault-bg font-display font-bold px-8 py-4 rounded-xl text-lg hover:bg-vault-accent-dim transition-all hover:scale-105">
              Start for free <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#bots" className="w-full sm:w-auto flex items-center justify-center gap-2 border border-vault-border text-vault-text-dim px-8 py-4 rounded-xl text-lg hover:border-vault-accent hover:text-vault-accent transition-all">
              See the bots <ChevronRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Bots */}
      <section id="bots" className="py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl sm:text-5xl font-bold mb-4">Four bots. One vault.</h2>
            <p className="text-vault-text-dim text-lg max-w-2xl mx-auto">Each bot targets a specific business function and runs on autopilot.</p>
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

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 sm:px-6 border-t border-vault-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl sm:text-5xl font-bold mb-4">Simple pricing</h2>
            <p className="text-vault-text-dim text-lg">All bots included in every paid plan.</p>
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
