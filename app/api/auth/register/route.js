import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { signToken, setTokenCookie } from '@/lib/jwt'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(8).max(100),
})

export async function POST(req) {
  try {
    const body = await req.json()
    const { name, email, password } = schema.parse(body)

    const [existing] = await db.select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1)

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      )
    }

    const hashed = await bcrypt.hash(password, 12)
    const [user] = await db.insert(users).values({
      name,
      email,
      password: hashed,
    }).returning({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      onboarded: users.onboarded,
    })

    const token = await signToken({ id: user.id, email: user.email, role: user.role })
    const response = NextResponse.json({ user }, { status: 201 })
    setTokenCookie(response, token)
    return response
  } catch (err) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    console.error('[register]', err)
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
