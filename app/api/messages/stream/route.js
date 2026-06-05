import { subscribe } from '@/lib/message-events'
import { verifyToken } from '@/lib/jwt'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function getUserId(request) {
  const cookieHeader = request.headers.get('cookie') || ''
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [key, ...val] = c.trim().split('=')
      return [key, val.join('=')]
    })
  )

  const token = cookies['hana-token']
  if (token) {
    try {
      const payload = await verifyToken(token)
      if (payload?.id) return payload.id
    } catch {}
  }

  try {
    const session = await auth()
    if (session?.user?.id) return session.user.id
  } catch {}

  return null
}

export async function GET(request) {
  const userId = await getUserId(request)
  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()

      const send = (data) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      send({ type: 'connected', userId })

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`))
        } catch {
          clearInterval(heartbeat)
        }
      }, 15000)

      const unsubscribe = subscribe(userId, (event) => {
        try {
          send(event)
        } catch {
          unsubscribe()
          clearInterval(heartbeat)
        }
      })

      request.signal.addEventListener('abort', () => {
        unsubscribe()
        clearInterval(heartbeat)
        try { controller.close() } catch {}
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
