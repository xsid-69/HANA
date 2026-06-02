import { NextResponse } from 'next/server'
import { clearTokenCookie } from '@/lib/jwt'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  clearTokenCookie(response)
  return response
}
