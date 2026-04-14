import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/cms-supabase'

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    const { error } = await supabaseAdmin
      .from('subscribers')
      .update(updates)
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
