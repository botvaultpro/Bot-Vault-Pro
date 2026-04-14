import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/cms-supabase'
import { resend } from '@/lib/resend'

export async function POST(request: NextRequest) {
  try {
    const { email, name, source } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Upsert subscriber to DB
    await supabaseAdmin
      .from('subscribers')
      .upsert(
        { email, name: name || null, source: source || 'website', is_active: true },
        { onConflict: 'email', ignoreDuplicates: false }
      )

    // Add to Resend audience
    const audienceId = process.env.RESEND_AUDIENCE_ID
    if (audienceId) {
      try {
        const contact = await resend.contacts.create({
          email,
          firstName: name || undefined,
          audienceId,
          unsubscribed: false,
        })

        // Store Resend contact ID
        if ('id' in contact && typeof contact.id === 'string') {
          await supabaseAdmin
            .from('subscribers')
            .update({ resend_contact_id: contact.id })
            .eq('email', email)
        }
      } catch {
        // Non-fatal — subscriber is still saved to DB
      }
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Subscribe error:', err)
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}
