import { redis } from '@/lib/upstash'

export async function POST(req) {
  const { userId } = await req.json()

  if (!userId) {
    return Response.json({ error: 'userId required' }, { status: 400 })
  }

  await redis.set(`user:${userId}:online`, 'true', { ex: 30 })

  return Response.json({ ok: true })
}

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return Response.json({ error: 'userId required' }, { status: 400 })
  }

  const online = await redis.get(`user:${userId}:online`)

  return Response.json({ online: !!online })
}
