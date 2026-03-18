import Link from "next/link";

export const metadata = { title: "Terms of Service — Bot Vault Pro" };

export default function TermsPage() {
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
        <h1 className="font-display text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-vault-text-dim text-sm mb-10">Last updated: March 2026</p>

        <div className="space-y-8 text-vault-text-dim leading-relaxed">
          <section>
            <h2 className="font-display text-xl font-bold text-vault-text mb-3">1. Acceptance of Terms</h2>
            <p>By creating an account or using Bot Vault Pro, you agree to these Terms of Service. If you do not agree, do not use the service.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-vault-text mb-3">2. Use of the Service</h2>
            <p>Bot Vault Pro grants you a non-exclusive, non-transferable license to access and use the platform for your own business purposes. You may not resell, redistribute, or use the service to compete directly with Bot Vault Pro.</p>
            <p className="mt-3">You are responsible for all activity under your account and for maintaining the confidentiality of your credentials.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-vault-text mb-3">3. Subscriptions and Billing</h2>
            <p>Bot Vault Pro charges per-bot subscriptions on a monthly basis. Subscriptions auto-renew unless cancelled. You may cancel at any time through the billing portal. No refunds are issued for partial months.</p>
            <p className="mt-3">Bundle discounts (20% off) apply automatically when you subscribe to 3 or more bots simultaneously. Discount is applied at checkout and reflected in your Stripe subscription.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-vault-text mb-3">4. Free Trials</h2>
            <p>Each bot offers a limited free trial. Trial limits are clearly stated on the pricing page. Once trial usage is exhausted, a subscription is required to continue using the bot.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-vault-text mb-3">5. AI-Generated Content</h2>
            <p>Bot Vault Pro uses AI models to generate content, analysis, and recommendations. All AI outputs are provided as-is. You are responsible for reviewing any AI-generated content before acting on it or publishing it. Bot Vault Pro is not liable for errors, omissions, or inaccuracies in AI outputs.</p>
            <p className="mt-3">ClauseCheck outputs are not legal advice. Always consult a licensed attorney for legal decisions.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-vault-text mb-3">6. Limitations of Liability</h2>
            <p>To the maximum extent permitted by law, Bot Vault Pro shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service, including but not limited to loss of revenue, data, or business opportunities.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-vault-text mb-3">7. Termination</h2>
            <p>We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or misuse the platform. You may cancel your account at any time.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-vault-text mb-3">8. Changes to Terms</h2>
            <p>We may update these terms from time to time. Continued use of the service after changes are posted constitutes acceptance of the revised terms.</p>
          </section>

          <section>
            <h2 className="font-display text-xl font-bold text-vault-text mb-3">9. Contact</h2>
            <p>Questions? Email <a href="mailto:hello@botvaultpro.com" className="text-vault-accent hover:underline">hello@botvaultpro.com</a>.</p>
          </section>
        </div>
      </div>

      <footer className="border-t border-vault-border py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-vault-text-dim text-sm">
          <Link href="/" className="font-display font-bold text-vault-text"><span className="text-gradient-cyan">Bot</span> Vault Pro</Link>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-vault-accent transition-colors">Privacy</Link>
            <Link href="/terms" className="text-vault-accent">Terms</Link>
            <a href="mailto:hello@botvaultpro.com" className="hover:text-vault-accent transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
