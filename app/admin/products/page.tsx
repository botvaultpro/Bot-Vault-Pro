import Link from 'next/link'
import { supabaseAdmin } from '@/lib/cms-supabase'
import { formatPrice } from '@/lib/cms-utils'
import type { Product } from '@/types/cms'
import { Plus, Edit2 } from 'lucide-react'
import ProductToggle from './ProductToggle'

async function getProducts(): Promise<Product[]> {
  const { data } = await supabaseAdmin
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true })
  return (data || []) as Product[]
}

export default async function AdminProductsPage() {
  const products = await getProducts()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-display-sm uppercase tracking-wide text-text">BVP Products</h1>
          <p className="font-body text-text-muted text-sm mt-1">{products.length} products total</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 bg-orange hover:bg-orange-hover text-white font-body font-bold uppercase tracking-wider text-sm rounded transition-colors"
        >
          <Plus size={14} /> Add New BVP Product
        </Link>
      </div>

      <div className="bg-surface border border-bvp-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-bvp-border">
              <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-widest text-text-faint">Name</th>
              <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-widest text-text-faint hidden md:table-cell">Price</th>
              <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-widest text-text-faint hidden lg:table-cell">Category</th>
              <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-widest text-text-faint">Featured</th>
              <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-widest text-text-faint">Active</th>
              <th className="text-right px-4 py-3 font-body text-xs uppercase tracking-widest text-text-faint">Edit</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center font-body text-text-faint text-sm">No products yet. Add your first BVP product.</td></tr>
            ) : (
              products.map(product => (
                <tr key={product.id} className="border-b border-bvp-border last:border-0 hover:bg-surface2 transition-colors">
                  <td className="px-4 py-3 font-body text-sm text-text">{product.name}</td>
                  <td className="px-4 py-3 font-mono text-sm text-orange hidden md:table-cell">{formatPrice(product.price_cents)}</td>
                  <td className="px-4 py-3 font-body text-sm text-text-muted hidden lg:table-cell">{product.category}</td>
                  <td className="px-4 py-3">
                    <ProductToggle productId={product.id} field="is_featured" value={product.is_featured} />
                  </td>
                  <td className="px-4 py-3">
                    <ProductToggle productId={product.id} field="is_active" value={product.is_active} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/products/${product.id}`} className="inline-flex items-center justify-center w-8 h-8 text-text-muted hover:text-text transition-colors">
                      <Edit2 size={14} />
                    </Link>
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
