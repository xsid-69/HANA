import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/jwt'
import { cookies } from 'next/headers'

export const createContext = async (opts) => {
  // Try JWT cookie first
  let jwtUser = null
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('hana-token')?.value
    if (token) {
      const payload = await verifyToken(token)
      if (payload?.id) {
        jwtUser = { id: payload.id, email: payload.email, role: payload.role }
      }
    }
  } catch {}

  // Fall back to NextAuth session
  let session = null
  if (!jwtUser) {
    try {
      session = await auth()
    } catch {}
  }

  const user = jwtUser || session?.user || null

  return {
    session: user ? { user } : null,
    prisma,
    ...opts,
  }
}

const t = initTRPC.context().create({
  transformer: superjson,
})

export const router = t.router
export const publicProcedure = t.procedure

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({ ctx: { ...ctx, user: ctx.session.user } })
})

export const protectedProcedure = t.procedure.use(isAuthed)

const isCompanion = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) throw new TRPCError({ code: 'UNAUTHORIZED' })
  const user = await ctx.prisma.user.findUnique({
    where: { id: ctx.session.user.id },
    select: { role: true },
  })
  if (user?.role !== 'COMPANION') {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }
  return next({ ctx: { ...ctx, user: ctx.session.user } })
})

export const companionProcedure = t.procedure.use(isCompanion)
