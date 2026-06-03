'use server'

import { db } from '@/db'
import { reviews, bookings, companions, users } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { verifyToken } from '@/lib/jwt'
import { cookies } from 'next/headers'
import { z } from 'zod'

async function getUser() {
  let userId = null
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('hana-token')?.value
    if (token) {
      const payload = await verifyToken(token)
      if (payload?.id) userId = payload.id
    }
  } catch {}

  if (!userId) {
    try {
      const session = await auth()
      userId = session?.user?.id
    } catch {}
  }

  if (!userId) throw new Error('Unauthorized')
  return userId
}

export async function createReview(input) {
  const userId = await getUser()

  const schema = z.object({
    bookingId: z.string(),
    rating: z.number().min(1).max(5),
    content: z.string().min(10).max(1000),
  })

  const data = schema.parse(input)

  const [booking] = await db.select()
    .from(bookings)
    .where(eq(bookings.id, data.bookingId))
    .limit(1)

  if (!booking) throw new Error('Booking not found')
  if (booking.clientId !== userId) throw new Error('Forbidden')
  if (booking.status !== 'COMPLETED') throw new Error('Booking must be completed to review')

  const [existingReview] = await db.select({ id: reviews.id })
    .from(reviews)
    .where(eq(reviews.bookingId, data.bookingId))
    .limit(1)

  if (existingReview) throw new Error('Review already exists')

  const [review] = await db.insert(reviews).values({
    bookingId: data.bookingId,
    authorId: userId,
    companionId: booking.companionId,
    rating: data.rating,
    content: data.content,
  }).returning()

  const allReviews = await db.select({ rating: reviews.rating })
    .from(reviews)
    .where(and(eq(reviews.companionId, booking.companionId), eq(reviews.isVisible, true)))

  const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

  await db.update(companions)
    .set({
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: allReviews.length,
    })
    .where(eq(companions.id, booking.companionId))

  return review
}

export async function getReviewsByCompanion(input) {
  const schema = z.object({
    companionId: z.string(),
    page: z.number().default(1),
  })

  const data = schema.parse(input)

  const rows = await db.select()
    .from(reviews)
    .where(and(eq(reviews.companionId, data.companionId), eq(reviews.isVisible, true)))
    .orderBy(desc(reviews.createdAt))
    .limit(10)
    .offset((data.page - 1) * 10)

  const results = await Promise.all(rows.map(async (review) => {
    const [author] = await db.select({ name: users.name, image: users.image })
      .from(users)
      .where(eq(users.id, review.authorId))
      .limit(1)
    return { ...review, author }
  }))

  return results
}
