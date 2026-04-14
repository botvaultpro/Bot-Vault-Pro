import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/cms-supabase'
import { resend } from '@/lib/resend'
import type Stripe from 'stripe'

// Raw body needed for Stripe signature verification
export const dynamic = 'force-dynamic'

function buildDeliveryEmail(productName: string, downloadUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Your BVP Order</title></head>
<body style="margin:0;padding:0;background:#050608;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050608;min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#0f0f11;border:1px solid #1e1e24;border-radius:8px;max-width:600px;width:100%;">
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #1e1e24;">
              <p style="margin:0;font-size:28px;font-weight:900;text-transform:uppercase;letter-spacing:2px;color:#ff5e14;">BVP</p>
              <p style="margin:4px 0 0;font-size:11px;text-transform:uppercase;letter-spacing:3px;color:#52504e;">Bot Vault Pro</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 8px;font-size:13px;text-transform:uppercase;letter-spacing:2px;color:#52504e;">Order Confirmed</p>
              <h1 style="margin:0 0 16px;font-size:32px;font-weight:900;color:#f0ede8;">Your purchase is confirmed.</h1>
              <p style="margin:0 0 32px;font-size:16px;color:#a8a49e;line-height:1.6;">
                You now have access to <strong style="color:#ff5e14;">${productName}</strong>. Click the button below to download your product.
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:4px;background:#ff5e14;">
                    <a href="${downloadUrl}"
                       style="display:inline-block;padding:16px 32px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#ffffff;text-decoration:none;">
                      Download Your Product
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:32px 0 0;font-size:13px;color:#52504e;">
                If the button doesn't work, copy this link:<br>
                <a href="${downloadUrl}" style="color:#ff5e14;word-break:break-all;">${downloadUrl}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #1e1e24;">
              <p style="margin:0;font-size:12px;color:#52504e;">
                Questions? <a href="mailto:support@botvaultpro.com" style="color:#a8a49e;">support@botvaultpro.com</a>
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#52504e;">© 2025 Bot Vault Pro. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const customerEmail = session.customer_details?.email ?? ''
    const customerName = session.customer_details?.name ?? null
    const productId = session.metadata?.productId ?? null
    const amountTotal = session.amount_total ?? 0

    try {
      // Insert order
      const { data: order } = await supabaseAdmin
        .from('orders')
        .insert({
          product_id: productId,
          customer_email: customerEmail,
          customer_name: customerName,
          amount_cents: amountTotal,
          stripe_session_id: session.id,
          stripe_payment_intent: typeof session.payment_intent === 'string'
            ? session.payment_intent
            : null,
          status: 'completed',
          email_sent: false,
        })
        .select()
        .single()

      // Fetch product download URL
      if (productId) {
        const { data: product } = await supabaseAdmin
          .from('products')
          .select('name, download_url')
          .eq('id', productId)
          .single()

        if (product?.download_url && customerEmail) {
          await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || 'orders@botvaultpro.com',
            to: customerEmail,
            subject: `Your BVP ${product.name} is ready`,
            html: buildDeliveryEmail(product.name, product.download_url),
          })

          if (order?.id) {
            await supabaseAdmin
              .from('orders')
              .update({ email_sent: true })
              .eq('id', order.id)
          }
        }
      }
    } catch (err) {
      console.error('Error processing order:', err)
    }
  }

  return NextResponse.json({ received: true })
}
