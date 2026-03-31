"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, ArrowRight, Loader2, Check } from "lucide-react";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");
  const refCode = searchParams.get("ref");

  const [fullName, setFullName]         = useState("");
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [success, setSuccess]           = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data: signUpData, error } = await supabase.auth.signUp({
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
      const userId = signUpData?.user?.id;
      fetch("/api/auth/welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: fullName, userId }),
      }).catch(() => {});

      // Track referral if a ref code was passed in the URL
      if (refCode) {
        fetch("/api/referral", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ referralCode: refCode }),
        }).catch(() => {});
      }

      if (plan && plan !== "free") {
        router.push(`/dashboard/billing?plan=${plan}`);
      } else {
        setSuccess(true);
      }
    }
  }

  if (success) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: "var(--bg-primary)" }}
      >
        <div className="text-center max-w-md">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
            style={{
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.3)",
            }}
          >
            <Check className="w-8 h-8" style={{ color: "var(--accent-green)" }} />
          </div>
          <h2
            className="font-display font-extrabold text-3xl mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            Check your email
          </h2>
          <p className="mb-2" style={{ color: "var(--text-secondary)" }}>
            We sent a confirmation link to{" "}
            <span style={{ color: "var(--text-primary)" }}>{email}</span>.
          </p>
          <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
            Click the link in that email to activate your account before logging in.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(16,185,129,0.06) 0%, transparent 65%)",
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
          }}
        >
          {/* Mascot + Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image
                src="/BVP_Bot_Tranparent.png"
                alt="Bot Vault Pro"
                width={60}
                height={60}
                className="object-contain"
              />
            </div>
            <h1
              className="font-display font-extrabold text-2xl"
              style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
            >
              Bot <span style={{ color: "var(--accent-blue)" }}>Vault</span> Pro
            </h1>
            <p className="mt-4 text-2xl font-display font-bold" style={{ color: "var(--text-primary)" }}>
              Create your account
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              {plan && plan !== "free"
                ? `Starting with the ${plan} plan`
                : "Start free — upgrade anytime"}
            </p>
          </div>

          {error && (
            <div
              className="text-sm px-4 py-3 rounded-lg mb-5"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "var(--accent-red)",
                borderRadius: "8px",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Jane Smith"
                style={{
                  width: "100%",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                  outline: "none",
                  fontFamily: "var(--font-body)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--border-active)";
                  e.target.style.boxShadow = "0 0 0 3px var(--accent-blue-glow)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                style={{
                  width: "100%",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                  outline: "none",
                  fontFamily: "var(--font-body)",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--border-active)";
                  e.target.style.boxShadow = "0 0 0 3px var(--accent-blue-glow)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Min. 8 characters"
                  style={{
                    width: "100%",
                    background: "var(--bg-input)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    padding: "12px 48px 12px 16px",
                    color: "var(--text-primary)",
                    fontSize: "14px",
                    outline: "none",
                    fontFamily: "var(--font-body)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--border-active)";
                    e.target.style.boxShadow = "0 0 0 3px var(--accent-blue-glow)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "var(--border)";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-2"
              style={{
                background: "var(--accent-blue)",
                color: "#0A0F1A",
                borderRadius: "8px",
                fontFamily: "var(--font-body)",
              }}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Create account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: "var(--text-secondary)" }}>
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-medium transition-colors"
              style={{ color: "var(--accent-blue)" }}
            >
              Sign in
            </Link>
          </p>
        </div>
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
