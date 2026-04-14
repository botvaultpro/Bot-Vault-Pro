import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/cms-supabase'
import { revalidatePath } from 'next/cache'

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    const { error } = await supabaseAdmin
      .from('cms_pages')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    revalidatePath('/')
    revalidatePath('/[slug]', 'page')
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...fields } = body

    if (id && id !== 'new') {
      const { data, error } = await supabaseAdmin
        .from('cms_pages')
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      revalidatePath('/')
      revalidatePath(`/${data.slug}`)
      return NextResponse.json(data)
    } else {
      const { data, error } = await supabaseAdmin
        .from('cms_pages')
        .insert(fields)
        .select()
        .single()
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      revalidatePath('/')
      return NextResponse.json(data)
    }
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
