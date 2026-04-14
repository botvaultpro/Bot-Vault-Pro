import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/cms-supabase'

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
