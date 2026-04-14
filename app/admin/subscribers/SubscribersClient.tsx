'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import type { Subscriber } from '@/types/cms'

interface Props {
  initialSubscribers: Subscriber[]
}

export default function SubscribersClient({ initialSubscribers }: Props) {
  const [subscribers, setSubscribers] = useState(initialSubscribers)
  const [search, setSearch] = useState('')

  const filtered = subscribers.filter(s =>
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.name || '').toLowerCase().includes(search.toLowerCase())
  )

  function exportCsv() {
    const headers = ['Email', 'Name', 'Source', 'Date Joined', 'Active']
    const rows = subscribers.map(s => [
      s.email,
      s.name || '',
      s.source,
      new Date(s.created_at).toLocaleDateString(),
      s.is_active ? 'Yes' : 'No',
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bvp-subscribers.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  async function toggleActive(subscriber: Subscriber) {
    const newVal = !subscriber.is_active
    await fetch('/api/admin/subscribers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: subscriber.id, is_active: newVal }),
    })
    setSubscribers(prev => prev.map(s => s.id === subscriber.id ? { ...s, is_active: newVal } : s))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-display-sm uppercase tracking-wide text-text">BVP Subscribers</h1>
          <p className="font-body text-text-muted text-sm mt-1">{subscribers.length} total</p>
        </div>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 border border-bvp-border text-text-muted hover:text-text font-body font-bold uppercase tracking-wider text-sm rounded transition-colors"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by email or name..."
          className="w-full max-w-sm min-h-[40px] bg-surface border border-bvp-border text-text placeholder-text-faint rounded px-4 py-2.5 font-body text-sm focus:border-orange focus:outline-none transition-colors"
        />
      </div>

      <div className="bg-surface border border-bvp-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-bvp-border">
              <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-widest text-text-faint">Email</th>
              <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-widest text-text-faint hidden md:table-cell">Name</th>
              <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-widest text-text-faint hidden lg:table-cell">Source</th>
              <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-widest text-text-faint hidden md:table-cell">Joined</th>
              <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-widest text-text-faint">Active</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center font-body text-text-faint text-sm">No subscribers found.</td></tr>
            ) : (
              filtered.map(sub => (
                <tr key={sub.id} className="border-b border-bvp-border last:border-0 hover:bg-surface2 transition-colors">
                  <td className="px-4 py-3 font-body text-sm text-text">{sub.email}</td>
                  <td className="px-4 py-3 font-body text-sm text-text-muted hidden md:table-cell">{sub.name || '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-text-faint hidden lg:table-cell">{sub.source}</td>
                  <td className="px-4 py-3 font-mono text-xs text-text-faint hidden md:table-cell">
                    {new Date(sub.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(sub)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${sub.is_active ? 'bg-orange' : 'bg-bvp-border'}`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${sub.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
