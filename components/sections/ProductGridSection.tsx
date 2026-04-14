'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Star } from 'lucide-react'
import { formatPrice } from '@/lib/cms-utils'
import type { Product, ProductGridContent } from '@/types/cms'

interface Props {
  content: Record<string, unknown>
  products: Product[]
}

function ProductCard({ product }: { product: Product }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleCheckout() {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      })
      const data = await res.json()
      if (data.url) {
        router.push(data.url)
      }
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex flex-col bg-surface border border-bvp-border rounded-lg p-6 hover:border-orange transition-colors group">
      {product.is_featured && (
        <span className="absolute top-4 right-4 inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono uppercase tracking-widest text-amber bg-amber/10 rounded-full border border-amber/20">
          <Star size={10} fill="currentColor" />
          Featured
        </span>
      )}

      {product.thumbnail_url && (
        <div className="mb-4 rounded overflow-hidden bg-surface2 aspect-video">
          <img
            src={product.thumbnail_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="flex-1">
        <h3 className="font-display text-xl uppercase tracking-wide text-text mb-2 leading-tight">
          {product.name}
        </h3>
        {product.tagline && (
          <p className="font-body text-sm text-text-muted mb-4 line-clamp-2 leading-relaxed">
            {product.tagline}
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <span className="font-mono text-2xl font-bold text-orange">
          {formatPrice(product.price_cents)}
        </span>
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 bg-orange hover:bg-orange-hover text-white font-body font-bold uppercase tracking-wider text-sm rounded transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            `Get BVP ${product.name.replace(/^BVP\s*/i, '')}`
          )}
        </button>
      </div>
    </div>
  )
}

export default function ProductGridSection({ content, products }: Props) {
  const c = content as ProductGridContent
  const filtered = c.show_featured_only
    ? products.filter(p => p.is_featured)
    : products

  return (
    <section id="products" className="py-20 md:py-28 bg-bg">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {c.headline && (
          <div className="mb-12">
            <h2 className="font-display text-display-sm uppercase tracking-wide text-text mb-3">
              {c.headline}
            </h2>
            {c.subheadline && (
              <p className="font-body text-text-muted text-lg max-w-2xl">{c.subheadline}</p>
            )}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-surface border border-bvp-border flex items-center justify-center mb-4">
              <span className="text-2xl font-mono text-orange">BVP</span>
            </div>
            <p className="font-body text-text-muted text-lg">Products coming soon.</p>
            <p className="font-body text-text-faint text-sm mt-1">Check back shortly for new BVP tools.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
