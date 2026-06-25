'use server'

import { db } from '@/db'
import { bookings, companions, users, notifications, conversations, conversationParticipants } from '@/db/schema'
import { eq, and, or, lte, lt, gt, gte, inArray, count, sql, desc } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { verifyToken } from '@/lib/jwt'
import { cookies } from 'next/headers'
import { randomInt } from 'crypto'
import { z } from 'zod'

// ── Booking time limits ──────────────────────────────────────────────
// How long a companion has to accept/reject a client's request before it
// auto-expires. Capped so a request never outlives the booking start time.
const REQUEST_ACCEPTANCE_WINDOW_MS = 24 * 60 * 60 * 1000 // 24 hours
// How long a client has to pay after the companion accepts.
const PAYMENT_WINDOW_MS = 30 * 60 * 1000 // 30 minutes

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

// Step 1: User creates a booking request → PENDING_ACCEPTANCE
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
    isSuspended: companions.isSuspended,
  })
    .from(companions)
    .where(eq(companions.id, data.companionId))
    .limit(1)

  if (!companion) throw new Error('Companion not found')
  if (companion.userId === userId) throw new Error('Cannot book yourself')
  if (companion.isSuspended) throw new Error('Companion is currently unavailable')

  const date = new Date(data.date)

  const [conflict] = await db.select({ id: bookings.id })
    .from(bookings)
    .where(and(
      eq(bookings.companionId, data.companionId),
      eq(bookings.date, date),
      inArray(bookings.status, ['PENDING_ACCEPTANCE', 'AWAITING_PAYMENT', 'CONFIRMED', 'IN_PROGRESS']),
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

  // Request auto-expires after the acceptance window. If the booking starts
  // sooner than that window, cap it at the booking start — but only when that
  // is actually in the future, so we never create an already-expired request.
  // startTime can be 12-hour ("2:00 PM") or 24-hour ("14:00"), so parse both.
  const parseStart = (timeStr) => {
    if (!timeStr) return null
    const m = String(timeStr).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i)
    if (!m) return null
    let h = parseInt(m[1], 10)
    const min = parseInt(m[2], 10)
    const period = m[3]?.toUpperCase()
    if (period === 'PM' && h !== 12) h += 12
    if (period === 'AM' && h === 12) h = 0
    return { h, min }
  }

  const windowExpiry = Date.now() + REQUEST_ACCEPTANCE_WINDOW_MS
  const parsed = parseStart(data.startTime)
  let requestExpiresAt = new Date(windowExpiry)
  if (parsed) {
    const bookingStart = new Date(date)
    bookingStart.setHours(parsed.h, parsed.min, 0, 0)
    // Only cap when the booking start is in the future and earlier than the window.
    if (bookingStart.getTime() > Date.now() && bookingStart.getTime() < windowExpiry) {
      requestExpiresAt = bookingStart
    }
  }

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
    status: 'PENDING_ACCEPTANCE',
    paymentStatus: 'PENDING',
    requestExpiresAt,
  }).returning()

  // Increment total requests for companion
  await db.update(companions)
    .set({ totalRequests: sql`"totalRequests" + 1` })
    .where(eq(companions.id, data.companionId))

  await db.insert(notifications).values({
    userId: companion.userId,
    type: 'BOOKING_REQUEST',
    title: 'New Booking Request',
    body: `You have a new booking request for ${data.activityType}. Respond before it expires.`,
    data: { bookingId: booking.id, requestExpiresAt: requestExpiresAt.toISOString() },
  })

  return booking
}

// Step 2: Companion accepts → AWAITING_PAYMENT
export async function acceptBooking(bookingId) {
  const userId = await getUser()

  const [booking] = await db.select()
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1)

  if (!booking) throw new Error('Booking not found')

  const [companion] = await db.select({ userId: companions.userId, id: companions.id })
    .from(companions)
    .where(eq(companions.id, booking.companionId))
    .limit(1)

  if (companion?.userId !== userId) throw new Error('Forbidden')
  if (booking.status !== 'PENDING_ACCEPTANCE') throw new Error('Booking cannot be accepted in current state')

  // Reject if the acceptance window has already elapsed.
  if (booking.requestExpiresAt && new Date() > booking.requestExpiresAt) {
    await db.update(bookings)
      .set({ status: 'EXPIRED', updatedAt: new Date() })
      .where(eq(bookings.id, bookingId))
    await db.insert(notifications).values({
      userId: booking.clientId,
      type: 'PAYMENT_EXPIRED',
      title: 'Request Expired',
      body: 'This booking request expired before it could be accepted.',
      data: { bookingId: booking.id },
    })
    throw new Error('This request has expired and can no longer be accepted')
  }

  const paymentExpiresAt = new Date(Date.now() + PAYMENT_WINDOW_MS)

  const [updated] = await db.update(bookings)
    .set({
      status: 'AWAITING_PAYMENT',
      acceptedAt: new Date(),
      paymentExpiresAt,
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, bookingId))
    .returning()

  // Update companion acceptance rate
  await recalculateCompanionStats(companion.id)

  await db.insert(notifications).values({
    userId: booking.clientId,
    type: 'BOOKING_ACCEPTED',
    title: 'Booking Accepted!',
    body: 'Your booking request has been accepted. Complete payment within 30 minutes to confirm your booking.',
    data: { bookingId: booking.id, paymentExpiresAt: paymentExpiresAt.toISOString() },
  })

  return updated
}

