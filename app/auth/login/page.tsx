"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const confirmationError = searchParams.get("error") === "confirmation_failed";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-vault-bg flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-grid-pattern bg-grid-size opacity-100 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-glow-cyan pointer-events-none" />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center gap-2 font-display text-2xl font-bold">
            <Image src="/BVP_Bot_Tranparent.png" alt="Bot Vault Pro mascot" width={50} height={50} className="h-12 w-auto object-contain" />
            <span className="text-gradient-cyan">Bot</span>
            <span className="text-vault-text"> Vault Pro</span>
          </Link>
          <p className="text-vault-text-dim text-sm italic mt-2">ChatGPT gives you an answer. Bot Vault Pro runs your business.</p>
          <h1 className="font-display text-3xl font-bold mt-6 mb-2">Welcome back</h1>
          <p className="text-vault-text-dim">Sign in to your account</p>
        </div>
        <div className="card-surface rounded-2xl p-8">
          {confirmationError && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm px-4 py-3 rounded-lg mb-6">
              There was an issue confirming your email. Please try the link again or contact support.
            </div>
          )}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-vault-text-dim mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-vault-bg border border-vault-border rounded-lg px-4 py-3 text-vault-text placeholder-vault-muted focus:outline-none focus:border-vault-accent transition-colors"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-vault-text-dim mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-vault-bg border border-vault-border rounded-lg px-4 py-3 text-vault-text placeholder-vault-muted focus:outline-none focus:border-vault-accent transition-colors pr-12"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-vault-muted hover:text-vault-text-dim">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-vault-accent text-vault-bg font-display font-bold py-3 rounded-xl hover:bg-vault-accent-dim transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : <>Sign in <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </div>
        <p className="text-center text-vault-text-dim text-sm mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="text-vault-accent hover:text-vault-accent-dim">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
