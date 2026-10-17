'use server'

import bcrypt from 'bcryptjs'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { and, desc, eq } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { auth } from '@/lib/auth'
import { db } from '@/db'
import { bookings, codeWords, companions, conversations, evidenceLog, users } from '@/db/schema'
import { encrypt } from '@/lib/encrypt'
import { verifyToken } from '@/lib/jwt'
import { redis } from '@/lib/upstash'
import { resend } from '@/lib/resend'
import { supabaseAdmin } from '@/lib/supabase-admin'

const BLOCKLIST = new Set([
  'hello', 'sorry', 'okay', 'thanks', 'please',
  'great', 'good', 'help', 'yes', 'no',
])
const CHANGE_INTERVAL_MS = 30 * 24 * 60 * 60 * 1000
const CACHE_TTL_SECONDS = 60 * 60
const SALT_ROUNDS = 12

async function getAuthenticatedUser() {
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

  const [user] = await db.select({
    id: users.id,
    email: users.email,
    name: users.name,
    image: users.image,
    role: users.role,
  }).from(users).where(eq(users.id, userId)).limit(1)

  if (!user) throw new Error('Unauthorized')
  return user
}
async function requireCompanionSelf(companionId) {
  const user = await getAuthenticatedUser()
  if (user.role !== 'COMPANION' || user.id !== companionId) {
    throw new Error('Forbidden')
  }
  return user
}

async function requireAdmin() {
  const user = await getAuthenticatedUser()
  if (user.role !== 'ADMIN') throw new Error('Forbidden')
  return user
}

function normalizeCodeWord(value) {
  return value.normalize('NFKC').trim().toLocaleLowerCase('en-US')
}

function createWordFingerprint(word) {
  const secret = process.env.ENCRYPTION_KEY || process.env.AUTH_SECRET
  if (!secret) throw new Error('ENCRYPTION_KEY or AUTH_SECRET must be configured')
  return createHmac('sha256', secret).update(word, 'utf8').digest('hex')
}

function fingerprintMatches(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string') return false
  const leftBuffer = Buffer.from(left, 'hex')
  const rightBuffer = Buffer.from(right, 'hex')
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}

