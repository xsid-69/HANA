import 'dotenv/config'
import pg from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import { count, eq, inArray, sql } from 'drizzle-orm'
import { bookings, companions, users } from './schema.js'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const db = drizzle(pool)
const SEED_EMAIL = 'analytics.history@demo.hana.app'
const SEED_VERSION = 'history-v1'
const TERMINAL_NEGATIVE = ['CANCELLED', 'REJECTED', 'EXPIRED']
const ACTIVITIES = ['Coffee & conversation', 'City walk', 'Local food trail', 'Museum visit', 'Shopping companion', 'Cultural tour']
const DIVYA_PATTERN = [
  ['COMPLETED', 'COMPLETED'],
  ['CANCELLED', 'REJECTED', 'CANCELLED'],
  ['COMPLETED', 'COMPLETED', 'COMPLETED'],
  ['EXPIRED', 'CANCELLED'],
  ['COMPLETED'],
  ['REJECTED', 'CANCELLED', 'EXPIRED'],
  ['COMPLETED', 'COMPLETED', 'COMPLETED'],
]

function hashSeed(value) {
  let hash = 2166136261
  for (const char of value) {
    hash ^= char.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function createRandom(seed) {
  let value = seed
  return () => {
    value += 0x6D2B79F5
    let result = value
    result = Math.imul(result ^ (result >>> 15), result | 1)
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61)
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296
  }
}
function utcDay(daysAgo) {
  const date = new Date()
  date.setUTCHours(0, 0, 0, 0)
  date.setUTCDate(date.getUTCDate() - daysAgo)
  return date
}

function statusesFor(companion, dayIndex, random) {
  if (companion.displayName.toLowerCase().includes('divya')) return DIVYA_PATTERN[dayIndex]
  if (dayIndex === 0) return ['COMPLETED']
  if (dayIndex === 1) return ['CANCELLED']

  const countForDay = 1 + Math.floor(random() * 3)
  const weighted = ['COMPLETED', 'COMPLETED', 'COMPLETED', 'CANCELLED', 'REJECTED', 'EXPIRED']
  return Array.from({ length: countForDay }, () => weighted[Math.floor(random() * weighted.length)])
}

function timeLabel(hour, minute = 0) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function bookingValues({ companion, clientId, date, dayIndex, slotIndex, status, random }) {
  const durationOptions = [1, 2, 3]
  const durationHours = durationOptions[Math.floor(random() * durationOptions.length)]
  const startHour = 9 + Math.floor(random() * 8)
  const endMinutes = startHour * 60 + Math.round(durationHours * 60)
  const hourlyRate = companion.hourlyRate
  const subtotal = Math.round(hourlyRate * durationHours)
  const serviceFee = Math.round(subtotal * 0.1)
  const totalAmount = subtotal + serviceFee
  const deposit = Math.round(totalAmount * 0.2)
  const createdAt = new Date(date)
  createdAt.setUTCHours(Math.max(1, startHour - 3), 0, 0, 0)
  const eventAt = new Date(date)
  eventAt.setUTCHours(startHour, 0, 0, 0)
  const id = `${SEED_VERSION}:${companion.id}:${date.toISOString().slice(0, 10)}:${slotIndex}`
  const isCompleted = status === 'COMPLETED'
  const isCancelled = status === 'CANCELLED'
  const isRejected = status === 'REJECTED'
  const isExpired = status === 'EXPIRED'

  return {
    id,
    clientId,
    companionId: companion.id,
    date,
    startTime: timeLabel(startHour),
    endTime: timeLabel(Math.floor(endMinutes / 60), endMinutes % 60),
    durationHours,
    activityType: ACTIVITIES[(dayIndex + slotIndex + Math.floor(random() * ACTIVITIES.length)) % ACTIVITIES.length],
    notes: `Generated analytics history (${SEED_VERSION})`,
    hourlyRate,
    subtotal,
    serviceFee,
    deposit,
    totalAmount,
    status,
    paymentStatus: isCompleted || isCancelled ? 'PAID' : isExpired ? 'EXPIRED' : 'PENDING',
    acceptedAt: isCompleted || isCancelled ? createdAt : null,
    rejectedAt: isRejected ? eventAt : null,
    cancelledBy: isCancelled ? clientId : null,
    cancelledAt: isCancelled ? eventAt : null,
    cancelReason: isCancelled ? 'Plans changed before the experience' : null,
    refundedAt: isCancelled ? eventAt : null,
    paidAt: isCompleted || isCancelled ? createdAt : null,
    requestExpiresAt: isExpired ? eventAt : null,
    meetingCode: isCompleted ? `H${hashSeed(id).toString().slice(-5).padStart(5, '0')}` : null,
    codeGeneratedAt: isCompleted ? createdAt : null,
    codeVerified: isCompleted,
    verifiedAt: isCompleted ? eventAt : null,
    createdAt,
    updatedAt: eventAt,
  }
}
async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')

  await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(721904)`)

    const [client] = await tx.insert(users).values({
      email: SEED_EMAIL,
      name: 'Hana Analytics Client',
      role: 'CLIENT',
      city: 'Mumbai',
      onboarded: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).onConflictDoUpdate({
      target: users.email,
      set: { name: 'Hana Analytics Client', role: 'CLIENT', onboarded: true, updatedAt: new Date() },
    }).returning()

    const allCompanions = await tx.select().from(companions).where(eq(companions.isActive, true))
    if (!allCompanions.length) throw new Error('No active companions found')

    let inserted = 0
    for (const companion of allCompanions) {
      const random = createRandom(hashSeed(`${SEED_VERSION}:${companion.id}`))
      for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
        const date = utcDay(6 - dayIndex)
        const statuses = statusesFor(companion, dayIndex, random)
        for (let slotIndex = 0; slotIndex < statuses.length; slotIndex += 1) {
          const values = bookingValues({ companion, clientId: client.id, date, dayIndex, slotIndex, status: statuses[slotIndex], random })
          const { id, ...updates } = values
          await tx.insert(bookings).values(values).onConflictDoUpdate({ target: bookings.id, set: updates })
          inserted += 1
        }
      }

      const [stats] = await tx.select({
        total: count(),
        completed: sql`COUNT(*) FILTER (WHERE ${bookings.status} = 'COMPLETED')`,
        cancelled: sql`COUNT(*) FILTER (WHERE ${bookings.status} = 'CANCELLED')`,
        accepted: sql`COUNT(*) FILTER (WHERE ${bookings.status} IN ('COMPLETED', 'CANCELLED', 'CONFIRMED', 'IN_PROGRESS'))`,
      }).from(bookings).where(eq(bookings.companionId, companion.id))

      const total = Number(stats?.total ?? 0)
      const completed = Number(stats?.completed ?? 0)
      const cancelled = Number(stats?.cancelled ?? 0)
      const accepted = Number(stats?.accepted ?? 0)
      await tx.update(companions).set({
        totalBookings: total,
        totalRequests: total,
        completedBookings: completed,
        cancellationCount: cancelled,
        cancellationRate: total ? Number(((cancelled / total) * 100).toFixed(1)) : 0,
        acceptanceRate: total ? Number(((accepted / total) * 100).toFixed(1)) : 0,
        updatedAt: new Date(),
      }).where(eq(companions.id, companion.id))
    }

    const topRateIds = [...allCompanions]
      .sort((a, b) => b.hourlyRate - a.hourlyRate || b.averageRating - a.averageRating)
      .slice(0, 5)
      .map((companion) => companion.id)
    await tx.update(companions).set({ isFeatured: false })
    await tx.update(companions).set({ isFeatured: true }).where(inArray(companions.id, topRateIds))

    console.log(`Seeded ${inserted} seven-day history rows across ${allCompanions.length} companions.`)
    console.log(`Divya received an alternating peak/dip pattern. Featured IDs: ${topRateIds.join(', ')}`)
  })
}

main()
  .catch((error) => {
    console.error('History seed failed:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await pool.end()
  })
