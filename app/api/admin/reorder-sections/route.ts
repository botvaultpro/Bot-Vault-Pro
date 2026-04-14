import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/cms-supabase'
import { revalidatePath } from 'next/cache'

export async function PUT(request: NextRequest) {
  try {
    const { items } = await request.json() as { items: { id: string; sort_order: number }[] }

    await Promise.all(
      items.map(item =>
        supabaseAdmin
          .from('cms_sections')
          .update({ sort_order: item.sort_order })
          .eq('id', item.id)
      )
    )

    revalidatePath('/')
    revalidatePath('/[slug]', 'page')
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