// Step 2b: Companion rejects → REJECTED
export async function rejectBooking(bookingId, reason) {
  const userId = await getUser()

  const [booking] = await db.select()
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1)

  if (!booking) throw new Error('Booking not found')

  const [companion] = await db.select({ userId: companions.userId, id: companions.id })
    .from(companions)
    .where(eq(companions.id, booking.companionId))
    .limit(1)

  if (companion?.userId !== userId) throw new Error('Forbidden')
  if (booking.status !== 'PENDING_ACCEPTANCE') throw new Error('Booking cannot be rejected in current state')

  const [updated] = await db.update(bookings)
    .set({
      status: 'REJECTED',
      rejectedAt: new Date(),
      cancelReason: reason || 'Declined by companion',
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, bookingId))
    .returning()

  await recalculateCompanionStats(companion.id)

  await db.insert(notifications).values({
    userId: booking.clientId,
    type: 'BOOKING_DECLINED',
    title: 'Booking Declined',
    body: reason || 'Your booking request was declined by the companion.',
    data: { bookingId: booking.id },
  })

  return updated
}

// Step 4: User pays → CONFIRMED
export async function confirmPayment(bookingId) {
  const userId = await getUser()

  const [booking] = await db.select()
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1)

  if (!booking) throw new Error('Booking not found')
  if (booking.clientId !== userId) throw new Error('Forbidden')
  if (booking.status !== 'AWAITING_PAYMENT') throw new Error('Booking is not awaiting payment')

  // Check if payment window expired
  if (booking.paymentExpiresAt && new Date() > booking.paymentExpiresAt) {
    await db.update(bookings)
      .set({ status: 'EXPIRED', paymentStatus: 'EXPIRED', updatedAt: new Date() })
      .where(eq(bookings.id, bookingId))
    throw new Error('Payment window has expired')
  }

  const meetingCode = String(randomInt(100000, 999999))

  const [updated] = await db.update(bookings)
    .set({
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      paidAt: new Date(),
      meetingCode,
      codeGeneratedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, bookingId))
    .returning()

  // Create conversation for chat
  const [conversation] = await db.insert(conversations).values({
    bookingId: booking.id,
    lastMessageAt: new Date(),
  }).returning()

  const [companion] = await db.select({ userId: companions.userId })
    .from(companions)
    .where(eq(companions.id, booking.companionId))
    .limit(1)

  await db.insert(conversationParticipants).values([
    { conversationId: conversation.id, userId: booking.clientId },
    { conversationId: conversation.id, userId: companion.userId },
  ])

  await db.insert(notifications).values({
    userId: companion.userId,
    type: 'BOOKING_CONFIRMED',
    title: 'Booking Confirmed',
    body: 'Payment received. Your booking is confirmed!',
    data: { bookingId: booking.id },
  })

  return updated
}

// Step 5: Check and expire unpaid bookings
export async function expireUnpaidBookings() {
  const now = new Date()

  const expired = await db.update(bookings)
    .set({
      status: 'EXPIRED',
      paymentStatus: 'EXPIRED',
      updatedAt: now,
    })
    .where(and(
      eq(bookings.status, 'AWAITING_PAYMENT'),
      lt(bookings.paymentExpiresAt, now),
    ))
    .returning()

  for (const booking of expired) {
    const [companion] = await db.select({ userId: companions.userId })
      .from(companions)
      .where(eq(companions.id, booking.companionId))
      .limit(1)

    await db.insert(notifications).values([
      {
        userId: booking.clientId,
        type: 'PAYMENT_EXPIRED',
        title: 'Booking Expired',
        body: 'Your payment window has expired. The booking has been cancelled.',
        data: { bookingId: booking.id },
      },
      {
        userId: companion.userId,
        type: 'PAYMENT_EXPIRED',
        title: 'Booking Expired',
        body: 'The client did not complete payment. The time slot has been released.',
        data: { bookingId: booking.id },
      },
    ])
  }

  return { expiredCount: expired.length }
}

