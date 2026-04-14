import { NextRequest, NextResponse } from 'next/server'
import { createSessionCookie } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    const cookie = createSessionCookie('bvp-admin')
    const response = NextResponse.json({ success: true })
    response.cookies.set(cookie)
    return response
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
