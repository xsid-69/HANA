'use server'

import { db } from '@/db'
import { bookings, bookingExtensions, companions, users, notifications } from '@/db/schema'
import { eq, and, inArray, gte, lte, desc, count, sql } from 'drizzle-orm'
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

function parseTimeStr(timeStr) {
  if (!timeStr) return { hours: 0, minutes: 0 }
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i)
  if (!match) return { hours: 0, minutes: 0 }
  let hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const period = match[3]
  if (period) {
    if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12
    if (period.toUpperCase() === 'AM' && hours === 12) hours = 0
  }
  return { hours, minutes }
}

function formatTime(hours, minutes) {
  const period = hours >= 12 ? 'PM' : 'AM'
  const h = hours % 12 || 12
  return `${h}:${String(minutes).padStart(2, '0')} ${period}`
}

function addMinutesToTime(timeStr, mins) {
  const { hours, minutes } = parseTimeStr(timeStr)
  const totalMinutes = hours * 60 + minutes + mins
  const newH = Math.floor(totalMinutes / 60) % 24
  const newM = totalMinutes % 60
  return formatTime(newH, newM)
}

function getMinutesBetween(startTime, endTime) {
  const s = parseTimeStr(startTime)
  const e = parseTimeStr(endTime)
  return (e.hours * 60 + e.minutes) - (s.hours * 60 + s.minutes)
}

export async function requestExtension(input) {
  const userId = await getUser()

  const schema = z.object({
    bookingId: z.string(),
    extraMinutes: z.number().refine(v => [30, 60, 120].includes(v)),
  })

  const data = schema.parse(input)

  const [booking] = await db.select()
    .from(bookings)
    .where(eq(bookings.id, data.bookingId))
    .limit(1)

  if (!booking) throw new Error('Booking not found')
  if (booking.clientId !== userId) throw new Error('Forbidden')
  if (booking.status !== 'IN_PROGRESS') throw new Error('Booking must be in progress')
  if (!booking.codeVerified) throw new Error('Meeting must be verified first')

  const [existingPending] = await db.select({ id: bookingExtensions.id })
    .from(bookingExtensions)
    .where(and(
      eq(bookingExtensions.bookingId, data.bookingId),
      eq(bookingExtensions.status, 'PENDING')
    ))
    .limit(1)

  if (existingPending) throw new Error('An extension request is already pending')

  const additionalAmount = Math.round((booking.hourlyRate / 60) * data.extraMinutes)

  const [extension] = await db.insert(bookingExtensions).values({
    bookingId: data.bookingId,
    requestedBy: userId,
    extraMinutes: data.extraMinutes,
    additionalAmount,
    status: 'PENDING',
    paymentStatus: 'PENDING',
  }).returning()

  const [companion] = await db.select({ userId: companions.userId })
    .from(companions)
    .where(eq(companions.id, booking.companionId))
    .limit(1)

  const [client] = await db.select({ name: users.name })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  const durationLabel = data.extraMinutes >= 60
    ? `${data.extraMinutes / 60} hour${data.extraMinutes > 60 ? 's' : ''}`
    : `${data.extraMinutes} minutes`

  await db.insert(notifications).values({
    userId: companion.userId,
    type: 'EXTENSION_REQUESTED',
    title: 'Extension Requested',
    body: `${client.name} wants to extend this booking by ${durationLabel}.`,
    data: {
      bookingId: booking.id,
      extensionId: extension.id,
      extraMinutes: data.extraMinutes,
      additionalAmount,
      newEndTime: addMinutesToTime(booking.endTime, data.extraMinutes),
    },
  })

  return extension
}

export async function approveExtension(extensionId) {
  const userId = await getUser()

  const [extension] = await db.select()
    .from(bookingExtensions)
    .where(eq(bookingExtensions.id, extensionId))
    .limit(1)

  if (!extension) throw new Error('Extension not found')
  if (extension.status !== 'PENDING') throw new Error('Extension is not pending')

  const [booking] = await db.select()
    .from(bookings)
    .where(eq(bookings.id, extension.bookingId))
    .limit(1)

  if (!booking) throw new Error('Booking not found')

  const [companion] = await db.select({ userId: companions.userId, id: companions.id })
    .from(companions)
    .where(eq(companions.id, booking.companionId))
    .limit(1)

  if (companion?.userId !== userId) throw new Error('Forbidden')

  const newEndTime = addMinutesToTime(booking.endTime, extension.extraMinutes)

  const nextBookings = await db.select({ startTime: bookings.startTime })
    .from(bookings)
    .where(and(
      eq(bookings.companionId, booking.companionId),
      eq(bookings.date, booking.date),
      inArray(bookings.status, ['CONFIRMED', 'IN_PROGRESS']),
      gte(bookings.startTime, booking.endTime),
    ))
    .orderBy(bookings.startTime)
    .limit(1)

  if (nextBookings.length > 0) {
    const freeMinutes = getMinutesBetween(booking.endTime, nextBookings[0].startTime)
    if (extension.extraMinutes > freeMinutes) {
      throw new Error('You have another booking scheduled. Not enough free time for this extension.')
    }
  }

  const [updated] = await db.update(bookingExtensions)
    .set({
      status: 'APPROVED',
      approvedBy: userId,
      approvedAt: new Date(),
    })
    .where(eq(bookingExtensions.id, extensionId))
    .returning()

  await db.insert(notifications).values({
    userId: booking.clientId,
    type: 'EXTENSION_PAYMENT_REQUIRED',
    title: 'Extension Approved',
    body: 'Complete payment to continue your booking.',
    data: {
      bookingId: booking.id,
      extensionId: extension.id,
      additionalAmount: extension.additionalAmount,
      extraMinutes: extension.extraMinutes,
      newEndTime,
    },
  })

  return updated
}

