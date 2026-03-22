import Link from "next/link";
import { ArrowRight, Scale, FileText, Mail, BarChart2 } from "lucide-react";

const demos = [
  {
    slug: "clausecheck",
    name: "ClauseCheck",
    icon: Scale,
    color: "text-orange-400",
    border: "border-orange-400/20",
    bg: "bg-orange-400/5",
    tagline: "Upload any contract. Get flagged risks in 30 seconds.",
    trial: "1 free analysis — no credit card",
    href: "/demo/clausecheck",
  },
  {
    slug: "emailcoach",
    name: "EmailCoach",
    icon: Mail,
    color: "text-vault-accent",
    border: "border-vault-accent/20",
    bg: "bg-vault-accent/5",
    tagline: "Paste a difficult email. Get 3 ready-to-send replies.",
    trial: "3 free replies — no credit card",
    href: "/demo/emailcoach",
  },
  {
    slug: "invoiceforge",
    name: "InvoiceForge",
    icon: FileText,
    color: "text-blue-400",
    border: "border-blue-400/20",
    bg: "bg-blue-400/5",
    tagline: "Generate a professional invoice in 60 seconds.",
    trial: "3 free invoices — no credit card",
    href: "/demo/invoiceforge",
  },
  {
    slug: "weeklypulse",
    name: "WeeklyPulse",
    icon: BarChart2,
    color: "text-purple-400",
    border: "border-purple-400/20",
    bg: "bg-purple-400/5",
    tagline: "Enter your numbers. Get a plain-English business health report.",
    trial: "3 free reports — no credit card",
    href: "/demo/weeklypulse",
  },
];

export const metadata = {
  title: "Try Bot Vault Pro Free — AI Tools for Business",
  description: "Try ClauseCheck, EmailCoach, InvoiceForge, and WeeklyPulse free. No credit card required.",
};

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-vault-bg">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-vault-border bg-vault-bg/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-xl tracking-tight">
            <span className="text-gradient-cyan">Bot</span>
            <span className="text-vault-text"> Vault Pro</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-vault-text-dim hover:text-vault-text transition-colors hidden sm:block">
              Log in
            </Link>
            <Link href="/auth/signup" className="text-sm bg-vault-accent text-vault-bg font-semibold px-4 py-2 rounded-lg hover:bg-vault-accent-dim transition-colors">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      <div className="pt-28 pb-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-vault-accent font-mono text-sm uppercase tracking-widest mb-3">Live Demos</p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
              Try before you subscribe.
            </h1>
            <p className="text-vault-text-dim text-lg max-w-xl mx-auto">
              No account required. Pick a bot and see exactly what it does with your real data.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {demos.map((demo) => {
              const Icon = demo.icon;
              return (
                <Link
                  key={demo.slug}
                  href={demo.href}
                  className={`group rounded-2xl border p-6 flex flex-col gap-4 transition-all hover:scale-[1.02] ${demo.border} ${demo.bg}`}
                >
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${demo.border} ${demo.bg}`}>
                      <Icon className={`w-6 h-6 ${demo.color}`} />
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${demo.border} ${demo.color}`}>
                      {demo.trial}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-vault-text mb-1">{demo.name}</h2>
                    <p className="text-vault-text-dim text-sm">{demo.tagline}</p>
                  </div>
                  <div className={`flex items-center gap-2 text-sm font-semibold mt-auto ${demo.color}`}>
                    Try it free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>

          <p className="text-center text-vault-text-dim text-sm mt-8">
            Like what you see?{" "}
            <Link href="/auth/signup" className="text-vault-accent hover:underline">
              Create a free account
            </Link>{" "}
            to save your results and get more free uses.
          </p>
        </div>
      </div>
    </div>
  );
}
