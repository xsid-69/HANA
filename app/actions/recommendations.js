'use server'

import { db } from '@/db'
import {
  companions,
  recommendations as recommendationsTable,
  userEvents,
} from '@/db/schema'
import { getFeaturedCompanions } from '@/app/actions/companions'
import { redis } from '@/lib/upstash'
import { auth } from '@/lib/auth'
import { verifyToken } from '@/lib/jwt'
import { and, desc, eq, inArray } from 'drizzle-orm'
import { cookies, headers } from 'next/headers'
import { timingSafeEqual } from 'crypto'
import { z } from 'zod'

const EVENT_WEIGHTS = Object.freeze({
  profile_viewed: 1,
  companion_saved: 2,
  message_sent: 3,
  booking_completed: 5,
  booking_cancelled: -2,
  profile_dismissed: -1,
})

const recommendationInput = z.object({
  userId: z.string().min(1),
  companionId: z.string().min(1),
  score: z.number().finite(),
})

async function getCurrentUserId() {
  try {
    const token = (await cookies()).get('hana-token')?.value
    if (token) {
      const payload = await verifyToken(token)
      if (payload?.id) return payload.id
    }
  } catch {}

  try {
    return (await auth())?.user?.id ?? null
  } catch {
    return null
  }
}

async function assertUserAccess(userId) {
  const currentUserId = await getCurrentUserId()
  if (!currentUserId || currentUserId !== userId) throw new Error('Unauthorized')
}

async function assertMlAccess() {
  const secret = process.env.ML_API_SECRET
  const authorization = (await headers()).get('authorization') ?? ''
  const expected = secret ? `Bearer ${secret}` : ''

  if (!expected || authorization.length !== expected.length) throw new Error('Unauthorized')
  if (!timingSafeEqual(Buffer.from(authorization), Buffer.from(expected))) {
    throw new Error('Unauthorized')
  }
}

function cacheKey(userId) {
  return `recommendations:${userId}`
}

export async function logUserEvent(userId, companionId, eventType, sessionDuration) {
  const input = z.object({
    userId: z.string().min(1),
    companionId: z.string().min(1),
    eventType: z.enum(Object.keys(EVENT_WEIGHTS)),
    sessionDuration: z.number().int().min(0).optional(),
  }).parse({ userId, companionId, eventType, sessionDuration })

  await assertUserAccess(input.userId)

  const [event] = await db.insert(userEvents).values({
    ...input,
    weight: EVENT_WEIGHTS[input.eventType],
    sessionDuration: input.eventType === 'profile_viewed' ? input.sessionDuration ?? null : null,
  }).returning()

  return event
}

export async function getRecommendations(userId) {
  const inputUserId = z.string().min(1).parse(userId)
  await assertUserAccess(inputUserId)
  const key = cacheKey(inputUserId)

  try {
    const cached = await redis.get(key)
    if (cached) return typeof cached === 'string' ? JSON.parse(cached) : cached
  } catch (error) {
    console.error('Recommendation cache read failed:', error)
  }

  const rows = await db.select({ companion: companions, score: recommendationsTable.score })
    .from(recommendationsTable)
    .innerJoin(companions, eq(recommendationsTable.companionId, companions.id))
    .where(and(
      eq(recommendationsTable.userId, inputUserId),
      eq(companions.isActive, true),
      eq(companions.isSuspended, false),
    ))
    .orderBy(desc(recommendationsTable.score))
    .limit(10)

  const isColdStart = rows.length < 3
  const recommended = rows.map(({ companion, score }) => ({ ...companion, score }))
  const featured = isColdStart
    ? (await getFeaturedCompanions())
      .filter((companion) => !companion.isSuspended && companion.userId !== inputUserId)
      .slice(0, 10)
      .map((companion) => ({ ...companion, score: null }))
    : recommended
  const result = { companions: featured, isColdStart }

  try {
    await redis.set(key, result, { ex: 86400 })
  } catch (error) {
    console.error('Recommendation cache write failed:', error)
  }

  return result
}

export async function getInteractionMatrix() {
  await assertMlAccess()
  return db.select({
    userId: userEvents.userId,
    companionId: userEvents.companionId,
    weight: userEvents.weight,
    createdAt: userEvents.createdAt,
  }).from(userEvents)
}

export async function saveRecommendations(recommendations) {
  await assertMlAccess()
  const input = z.array(recommendationInput).parse(recommendations)
  if (!input.length) return { saved: 0, users: 0 }

  const userIds = [...new Set(input.map((item) => item.userId))]
  const modelVersion = process.env.RECOMMENDATION_MODEL_VERSION || 'v1'

  await db.transaction(async (tx) => {
    await tx.delete(recommendationsTable)
      .where(inArray(recommendationsTable.userId, userIds))
    await tx.insert(recommendationsTable).values(
      input.map((item) => ({ ...item, modelVersion })),
    )
  })

  await Promise.allSettled(userIds.map((userId) => redis.del(cacheKey(userId))))
  return { saved: input.length, users: userIds.length, modelVersion }
}