// Step 5b: Expire pending requests the companion never responded to
export async function expirePendingRequests() {
  const now = new Date()

  const expired = await db.update(bookings)
    .set({
      status: 'EXPIRED',
      updatedAt: now,
    })
    .where(and(
      eq(bookings.status, 'PENDING_ACCEPTANCE'),
      lt(bookings.requestExpiresAt, now),
    ))
    .returning()

  for (const booking of expired) {
    const [companion] = await db.select({ userId: companions.userId })
      .from(companions)
      .where(eq(companions.id, booking.companionId))
      .limit(1)

    await db.insert(notifications).values([
      {
        userId: booking.clientId,
        type: 'PAYMENT_EXPIRED',
        title: 'Request Expired',
        body: 'Your booking request expired before the companion responded. Please try again.',
        data: { bookingId: booking.id },
      },
      {
        userId: companion?.userId,
        type: 'PAYMENT_EXPIRED',
        title: 'Request Expired',
        body: 'You did not respond to a booking request in time, so it has expired.',
        data: { bookingId: booking.id },
      },
    ].filter(n => n.userId))
  }

  return { expiredCount: expired.length }
}

// Convenience: expire both stale pending requests and unpaid confirmations.
// Safe to call frequently; only touches rows past their deadline.
export async function expireStaleBookings() {
  const [requests, payments] = await Promise.all([
    expirePendingRequests(),
    expireUnpaidBookings(),
  ])
  return {
    expiredRequests: requests.expiredCount,
    expiredPayments: payments.expiredCount,
  }
}

// Companion cancels a confirmed booking
export async function companionCancelBooking(bookingId, reason) {
  const userId = await getUser()

  const [booking] = await db.select()
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1)

  if (!booking) throw new Error('Booking not found')

  const [companion] = await db.select({ userId: companions.userId, id: companions.id })
    .from(companions)
    .where(eq(companions.id, booking.companionId))
    .limit(1)

  if (companion?.userId !== userId) throw new Error('Forbidden')
  if (!['AWAITING_PAYMENT', 'CONFIRMED', 'IN_PROGRESS'].includes(booking.status)) {
    throw new Error('Cannot cancel this booking')
  }

  const bookingDate = new Date(booking.date)
  const now = new Date()
  const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60)

  let isLateCancellation = false
  let trustPenalty = 0

  if (hoursUntilBooking < 6) {
    isLateCancellation = true
    trustPenalty = 15 // Major reduction
  } else if (hoursUntilBooking < 24) {
    isLateCancellation = true
    trustPenalty = 5 // Minor reduction
  }

  const [updated] = await db.update(bookings)
    .set({
      status: 'CANCELLED',
      cancelledBy: userId,
      cancelledAt: new Date(),
      cancelReason: reason || 'Cancelled by companion',
      isLateCancellation,
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, bookingId))
    .returning()

  // Update companion stats
  await db.update(companions)
    .set({
      cancellationCount: sql`"cancellationCount" + 1`,
      lateCancellations: isLateCancellation ? sql`"lateCancellations" + 1` : sql`"lateCancellations"`,
      trustScore: sql`GREATEST(0, "trustScore" - ${trustPenalty})`,
    })
    .where(eq(companions.id, companion.id))

  await recalculateCompanionStats(companion.id)

  // Check for suspension (5+ cancellations)
  const [comp] = await db.select({ cancellationCount: companions.cancellationCount })
    .from(companions)
    .where(eq(companions.id, companion.id))
    .limit(1)

  if (comp.cancellationCount >= 5) {
    await db.update(companions)
      .set({ isSuspended: true })
      .where(eq(companions.id, companion.id))
  }

  await db.insert(notifications).values({
    userId: booking.clientId,
    type: 'BOOKING_CANCELLED',
    title: 'Booking Cancelled',
    body: reason || 'Your booking has been cancelled by the companion.',
    data: { bookingId: booking.id },
  })

  return updated
}

