import Link from "next/link";

export const metadata = { title: "Privacy Policy — Bot Vault Pro" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-vault-bg">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-vault-border bg-vault-bg/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-xl tracking-tight">
            <span className="text-gradient-cyan">Bot</span>
            <span className="text-vault-text"> Vault Pro</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-vault-text-dim hover:text-vault-text transition-colors">Log in</Link>
            <Link href="/auth/signup" className="text-sm bg-vault-accent text-vault-bg font-semibold px-4 py-2 rounded-lg hover:bg-vault-accent-dim transition-colors">Get Started</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-24">
        <h1 className="font-display text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-vault-text-dim text-sm mb-10">Last updated: March 2026</p>

        <div className="prose prose-invert max-w-none space-y-8 text-vault-text-dim leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-bold text-vault-text mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly to us when you create an account, subscribe to a bot, or use our services. This includes your name, email address, and payment information (processed securely via Stripe).</p>
            <p className="mt-3">We also collect usage data such as bot runs, activity logs, and feature usage to improve the product and send you relevant reports (e.g., WeeklyPulse reports).</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-vault-text mb-3">2. How We Use Your Information</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>To operate and improve the Bot Vault Pro platform</li>
              <li>To process your subscriptions and send receipts</li>
              <li>To send automated reports and notifications from your subscribed bots</li>
              <li>To respond to your support requests</li>
              <li>To send product updates and announcements (you may opt out at any time)</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-vault-text mb-3">3. Data Storage and Security</h2>
            <p>Your data is stored securely using Supabase, a SOC 2 compliant database platform. Payment information is handled entirely by Stripe and never stored on our servers. We use industry-standard encryption in transit and at rest.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-vault-text mb-3">4. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul className="space-y-2 list-disc list-inside mt-3">
              <li><strong className="text-vault-text">Stripe</strong> — Payment processing</li>
              <li><strong className="text-vault-text">Supabase</strong> — Database and authentication</li>
              <li><strong className="text-vault-text">Anthropic</strong> — AI model provider (Claude)</li>
              <li><strong className="text-vault-text">Resend</strong> — Transactional email delivery</li>
              <li><strong className="text-vault-text">Vercel</strong> — Hosting and deployment</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-vault-text mb-3">5. Your Rights</h2>
            <p>You may request deletion of your account and associated data at any time by emailing <a href="mailto:hello@botvaultpro.com" className="text-vault-accent hover:underline">hello@botvaultpro.com</a>. We will process deletion requests within 30 days.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-vault-text mb-3">6. Contact</h2>
            <p>Questions about this policy? Contact us at <a href="mailto:hello@botvaultpro.com" className="text-vault-accent hover:underline">hello@botvaultpro.com</a>.</p>
          </section>
        </div>
      </div>

      <footer className="border-t border-vault-border py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-vault-text-dim text-sm">
          <Link href="/" className="font-display font-bold text-vault-text"><span className="text-gradient-cyan">Bot</span> Vault Pro</Link>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-vault-accent">Privacy</Link>
            <Link href="/terms" className="hover:text-vault-accent transition-colors">Terms</Link>
            <a href="mailto:hello@botvaultpro.com" className="hover:text-vault-accent transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
