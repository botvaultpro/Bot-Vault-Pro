import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/cms-supabase'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json() as Record<string, string>

    const upserts = Object.entries(settings).map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString(),
    }))

    const { error } = await supabaseAdmin
      .from('site_settings')
      .upsert(upserts, { onConflict: 'key' })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    revalidatePath('/', 'layout')
    revalidatePath('/[slug]', 'page')
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
