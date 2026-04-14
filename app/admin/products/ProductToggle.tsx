'use client'

import { useState } from 'react'

interface Props {
  productId: string
  field: 'is_active' | 'is_featured'
  value: boolean
}

export default function ProductToggle({ productId, field, value }: Props) {
  const [checked, setChecked] = useState(value)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    try {
      await fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId, [field]: !checked }),
      })
      setChecked(!checked)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`relative w-10 h-5 rounded-full transition-colors disabled:opacity-50 ${checked ? 'bg-orange' : 'bg-bvp-border'}`}
    >
      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  )
}
