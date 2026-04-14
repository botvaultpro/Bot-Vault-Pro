import Link from 'next/link'
import { supabaseAdmin } from '@/lib/cms-supabase'
import { formatPrice } from '@/lib/cms-utils'
import type { AdminStats, Order } from '@/types/cms'
import { Package, ShoppingCart, DollarSign, Users, Plus, Layers, FileText } from 'lucide-react'

async function getStats(): Promise<AdminStats> {
  const [products, orders, subscribers] = await Promise.all([
    supabaseAdmin.from('products').select('id', { count: 'exact' }).eq('is_active', true),
    supabaseAdmin.from('orders').select('amount_cents').eq('status', 'completed'),
    supabaseAdmin.from('subscribers').select('id', { count: 'exact' }).eq('is_active', true),
  ])

  const revenue = (orders.data || []).reduce((sum: number, o: { amount_cents: number }) => sum + o.amount_cents, 0)

  return {
    total_products: products.count || 0,
    total_orders: orders.data?.length || 0,
    total_revenue_cents: revenue,
    total_subscribers: subscribers.count || 0,
  }
}

async function getRecentOrders(): Promise<Order[]> {
  const { data } = await supabaseAdmin
    .from('orders')
    .select('*, products(name)')
    .order('created_at', { ascending: false })
    .limit(10)
  return (data || []) as Order[]
}

function StatCard({ icon: Icon, label, value }: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="bg-surface border border-bvp-border rounded-lg p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded bg-orange-muted flex items-center justify-center">
          <Icon size={16} className="text-orange" />
        </div>
        <span className="font-body text-xs uppercase tracking-widest text-text-faint">{label}</span>
      </div>
      <p className="font-mono text-3xl font-bold text-text">{value}</p>
    </div>
  )
}

function statusColor(status: string) {
  if (status === 'completed') return 'text-green bg-green/10'
  if (status === 'pending') return 'text-amber bg-amber/10'
  return 'text-red-400 bg-red-400/10'
}

export default async function AdminDashboard() {
  const [stats, orders] = await Promise.all([getStats(), getRecentOrders()])

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-display-sm uppercase tracking-wide text-text">BVP Dashboard</h1>
          <p className="font-body text-text-muted text-sm mt-1">Overview of your site performance</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
        <StatCard icon={Package} label="Active Products" value={String(stats.total_products)} />
        <StatCard icon={ShoppingCart} label="Total Orders" value={String(stats.total_orders)} />
        <StatCard icon={DollarSign} label="Total Revenue" value={formatPrice(stats.total_revenue_cents)} />
        <StatCard icon={Users} label="Subscribers" value={String(stats.total_subscribers)} />
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-3 mb-10">
        <Link href="/admin/products/new" className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 bg-orange hover:bg-orange-hover text-white font-body font-bold uppercase tracking-wider text-xs rounded transition-colors">
          <Plus size={14} /> Add Product
        </Link>
        <Link href="/admin/pages/new" className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 border border-orange text-orange hover:bg-orange-muted font-body font-bold uppercase tracking-wider text-xs rounded transition-colors">
          <FileText size={14} /> Add Page
        </Link>
        <Link href="/admin/sections" className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 border border-bvp-border text-text-muted hover:text-text font-body uppercase tracking-wider text-xs rounded transition-colors">
          <Layers size={14} /> Edit Sections
        </Link>
      </div>

      {/* Recent orders */}
      <div>
        <h2 className="font-display text-xl uppercase tracking-wide text-text mb-4">Recent Orders</h2>
        <div className="bg-surface border border-bvp-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-bvp-border">
                <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-widest text-text-faint">Date</th>
                <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-widest text-text-faint">Email</th>
                <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-widest text-text-faint hidden md:table-cell">Product</th>
                <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-widest text-text-faint">Amount</th>
                <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-widest text-text-faint">Status</th>
                <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-widest text-text-faint hidden lg:table-cell">Email Sent</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center font-body text-text-faint text-sm">No orders yet.</td></tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id} className="border-b border-bvp-border last:border-0 hover:bg-surface2 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-text-muted">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-text">{order.customer_email}</td>
                    <td className="px-4 py-3 font-body text-sm text-text-muted hidden md:table-cell">
                      {(order.products as { name: string } | undefined)?.name || '—'}
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-orange">{formatPrice(order.amount_cents)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 text-xs font-mono uppercase tracking-widest rounded-full ${statusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`font-mono text-xs ${order.email_sent ? 'text-green' : 'text-text-faint'}`}>
                        {order.email_sent ? '✓ Sent' : '—'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