export async function declineExtension(extensionId) {
  const userId = await getUser()

  const [extension] = await db.select()
    .from(bookingExtensions)
    .where(eq(bookingExtensions.id, extensionId))
    .limit(1)

  if (!extension) throw new Error('Extension not found')
  if (extension.status !== 'PENDING') throw new Error('Extension is not pending')

  const [booking] = await db.select()
    .from(bookings)
    .where(eq(bookings.id, extension.bookingId))
    .limit(1)

  const [companion] = await db.select({ userId: companions.userId })
    .from(companions)
    .where(eq(companions.id, booking.companionId))
    .limit(1)

  if (companion?.userId !== userId) throw new Error('Forbidden')

  const [updated] = await db.update(bookingExtensions)
    .set({ status: 'DECLINED' })
    .where(eq(bookingExtensions.id, extensionId))
    .returning()

  await db.insert(notifications).values({
    userId: booking.clientId,
    type: 'EXTENSION_DECLINED',
    title: 'Extension Declined',
    body: 'Extension request was declined. Your booking continues with the original end time.',
    data: { bookingId: booking.id, extensionId: extension.id },
  })

  return updated
}

export async function payExtension(extensionId) {
  const userId = await getUser()

  const [extension] = await db.select()
    .from(bookingExtensions)
    .where(eq(bookingExtensions.id, extensionId))
    .limit(1)

  if (!extension) throw new Error('Extension not found')
  if (extension.status !== 'APPROVED') throw new Error('Extension must be approved first')

  const [booking] = await db.select()
    .from(bookings)
    .where(eq(bookings.id, extension.bookingId))
    .limit(1)

  if (!booking) throw new Error('Booking not found')
  if (booking.clientId !== userId) throw new Error('Forbidden')

  const newEndTime = addMinutesToTime(booking.endTime, extension.extraMinutes)
  const newDurationHours = booking.durationHours + (extension.extraMinutes / 60)
  const newTotal = booking.totalAmount + extension.additionalAmount

  await db.update(bookingExtensions)
    .set({
      status: 'PAID',
      paymentStatus: 'PAID',
      paidAt: new Date(),
    })
    .where(eq(bookingExtensions.id, extensionId))

  await db.update(bookings)
    .set({
      endTime: newEndTime,
      durationHours: newDurationHours,
      totalAmount: newTotal,
      updatedAt: new Date(),
    })
    .where(eq(bookings.id, booking.id))

  const [companion] = await db.select({ userId: companions.userId })
    .from(companions)
    .where(eq(companions.id, booking.companionId))
    .limit(1)

  await db.insert(notifications).values([
    {
      userId: booking.clientId,
      type: 'EXTENSION_COMPLETED',
      title: 'Booking Extended!',
      body: `Your booking has been extended. New end time: ${newEndTime}`,
      data: { bookingId: booking.id, extensionId, newEndTime, newTotal },
    },
    {
      userId: companion.userId,
      type: 'EXTENSION_COMPLETED',
      title: 'Booking Extended!',
      body: `Booking extended by ${extension.extraMinutes} minutes. Additional earnings: ₹${extension.additionalAmount}`,
      data: { bookingId: booking.id, extensionId, newEndTime, additionalAmount: extension.additionalAmount },
    },
  ])

  return { newEndTime, newDurationHours, newTotal }
}

