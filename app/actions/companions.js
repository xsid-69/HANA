'use server'

import { db } from '@/db'
import { companions, users, experiences, reviews, bookings, availabilities, blockedDates } from '@/db/schema'
import { eq, and, or, gte, lte, ilike, desc, asc, inArray, arrayOverlaps, count } from 'drizzle-orm'
import { z } from 'zod'

export async function getCompanions(filters) {
  const schema = z.object({
    search: z.string().optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    tags: z.array(z.string()).optional(),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
    sortBy: z.enum(['rating', 'price_asc', 'price_desc', 'name']).optional(),
    page: z.number().default(1),
    limit: z.number().default(50),
  }).optional()

  const f = schema.parse(filters) ?? {}
  const page = f.page ?? 1
  const limit = f.limit ?? 50

  const conditions = [eq(companions.isActive, true)]

  if (f.city) conditions.push(ilike(companions.city, f.city))
  if (f.district) conditions.push(ilike(companions.district, `%${f.district}%`))
  if (f.tags?.length) conditions.push(arrayOverlaps(companions.tags, f.tags))
  if (f.minPrice) conditions.push(gte(companions.hourlyRate, f.minPrice))
  if (f.maxPrice) conditions.push(lte(companions.hourlyRate, f.maxPrice))

  if (f.search) {
    conditions.push(or(
      ilike(companions.displayName, `%${f.search}%`),
      ilike(companions.bio, `%${f.search}%`),
      ilike(companions.city, `%${f.search}%`),
      ilike(companions.district, `%${f.search}%`),
      arrayOverlaps(companions.tags, [f.search.toLowerCase()]),
    ))
  }

  const orderBy =
    f.sortBy === 'price_asc' ? asc(companions.hourlyRate) :
    f.sortBy === 'price_desc' ? desc(companions.hourlyRate) :
    f.sortBy === 'name' ? asc(companions.displayName) :
    desc(companions.averageRating)

  const rows = await db.select()
    .from(companions)
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(limit)
    .offset((page - 1) * limit)

  const results = await Promise.all(rows.map(async (companion) => {
    const [user] = await db.select({ name: users.name, image: users.image })
      .from(users)
      .where(eq(users.id, companion.userId))
      .limit(1)

    const exps = await db.select()
      .from(experiences)
      .where(eq(experiences.companionId, companion.id))

    const [reviewCount] = await db.select({ count: count() })
      .from(reviews)
      .where(eq(reviews.companionId, companion.id))

    const [bookingCount] = await db.select({ count: count() })
      .from(bookings)
      .where(eq(bookings.companionId, companion.id))

    return {
      ...companion,
      user,
      experiences: exps,
      _count: {
        reviews: reviewCount?.count ?? 0,
        bookings: bookingCount?.count ?? 0,
      },
    }
  }))

  return results
}

export async function getCompanionById(id) {
  const input = z.object({ id: z.string() }).parse({ id })

  const [companion] = await db.select()
    .from(companions)
    .where(eq(companions.id, input.id))
    .limit(1)

  if (!companion) throw new Error('Companion not found')

  const [user] = await db.select({ id: users.id, name: users.name, image: users.image })
    .from(users)
    .where(eq(users.id, companion.userId))
    .limit(1)

  const exps = await db.select()
    .from(experiences)
    .where(eq(experiences.companionId, companion.id))

  const avail = await db.select()
    .from(availabilities)
    .where(eq(availabilities.companionId, companion.id))

  const revs = await db.select({
    id: reviews.id,
    rating: reviews.rating,
    content: reviews.content,
    createdAt: reviews.createdAt,
    authorId: reviews.authorId,
  })
    .from(reviews)
    .where(and(eq(reviews.companionId, companion.id), eq(reviews.isVisible, true)))
    .orderBy(desc(reviews.createdAt))
    .limit(10)

  const reviewsWithAuthor = await Promise.all(revs.map(async (rev) => {
    const [author] = await db.select({ name: users.name, image: users.image })
      .from(users)
      .where(eq(users.id, rev.authorId))
      .limit(1)
    return { ...rev, author }
  }))

  const [reviewCount] = await db.select({ count: count() })
    .from(reviews)
    .where(eq(reviews.companionId, companion.id))

  const [bookingCount] = await db.select({ count: count() })
    .from(bookings)
    .where(eq(bookings.companionId, companion.id))

  return {
    ...companion,
    user,
    experiences: exps,
    availability: avail,
    reviews: reviewsWithAuthor,
    _count: {
      reviews: reviewCount?.count ?? 0,
      bookings: bookingCount?.count ?? 0,
    },
  }
}

export async function getFeaturedCompanions() {
  const rows = await db.select()
    .from(companions)
    .where(and(eq(companions.isActive, true), eq(companions.isFeatured, true)))
    .orderBy(desc(companions.averageRating))
    .limit(10)

  const results = await Promise.all(rows.map(async (companion) => {
    const [user] = await db.select({ name: users.name, image: users.image })
      .from(users)
      .where(eq(users.id, companion.userId))
      .limit(1)

    const exps = await db.select()
      .from(experiences)
      .where(eq(experiences.companionId, companion.id))

    return { ...companion, user, experiences: exps }
  }))

  return results
}

export async function searchCompanions(query) {
  const input = z.object({ query: z.string().min(1) }).parse({ query })

  const rows = await db.select()
    .from(companions)
    .where(and(
      eq(companions.isActive, true),
      or(
        ilike(companions.displayName, `%${input.query}%`),
        ilike(companions.bio, `%${input.query}%`),
        arrayOverlaps(companions.tags, [input.query.toLowerCase()]),
        ilike(companions.city, `%${input.query}%`),
      )
    ))
    .limit(20)

  const results = await Promise.all(rows.map(async (companion) => {
    const [user] = await db.select({ name: users.name, image: users.image })
      .from(users)
      .where(eq(users.id, companion.userId))
      .limit(1)

    const exps = await db.select()
      .from(experiences)
      .where(eq(experiences.companionId, companion.id))

    return { ...companion, user, experiences: exps }
  }))

  return results
}

export async function getCompanionAvailability({ companionId, date }) {
  const input = z.object({ companionId: z.string(), date: z.string() }).parse({ companionId, date })

  const d = new Date(input.date)
  const dayOfWeek = d.getDay()

  const [availability] = await db.select()
    .from(availabilities)
    .where(and(
      eq(availabilities.companionId, input.companionId),
      eq(availabilities.dayOfWeek, dayOfWeek)
    ))
    .limit(1)

  const [blockedDate] = await db.select()
    .from(blockedDates)
    .where(and(
      eq(blockedDates.companionId, input.companionId),
      eq(blockedDates.date, d)
    ))
    .limit(1)

  const existingBookings = await db.select({
    startTime: bookings.startTime,
    endTime: bookings.endTime,
  })
    .from(bookings)
    .where(and(
      eq(bookings.companionId, input.companionId),
      eq(bookings.date, d),
      inArray(bookings.status, ['PENDING', 'CONFIRMED'])
    ))

  return {
    isAvailable: availability?.isAvailable && !blockedDate,
    startTime: availability?.startTime,
    endTime: availability?.endTime,
    bookedSlots: existingBookings,
  }
}
