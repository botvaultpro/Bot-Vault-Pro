import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Bot Vault Pro",
  description: "Practical guides for freelancers and small business owners. Contract review, email writing, invoicing, and business automation.",
};

const posts = [
  {
    slug: "how-to-get-clients-as-a-freelancer",
    title: "How to Get Clients as a Freelancer in 2026 (Without Cold Emailing Strangers)",
    excerpt: "The 5 channels that consistently book 3–5 new clients per month, the exact scripts to use, and one AI shortcut that freelancers are using to close deals in the first email.",
    tag: "Freelancing",
    tagColor: "text-vault-green bg-vault-green/10 border-vault-green/20",
    readTime: "10 min read",
    date: "March 2026",
  },
  {
    slug: "best-ai-tools-for-small-business",
    title: "Best AI Tools for Small Business in 2026 (Honest Comparison)",
    excerpt: "We tested the top AI tools for invoicing, email, contract review, and analytics. Here's what actually works for solopreneurs and small business owners — with real pricing.",
    tag: "AI Tools",
    tagColor: "text-vault-accent bg-vault-accent/10 border-vault-accent/20",
    readTime: "8 min read",
    date: "March 2026",
  },
  {
    slug: "how-to-write-an-invoice",
    title: "How to Write a Professional Invoice That Gets Paid Faster",
    excerpt: "10 required fields, the right payment terms, an example invoice, and the follow-up sequence that collects 94%+ of overdue invoices before day 14.",
    tag: "Invoicing",
    tagColor: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    readTime: "7 min read",
    date: "March 2026",
  },
  {
    slug: "how-to-review-a-contract",
    title: "How to Review a Contract (Without a Lawyer): A Practical Checklist",
    excerpt: "Before you sign anything, run through these 12 checks. They catch the clauses that cost freelancers and small businesses the most money.",
    tag: "Contracts",
    tagColor: "text-orange-400 bg-orange-400/10 border-orange-400/20",
    readTime: "8 min read",
    date: "March 2026",
  },
  {
    slug: "ai-email-reply-tips",
    title: "How to Reply to Difficult Emails Professionally (With AI Examples)",
    excerpt: "Late payments, difficult clients, awkward negotiations — here's exactly how to handle the emails you dread writing, with real examples.",
    tag: "Email",
    tagColor: "text-vault-accent bg-vault-accent/10 border-vault-accent/20",
    readTime: "6 min read",
    date: "March 2026",
  },
];

export default function BlogPage() {
  return (
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
        <div className="max-w-2xl mx-auto">
          <div className="mb-10">
            <p className="text-vault-accent font-mono text-sm uppercase tracking-widest mb-2">Blog</p>
            <h1 className="font-display text-4xl font-bold mb-3">Practical guides for small business operators.</h1>
            <p className="text-vault-text-dim">No fluff. Just actionable advice on contracts, emails, invoicing, and automation.</p>
          </div>
          <div className="space-y-6">
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="block card-surface rounded-2xl p-6 hover:border-vault-accent/30 transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${post.tagColor}`}>{post.tag}</span>
                  <span className="text-xs text-vault-text-dim">{post.date} · {post.readTime}</span>
                </div>
                <h2 className="font-display text-xl font-bold text-vault-text mb-2 group-hover:text-vault-accent transition-colors">{post.title}</h2>
                <p className="text-vault-text-dim text-sm leading-relaxed">{post.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
