'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { SubscribeContent } from '@/types/cms'

interface Props {
  content: Record<string, unknown>
}

type State = 'idle' | 'loading' | 'success'

export default function SubscribeSection({ content }: Props) {
  const c = content as SubscribeContent
  const [email, setEmail] = useState('')
  const [state, setState] = useState<State>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setState('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'subscribe_section' }),
      })
      if (res.ok) {
        setState('success')
      } else {
        setState('idle')
      }
    } catch {
      setState('idle')
    }
  }

  return (
    <section className="py-16 md:py-20 bg-surface border-l-4 border-orange mx-0">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="max-w-2xl">
          {c.headline && (
            <h2 className="font-display text-display-sm uppercase tracking-wide text-text mb-2">
              {c.headline}
            </h2>
          )}
          {c.subheadline && (
            <p className="font-body text-text-muted mb-6">{c.subheadline}</p>
          )}

          {state === 'success' ? (
            <p className="font-body text-green font-semibold text-lg">
              {c.success_message || 'You are in. Watch your inbox.'}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 min-h-[44px] bg-surface2 border border-bvp-border text-text placeholder-text-faint rounded px-4 py-3 font-body focus:border-orange focus:outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={state === 'loading'}
                className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 bg-orange hover:bg-orange-hover text-white font-body font-bold uppercase tracking-wider text-sm rounded transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {state === 'loading' ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  c.button_text || 'Subscribe'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
