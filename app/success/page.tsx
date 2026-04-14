import { stripe } from '@/lib/stripe'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

interface Props {
  searchParams: Promise<{ session_id?: string }>
}

export default async function SuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams

  let productName = ''
  let customerEmail = ''

  if (session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id)
      productName = session.metadata?.productName || ''
      customerEmail = session.customer_details?.email || ''
    } catch {
      // Non-fatal — show generic success
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-lg text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-green/10 border border-green/30 flex items-center justify-center">
            <CheckCircle size={32} className="text-green" />
          </div>
        </div>

        <span className="font-display text-3xl text-orange block mb-4">BVP</span>
        <h1 className="font-display text-display-sm uppercase tracking-wide text-text mb-3">
          Order Confirmed
        </h1>

        {productName && (
          <p className="font-body text-text-muted text-lg mb-2">
            You now have access to{' '}
            <span className="text-orange font-semibold">{productName}</span>.
          </p>
        )}

        {customerEmail && (
          <p className="font-body text-text-muted mb-8">
            Check your email at{' '}
            <span className="text-text font-semibold">{customerEmail}</span>{' '}
            for your download link.
          </p>
        )}

        {!customerEmail && (
          <p className="font-body text-text-muted mb-8">
            Check your inbox for your download link.
          </p>
        )}

        <Link
          href="/"
          className="inline-flex items-center justify-center min-h-[44px] px-8 py-3 bg-orange hover:bg-orange-hover text-white font-body font-bold uppercase tracking-wider text-sm rounded transition-colors"
        >
          Back to BVP
        </Link>
      </div>
    </div>
  )
}
