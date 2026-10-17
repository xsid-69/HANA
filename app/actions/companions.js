'use server'

import { db } from '@/db'
import { companions, users, experiences, reviews, bookings, availabilities, blockedDates } from '@/db/schema'
import { auth } from '@/lib/auth'
import { verifyToken } from '@/lib/jwt'
import { areAgesCompatible, isAdultAge } from '@/lib/age-policy'
import { cookies } from 'next/headers'
import { eq, and, or, gte, lte, ilike, desc, asc, inArray, arrayOverlaps, count, sql } from 'drizzle-orm'
import { z } from 'zod'

async function getOptionalViewer() {
  let userId = null
  try {
    const token = (await cookies()).get('hana-token')?.value
    if (token) userId = (await verifyToken(token))?.id ?? null
  } catch {}

  if (!userId) {
    try {
      userId = (await auth())?.user?.id ?? null
    } catch {}
  }
  if (!userId) return null

  const [viewer] = await db.select({
    id: users.id,
    role: users.role,
    age: users.age,
    onboarded: users.onboarded,
  }).from(users).where(eq(users.id, userId)).limit(1)

  return viewer ?? null
}

function getBookingEligibility(viewer, companion) {
  if (!companion.isActive || companion.isSuspended) {
    return { canBook: false, reason: 'This companion is currently unavailable' }
  }
  if (!viewer) return { canBook: false, reason: 'Sign in to book this companion' }
  if (viewer.id === companion.userId) return { canBook: false, reason: 'You cannot book yourself' }
  if (viewer.role !== 'CLIENT') return { canBook: false, reason: 'Only client accounts can make bookings' }
  if (!viewer.onboarded || !isAdultAge(viewer.age)) {
    return { canBook: false, reason: 'Complete your adult profile before booking' }
  }
  if (!areAgesCompatible(viewer.age, companion.age)) {
    return { canBook: false, reason: 'You can only book companions within two years of your age' }
  }
  return { canBook: true, reason: null }
}

async function hydrateCompanion(companion, { includeDetails = false } = {}) {
  const [user] = await db.select({ id: users.id, name: users.name, image: users.image })
    .from(users)
    .where(eq(users.id, companion.userId))
    .limit(1)

  const exps = await db.select()
    .from(experiences)
    .where(eq(experiences.companionId, companion.id))

  if (!includeDetails) return { ...companion, user, experiences: exps }

  const [avail, revs, reviewCount, bookingCount] = await Promise.all([
    db.select().from(availabilities).where(eq(availabilities.companionId, companion.id)),
    db.select({
      id: reviews.id,
      rating: reviews.rating,
      content: reviews.content,
      createdAt: reviews.createdAt,
      authorId: reviews.authorId,
    }).from(reviews)
      .where(and(eq(reviews.companionId, companion.id), eq(reviews.isVisible, true)))
      .orderBy(desc(reviews.createdAt))
      .limit(10),
    db.select({ count: count() }).from(reviews).where(eq(reviews.companionId, companion.id)),
    db.select({ count: count() }).from(bookings).where(eq(bookings.companionId, companion.id)),
  ])

  const reviewsWithAuthor = await Promise.all(revs.map(async (review) => {
    const [author] = await db.select({ name: users.name, image: users.image })
      .from(users)
      .where(eq(users.id, review.authorId))
      .limit(1)
    return { ...review, author }
  }))

  return {
    ...companion,
    user,
    experiences: exps,
    availability: avail,
    reviews: reviewsWithAuthor,
    _count: {
      reviews: reviewCount[0]?.count ?? 0,
      bookings: bookingCount[0]?.count ?? 0,
    },
  }
}

export async function getCompanions(filters) {
  const schema = z.object({
    search: z.string().optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    tags: z.array(z.string()).optional(),
    minPrice: z.number().optional(),
    maxPrice: z.number().optional(),
    sortBy: z.enum(['random', 'rating', 'price_asc', 'price_desc', 'name']).optional(),
    page: z.number().default(1),
    limit: z.number().default(50),
  }).optional()

  const f = schema.parse(filters) ?? {}
  const page = f.page ?? 1
  const limit = f.limit ?? 50
  const conditions = [
    eq(companions.isActive, true),
    eq(companions.isSuspended, false),
  ]

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
    f.sortBy === 'random' ? sql`random()` :
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

  return Promise.all(rows.map(async (companion) => {
    const hydrated = await hydrateCompanion(companion)
    const [reviewCount, bookingCount] = await Promise.all([
      db.select({ count: count() }).from(reviews).where(eq(reviews.companionId, companion.id)),
      db.select({ count: count() }).from(bookings).where(eq(bookings.companionId, companion.id)),
    ])
    return {
      ...hydrated,
      _count: {
        reviews: reviewCount[0]?.count ?? 0,
        bookings: bookingCount[0]?.count ?? 0,
      },
    }
  }))
}

export async function getCompanionById(id) {
  const input = z.object({ id: z.string() }).parse({ id })
  const [companion] = await db.select()
    .from(companions)
    .where(eq(companions.id, input.id))
    .limit(1)
  if (!companion) throw new Error('Companion not found')

  const [hydrated, viewer] = await Promise.all([
    hydrateCompanion(companion, { includeDetails: true }),
    getOptionalViewer(),
  ])
  return {
    ...hydrated,
    bookingEligibility: getBookingEligibility(viewer, companion),
  }
}

export async function getFeaturedCompanions() {
  const rows = await db.select()
    .from(companions)
    .where(and(
      eq(companions.isActive, true),
      eq(companions.isSuspended, false),
      eq(companions.isFeatured, true),
    ))
    .orderBy(desc(companions.averageRating))
    .limit(10)

  return Promise.all(rows.map((companion) => hydrateCompanion(companion)))
}

export async function searchCompanions(query) {
  const input = z.object({ query: z.string().min(1) }).parse({ query })

  const rows = await db.select()
    .from(companions)
    .where(and(
      eq(companions.isActive, true),
      eq(companions.isSuspended, false),
      or(
        ilike(companions.displayName, `%${input.query}%`),
        ilike(companions.bio, `%${input.query}%`),
        arrayOverlaps(companions.tags, [input.query.toLowerCase()]),
        ilike(companions.city, `%${input.query}%`),
      )
    ))
    .limit(20)

  return Promise.all(rows.map((companion) => hydrateCompanion(companion)))
}

export async function getCompanionAvailability({ companionId, date }) {
  const input = z.object({ companionId: z.string(), date: z.string() }).parse({ companionId, date })
  const [companion] = await db.select({ isActive: companions.isActive, isSuspended: companions.isSuspended })
    .from(companions)
    .where(eq(companions.id, input.companionId))
    .limit(1)
  if (!companion) throw new Error('Companion not found')

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
      inArray(bookings.status, ['PENDING_ACCEPTANCE', 'AWAITING_PAYMENT', 'CONFIRMED', 'IN_PROGRESS'])
    ))

  return {
    isAvailable: Boolean(companion.isActive && !companion.isSuspended && availability?.isAvailable && !blockedDate),
    startTime: availability?.startTime,
    endTime: availability?.endTime,
    bookedSlots: existingBookings,
  }
}
