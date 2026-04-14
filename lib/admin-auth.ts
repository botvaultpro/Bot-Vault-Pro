import { cookies } from 'next/headers'
import { createHmac } from 'crypto'

const SECRET = process.env.ADMIN_SESSION_SECRET!
const COOKIE = 'bvp_admin_session'

export function signSession(payload: string): string {
  const hmac = createHmac('sha256', SECRET)
  hmac.update(payload)
  return `${payload}.${hmac.digest('hex')}`
}

export function verifySession(token: string): boolean {
  const lastDot = token.lastIndexOf('.')
  if (lastDot === -1) return false
  const payload = token.substring(0, lastDot)
  const sig = token.substring(lastDot + 1)
  const expected = createHmac('sha256', SECRET).update(payload).digest('hex')
  return sig === expected
}

export async function getAdminSession(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE)?.value
  if (!token) return false
  return verifySession(token)
}

export function createSessionCookie(value: string) {
  return {
    name: COOKIE,
    value: signSession(value),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  }
}
