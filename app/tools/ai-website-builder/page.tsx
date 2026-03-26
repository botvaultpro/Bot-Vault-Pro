import Link from "next/link";
import { Metadata } from "next";
import { Globe, ArrowRight, Check, Zap, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Website Builder for Small Business — SiteBuilder Pro",
  description: "Generate a complete, professional business website in 60 seconds with AI. No coding or design skills needed. Perfect for freelancers, contractors, and local businesses.",
  keywords: ["ai website builder", "ai website generator", "business website generator", "free website builder ai", "website generator for small business"],
  openGraph: {
    title: "AI Website Builder for Small Business — Free Demo",
    description: "Generate a complete professional website in 60 seconds. No coding needed.",
    type: "website",
  },
};

const features = [
  {
    icon: "⚡",
    title: "60-Second Generation",
    desc: "Enter your business name, type, and location. AI writes every headline, service description, and CTA tailored to your industry.",
  },
  {
    icon: "📱",
    title: "Mobile-Responsive by Default",
    desc: "Every generated site works perfectly on phones, tablets, and desktops. No extra work required.",
  },
  {
    icon: "🎨",
    title: "Industry-Specific Design",
    desc: "Restaurants get a different layout than law firms. Every design is optimized for your specific business type and customer expectations.",
  },
  {
    icon: "📤",
    title: "Download or Host Instantly",
    desc: "Get clean HTML/CSS you own outright. Host anywhere, hand it to a developer, or use our one-click hosting.",
  },
  {
    icon: "🎯",
    title: "Automated Prospect Outreach",
    desc: "SiteBuilder Pro finds local businesses in your area that need websites and sends personalized outreach automatically.",
  },
  {
    icon: "♾️",
    title: "Unlimited Generations",
    desc: "Freelancers use SiteBuilder to generate proposals for every prospect in seconds. No limits on Starter or Pro plans.",
  },
];

const businessTypes = [
  "Restaurants & Cafés",
  "Law Firms",
  "Dental & Medical",
  "Real Estate Agencies",
  "Contractors & Builders",
  "Gyms & Fitness Studios",
  "Salons & Spas",
  "Auto Repair Shops",
  "Accounting Firms",
  "Photography Studios",
  "Plumbers & HVAC",
  "Retail Stores",
];

