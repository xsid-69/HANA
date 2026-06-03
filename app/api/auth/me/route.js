import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('hana-token')?.value
    if (!token) return NextResponse.json({ user: null })

    const payload = await verifyToken(token)
    if (!payload?.id) return NextResponse.json({ user: null })

    const [user] = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      onboarded: users.onboarded,
      image: users.image,
    })
      .from(users)
      .where(eq(users.id, payload.id))
      .limit(1)

    return NextResponse.json({ user: user ?? null })
  } catch {
    return NextResponse.json({ user: null })
  }
}
