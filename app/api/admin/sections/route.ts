import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/cms-supabase'
import { revalidatePath } from 'next/cache'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const pageId = searchParams.get('pageId')
  if (!pageId) return NextResponse.json({ error: 'Missing pageId' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('cms_sections')
    .select('*')
    .eq('page_id', pageId)
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { data, error } = await supabaseAdmin
      .from('cms_sections')
      .insert(body)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    revalidatePath('/')
    revalidatePath('/[slug]', 'page')
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    const { data, error } = await supabaseAdmin
      .from('cms_sections')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    revalidatePath('/')
    revalidatePath('/[slug]', 'page')
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

    await supabaseAdmin.from('cms_sections').delete().eq('id', id)
    revalidatePath('/')
    revalidatePath('/[slug]', 'page')
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
