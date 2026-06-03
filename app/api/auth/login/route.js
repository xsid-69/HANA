import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { signToken, setTokenCookie } from '@/lib/jwt'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(req) {
  try {
    const body = await req.json()
    const { email, password } = schema.parse(body)

    const [user] = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      onboarded: users.onboarded,
      password: users.password,
    })
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      )
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      )
    }

    const token = await signToken({ id: user.id, email: user.email, role: user.role })
    const { password: _, ...safeUser } = user
    const response = NextResponse.json({ user: safeUser })
    setTokenCookie(response, token)
    return response
  } catch (err) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    console.error('[login]', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
