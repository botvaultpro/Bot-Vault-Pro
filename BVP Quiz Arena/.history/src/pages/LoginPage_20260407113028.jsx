import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Zap, ArrowRight, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store'

export default function LoginPage() {
  const { user } = useAuthStore()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

  if (user) return <Navigate to="/" replace />

  async function handleLogin(e) {
    e.preventDefault()
    if (!email.trim()) return

    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: window.location.origin,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#6C63FF 1px, transparent 1px), linear-gradient(90deg, #6C63FF 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center glow-primary">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-syne font-bold text-2xl text-white">BVP</span>
            <span className="font-syne text-2xl text-text-secondary">QuizArena</span>
          </div>
          <p className="text-text-secondary font-dm">Training Game Suite</p>
        </div>

        <div className="card">
          {!sent ? (
            <>
              <h1 className="font-syne font-bold text-2xl text-white mb-2">
                Host Sign In
              </h1>
              <p className="text-text-secondary font-dm text-sm mb-6">
                Enter your email to receive a magic link. No password needed.
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Work Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="input-field pl-10"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-danger/10 border border-danger/30 rounded-xl p-3"
                  >
                    <p className="text-danger text-sm font-dm">{error}</p>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Send Magic Link
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
              <h2 className="font-syne font-bold text-xl text-white mb-2">
                Check your email
              </h2>
              <p className="text-text-secondary font-dm text-sm mb-4">
                We sent a magic link to
              </p>
              <p className="text-primary font-dm font-medium mb-4">{email}</p>
              <p className="text-text-muted font-dm text-xs">
                Click the link in the email to sign in. It expires in 1 hour.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-4 text-text-secondary hover:text-white text-sm font-dm transition-colors"
              >
                Use a different email
              </button>
            </motion.div>
          )}
        </div>

        <div className="text-center mt-6">
          <p className="text-text-muted text-sm font-dm">
            Player?{' '}
            <a href="/join" className="text-accent hover:text-white transition-colors">
              Join with a room code →
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  )
}