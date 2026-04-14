import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/cms-supabase'
import { resend } from '@/lib/resend'

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
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <h1 style="margin:0 0 16px;font-size:32px;font-weight:900;color:#f0ede8;">Your purchase is confirmed.</h1>
              <p style="margin:0 0 32px;font-size:16px;color:#a8a49e;line-height:1.6;">
                You have access to <strong style="color:#ff5e14;">${productName}</strong>.
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:4px;background:#ff5e14;">
                    <a href="${downloadUrl}" style="display:inline-block;padding:16px 32px;font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#ffffff;text-decoration:none;">
                      Download Your Product
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #1e1e24;">
              <p style="margin:0;font-size:12px;color:#52504e;">Questions? <a href="mailto:support@botvaultpro.com" style="color:#a8a49e;">support@botvaultpro.com</a></p>
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
  try {
    const { orderId } = await request.json()

    const { data: order } = await supabaseAdmin
      .from('orders')
      .select('*, products(name, download_url)')
      .eq('id', orderId)
      .single()

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const product = order.products as { name: string; download_url: string } | null
    if (!product?.download_url) return NextResponse.json({ error: 'No download URL' }, { status: 400 })

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'orders@botvaultpro.com',
      to: order.customer_email,
      subject: `Your BVP ${product.name} is ready`,
      html: buildDeliveryEmail(product.name, product.download_url),
    })

    await supabaseAdmin.from('orders').update({ email_sent: true }).eq('id', orderId)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