function getMessageWords(content) {
  const normalized = content.normalize('NFKC').toLocaleLowerCase('en-US')
  return [...new Set(normalized.match(/[\p{L}\p{N}'’-]+/gu) || [])]
}

function getNextChangeDate(lastChangedAt) {
  return new Date(new Date(lastChangedAt).getTime() + CHANGE_INTERVAL_MS)
}

async function clearCachedHash(companionId) {
  try {
    await redis.del(`codeword:${companionId}`)
  } catch (error) {
    console.error('Failed to clear code-word cache', error)
  }
}

async function getWordRecord(companionId) {
  const cacheKey = `codeword:${companionId}`

  try {
    const cached = await redis.get(cacheKey)
    if (
      cached && typeof cached === 'object' &&
      typeof cached.wordHash === 'string' &&
      typeof cached.wordFingerprint === 'string'
    ) {
      return cached
    }
  } catch (error) {
    console.error('Failed to read code-word cache', error)
  }

  const [record] = await db.select({
    wordHash: codeWords.wordHash,
    wordFingerprint: codeWords.wordFingerprint,
  })
    .from(codeWords)
    .where(eq(codeWords.companionId, companionId))
    .limit(1)

  if (!record) return null

  try {
    await redis.set(cacheKey, record, { ex: CACHE_TTL_SECONDS })
  } catch (error) {
    console.error('Failed to write code-word cache', error)
  }

  return record
}

export async function setupCodeWord(companionId, plainTextWord) {
  try {
    await requireCompanionSelf(companionId)

    if (typeof plainTextWord !== 'string') {
      return { error: 'Enter a valid code word.' }
    }

    const normalizedWord = normalizeCodeWord(plainTextWord)
    if (normalizedWord.length < 5) {
      return { error: 'Code word must be at least 5 characters.' }
    }
    if (!/^[\p{L}\p{N}'’-]+$/u.test(normalizedWord)) {
      return { error: 'Code word must be one word without spaces.' }
    }
    if (BLOCKLIST.has(normalizedWord)) {
      return { error: 'Choose a less common word.' }
    }

    const [existing] = await db.select({ lastChangedAt: codeWords.lastChangedAt })
      .from(codeWords)
      .where(eq(codeWords.companionId, companionId))
      .limit(1)

    if (existing) {
      const nextChangeDate = getNextChangeDate(existing.lastChangedAt)
      if (nextChangeDate > new Date()) {
        return {
          error: `You can change your code word on ${nextChangeDate.toLocaleDateString('en-IN')}.`,
        }
      }
    }

    const wordHash = await bcrypt.hash(normalizedWord, SALT_ROUNDS)
    const wordFingerprint = createWordFingerprint(normalizedWord)
    const now = new Date()

    await db.insert(codeWords).values({
      companionId,
      wordHash,
      wordFingerprint,
      lastChangedAt: now,
    }).onConflictDoUpdate({
      target: codeWords.companionId,
      set: { wordHash, wordFingerprint, lastChangedAt: now },
    })

    await clearCachedHash(companionId)
    return { success: true }
  } catch (error) {
    console.error('Failed to set code word', error)
    return { error: error.message || 'Unable to set code word.' }
  }
}

export async function checkCodeWord(companionId, messageContent) {
  await requireCompanionSelf(companionId)

  if (typeof messageContent !== 'string' || !messageContent) {
    return { triggered: false }
  }

  const record = await getWordRecord(companionId)
  if (!record) return { triggered: false }

  const words = getMessageWords(messageContent)
  for (const word of words) {
    const candidateFingerprint = createWordFingerprint(word)
    if (fingerprintMatches(candidateFingerprint, record.wordFingerprint)) {
      return { triggered: true }
    }
  }

  return { triggered: false }
}
async function getAlertContext(companionId, bookingId) {
  const [booking] = await db.select().from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1)

  if (!booking || booking.status !== 'IN_PROGRESS') {
    throw new Error('Active booking not found')
  }

  const [companionProfile] = await db.select({
    id: companions.id,
    userId: companions.userId,
    displayName: companions.displayName,
  }).from(companions).where(and(
    eq(companions.id, booking.companionId),
    eq(companions.userId, companionId),
  )).limit(1)

  if (!companionProfile) throw new Error('Forbidden')

  const [companionUser] = await db.select({
    email: users.email,
    name: users.name,
    image: users.image,
  }).from(users).where(eq(users.id, companionId)).limit(1)

  const [client] = await db.select({
    id: users.id,
    name: users.name,
  }).from(users).where(eq(users.id, booking.clientId)).limit(1)

  const [conversation] = await db.select({ id: conversations.id })
    .from(conversations)
    .where(eq(conversations.bookingId, booking.id))
    .limit(1)

  if (!companionUser || !client || !conversation) {
    throw new Error('Booking safety details are incomplete')
  }

  return {
    booking,
    chatId: conversation.id,
    client,
    companion: {
      id: companionId,
      email: companionUser.email,
      image: companionUser.image,
      name: companionProfile.displayName || companionUser.name || 'Your companion',
    },
  }
}

function formatLocation(location) {
  if (!location) return 'Not available'
  return `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`
}

function formatBookingDate(booking) {
  const date = new Date(booking.date).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return `${date}, ${booking.startTime}–${booking.endTime}`
}

async function sendEmergencyEmail(context, location, timestamp) {
  const adminEmail = process.env.ADMIN_EMAIL?.trim()
  const bcc = adminEmail && adminEmail !== context.companion.email
    ? [adminEmail]
    : undefined

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'noreply@hana.app',
    to: [context.companion.email],
    bcc,
    subject: `⚠️ ${context.companion.name} may need help right now`,
    text: [
      `${context.companion.name} may need help right now.`,
      '',
      `Companion: ${context.companion.name}`,
      `Client: ${context.client.name || 'Unknown'}`,
      `Booking: ${formatBookingDate(context.booking)}`,
      `Activity: ${context.booking.activityType}`,
      `Last known location: ${formatLocation(location)}`,
      `Timestamp: ${timestamp.toLocaleString('en-IN')}`,
      '',
      'Please call her immediately.',
    ].join('\n'),
  })
}

async function broadcastAdminAlert(payload) {
  const channel = supabaseAdmin.channel('admin:alerts')

  try {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Admin alert channel timed out')), 5000)
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          clearTimeout(timeout)
          resolve()
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          clearTimeout(timeout)
          reject(new Error(`Admin alert channel failed: ${status}`))
        }
      })
    })

    const result = await channel.send({
      type: 'broadcast',
      event: 'codeword_triggered',
      payload,
    })

    if (result !== 'ok') throw new Error('Admin alert broadcast failed')
  } finally {
    await supabaseAdmin.removeChannel(channel)
  }
}