// User cancels a booking
export async function userCancelBooking(bookingId, reason) {
  const userId = await getUser()

  const [booking] = await db.select()
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1)

  if (!booking) throw new Error('Booking not found')
  if (booking.clientId !== userId) throw new Error('Forbidden')
  if (!['PENDING_ACCEPTANCE', 'AWAITING_PAYMENT', 'CONFIRMED', 'IN_PROGRESS'].includes(booking.status)) {
    throw new Error('Cannot cancel this booking')
  }

  const bookingDate = new Date(booking.date)
  const now = new Date()
  const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60)

  let trustPenalty = 0
  if (booking.status === 'CONFIRMED') {
    if (hoursUntilBooking < 6) trustPenalty = 10
    else if (hoursUntilBooking < 24) trustPenalty = 3
  }

  const [updated] = await db.update(bookings)
    .set({
      status: 'CANCELLED',
      cancelledBy: userId,
      cancelledAt: new Date(),
      cancelReason: reason || 'Cancelled by user',
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, bookingId))
    .returning()

  // Update user trust
  await db.update(users)
    .set({
      cancellationCount: sql`"cancellationCount" + 1`,
      trustScore: sql`GREATEST(0, "trustScore" - ${trustPenalty})`,
    })
    .where(eq(users.id, userId))

  const [companion] = await db.select({ userId: companions.userId })
    .from(companions)
    .where(eq(companions.id, booking.companionId))
    .limit(1)

  await db.insert(notifications).values({
    userId: companion.userId,
    type: 'BOOKING_CANCELLED',
    title: 'Booking Cancelled',
    body: reason || 'The client has cancelled the booking.',
    data: { bookingId: booking.id },
  })

  return updated
}

// Complete a booking
export async function completeBooking(bookingId) {
  const userId = await getUser()

  const [booking] = await db.select()
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1)

  if (!booking) throw new Error('Booking not found')

  const [companion] = await db.select({ userId: companions.userId, id: companions.id })
    .from(companions)
    .where(eq(companions.id, booking.companionId))
    .limit(1)

  if (companion?.userId !== userId) throw new Error('Forbidden')
  if (booking.status !== 'IN_PROGRESS') throw new Error('Booking must be in progress to complete')
  if (!booking.codeVerified) throw new Error('Meeting must be verified before completing')

  const [updated] = await db.update(bookings)
    .set({ status: 'COMPLETED', updatedAt: new Date() })
    .where(eq(bookings.id, bookingId))
    .returning()

  // Update stats
  await db.update(companions)
    .set({
      completedBookings: sql`"completedBookings" + 1`,
      totalBookings: sql`"totalBookings" + 1`,
      trustScore: sql`LEAST(100, "trustScore" + 1)`,
    })
    .where(eq(companions.id, companion.id))

  await db.update(users)
    .set({
      completedBookings: sql`"completedBookings" + 1`,
      trustScore: sql`LEAST(100, "trustScore" + 1)`,
    })
    .where(eq(users.id, booking.clientId))

  await recalculateCompanionStats(companion.id)

  await db.insert(notifications).values({
    userId: booking.clientId,
    type: 'BOOKING_COMPLETED',
    title: 'Booking Completed',
    body: 'Your experience is complete! Leave a review.',
    data: { bookingId: booking.id },
  })

  return updated
}

// Auto-complete a booking when its session time has elapsed.
// Callable by either participant (client or companion) and is idempotent —
// the UI triggers this when the live countdown reaches zero so the active
// banner doesn't linger after the date is over.
export async function autoCompleteBooking(bookingId) {
  const userId = await getUser()

  const [booking] = await db.select()
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1)

  if (!booking) throw new Error('Booking not found')
  if (booking.status === 'COMPLETED') return booking
  if (booking.status !== 'IN_PROGRESS') throw new Error('Booking is not in progress')

  const [companion] = await db.select({ userId: companions.userId, id: companions.id })
    .from(companions)
    .where(eq(companions.id, booking.companionId))
    .limit(1)

  // Only the client or the companion of this booking may complete it.
  if (booking.clientId !== userId && companion?.userId !== userId) {
    throw new Error('Forbidden')
  }

  // Conditional update guards against double-completion from both sides.
  const [updated] = await db.update(bookings)
    .set({ status: 'COMPLETED', updatedAt: new Date() })
    .where(and(eq(bookings.id, bookingId), eq(bookings.status, 'IN_PROGRESS')))
    .returning()

  if (!updated) {
    const [current] = await db.select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1)
    return current
  }

  await db.update(companions)
    .set({
      completedBookings: sql`"completedBookings" + 1`,
      totalBookings: sql`"totalBookings" + 1`,
      trustScore: sql`LEAST(100, "trustScore" + 1)`,
    })
    .where(eq(companions.id, companion.id))

  await db.update(users)
    .set({
      completedBookings: sql`"completedBookings" + 1`,
      trustScore: sql`LEAST(100, "trustScore" + 1)`,
    })
    .where(eq(users.id, booking.clientId))

  await recalculateCompanionStats(companion.id)

  await db.insert(notifications).values({
    userId: booking.clientId,
    type: 'BOOKING_COMPLETED',
    title: 'Booking Completed',
    body: 'Your experience is complete! Leave a review.',
    data: { bookingId: booking.id },
  })

  return updated
}

