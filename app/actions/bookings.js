'use server'

import { db } from '@/db'
import { bookings, companions, users, notifications, reviews } from '@/db/schema'
import { eq, and, or, lte, lt, gt, gte, inArray } from 'drizzle-orm'
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

export async function createBooking(input) {
  const userId = await getUser()

  const schema = z.object({
    companionId: z.string(),
    date: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    durationHours: z.number().min(2).max(8),
    activityType: z.string(),
    notes: z.string().optional(),
  })

  const data = schema.parse(input)

  const [companion] = await db.select({
    hourlyRate: companions.hourlyRate,
    userId: companions.userId,
  })
    .from(companions)
    .where(eq(companions.id, data.companionId))
    .limit(1)

  if (!companion) throw new Error('Companion not found')
  if (companion.userId === userId) throw new Error('Cannot book yourself')

  const date = new Date(data.date)

  const [conflict] = await db.select({ id: bookings.id })
    .from(bookings)
    .where(and(
      eq(bookings.companionId, data.companionId),
      eq(bookings.date, date),
      inArray(bookings.status, ['PENDING', 'CONFIRMED']),
      or(
        and(lte(bookings.startTime, data.startTime), gt(bookings.endTime, data.startTime)),
        and(lt(bookings.startTime, data.endTime), gte(bookings.endTime, data.endTime)),
      )
    ))
    .limit(1)

  if (conflict) throw new Error('Time slot unavailable')

  const subtotal = companion.hourlyRate * data.durationHours
  const serviceFee = Math.round(subtotal * 0.08)
  const deposit = 2000
  const totalAmount = subtotal + serviceFee + deposit

  const [booking] = await db.insert(bookings).values({
    clientId: userId,
    companionId: data.companionId,
    date,
    startTime: data.startTime,
    endTime: data.endTime,
    durationHours: data.durationHours,
    activityType: data.activityType,
    notes: data.notes,
    hourlyRate: companion.hourlyRate,
    subtotal,
    serviceFee,
    deposit,
    totalAmount,
    status: 'PENDING',
  }).returning()

  await db.insert(notifications).values({
    userId: companion.userId,
    type: 'BOOKING_REQUEST',
    title: 'New Booking Request',
    body: `You have a new booking request for ${data.activityType}`,
    data: { bookingId: booking.id },
  })

  return booking
}

export async function getMyBookings(input) {
  const userId = await getUser()

  const schema = z.object({
    status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'DECLINED']).optional(),
  }).optional()

  const data = schema.parse(input)

  const companionIds = await db.select({ id: companions.id })
    .from(companions)
    .where(eq(companions.userId, userId))

  const myCompanionId = companionIds[0]?.id

  let conditions
  if (myCompanionId) {
    conditions = or(
      eq(bookings.clientId, userId),
      eq(bookings.companionId, myCompanionId),
    )
  } else {
    conditions = eq(bookings.clientId, userId)
  }

  if (data?.status) {
    conditions = and(conditions, eq(bookings.status, data.status))
  }

  const rows = await db.select()
    .from(bookings)
    .where(conditions)
    .orderBy(bookings.date)

  const results = await Promise.all(rows.map(async (booking) => {
    const [companion] = await db.select()
      .from(companions)
      .where(eq(companions.id, booking.companionId))
      .limit(1)

    const [companionUser] = companion ? await db.select({ name: users.name, image: users.image })
      .from(users)
      .where(eq(users.id, companion.userId))
      .limit(1) : [null]

    const [client] = await db.select({ name: users.name, image: users.image })
      .from(users)
      .where(eq(users.id, booking.clientId))
      .limit(1)

    return {
      ...booking,
      companion: companion ? { ...companion, user: companionUser } : null,
      client,
    }
  }))

  return results
}

export async function getBookingById(id) {
  const userId = await getUser()

  const [booking] = await db.select()
    .from(bookings)
    .where(eq(bookings.id, id))
    .limit(1)

  if (!booking) throw new Error('Booking not found')

  const [companion] = await db.select()
    .from(companions)
    .where(eq(companions.id, booking.companionId))
    .limit(1)

  const [companionUser] = companion ? await db.select({ name: users.name, image: users.image })
    .from(users)
    .where(eq(users.id, companion.userId))
    .limit(1) : [null]

  const [client] = await db.select({ name: users.name, image: users.image })
    .from(users)
    .where(eq(users.id, booking.clientId))
    .limit(1)

  const [review] = await db.select()
    .from(reviews)
    .where(eq(reviews.bookingId, booking.id))
    .limit(1)

  if (booking.clientId !== userId && companion?.userId !== userId) {
    throw new Error('Forbidden')
  }

  return {
    ...booking,
    companion: companion ? { ...companion, user: companionUser } : null,
    client,
    review: review ?? null,
  }
}

export async function cancelBooking({ id, reason }) {
  const userId = await getUser()

  const [booking] = await db.select()
    .from(bookings)
    .where(eq(bookings.id, id))
    .limit(1)

  if (!booking) throw new Error('Booking not found')

  const [companion] = await db.select({ userId: companions.userId })
    .from(companions)
    .where(eq(companions.id, booking.companionId))
    .limit(1)

  if (booking.clientId !== userId && companion?.userId !== userId) {
    throw new Error('Forbidden')
  }

  if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
    throw new Error('Cannot cancel this booking')
  }

  const [updated] = await db.update(bookings)
    .set({
      status: 'CANCELLED',
      cancelledBy: userId,
      cancelledAt: new Date(),
      cancelReason: reason,
    })
    .where(eq(bookings.id, id))
    .returning()

  return updated
}

export async function confirmBooking(id) {
  const userId = await getUser()

  const [booking] = await db.select()
    .from(bookings)
    .where(eq(bookings.id, id))
    .limit(1)

  if (!booking) throw new Error('Booking not found')

  const [companion] = await db.select({ userId: companions.userId })
    .from(companions)
    .where(eq(companions.id, booking.companionId))
    .limit(1)

  if (companion?.userId !== userId) throw new Error('Forbidden')
  if (booking.status !== 'PENDING') throw new Error('Booking is not pending')

  const [updated] = await db.update(bookings)
    .set({ status: 'CONFIRMED' })
    .where(eq(bookings.id, id))
    .returning()

  await db.insert(notifications).values({
    userId: booking.clientId,
    type: 'BOOKING_CONFIRMED',
    title: 'Booking Confirmed',
    body: 'Your booking has been confirmed!',
    data: { bookingId: booking.id },
  })

  return updated
}

export async function completeBooking(id) {
  const userId = await getUser()

  const [booking] = await db.select()
    .from(bookings)
    .where(eq(bookings.id, id))
    .limit(1)

  if (!booking) throw new Error('Booking not found')

  const [companion] = await db.select({ userId: companions.userId })
    .from(companions)
    .where(eq(companions.id, booking.companionId))
    .limit(1)

  if (companion?.userId !== userId) throw new Error('Forbidden')
  if (booking.status !== 'CONFIRMED') throw new Error('Booking is not confirmed')

  const [updated] = await db.update(bookings)
    .set({ status: 'COMPLETED' })
    .where(eq(bookings.id, id))
    .returning()

  await db.insert(notifications).values({
    userId: booking.clientId,
    type: 'BOOKING_COMPLETED',
    title: 'Booking Completed',
    body: 'Your experience is complete! Leave a review.',
    data: { bookingId: booking.id },
  })

  return updated
}
