"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, ArrowRight, Check } from "lucide-react";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Fire welcome email — best-effort, don't block the flow
      fetch("/api/auth/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: fullName }),
      }).catch(() => {});

      if (plan && plan !== "free") {
        router.push(`/dashboard/billing?plan=${plan}`);
      } else {
        setSuccess(true);
      }
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-vault-bg flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-vault-green/10 border border-vault-green/30 mb-6">
            <Check className="w-8 h-8 text-vault-green" />
          </div>
          <h2 className="font-display text-3xl font-bold mb-3">Check your email</h2>
          <p className="text-vault-text-dim mb-2">We sent a confirmation link to <span className="text-vault-text">{email}</span>.</p>
          <p className="text-vault-text-dim text-sm">Click the link in that email to activate your account before logging in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vault-bg flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-grid-pattern bg-grid-size opacity-100 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] bg-glow-green pointer-events-none" />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center gap-2 font-display text-2xl font-bold">
            <Image src="/BVP_Bot_Tranparent.png" alt="Bot Vault Pro mascot" width={50} height={50} className="h-12 w-auto object-contain" />
            <span className="text-gradient-cyan">Bot</span>
            <span className="text-vault-text"> Vault Pro</span>
          </Link>
          <p className="text-vault-text-dim text-sm italic mt-2">ChatGPT gives you an answer. Bot Vault Pro runs your business.</p>
          <h1 className="font-display text-3xl font-bold mt-6 mb-2">Create your account</h1>
          <p className="text-vault-text-dim">
            {plan && plan !== "free" ? `Starting with the ${plan} plan` : "Start free — upgrade anytime"}
          </p>
        </div>
        <div className="card-surface rounded-2xl p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          <form onSubmit={handleSignup} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-vault-text-dim mb-2">Full Name</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required
                className="w-full bg-vault-bg border border-vault-border rounded-lg px-4 py-3 text-vault-text placeholder-vault-muted focus:outline-none focus:border-vault-accent transition-colors"
                placeholder="Jane Smith" />
            </div>
            <div>
              <label className="block text-sm font-medium text-vault-text-dim mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full bg-vault-bg border border-vault-border rounded-lg px-4 py-3 text-vault-text placeholder-vault-muted focus:outline-none focus:border-vault-accent transition-colors"
                placeholder="you@company.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-vault-text-dim mb-2">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
                  className="w-full bg-vault-bg border border-vault-border rounded-lg px-4 py-3 text-vault-text placeholder-vault-muted focus:outline-none focus:border-vault-accent transition-colors pr-12"
                  placeholder="Min. 8 characters" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-vault-muted hover:text-vault-text-dim">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-vault-accent text-vault-bg font-display font-bold py-3 rounded-xl hover:bg-vault-accent-dim transition-all disabled:opacity-50">
              {loading ? "Creating account..." : <>Create account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </div>
        <p className="text-center text-vault-text-dim text-sm mt-6">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-vault-accent hover:text-vault-accent-dim">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
