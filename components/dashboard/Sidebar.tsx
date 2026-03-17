"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Target, Zap, MessageSquare, Globe,
  CreditCard, Settings, LogOut, X, GitBranch, ChevronDown, ChevronRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { type Tier } from "@/lib/tier-limits";
import clsx from "clsx";
import { useState } from "react";

interface SidebarProps {
  tier: Tier;
  email: string;
  onClose?: () => void;
}

const bottomItems = [
  { href: "/dashboard/billing", icon: CreditCard, label: "Billing" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar({ tier, email, onClose }: SidebarProps) {
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

  const tierColors: Record<Tier, string> = {
    free: "text-vault-muted bg-vault-muted/10 border-vault-muted/20",
    starter: "text-vault-accent bg-vault-accent/10 border-vault-accent/20",
    growth: "text-vault-green bg-vault-green/10 border-vault-green/20",
    enterprise: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  };

  function navLink(href: string, Icon: React.ElementType, label: string) {
    const active = pathname === href;
    return (
      <Link
        key={href}
        href={href}
        onClick={onClose}
        className={clsx(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
          active
            ? "bg-vault-accent/10 text-vault-accent border border-vault-accent/20"
            : "text-vault-text-dim hover:text-vault-text hover:bg-vault-border/50"
        )}
      >
        <Icon className="w-4 h-4 shrink-0" />
        {label}
      </Link>
    );
  }

  const siteBuilderActive =
    pathname.startsWith("/dashboard/bots/sitebuilder") ||
    pathname.startsWith("/dashboard/sitebuilder");

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
            <span className={clsx("text-xs font-mono px-2 py-0.5 rounded-full border capitalize", tierColors[tier])}>
              {tier}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navLink("/dashboard", LayoutDashboard, "Dashboard")}
        {navLink("/dashboard/bots/leadgen", Target, "LeadGen Pro")}
        {navLink("/dashboard/bots/contentblast", Zap, "ContentBlast")}
        {navLink("/dashboard/bots/supportdesk", MessageSquare, "SupportDesk")}

        {/* SiteBuilder Pro — expandable */}
        <div>
          <button
            onClick={() => setSiteBuilderOpen((o) => !o)}
            className={clsx(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
              siteBuilderActive
                ? "bg-vault-green/10 text-vault-green border border-vault-green/20"
                : "text-vault-text-dim hover:text-vault-text hover:bg-vault-border/50"
            )}
          >
            <Globe className="w-4 h-4 shrink-0" />
            <span className="flex-1 text-left">SiteBuilder Pro</span>
            {siteBuilderOpen
              ? <ChevronDown className="w-3.5 h-3.5 shrink-0" />
              : <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
          </button>

          {siteBuilderOpen && (
            <div className="ml-4 mt-1 space-y-1 border-l border-vault-border pl-3">
              <Link
                href="/dashboard/bots/sitebuilder"
                onClick={onClose}
                className={clsx(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                  pathname === "/dashboard/bots/sitebuilder"
                    ? "bg-vault-green/10 text-vault-green"
                    : "text-vault-text-dim hover:text-vault-text hover:bg-vault-border/50"
                )}
              >
                <Globe className="w-3.5 h-3.5 shrink-0" />
                Generate Site
              </Link>
              <Link
                href="/dashboard/sitebuilder/pipeline"
                onClick={onClose}
                className={clsx(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                  pathname === "/dashboard/sitebuilder/pipeline"
                    ? "bg-vault-green/10 text-vault-green"
                    : "text-vault-text-dim hover:text-vault-text hover:bg-vault-border/50"
                )}
              >
                <GitBranch className="w-3.5 h-3.5 shrink-0" />
                Pipeline
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-vault-border space-y-1">
        {tier === "free" && (
          <Link
            href="/dashboard/billing"
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-vault-accent/10 border border-vault-accent/30 text-vault-accent rounded-lg text-sm font-semibold hover:bg-vault-accent/20 transition-colors mb-2"
          >
            ⚡ Upgrade Plan
          </Link>
        )}
        {bottomItems.map(({ href, icon: Icon, label }) => (
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
            <Icon className="w-4 h-4 shrink-0" />
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