// Fetch bookings for user
export async function getMyBookings(input) {
  const userId = await getUser()

  // Opportunistically expire any stale requests/payments before reading.
  await expireStaleBookings()

  const schema = z.object({
    status: z.enum(['PENDING_ACCEPTANCE', 'REJECTED', 'AWAITING_PAYMENT', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED']).optional(),
  }).optional()

  const data = schema.parse(input)

  let conditions = eq(bookings.clientId, userId)
  if (data?.status) {
    conditions = and(conditions, eq(bookings.status, data.status))
  }

  const rows = await db.select()
    .from(bookings)
    .where(conditions)
    .orderBy(desc(bookings.createdAt))

  const results = await Promise.all(rows.map(async (booking) => {
    const [companion] = await db.select()
      .from(companions)
      .where(eq(companions.id, booking.companionId))
      .limit(1)

    const [companionUser] = companion ? await db.select({ name: users.name, image: users.image })
      .from(users)
      .where(eq(users.id, companion.userId))
      .limit(1) : [null]

    return {
      ...booking,
      companion: companion ? { ...companion, user: companionUser } : null,
    }
  }))

  return results
}

// Fetch bookings for companion dashboard
export async function getCompanionBookings(input) {
  const userId = await getUser()

  // Opportunistically expire any stale requests/payments before reading.
  await expireStaleBookings()

  const [companion] = await db.select({ id: companions.id })
    .from(companions)
    .where(eq(companions.userId, userId))
    .limit(1)

  if (!companion) throw new Error('Not a companion')

  const schema = z.object({
    status: z.enum(['PENDING_ACCEPTANCE', 'REJECTED', 'AWAITING_PAYMENT', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'EXPIRED']).optional(),
  }).optional()

  const data = schema.parse(input)

  let conditions = eq(bookings.companionId, companion.id)
  if (data?.status) {
    conditions = and(conditions, eq(bookings.status, data.status))
  }

  const rows = await db.select()
    .from(bookings)
    .where(conditions)
    .orderBy(desc(bookings.createdAt))

  const results = await Promise.all(rows.map(async (booking) => {
    const [client] = await db.select({ id: users.id, name: users.name, image: users.image, trustScore: users.trustScore })
      .from(users)
      .where(eq(users.id, booking.clientId))
      .limit(1)

    return { ...booking, client }
  }))

  return results
}

// Get companion dashboard stats
export async function getCompanionDashboardStats() {
  const userId = await getUser()

  // Opportunistically expire any stale requests/payments before reading.
  await expireStaleBookings()

  const [companion] = await db.select()
    .from(companions)
    .where(eq(companions.userId, userId))
    .limit(1)

  if (!companion) throw new Error('Not a companion')

  const [pendingCount] = await db.select({ count: count() })
    .from(bookings)
    .where(and(eq(bookings.companionId, companion.id), eq(bookings.status, 'PENDING_ACCEPTANCE')))

  const [confirmedCount] = await db.select({ count: count() })
    .from(bookings)
    .where(and(eq(bookings.companionId, companion.id), inArray(bookings.status, ['CONFIRMED', 'IN_PROGRESS'])))

  const [monthEarnings] = await db.select({ total: sql`COALESCE(SUM("totalAmount"), 0)` })
    .from(bookings)
    .where(and(
      eq(bookings.companionId, companion.id),
      eq(bookings.status, 'COMPLETED'),
      gte(bookings.createdAt, new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
    ))

  return {
    companion,
    pendingRequests: pendingCount?.count ?? 0,
    upcomingBookings: confirmedCount?.count ?? 0,
    monthlyEarnings: Number(monthEarnings?.total ?? 0),
    trustScore: companion.trustScore,
    acceptanceRate: companion.acceptanceRate,
    cancellationRate: companion.cancellationRate,
    averageRating: companion.averageRating,
    totalReviews: companion.totalReviews,
    completedBookings: companion.completedBookings,
  }
}

// Get user trust stats
export async function getUserTrustStats() {
  const userId = await getUser()

  const [user] = await db.select({
    trustScore: users.trustScore,
    cancellationCount: users.cancellationCount,
    noShowCount: users.noShowCount,
    completedBookings: users.completedBookings,
  })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) throw new Error('User not found')

  const total = user.completedBookings + user.cancellationCount
  const cancellationRate = total > 0 ? (user.cancellationCount / total * 100) : 0

  return {
    trustScore: user.trustScore,
    cancellationCount: user.cancellationCount,
    noShowCount: user.noShowCount,
    completedBookings: user.completedBookings,
    cancellationRate: Math.round(cancellationRate * 10) / 10,
  }
}

// Get meeting code for user (only the booking client can see it)
export async function getMeetingCode(bookingId) {
  const userId = await getUser()

  const [booking] = await db.select({
    id: bookings.id,
    clientId: bookings.clientId,
    status: bookings.status,
    meetingCode: bookings.meetingCode,
    codeGeneratedAt: bookings.codeGeneratedAt,
    codeVerified: bookings.codeVerified,
    verifiedAt: bookings.verifiedAt,
  })
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1)

  if (!booking) throw new Error('Booking not found')
  if (booking.clientId !== userId) throw new Error('Forbidden')

  return {
    meetingCode: booking.meetingCode,
    codeGeneratedAt: booking.codeGeneratedAt,
    codeVerified: booking.codeVerified,
    verifiedAt: booking.verifiedAt,
  }
}

// Companion verifies the meeting code
export async function verifyMeetingCode(bookingId, code) {
  const userId = await getUser()

  const [booking] = await db.select()
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1)

  if (!booking) throw new Error('Booking not found')

  const [companion] = await db.select({ userId: companions.userId })
    .from(companions)
    .where(eq(companions.id, booking.companionId))
    .limit(1)

  if (companion?.userId !== userId) throw new Error('Forbidden')
  if (booking.status !== 'CONFIRMED') throw new Error('Booking is not in a verifiable state')
  if (booking.codeVerified) throw new Error('Code has already been verified')
  if (booking.verificationAttempts >= 5) throw new Error('Maximum verification attempts exceeded. Please contact support.')

  if (booking.meetingCode !== code) {
    await db.update(bookings)
      .set({
        verificationAttempts: sql`"verificationAttempts" + 1`,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))

    const attempts = booking.verificationAttempts + 1
    if (attempts >= 5) {
      throw new Error('Maximum verification attempts reached. Verification is temporarily disabled.')
    }
    throw new Error('Invalid meeting code. Please try again.')
  }

  const [updated] = await db.update(bookings)
    .set({
      codeVerified: true,
      verifiedAt: new Date(),
      status: 'IN_PROGRESS',
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, bookingId))
    .returning()

  await db.insert(notifications).values({
    userId: booking.clientId,
    type: 'BOOKING_CONFIRMED',
    title: 'Meetup Verified!',
    body: 'Your companion has verified the meeting code. Your booking is now in progress.',
    data: { bookingId: booking.id },
  })

  return updated
}

