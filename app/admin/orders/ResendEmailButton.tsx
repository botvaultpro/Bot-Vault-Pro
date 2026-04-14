'use client'

import { useState } from 'react'
import { Loader2, Mail } from 'lucide-react'

export default function ResendEmailButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleResend() {
    setLoading(true)
    try {
      await fetch('/api/admin/resend-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })
      setDone(true)
    } finally {
      setLoading(false)
    }
  }

  if (done) return <span className="font-mono text-xs text-green">Sent!</span>

  return (
    <button
      onClick={handleResend}
      disabled={loading}
      className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-orange transition-colors disabled:opacity-50 font-body uppercase tracking-wider"
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : <Mail size={12} />}
      Resend
    </button>
  )
}
