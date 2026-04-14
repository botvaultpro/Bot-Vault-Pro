'use client'

import { useState } from 'react'

interface Props {
  pageId: string
  field: 'is_active' | 'show_in_nav'
  value: boolean
  isHome?: boolean
}

export default function PageToggle({ pageId, field, value, isHome }: Props) {
  const [checked, setChecked] = useState(value)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    if (isHome && field === 'is_active') return // Never deactivate home
    setLoading(true)
    try {
      await fetch('/api/admin/pages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pageId, [field]: !checked }),
      })
      setChecked(!checked)
    } finally {
      setLoading(false)
    }
  }

  const disabled = isHome && field === 'is_active'

  return (
    <button
      onClick={toggle}
      disabled={loading || disabled}
      title={disabled ? 'Home page cannot be deactivated' : undefined}
      className={`relative w-10 h-5 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${checked ? 'bg-orange' : 'bg-bvp-border'}`}
    >
      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  )
}
