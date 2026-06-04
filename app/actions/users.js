'use server'

import { db } from '@/db'
import { users, companions, savedCompanions, bookings, reviews, experiences } from '@/db/schema'
import { eq, and, count } from 'drizzle-orm'
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

export async function getProfile() {
  const userId = await getUser()

  const [user] = await db.select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!user) return null

  const [companion] = await db.select()
    .from(companions)
    .where(eq(companions.userId, userId))
    .limit(1)

  const [bookingsCount] = await db.select({ count: count() })
    .from(bookings)
    .where(eq(bookings.clientId, userId))

  const [savedCount] = await db.select({ count: count() })
    .from(savedCompanions)
    .where(eq(savedCompanions.userId, userId))

  const [reviewsCount] = await db.select({ count: count() })
    .from(reviews)
    .where(eq(reviews.authorId, userId))

  return {
    ...user,
    companion: companion ?? null,
    _count: {
      bookingsAsClient: bookingsCount?.count ?? 0,
      savedCompanions: savedCount?.count ?? 0,
      reviewsWritten: reviewsCount?.count ?? 0,
    }
  }
}

export async function updateProfile(input) {
  const userId = await getUser()

  const schema = z.object({
    name: z.string().min(1).max(100).optional(),
    bio: z.string().max(500).optional(),
    city: z.string().max(100).optional(),
    image: z.string().url().optional(),
  })

  const data = schema.parse(input)

  const [updated] = await db.update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning()

  return updated
}

export async function completeOnboarding(input) {
  const userId = await getUser()

  const schema = z.object({
    role: z.enum(['CLIENT', 'COMPANION']),
    name: z.string().min(1).max(100),
    city: z.string().min(1).max(100),
    image: z.string().optional(),
    tags: z.array(z.string()).optional(),
    // Companion-specific fields
    age: z.number().min(18).max(99).optional(),
    bio: z.string().min(10).max(1000).optional(),
    hourlyRate: z.number().min(100).optional(),
    languages: z.array(z.string()).optional(),
    displayName: z.string().min(1).max(50).optional(),
  })

  const data = schema.parse(input)

  const [user] = await db.update(users)
    .set({
      role: data.role,
      name: data.name,
      city: data.city,
      image: data.image,
      onboarded: true,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning()

  // If companion, create companion profile
  if (data.role === 'COMPANION') {
    const [existing] = await db.select({ id: companions.id })
      .from(companions)
      .where(eq(companions.userId, userId))
      .limit(1)

    if (!existing) {
      await db.insert(companions).values({
        userId,
        displayName: data.displayName || data.name,
        age: data.age || 25,
        city: data.city,
        bio: data.bio || `Hi, I'm ${data.name}. Let's explore ${data.city} together!`,
        languages: data.languages || ['English', 'Hindi'],
        photos: data.image ? [data.image] : [],
        tags: data.tags || [],
        hourlyRate: data.hourlyRate || 1000,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }
  }

  return user
}

export async function getSavedCompanions() {
  const userId = await getUser()

  const saved = await db.select()
    .from(savedCompanions)
    .where(eq(savedCompanions.userId, userId))
    .orderBy(savedCompanions.savedAt)

  const results = await Promise.all(saved.map(async (s) => {
    const [companion] = await db.select()
      .from(companions)
      .where(eq(companions.id, s.companionId))
      .limit(1)

    if (!companion) return null

    const [user] = await db.select({ name: users.name, image: users.image })
      .from(users)
      .where(eq(users.id, companion.userId))
      .limit(1)

    const exps = await db.select()
      .from(experiences)
      .where(eq(experiences.companionId, companion.id))

    return { ...companion, user, experiences: exps }
  }))

  return results.filter(Boolean)
}

export async function toggleSaveCompanion(companionId) {
  const userId = await getUser()

  const input = z.string().parse(companionId)

  const [existing] = await db.select()
    .from(savedCompanions)
    .where(and(
      eq(savedCompanions.userId, userId),
      eq(savedCompanions.companionId, input),
    ))
    .limit(1)

  if (existing) {
    await db.delete(savedCompanions)
      .where(eq(savedCompanions.id, existing.id))
    return { saved: false }
  }

  await db.insert(savedCompanions).values({
    userId,
    companionId: input,
  })
  return { saved: true }
}
