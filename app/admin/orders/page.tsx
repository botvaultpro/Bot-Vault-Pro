import { supabaseAdmin } from '@/lib/cms-supabase'
import { formatPrice } from '@/lib/cms-utils'
import type { Order } from '@/types/cms'
import ResendEmailButton from './ResendEmailButton'

async function getOrders(): Promise<Order[]> {
  const { data } = await supabaseAdmin
    .from('orders')
    .select('*, products(name)')
    .order('created_at', { ascending: false })
  return (data || []) as Order[]
}

function statusColor(status: string) {
  if (status === 'completed') return 'text-green bg-green/10'
  if (status === 'pending') return 'text-amber bg-amber/10'
  return 'text-red-400 bg-red-400/10'
}

export default async function AdminOrdersPage() {
  const orders = await getOrders()

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-display-sm uppercase tracking-wide text-text">BVP Orders</h1>
        <p className="font-body text-text-muted text-sm mt-1">{orders.length} orders total</p>
      </div>

      <div className="bg-surface border border-bvp-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-bvp-border">
              <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-widest text-text-faint">Date</th>
              <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-widest text-text-faint">Email</th>
              <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-widest text-text-faint hidden md:table-cell">Product</th>
              <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-widest text-text-faint">Amount</th>
              <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-widest text-text-faint">Status</th>
              <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-widest text-text-faint hidden lg:table-cell">Email</th>
              <th className="text-right px-4 py-3 font-body text-xs uppercase tracking-widest text-text-faint">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center font-body text-text-faint text-sm">No orders yet.</td></tr>
            ) : (
              orders.map(order => (
                <tr key={order.id} className="border-b border-bvp-border last:border-0 hover:bg-surface2 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-text-muted whitespace-nowrap">
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
                      {order.email_sent ? '✓' : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ResendEmailButton orderId={order.id} />
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