export async function triggerSilentAlert(companionId, bookingId, location) {
  await requireCompanionSelf(companionId)

  const parsedLocation = location &&
    Number.isFinite(location.lat) && Number.isFinite(location.lng) &&
    location.lat >= -90 && location.lat <= 90 &&
    location.lng >= -180 && location.lng <= 180
    ? { lat: location.lat, lng: location.lng }
    : null

  const context = await getAlertContext(companionId, bookingId)
  const timestamp = new Date()
  let locationEncrypted = null

  if (parsedLocation) {
    try {
      locationEncrypted = encrypt(JSON.stringify(parsedLocation))
    } catch (error) {
      console.error('Failed to encrypt emergency location', error)
    }
  }

  const [evidence] = await db.insert(evidenceLog).values({
    bookingId,
    companionId,
    clientId: context.client.id,
    triggerType: 'codeword',
    locationEncrypted,
    chatId: context.chatId,
    timestamp,
  }).returning({ id: evidenceLog.id })

  const tasks = await Promise.allSettled([
    sendEmergencyEmail(context, parsedLocation, timestamp),
    broadcastAdminAlert({ companionId, bookingId, timestamp: timestamp.toISOString() }),
  ])

  for (const result of tasks) {
    if (result.status === 'rejected') {
      console.error('Silent alert delivery channel failed', result.reason)
    }
  }

  return { alerted: true, evidenceId: evidence.id }
}
export async function testCodeWord(companionId) {
  const companion = await requireCompanionSelf(companionId)
  const [record] = await db.select({ id: codeWords.id })
    .from(codeWords)
    .where(eq(codeWords.companionId, companionId))
    .limit(1)

  if (!record) throw new Error('Set your code word before testing it.')

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'noreply@hana.app',
    to: [companion.email],
    subject: '✅ Hana Guardian Test — Code word works',
    text: [
      `Hi ${companion.name || 'there'},`,
      '',
      'Your Hana Guardian code word is active and the emergency email channel is working.',
      'This was only a test. No evidence log or admin alert was created.',
    ].join('\n'),
  })

  return { testSent: true }
}

export async function canChangeCodeWord(companionId) {
  await requireCompanionSelf(companionId)

  const [record] = await db.select({
    createdAt: codeWords.createdAt,
    lastChangedAt: codeWords.lastChangedAt,
  }).from(codeWords).where(eq(codeWords.companionId, companionId)).limit(1)

  if (!record) {
    return {
      canChange: true,
      nextChangeDate: null,
      isSet: false,
      setOn: null,
    }
  }

  const nextChangeDate = getNextChangeDate(record.lastChangedAt)
  return {
    canChange: nextChangeDate <= new Date(),
    nextChangeDate: nextChangeDate.toISOString(),
    isSet: true,
    setOn: record.createdAt.toISOString(),
  }
}

export async function getAdminAlerts() {
  await requireAdmin()

  const rows = await db.select().from(evidenceLog)
    .orderBy(desc(evidenceLog.timestamp))
    .limit(100)

  return Promise.all(rows.map(async (evidence) => {
    const [booking] = await db.select({
      activityType: bookings.activityType,
      date: bookings.date,
      startTime: bookings.startTime,
      endTime: bookings.endTime,
      status: bookings.status,
    }).from(bookings).where(eq(bookings.id, evidence.bookingId)).limit(1)

    const [companion] = await db.select({
      name: users.name,
      image: users.image,
    }).from(users).where(eq(users.id, evidence.companionId)).limit(1)

    const [companionProfile] = await db.select({
      displayName: companions.displayName,
      photos: companions.photos,
    }).from(companions).where(eq(companions.userId, evidence.companionId)).limit(1)

    const [client] = await db.select({ name: users.name })
      .from(users)
      .where(eq(users.id, evidence.clientId))
      .limit(1)

    return {
      id: evidence.id,
      bookingId: evidence.bookingId,
      chatId: evidence.chatId,
      timestamp: evidence.timestamp.toISOString(),
      triggerType: evidence.triggerType,
      adminReviewed: evidence.adminReviewed,
      companion: {
        name: companionProfile?.displayName || companion?.name || 'Unknown companion',
        image: companion?.image || companionProfile?.photos?.[0] || null,
      },
      client: { name: client?.name || 'Unknown client' },
      booking: booking ? {
        ...booking,
        date: booking.date.toISOString(),
      } : null,
    }
  }))
}

export async function markEvidenceReviewed(id) {
  await requireAdmin()
  if (typeof id !== 'string' || !id) throw new Error('Invalid evidence ID')

  const [updated] = await db.update(evidenceLog)
    .set({ adminReviewed: true })
    .where(eq(evidenceLog.id, id))
    .returning({ id: evidenceLog.id })

  if (!updated) throw new Error('Evidence record not found')
  return { success: true }
}
