"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Save, Loader2, CheckCircle2, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? "");
      setUserId(user.id);
      const { data } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
      if (data?.full_name) setFullName(data.full_name);
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    await supabase.from("profiles").update({ full_name: fullName, updated_at: new Date().toISOString() }).eq("id", userId);
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold">Settings</h1>
        <p className="text-vault-text-dim mt-1">Manage your account details.</p>
      </div>

      <div className="card-surface rounded-2xl p-6">
        <h2 className="font-display text-lg font-bold mb-5">Profile</h2>
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-vault-text-dim mb-2">Full Name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-vault-bg border border-vault-border rounded-lg px-4 py-3 text-vault-text focus:outline-none focus:border-vault-accent transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-medium text-vault-text-dim mb-2">Email</label>
            <input type="email" value={email} disabled
              className="w-full bg-vault-bg border border-vault-border rounded-lg px-4 py-3 text-vault-muted cursor-not-allowed" />
            <p className="text-xs text-vault-text-dim mt-1">Email cannot be changed here.</p>
          </div>
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 bg-vault-accent text-vault-bg font-display font-bold px-5 py-2.5 rounded-xl hover:bg-vault-accent-dim transition-all disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </form>
      </div>

      <div className="card-surface rounded-2xl p-6">
        <h2 className="font-display text-lg font-bold mb-2">Danger Zone</h2>
        <p className="text-vault-text-dim text-sm mb-5">Actions here are immediate.</p>
        <button onClick={handleLogout}
          className="flex items-center gap-2 border border-red-500/30 text-red-400 px-5 py-2.5 rounded-xl hover:bg-red-500/10 transition-colors text-sm font-semibold">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}
