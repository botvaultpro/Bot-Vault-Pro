'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/cms-utils'
import type { Product } from '@/types/cms'

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkingOut, setCheckingOut] = useState(false)

  useEffect(() => {
    fetch(`/api/products/${params.slug}`)
      .then(r => r.json())
      .then(data => {
        setProduct(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.slug])

  async function handleCheckout() {
    if (!product) return
    setCheckingOut(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      })
      const data = await res.json()
      if (data.url) router.push(data.url)
    } catch {
      setCheckingOut(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-orange" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4">
        <p className="font-body text-text-muted">Product not found.</p>
        <Link href="/" className="text-orange hover:underline font-body text-sm">
          ← Back to home
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
        <Link href="/#products" className="inline-flex items-center gap-2 text-text-muted hover:text-text font-body text-sm mb-8 transition-colors">
          <ArrowLeft size={14} /> Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {product.thumbnail_url && (
            <div className="rounded-lg overflow-hidden border border-bvp-border bg-surface aspect-video">
              <img src={product.thumbnail_url} alt={product.name} className="w-full h-full object-cover" />
            </div>
          )}

          <div>
            {product.is_featured && (
              <span className="inline-block mb-3 px-2 py-0.5 text-xs font-mono uppercase tracking-widest text-amber bg-amber/10 rounded-full border border-amber/20">
                Featured
              </span>
            )}
            <h1 className="font-display text-display-sm uppercase tracking-wide text-text mb-3">
              {product.name}
            </h1>
            {product.tagline && (
              <p className="font-body text-lg text-text-muted mb-4 leading-relaxed">{product.tagline}</p>
            )}
            {product.description && (
              <p className="font-body text-text-muted text-sm leading-relaxed mb-6">{product.description}</p>
            )}

            <div className="flex items-center gap-6 mb-8">
              <span className="font-mono text-4xl font-bold text-orange">
                {formatPrice(product.price_cents)}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="inline-flex items-center justify-center gap-2 min-h-[52px] px-8 py-4 bg-orange hover:bg-orange-hover text-white font-body font-bold uppercase tracking-wider text-sm rounded transition-colors disabled:opacity-60 w-full sm:w-auto"
            >
              {checkingOut ? <Loader2 size={16} className="animate-spin" /> : `Get ${product.name}`}
            </button>

            {product.long_description && (
              <div className="mt-8 pt-8 border-t border-bvp-border">
                <h2 className="font-display text-xl uppercase tracking-wide text-text mb-4">About This Product</h2>
                <p className="font-body text-text-muted text-sm leading-relaxed whitespace-pre-wrap">
                  {product.long_description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
