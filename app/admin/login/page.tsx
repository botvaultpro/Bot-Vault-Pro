'use client'

import { useState, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Lock } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!password) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        setError('Incorrect password.')
        setLoading(false)
      }
    } catch {
      setError('Something went wrong. Try again.')
      setLoading(false)
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="font-display text-5xl text-orange leading-none block">BVP</span>
          <p className="font-body text-xs text-text-faint uppercase tracking-widest mt-1">Admin Panel</p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-bvp-border rounded-lg p-8">
          <div className="flex items-center gap-2 mb-6">
            <Lock size={16} className="text-orange" />
            <h1 className="font-display text-xl uppercase tracking-wide text-text">Enter Admin</h1>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <label className="font-body text-xs uppercase tracking-widest text-text-faint block mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter admin password"
                autoFocus
                className="w-full min-h-[44px] bg-surface2 border border-bvp-border text-text placeholder-text-faint rounded px-4 py-3 font-body focus:border-orange focus:outline-none transition-colors"
              />
            </div>

            {error && (
              <p className="font-body text-sm text-red-400">{error}</p>
            )}

            <button
              onClick={handleLogin}
              disabled={loading || !password}
              className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 bg-orange hover:bg-orange-hover text-white font-body font-bold uppercase tracking-wider text-sm rounded transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Enter Admin'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