// Internal helper
async function recalculateCompanionStats(companionId) {
  const [totalReqs] = await db.select({ count: count() })
    .from(bookings)
    .where(eq(bookings.companionId, companionId))

  const [accepted] = await db.select({ count: count() })
    .from(bookings)
    .where(and(
      eq(bookings.companionId, companionId),
      inArray(bookings.status, ['AWAITING_PAYMENT', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED']),
    ))

  const [cancelled] = await db.select({ count: count() })
    .from(bookings)
    .where(and(
      eq(bookings.companionId, companionId),
      eq(bookings.status, 'CANCELLED'),
      eq(bookings.cancelledBy, sql`(SELECT "userId" FROM companions WHERE id = ${companionId})`),
    ))

  const total = totalReqs?.count ?? 0
  const acceptedCount = accepted?.count ?? 0
  const cancelledCount = cancelled?.count ?? 0

  const acceptanceRate = total > 0 ? (acceptedCount / total * 100) : 100
  const cancellationRate = total > 0 ? (cancelledCount / total * 100) : 0

  await db.update(companions)
    .set({
      acceptanceRate: Math.round(acceptanceRate * 10) / 10,
      cancellationRate: Math.round(cancellationRate * 10) / 10,
    })
    .where(eq(companions.id, companionId))
}