export async function getExtensionOptions(bookingId) {
  const userId = await getUser()

  const [booking] = await db.select()
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1)

  if (!booking) throw new Error('Booking not found')
  if (booking.status !== 'IN_PROGRESS') throw new Error('Booking must be in progress')
  if (!booking.codeVerified) throw new Error('Meeting must be verified')

  const nextBookings = await db.select({ startTime: bookings.startTime })
    .from(bookings)
    .where(and(
      eq(bookings.companionId, booking.companionId),
      eq(bookings.date, booking.date),
      inArray(bookings.status, ['CONFIRMED', 'IN_PROGRESS']),
      gte(bookings.startTime, booking.endTime),
    ))
    .orderBy(bookings.startTime)
    .limit(1)

  let maxExtensionMinutes = 120
  if (nextBookings.length > 0) {
    maxExtensionMinutes = Math.min(120, getMinutesBetween(booking.endTime, nextBookings[0].startTime))
  }

  const options = [30, 60, 120]
    .filter(m => m <= maxExtensionMinutes)
    .map(minutes => ({
      minutes,
      label: minutes >= 60 ? `+${minutes / 60} Hour${minutes > 60 ? 's' : ''}` : `+${minutes} Minutes`,
      amount: Math.round((booking.hourlyRate / 60) * minutes),
    }))

  return {
    options,
    currentEndTime: booking.endTime,
    hourlyRate: booking.hourlyRate,
    maxExtensionMinutes,
  }
}

export async function getPendingExtension(bookingId) {
  const userId = await getUser()

  const [extension] = await db.select()
    .from(bookingExtensions)
    .where(and(
      eq(bookingExtensions.bookingId, bookingId),
      inArray(bookingExtensions.status, ['PENDING', 'APPROVED']),
    ))
    .orderBy(desc(bookingExtensions.createdAt))
    .limit(1)

  if (!extension) return null

  const [booking] = await db.select({ endTime: bookings.endTime })
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1)

  return {
    ...extension,
    newEndTime: addMinutesToTime(booking.endTime, extension.extraMinutes),
  }
}

export async function checkCompanionAvailability(bookingId) {
  const [booking] = await db.select()
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1)

  if (!booking) return { available: false, maxMinutes: 0 }

  const nextBookings = await db.select({ startTime: bookings.startTime })
    .from(bookings)
    .where(and(
      eq(bookings.companionId, booking.companionId),
      eq(bookings.date, booking.date),
      inArray(bookings.status, ['CONFIRMED', 'IN_PROGRESS']),
      gte(bookings.startTime, booking.endTime),
    ))
    .orderBy(bookings.startTime)
    .limit(1)

  if (nextBookings.length === 0) {
    return { available: true, maxMinutes: 120 }
  }

  const freeMinutes = getMinutesBetween(booking.endTime, nextBookings[0].startTime)
  return { available: freeMinutes >= 30, maxMinutes: Math.min(120, freeMinutes) }
}

export async function getExtensionAnalytics() {
  const userId = await getUser()

  const [companion] = await db.select({ id: companions.id })
    .from(companions)
    .where(eq(companions.userId, userId))
    .limit(1)

  if (!companion) throw new Error('Not a companion')

  const companionBookingIds = db.select({ id: bookings.id })
    .from(bookings)
    .where(eq(bookings.companionId, companion.id))

  const [totalExtensions] = await db.select({ count: count() })
    .from(bookingExtensions)
    .where(inArray(bookingExtensions.bookingId, companionBookingIds))

  const [paidExtensions] = await db.select({
    count: count(),
    revenue: sql`COALESCE(SUM("additionalAmount"), 0)`,
    avgMinutes: sql`COALESCE(AVG("extraMinutes"), 0)`,
  })
    .from(bookingExtensions)
    .where(and(
      inArray(bookingExtensions.bookingId, companionBookingIds),
      eq(bookingExtensions.status, 'PAID'),
    ))

  const [approvedCount] = await db.select({ count: count() })
    .from(bookingExtensions)
    .where(and(
      inArray(bookingExtensions.bookingId, companionBookingIds),
      inArray(bookingExtensions.status, ['APPROVED', 'PAID']),
    ))

  const totalRequested = totalExtensions?.count ?? 0
  const approvedTotal = approvedCount?.count ?? 0
  const acceptanceRate = totalRequested > 0 ? Math.round((approvedTotal / totalRequested) * 100) : 0

  const durationBreakdown = await db.select({
    extraMinutes: bookingExtensions.extraMinutes,
    count: count(),
  })
    .from(bookingExtensions)
    .where(and(
      inArray(bookingExtensions.bookingId, companionBookingIds),
      eq(bookingExtensions.status, 'PAID'),
    ))
    .groupBy(bookingExtensions.extraMinutes)
    .orderBy(desc(count()))

  const mostPopularDuration = durationBreakdown[0]?.extraMinutes ?? null

  return {
    totalExtensions: totalRequested,
    completedExtensions: paidExtensions?.count ?? 0,
    extensionRevenue: Number(paidExtensions?.revenue ?? 0),
    averageExtensionMinutes: Math.round(Number(paidExtensions?.avgMinutes ?? 0)),
    extensionAcceptanceRate: acceptanceRate,
    mostPopularDuration,
    durationBreakdown,
  }
}
