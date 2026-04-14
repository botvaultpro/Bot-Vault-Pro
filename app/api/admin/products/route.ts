import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/cms-supabase'
import { revalidatePath } from 'next/cache'

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    const { error } = await supabaseAdmin
      .from('products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    revalidatePath('/')
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
        .from('products')
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
      revalidatePath('/')
      return NextResponse.json(data)
    } else {
      const { data, error } = await supabaseAdmin
        .from('products')
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    await supabaseAdmin.from('products').delete().eq('id', id)
    revalidatePath('/')
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
