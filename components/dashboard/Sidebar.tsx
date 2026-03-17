"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Globe, Star, FileText, Scale,
  BarChart2, Mail, CreditCard, Settings, LogOut, X,
  GitBranch, ChevronDown, ChevronRight, Lock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { useState } from "react";

interface BotSub {
  bot_slug: string;
  status: string;
}

interface SidebarProps {
  subscriptions?: BotSub[];
  email: string;
  onClose?: () => void;
}

const BOT_SECTIONS = [
  {
    slug: "sitebuilder",
    label: "SiteBuilder Pro",
    icon: Globe,
    color: "text-vault-green",
    activeClass: "bg-vault-green/10 text-vault-green border border-vault-green/20",
    subPages: [
      { href: "/dashboard/bots/sitebuilder", label: "Generate Site", icon: Globe },
      { href: "/dashboard/sitebuilder/pipeline", label: "Pipeline", icon: GitBranch },
    ],
  },
  {
    slug: "reviewbot",
    label: "ReviewBot",
    icon: Star,
    color: "text-yellow-400",
    activeClass: "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20",
    href: "/dashboard/reviewbot",
  },
  {
    slug: "invoiceforge",
    label: "InvoiceForge",
    icon: FileText,
    color: "text-blue-400",
    activeClass: "bg-blue-400/10 text-blue-400 border border-blue-400/20",
    href: "/dashboard/invoiceforge",
  },
  {
    slug: "clausecheck",
    label: "ClauseCheck",
    icon: Scale,
    color: "text-orange-400",
    activeClass: "bg-orange-400/10 text-orange-400 border border-orange-400/20",
    href: "/dashboard/clausecheck",
  },
  {
    slug: "weeklypulse",
    label: "WeeklyPulse",
    icon: BarChart2,
    color: "text-purple-400",
    activeClass: "bg-purple-400/10 text-purple-400 border border-purple-400/20",
    href: "/dashboard/weeklypulse",
  },
  {
    slug: "emailcoach",
    label: "EmailCoach",
    icon: Mail,
    color: "text-vault-accent",
    activeClass: "bg-vault-accent/10 text-vault-accent border border-vault-accent/20",
    href: "/dashboard/emailcoach",
  },
];

const bottomItems = [
  { href: "/dashboard/billing", icon: CreditCard, label: "Billing" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar({ subscriptions = [], email, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [siteBuilderOpen, setSiteBuilderOpen] = useState(
    pathname.startsWith("/dashboard/bots/sitebuilder") ||
    pathname.startsWith("/dashboard/sitebuilder")
  );

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  function isActive(href: string) {
    return pathname === href;
  }

  function isBotActive(slug: string) {
    const sub = subscriptions.find((s) => s.bot_slug === slug);
    return sub?.status === "active" || sub?.status === "trialing";
  }

  return (
    <aside className="flex flex-col h-full bg-vault-surface border-r border-vault-border w-64">
      {/* Logo */}
      <div className="p-5 border-b border-vault-border flex items-center justify-between">
        <Link href="/dashboard" className="font-display text-lg font-bold">
          <span className="text-gradient-cyan">Bot</span>
          <span className="text-vault-text"> Vault Pro</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-vault-text-dim hover:text-vault-text md:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="p-4 border-b border-vault-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-vault-accent/20 border border-vault-accent/30 flex items-center justify-center text-vault-accent font-display font-bold text-sm">
            {email?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-vault-text truncate">{email}</p>
            <span className="text-xs text-vault-text-dim">
              {subscriptions.filter((s) => s.status === "active").length} bot{subscriptions.filter((s) => s.status === "active").length !== 1 ? "s" : ""} active
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {/* Dashboard */}
        <Link
          href="/dashboard"
          onClick={onClose}
          className={clsx(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
            isActive("/dashboard")
              ? "bg-vault-accent/10 text-vault-accent border border-vault-accent/20"
              : "text-vault-text-dim hover:text-vault-text hover:bg-vault-border/50"
          )}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          Dashboard
        </Link>

        {/* Bot sections */}
        {BOT_SECTIONS.map((bot) => {
          const Icon = bot.icon;
          const active = isBotActive(bot.slug);
          const sectionActive = bot.subPages
            ? (pathname.startsWith("/dashboard/bots/sitebuilder") || pathname.startsWith("/dashboard/sitebuilder"))
            : bot.href ? isActive(bot.href) : false;

          if (bot.subPages) {
            // SiteBuilder with expandable sub-pages
            return (
              <div key={bot.slug}>
                <button
                  onClick={() => setSiteBuilderOpen((o) => !o)}
                  className={clsx(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                    sectionActive
                      ? bot.activeClass
                      : active
                        ? "text-vault-text hover:bg-vault-border/50"
                        : "text-vault-text-dim hover:text-vault-text hover:bg-vault-border/50"
                  )}
                >
                  <Icon className={clsx("w-4 h-4 shrink-0", sectionActive ? "" : bot.color)} />
                  <span className="flex-1 text-left">{bot.label}</span>
                  {!active && <Lock className="w-3 h-3 shrink-0 opacity-50" />}
                  {active && (siteBuilderOpen
                    ? <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                    : <ChevronRight className="w-3.5 h-3.5 shrink-0" />)}
                  {sectionActive && active && (siteBuilderOpen
                    ? <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                    : <ChevronRight className="w-3.5 h-3.5 shrink-0" />)}
                </button>

                {(siteBuilderOpen || sectionActive) && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-vault-border pl-3">
                    {active ? bot.subPages.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={onClose}
                        className={clsx(
                          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                          isActive(sub.href)
                            ? "bg-vault-green/10 text-vault-green"
                            : "text-vault-text-dim hover:text-vault-text hover:bg-vault-border/50"
                        )}
                      >
                        <sub.icon className="w-3.5 h-3.5 shrink-0" />
                        {sub.label}
                      </Link>
                    )) : (
                      <Link
                        href="/dashboard/billing"
                        onClick={onClose}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-vault-accent hover:bg-vault-accent/5 transition-all"
                      >
                        Subscribe to unlock
                      </Link>
                    )}
                  </div>
                )}
              </div>
            );
          }

          // Simple bot link
          if (!active) {
            return (
              <div key={bot.slug} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-vault-text-dim/60">
                <Icon className={clsx("w-4 h-4 shrink-0 opacity-50", bot.color)} />
                <span className="flex-1 truncate">{bot.label}</span>
                <Lock className="w-3 h-3 shrink-0 opacity-40" />
              </div>
            );
          }

          return (
            <Link
              key={bot.slug}
              href={bot.href!}
              onClick={onClose}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                sectionActive
                  ? bot.activeClass
                  : "text-vault-text-dim hover:text-vault-text hover:bg-vault-border/50"
              )}
            >
              <Icon className={clsx("w-4 h-4 shrink-0", bot.color)} />
              {bot.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-vault-border space-y-1">
        <Link
          href="/dashboard/billing"
          onClick={onClose}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-vault-accent/10 border border-vault-accent/30 text-vault-accent rounded-lg text-sm font-semibold hover:bg-vault-accent/20 transition-colors mb-2"
        >
          ⚡ Subscribe to Bots
        </Link>
        {bottomItems.map(({ href, icon: ItemIcon, label }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
              pathname === href
                ? "bg-vault-accent/10 text-vault-accent"
                : "text-vault-text-dim hover:text-vault-text hover:bg-vault-border/50"
            )}
          >
            <ItemIcon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-vault-text-dim hover:text-red-400 hover:bg-red-400/5 transition-all w-full"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Log out
        </button>
      </div>
    </aside>
  );
}
