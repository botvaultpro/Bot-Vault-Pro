import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Users, DollarSign, Gift } from "lucide-react";

export const metadata: Metadata = {
  title: "Affiliate & Referral Program — Earn With Bot Vault Pro",
  description:
    "Earn cash for every customer you refer to Bot Vault Pro. Share your unique link, track your referrals, and get rewarded when they subscribe.",
};

const howItWorks = [
  {
    icon: Users,
    step: "1. Get your link",
    desc: "Sign up for a free account. Your unique referral link is waiting in your dashboard — ready to share immediately.",
  },
  {
    icon: Gift,
    step: "2. Share it",
    desc: "Share your link anywhere — social media, your newsletter, client emails, your website. Every click is tracked.",
  },
  {
    icon: DollarSign,
    step: "3. Earn rewards",
    desc: "When someone signs up through your link and subscribes, you earn a reward. Your dashboard shows every referral and its status.",
  },
];

const faqs = [
  {
    q: "Who can join the referral program?",
    a: "Any Bot Vault Pro account holder. Sign up for a free account — even if you're still on trial — and you get a referral link immediately.",
  },
  {
    q: "How do I get my referral link?",
    a: "Log in to your dashboard. Your referral link and stats are in the Referral Program section. It's a unique link you can share anywhere.",
  },
  {
    q: "What counts as a successful referral?",
    a: "Someone clicks your link, signs up for Bot Vault Pro, and subscribes to at least one bot. Both the trial period and conversion count — you earn the reward when they become a paying subscriber.",
  },
  {
    q: "How long does the referral cookie last?",
    a: "30 days. If someone clicks your link and signs up within 30 days, the referral is credited to you.",
  },
  {
    q: "Is there a limit to how many referrals I can make?",
    a: "No limit. Refer as many people as you want. This is especially valuable for anyone with an audience — newsletter writers, YouTubers, consultants with clients.",
  },
];

export default function AffiliatePage() {
  return (
    <div className="min-h-screen bg-vault-bg">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-vault-border bg-vault-bg/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-xl tracking-tight">
            <span className="text-gradient-cyan">Bot</span>
            <span className="text-vault-text"> Vault Pro</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-vault-text-dim hover:text-vault-text transition-colors hidden sm:block">Log in</Link>
            <Link href="/auth/signup" className="text-sm bg-vault-accent text-vault-bg font-semibold px-4 py-2 rounded-lg hover:bg-vault-accent-dim transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-24 px-4 sm:px-6 max-w-4xl mx-auto space-y-20">

        {/* Hero */}
        <div className="text-center pt-8">
          <div className="inline-flex items-center gap-2 bg-vault-accent/10 border border-vault-accent/20 rounded-full px-4 py-1.5 text-sm text-vault-accent mb-6">
            <Gift className="w-4 h-4" /> Referral Program
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-6 leading-tight">
            Refer a Friend.<br />
            <span className="text-gradient-cyan">You Both Win.</span>
          </h1>
          <p className="text-vault-text-dim text-lg max-w-2xl mx-auto mb-8">
            Share Bot Vault Pro with your network. When someone subscribes through your link, you earn a reward. No cap, no expiry, no complicated tiers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 bg-vault-accent text-vault-bg font-display font-bold px-8 py-4 rounded-xl text-lg hover:bg-vault-accent-dim transition-all hover:scale-105"
            >
              Get Your Referral Link <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 border border-vault-border text-vault-text-dim px-8 py-4 rounded-xl text-lg hover:border-vault-accent hover:text-vault-accent transition-all"
            >
              Already a member? Log in
            </Link>
          </div>
        </div>

        {/* How it works */}
        <div>
          <h2 className="font-display text-3xl font-bold text-center mb-10">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {howItWorks.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="card-surface rounded-2xl p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-vault-accent/10 border border-vault-accent/20 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-6 h-6 text-vault-accent" />
                  </div>
                  <h3 className="font-display font-bold mb-2">{item.step}</h3>
                  <p className="text-vault-text-dim text-sm leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Who this is for */}
        <div className="card-surface rounded-2xl p-8">
          <h2 className="font-display text-2xl font-bold mb-6">Who the referral program is for</h2>
          <div className="space-y-4">
            {[
              {
                who: "Newsletter writers and content creators",
                why: "If you write about business, productivity, or AI tools — your audience is our exact customer. One mention can generate dozens of referrals.",
              },
              {
                who: "Freelancers and consultants",
                why: "If you work with small business clients, you know their pain points. Recommending tools that solve real problems builds trust and earns rewards.",
              },
              {
                who: "Existing Bot Vault Pro users",
                why: "If you're already using the bots and they're working for you — tell someone. You'll earn a reward and they'll thank you for the recommendation.",
              },
              {
                who: "Small business community builders",
                why: "Facebook groups, Slack communities, subreddits, local business networks — if you run or participate in communities where this is relevant, you're in a powerful position.",
              },
            ].map((item) => (
              <div key={item.who} className="border-b border-vault-border/50 pb-4 last:border-0 last:pb-0">
                <p className="font-display font-bold text-vault-text mb-1">{item.who}</p>
                <p className="text-vault-text-dim text-sm leading-relaxed">{item.why}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard preview */}
        <div className="card-surface rounded-2xl p-8">
          <h2 className="font-display text-2xl font-bold mb-4">Full tracking in your dashboard</h2>
          <p className="text-vault-text-dim mb-6">
            Once you sign in, your dashboard shows your referral link, a one-click copy button, total referrals sent, and how many have converted. You always know exactly where things stand.
          </p>
          <div className="bg-vault-bg rounded-xl border border-vault-border p-6 font-mono text-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-vault-text-dim text-xs uppercase tracking-wider">Your Referral Link</span>
              <span className="text-xs text-vault-green bg-vault-green/10 px-2 py-0.5 rounded-full">Active</span>
            </div>
            <div className="bg-vault-surface rounded-lg px-4 py-3 text-vault-accent text-xs mb-4 truncate">
              https://botvaultpro.com/ref/YOUR-CODE
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-vault-text">—</p>
                <p className="text-xs text-vault-text-dim">Referrals sent</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-vault-accent">—</p>
                <p className="text-xs text-vault-text-dim">Converted</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-vault-green">—</p>
                <p className="text-xs text-vault-text-dim">Rewards earned</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="font-display text-3xl font-bold text-center mb-10">Frequently asked questions</h2>
          <div className="space-y-4 max-w-2xl mx-auto">
            {faqs.map((faq) => (
              <div key={faq.q} className="card-surface rounded-xl p-6">
                <h3 className="font-display font-bold mb-2">{faq.q}</h3>
                <p className="text-vault-text-dim text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold mb-4">Start referring today</h2>
          <p className="text-vault-text-dim mb-8">Create a free account to get your link. No subscription required to participate.</p>
          <Link href="/auth/signup" className="inline-flex items-center gap-2 bg-vault-accent text-vault-bg font-display font-bold px-8 py-4 rounded-xl text-lg hover:bg-vault-accent-dim transition-all hover:scale-105">
            Get My Referral Link <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      <footer className="border-t border-vault-border py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-vault-text-dim text-sm">
          <Link href="/" className="font-display font-bold text-vault-text"><span className="text-gradient-cyan">Bot</span> Vault Pro</Link>
          <span>© 2026 Bot Vault Pro. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/pricing" className="hover:text-vault-accent transition-colors">Pricing</Link>
            <Link href="/demo" className="hover:text-vault-accent transition-colors">Try Demo</Link>
            <Link href="/privacy" className="hover:text-vault-accent transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
