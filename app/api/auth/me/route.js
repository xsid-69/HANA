import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('hana-token')?.value
  if (!token) return NextResponse.json({ user: null })

  const payload = await verifyToken(token)
  if (!payload?.id) {
    const response = NextResponse.json({ user: null })
    response.cookies.set('hana-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })
    return response
  }

  try {
    const [user] = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      age: users.age,
      onboarded: users.onboarded,
      image: users.image,
    })
      .from(users)
      .where(eq(users.id, payload.id))
      .limit(1)

    if (!user) {
      const response = NextResponse.json({ user: null })
      response.cookies.set('hana-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      })
      return response
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Failed to load authenticated user', error)
    return NextResponse.json(
      { error: 'Authentication service unavailable' },
      { status: 500 },
    )
  }
}
