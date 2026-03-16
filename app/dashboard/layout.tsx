"use client";
import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { Menu } from "lucide-react";
import { type Tier } from "@/lib/tier-limits";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tier, setTier] = useState<Tier>("free");
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? "");
      const { data } = await supabase.from("subscriptions").select("tier").eq("user_id", user.id).eq("status", "active").single();
      if (data?.tier) setTier(data.tier as Tier);
    }
    loadUser();
  }, []);

  return (
    <div className="flex h-screen bg-vault-bg overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar - desktop */}
      <div className="hidden md:flex shrink-0">
        <Sidebar tier={tier} email={email} />
      </div>

      {/* Sidebar - mobile */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Sidebar tier={tier} email={email} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center gap-4 px-4 py-3 border-b border-vault-border bg-vault-surface">
          <button onClick={() => setSidebarOpen(true)} className="text-vault-text-dim hover:text-vault-text">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-display font-bold">
            <span className="text-gradient-cyan">Bot</span> Vault Pro
          </span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