const testimonials = [
  {
    quote: "I use SiteBuilder Pro to pitch every new prospect. I send them a live demo of their future website in the first email. My close rate went from 15% to 40%.",
    name: "Marcus T.",
    title: "Freelance Web Developer",
  },
  {
    quote: "Generated 3 websites for clients in one afternoon. Used to take me a week each. This pays for itself on the first invoice.",
    name: "Sarah K.",
    title: "Digital Marketing Agency",
  },
  {
    quote: "My restaurant client needed a website in 2 days. I had a professional draft ready in 10 minutes. They were blown away.",
    name: "James R.",
    title: "Freelance Designer",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "SiteBuilder Pro — AI Website Generator",
  description: "Generate complete professional business websites in 60 seconds using AI",
  url: "https://botvaultpro.com/tools/ai-website-builder",
  applicationCategory: "BusinessApplication",
  offers: {
    "@type": "Offer",
    price: "49",
    priceCurrency: "USD",
    priceSpecification: { "@type": "UnitPriceSpecification", billingDuration: "P1M" },
  },
  featureList: [
    "AI-generated complete website in 60 seconds",
    "Mobile-responsive design",
    "Industry-specific layouts",
    "Downloadable HTML/CSS",
    "Automated prospect outreach",
    "Unlimited generations",
  ],
};

export default function AIWebsiteBuilderPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-vault-bg">
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-vault-border bg-vault-bg/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link href="/" className="font-display font-bold text-xl tracking-tight">
              <span className="text-gradient-cyan">Bot</span><span className="text-vault-text"> Vault Pro</span>
            </Link>
            <Link href="/auth/signup" className="text-sm bg-vault-accent text-vault-bg font-semibold px-4 py-2 rounded-lg">Try Free</Link>
          </div>
        </nav>

        <div className="pt-28 pb-24 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto space-y-20">

            {/* Hero */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-vault-green/10 border border-vault-green/20 rounded-full px-4 py-1.5 text-vault-green text-sm font-mono mb-6">
                <Globe className="w-3.5 h-3.5" /> AI Website Builder
              </div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold mb-5 leading-tight">
                Generate a complete business website<br className="hidden sm:block" /> in 60 seconds
              </h1>
              <p className="text-vault-text-dim text-lg max-w-2xl mx-auto mb-8">
                No design skills. No coding. Just enter your business details and get a professional, mobile-ready website instantly. Built for freelancers and small businesses.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/demo/sitebuilder" className="inline-flex items-center gap-2 bg-vault-green text-vault-bg font-semibold px-6 py-3 rounded-xl hover:bg-vault-green/90 transition-colors">
                  <Zap className="w-4 h-4" /> Try Free Demo
                </Link>
                <Link href="/pricing" className="inline-flex items-center gap-2 border border-vault-border text-vault-text px-6 py-3 rounded-xl hover:border-vault-accent/40 transition-colors">
                  See Pricing <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <p className="text-vault-text-dim text-sm mt-4">2 free generations · No account required</p>
            </div>

            {/* Features */}
            <div>
              <h2 className="font-display text-2xl font-bold text-center mb-8">Everything included, zero configuration</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {features.map((f) => (
                  <div key={f.title} className="card-surface rounded-xl p-5">
                    <div className="text-2xl mb-3">{f.icon}</div>
                    <h3 className="font-semibold text-vault-text mb-2">{f.title}</h3>
                    <p className="text-vault-text-dim text-sm leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Business types */}
            <div className="card-surface rounded-2xl p-8">
              <h2 className="font-display text-2xl font-bold mb-2">Works for any local business</h2>
              <p className="text-vault-text-dim text-sm mb-6">SiteBuilder Pro generates different layouts optimized for each industry — not the same generic template every time.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {businessTypes.map((type) => (
                  <div key={type} className="flex items-center gap-2 text-sm text-vault-text-dim">
                    <Check className="w-4 h-4 text-vault-green shrink-0" />
                    {type}
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonials */}
            <div>
              <h2 className="font-display text-2xl font-bold text-center mb-8">What freelancers say</h2>
              <div className="grid sm:grid-cols-3 gap-5">
                {testimonials.map((t) => (
                  <div key={t.name} className="card-surface rounded-xl p-5">
                    <div className="flex gap-0.5 mb-3">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                    </div>
                    <p className="text-vault-text-dim text-sm leading-relaxed mb-4">&quot;{t.quote}&quot;</p>
                    <div>
                      <p className="text-sm font-semibold text-vault-text">{t.name}</p>
                      <p className="text-xs text-vault-text-dim">{t.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How it works */}
            <div>
              <h2 className="font-display text-2xl font-bold text-center mb-8">How it works</h2>
              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  { step: "1", title: "Enter details", desc: "Business name, type, location, and brand color. Takes 30 seconds." },
                  { step: "2", title: "AI generates", desc: "Claude AI writes all copy and designs a custom layout for your industry. ~30 seconds." },
                  { step: "3", title: "Download or deploy", desc: "Get clean HTML/CSS to host anywhere, or use our one-click deployment." },
                ].map((s) => (
                  <div key={s.step} className="text-center">
                    <div className="w-12 h-12 rounded-full bg-vault-green/10 border border-vault-green/20 text-vault-green font-display font-bold text-lg flex items-center justify-center mx-auto mb-4">
                      {s.step}
                    </div>
                    <h3 className="font-semibold text-vault-text mb-2">{s.title}</h3>
                    <p className="text-vault-text-dim text-sm">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="text-center card-surface rounded-2xl p-10">
              <Globe className="w-10 h-10 text-vault-green mx-auto mb-4" />
              <h2 className="font-display text-3xl font-bold mb-3">Try it free right now</h2>
              <p className="text-vault-text-dim mb-6 max-w-md mx-auto">
                No account required. Generate 2 websites completely free and see exactly what your clients would get.
              </p>
              <Link href="/demo/sitebuilder" className="inline-flex items-center gap-2 bg-vault-green text-vault-bg font-semibold px-8 py-4 rounded-xl text-lg hover:bg-vault-green/90 transition-colors">
                Generate Your Free Website <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
