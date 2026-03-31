"use client";
import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const confirmationError = searchParams.get("error") === "confirmation_failed";

  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");

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
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--bg-primary)" }}
    >
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(59,130,246,0.07) 0%, transparent 65%)",
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
              Welcome back
            </p>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Sign in to your account
            </p>
          </div>

          {confirmationError && (
            <div
              className="text-sm px-4 py-3 rounded-lg mb-5"
              style={{
                background: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.25)",
                color: "var(--accent-amber)",
              }}
            >
              There was an issue confirming your email. Please try the link again or contact support.
            </div>
          )}

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

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-bvp w-full px-4 py-3 text-sm"
                placeholder="you@company.com"
                style={{
                  background: "var(--bg-input)",
                  border: `1px solid ${error ? "var(--accent-red)" : "var(--border)"}`,
                  borderRadius: "8px",
                  color: "var(--text-primary)",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--border-active)";
                  e.target.style.boxShadow = "0 0 0 3px var(--accent-blue-glow)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = error ? "var(--accent-red)" : "var(--border)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  Password
                </label>
                <a
                  href="#"
                  className="text-xs transition-colors"
                  style={{ color: "var(--accent-blue)" }}
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-bvp w-full px-4 py-3 text-sm pr-12"
                  placeholder="••••••••"
                  style={{
                    background: "var(--bg-input)",
                    border: `1px solid ${error ? "var(--accent-red)" : "var(--border)"}`,
                    borderRadius: "8px",
                    color: "var(--text-primary)",
                    outline: "none",
                    width: "100%",
                    paddingRight: "3rem",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "var(--border-active)";
                    e.target.style.boxShadow = "0 0 0 3px var(--accent-blue-glow)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = error ? "var(--accent-red)" : "var(--border)";
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
                  Sign in <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: "var(--text-secondary)" }}>
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-medium transition-colors"
              style={{ color: "var(--accent-blue)" }}
            >
              Sign up free
            </Link>
          </p>
        </div>
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
