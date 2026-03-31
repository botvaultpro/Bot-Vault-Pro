"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home, LayoutPanelLeft, Star, BarChart2, Mail,
  ShieldCheck, FileText, CreditCard, Settings,
  LogOut, X, GitBranch, ChevronDown, ChevronRight,
  Lock,
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
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const BOT_NAV = [
  {
    slug: "sitebuilder",
    label: "SiteBuilder Pro",
    icon: LayoutPanelLeft,
    href: "/dashboard/bots/sitebuilder",
    subPages: [
      { href: "/dashboard/bots/sitebuilder", label: "Generate Site", icon: LayoutPanelLeft },
      { href: "/dashboard/sitebuilder/pipeline", label: "Pipeline", icon: GitBranch },
    ],
  },
  { slug: "reviewbot",    label: "ReviewBot",     icon: Star,        href: "/dashboard/reviewbot" },
  { slug: "weeklypulse",  label: "WeeklyPulse",   icon: BarChart2,   href: "/dashboard/weeklypulse" },
  { slug: "emailcoach",   label: "EmailCoach",    icon: Mail,        href: "/dashboard/emailcoach" },
  { slug: "clausecheck",  label: "ClauseCheck",   icon: ShieldCheck, href: "/dashboard/clausecheck" },
  { slug: "invoiceforge", label: "InvoiceForge",  icon: FileText,    href: "/dashboard/invoiceforge" },
];

const BOTTOM_NAV = [
  { href: "/dashboard/billing",  icon: CreditCard, label: "Billing" },
  { href: "/dashboard/settings", icon: Settings,   label: "Settings" },
];

