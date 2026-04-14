import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/cms-supabase'
import { stripe } from '@/lib/stripe'
import type { Product } from '@/types/cms'

export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json()

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', productId)
      .eq('is_active', true)
      .single()

    if (error || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const p = product as Product
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://botvaultpro.com'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_creation: 'always',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: p.price_cents,
            product_data: {
              name: p.name,
              description: p.tagline ?? undefined,
              images: p.thumbnail_url ? [p.thumbnail_url] : [],
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        productId: p.id,
        productName: p.name,
      },
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/products/${p.slug}`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
