"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { Menu, Bell, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface BotSub {
  bot_slug: string;
  status: string;
}

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":                    "Dashboard",
  "/dashboard/dashboard":          "Dashboard",
  "/dashboard/billing":            "Billing",
  "/dashboard/settings":           "Settings",
  "/dashboard/bots/sitebuilder":   "SiteBuilder Pro",
  "/dashboard/sitebuilder/pipeline":"Pipeline",
  "/dashboard/reviewbot":          "ReviewBot",
  "/dashboard/weeklypulse":        "WeeklyPulse",
  "/dashboard/emailcoach":         "EmailCoach",
  "/dashboard/clausecheck":        "ClauseCheck",
  "/dashboard/invoiceforge":       "InvoiceForge",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen]       = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [subscriptions, setSubscriptions]   = useState<BotSub[]>([]);
  const [email, setEmail]                   = useState("");
  const pathname = usePathname();

  const pageTitle = PAGE_TITLES[pathname] ?? "Dashboard";
  const activeCount = subscriptions.filter((s) => s.status === "active").length;
  const planBadge   = activeCount >= 3
    ? { label: "Bundle", color: "#10B981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)" }
    : activeCount > 0
      ? { label: `${activeCount} Bot${activeCount > 1 ? "s" : ""}`, color: "#3B82F6", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.25)" }
      : { label: "Free", color: "#8899BB", bg: "rgba(136,153,187,0.1)", border: "rgba(136,153,187,0.2)" };

  const initials = email?.[0]?.toUpperCase() ?? "U";

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? "");
      const { data } = await supabase
        .from("bot_subscriptions")
        .select("bot_slug, status")
        .eq("user_id", user.id);
      setSubscriptions(data ?? []);
    }
    loadUser();
  }, []);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — desktop */}
      <div className="hidden md:flex shrink-0">
        <Sidebar
          subscriptions={subscriptions}
          email={email}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        />
      </div>

      {/* Sidebar — mobile slide-in */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          subscriptions={subscriptions}
          email={email}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top Bar */}
        <header
          className="flex items-center justify-between px-4 sm:px-6 h-14 shrink-0 border-b"
          style={{ background: "var(--bg-surface)", borderColor: "var(--border)" }}
        >
          {/* Left: hamburger (mobile) + page title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile logo */}
            <Link href="/dashboard" className="md:hidden flex items-center gap-2">
              <Image
                src="/BVP_Bot_Tranparent.png"
                alt="BVP"
                width={24}
                height={24}
                className="object-contain"
              />
              <span className="font-display font-bold text-sm">
                <span className="text-vault-text">Bot </span>
                <span style={{ color: "var(--accent-blue)" }}>Vault</span>
                <span className="text-vault-text"> Pro</span>
              </span>
            </Link>

            {/* Desktop page title */}
            <h1
              className="hidden md:block font-display font-bold text-base"
              style={{ color: "var(--text-primary)" }}
            >
              {pageTitle}
            </h1>
          </div>

          {/* Right: notification + avatar + plan badge */}
          <div className="flex items-center gap-3">
            <button
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: "var(--text-secondary)" }}
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  background: "var(--accent-blue-glow)",
                  border: "1px solid var(--border-active)",
                  color: "var(--accent-blue)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {initials}
              </div>

              {/* Plan badge */}
              <span
                className="hidden sm:inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  background: planBadge.bg,
                  color: planBadge.color,
                  border: `1px solid ${planBadge.border}`,
                }}
              >
                {planBadge.label}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