export default function Sidebar({
  subscriptions = [],
  email,
  onClose,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
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

  function isPathActive(href: string) {
    return pathname === href;
  }

  function isBotActive(slug: string) {
    const sub = subscriptions.find((s) => s.bot_slug === slug);
    return sub?.status === "active" || sub?.status === "trialing";
  }

  const activeCount = subscriptions.filter((s) => s.status === "active").length;
  const trialCount  = subscriptions.filter((s) => s.status === "trialing").length;
  const planLabel   = activeCount >= 3 ? "Bundle Active" : activeCount > 0 ? `${activeCount} Bot${activeCount > 1 ? "s" : ""}` : "Free";

  const initials = email?.[0]?.toUpperCase() ?? "U";

  if (collapsed) {
    return (
      <aside
        className="flex flex-col h-full border-r"
        style={{ width: 64, background: "var(--bg-surface)", borderColor: "var(--border)" }}
      >
        {/* Logo icon */}
        <div className="flex items-center justify-center py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <Link href="/dashboard">
            <Image
              src="/BVP_Bot_Tranparent.png"
              alt="BVP"
              width={32}
              height={32}
              className="object-contain"
            />
          </Link>
        </div>

        {/* Expand toggle */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="mx-auto mt-2 mb-1 p-1.5 rounded-lg transition-colors"
            style={{ color: "var(--text-secondary)" }}
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Icon-only nav */}
        <nav className="flex-1 flex flex-col items-center py-2 gap-1 overflow-y-auto">
          <Link
            href="/dashboard"
            title="Dashboard"
            className={clsx(
              "w-10 h-10 flex items-center justify-center rounded-lg transition-all",
              isPathActive("/dashboard")
                ? "bg-vault-elevated text-vault-accent"
                : "text-vault-text-dim hover:text-vault-text hover:bg-vault-elevated"
            )}
          >
            <Home className="w-4 h-4" />
          </Link>
          {BOT_NAV.map((bot) => {
            const Icon = bot.icon;
            const active = isBotActive(bot.slug);
            const current = pathname.startsWith(bot.href.replace("/generate-site", ""));
            return (
              <div key={bot.slug} className="relative group">
                {active ? (
                  <Link
                    href={bot.href}
                    title={bot.label}
                    className={clsx(
                      "w-10 h-10 flex items-center justify-center rounded-lg transition-all",
                      current
                        ? "bg-vault-elevated text-vault-accent"
                        : "text-vault-text-dim hover:text-vault-text hover:bg-vault-elevated"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </Link>
                ) : (
                  <div
                    title={`${bot.label} — Subscribe to unlock`}
                    className="w-10 h-10 flex items-center justify-center rounded-lg opacity-40 cursor-not-allowed"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="flex flex-col items-center py-3 gap-1 border-t" style={{ borderColor: "var(--border)" }}>
          {BOTTOM_NAV.map(({ href, icon: NavIcon, label }) => (
            <Link
              key={href}
              href={href}
              title={label}
              className={clsx(
                "w-10 h-10 flex items-center justify-center rounded-lg transition-all",
                isPathActive(href)
                  ? "text-vault-accent bg-vault-elevated"
                  : "text-vault-text-dim hover:text-vault-text hover:bg-vault-elevated"
              )}
            >
              <NavIcon className="w-4 h-4" />
            </Link>
          ))}
          <button
            onClick={handleLogout}
            title="Log out"
            className="w-10 h-10 flex items-center justify-center rounded-lg text-vault-text-dim hover:text-red-400 hover:bg-red-400/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className="flex flex-col h-full border-r"
      style={{ width: 256, background: "var(--bg-surface)", borderColor: "var(--border)" }}
    >
      {/* Logo + collapse toggle */}
      <div
        className="px-5 py-4 border-b flex items-center justify-between"
        style={{ borderColor: "var(--border)" }}
      >
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="font-display font-extrabold text-lg tracking-tight leading-none">
            <span className="text-vault-text">Bot </span>
            <span style={{ color: "var(--accent-blue)" }}>Vault</span>
            <span className="text-vault-text"> Pro</span>
          </span>
        </Link>
        <div className="flex items-center gap-1">
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded-md transition-colors"
              style={{ color: "var(--text-tertiary)" }}
              title="Collapse sidebar"
            >
              <ChevronDown className="w-4 h-4 rotate-90" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-md transition-colors md:hidden"
              style={{ color: "var(--text-tertiary)" }}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Bot mascot */}
      <div className="flex justify-center py-4 border-b" style={{ borderColor: "var(--border)" }}>
        <Image
          src="/BVP_Bot_Tranparent.png"
          alt="Bot Vault Pro"
          width={40}
          height={40}
          className="object-contain opacity-90"
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
        {/* Dashboard */}
        <Link
          href="/dashboard"
          onClick={onClose}
          className={clsx(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group",
            isPathActive("/dashboard") || isPathActive("/dashboard/dashboard")
              ? "nav-active text-vault-text"
              : "text-vault-text-dim hover:text-vault-text hover:bg-vault-elevated"
          )}
          style={
            isPathActive("/dashboard") || isPathActive("/dashboard/dashboard")
              ? { borderLeft: "2px solid var(--accent-blue)", background: "var(--bg-elevated)" }
              : {}
          }
        >
          <Home className="w-4 h-4 shrink-0" />
          <span>Dashboard</span>
        </Link>

        {/* Bot nav items */}
        {BOT_NAV.map((bot) => {
          const Icon = bot.icon;
          const active = isBotActive(bot.slug);
          const isSiteBuilder = !!bot.subPages;
          const sectionCurrent = isSiteBuilder
            ? pathname.startsWith("/dashboard/bots/sitebuilder") || pathname.startsWith("/dashboard/sitebuilder")
            : isPathActive(bot.href);

          if (isSiteBuilder) {
            return (
              <div key={bot.slug}>
                <button
                  onClick={() => active && setSiteBuilderOpen((o) => !o)}
                  className={clsx(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                    sectionCurrent && active
                      ? "text-vault-text"
                      : active
                        ? "text-vault-text-dim hover:text-vault-text hover:bg-vault-elevated"
                        : "text-vault-text-dim/50 cursor-default"
                  )}
                  style={
                    sectionCurrent && active
                      ? { borderLeft: "2px solid var(--accent-blue)", background: "var(--bg-elevated)" }
                      : {}
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1 text-left">{bot.label}</span>
                  {!active && (
                    <Lock className="w-3 h-3 shrink-0 opacity-50" />
                  )}
                  {active && (
                    siteBuilderOpen
                      ? <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                      : <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                  )}
                </button>

                {active && siteBuilderOpen && (
                  <div
                    className="ml-4 mt-0.5 space-y-0.5 pl-3 border-l"
                    style={{ borderColor: "var(--border)" }}
                  >
                    {bot.subPages!.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={onClose}
                        className={clsx(
                          "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                          isPathActive(sub.href)
                            ? "text-vault-accent"
                            : "text-vault-text-dim hover:text-vault-text hover:bg-vault-elevated"
                        )}
                      >
                        <sub.icon className="w-3.5 h-3.5 shrink-0" />
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}

                {!active && siteBuilderOpen && (
                  <div
                    className="ml-4 mt-0.5 pl-3 border-l"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <Link
                      href="/dashboard/billing"
                      onClick={onClose}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all"
                      style={{ color: "var(--accent-blue)" }}
                    >
                      Subscribe to unlock
                    </Link>
                  </div>
                )}
              </div>
            );
          }

          // Simple locked bot
          if (!active) {
            return (
              <div
                key={bot.slug}
                className="relative group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm"
                style={{ color: "var(--text-tertiary)" }}
                title="Subscribe to unlock"
              >
                <Icon className="w-4 h-4 shrink-0 opacity-50" />
                <span className="flex-1 truncate opacity-60">{bot.label}</span>
                <Lock className="w-3 h-3 shrink-0 opacity-40" />
                {/* Tooltip */}
                <span
                  className="absolute left-full ml-2 px-2 py-1 text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 hidden md:block"
                  style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                >
                  Subscribe to unlock
                </span>
              </div>
            );
          }

          // Active bot link
          return (
            <Link
              key={bot.slug}
              href={bot.href}
              onClick={onClose}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                sectionCurrent
                  ? "text-vault-text"
                  : "text-vault-text-dim hover:text-vault-text hover:bg-vault-elevated"
              )}
              style={
                sectionCurrent
                  ? { borderLeft: "2px solid var(--accent-blue)", background: "var(--bg-elevated)" }
                  : {}
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {bot.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: mascot area + user + nav */}
      <div className="border-t" style={{ borderColor: "var(--border)" }}>
        {/* Bottom nav */}
        <div className="px-3 pt-3 space-y-0.5">
          {BOTTOM_NAV.map(({ href, icon: NavIcon, label }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                isPathActive(href)
                  ? "text-vault-accent"
                  : "text-vault-text-dim hover:text-vault-text hover:bg-vault-elevated"
              )}
            >
              <NavIcon className="w-4 h-4 shrink-0" />
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

        {/* User info */}
        <div className="px-4 py-3 mt-1">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{
                background: "var(--accent-blue-glow)",
                border: "1px solid var(--border-active)",
                color: "var(--accent-blue)",
              }}
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-vault-text truncate font-medium">{email}</p>
              <span
                className="inline-flex items-center text-xs px-1.5 py-0.5 rounded mt-0.5"
                style={{
                  background: activeCount >= 3 ? "rgba(16,185,129,0.1)" : "var(--bg-elevated)",
                  color: activeCount >= 3 ? "var(--accent-green)" : "var(--text-secondary)",
                  border: `1px solid ${activeCount >= 3 ? "rgba(16,185,129,0.25)" : "var(--border)"}`,
                }}
              >
                {planLabel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
