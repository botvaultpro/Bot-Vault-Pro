import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/cms-supabase'
import { verifySession } from '@/lib/admin-auth'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // Verify admin session
  const cookieStore = await cookies()
  const token = cookieStore.get('bvp_admin_session')?.value
  if (!token || !verifySession(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const bucket = (formData.get('bucket') as string) || 'product-files'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Build a unique path: timestamp + sanitized filename
    const ext = file.name.split('.').pop()
    const base = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-z0-9]/gi, '-')
      .toLowerCase()
      .slice(0, 60)
    const path = `${Date.now()}-${base}.${ext}`

    const buffer = Buffer.from(await file.arrayBuffer())

    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('Storage upload error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path)

    return NextResponse.json({ url: data.publicUrl })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
