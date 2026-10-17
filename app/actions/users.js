'use server'

import { db } from '@/db'
import { users, companions, savedCompanions, bookings, reviews, experiences } from '@/db/schema'
import { eq, and, count } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { verifyToken } from '@/lib/jwt'
import { isCompanionAge } from '@/lib/age-policy'
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
    age: z.coerce.number().int().min(18).max(100).optional(),
    bio: z.string().max(500).optional(),
    city: z.string().max(100).optional(),
    image: z.string().optional(),
    banner: z.string().optional(),
  })
  const data = schema.parse(input)

  const [currentUser] = await db.select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  if (!currentUser) throw new Error('User not found')
  if (data.age != null && currentUser.role === 'COMPANION' && !isCompanionAge(data.age)) {
    throw new Error('Companions must be between 18 and 25 years old')
  }

  return db.transaction(async (tx) => {
    const [updated] = await tx.update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning()

    if (data.age != null && currentUser.role === 'COMPANION') {
      await tx.update(companions)
        .set({ age: data.age, updatedAt: new Date() })
        .where(eq(companions.userId, userId))
    }
    return updated
  })
}

export async function updateCompanionProfile(input) {
  const userId = await getUser()
  const schema = z.object({
    displayName: z.string().min(1).max(50).optional(),
    age: z.coerce.number().int().min(18).max(25).optional(),
    bio: z.string().max(1000).optional(),
    city: z.string().max(100).optional(),
    languages: z.array(z.string()).optional(),
    hourlyRate: z.number().min(100).optional(),
    photos: z.array(z.string()).optional(),
  })
  const data = schema.parse(input)

  const [companion] = await db.select({ id: companions.id })
    .from(companions)
    .where(eq(companions.userId, userId))
    .limit(1)
  if (!companion) throw new Error('Not a companion')

  return db.transaction(async (tx) => {
    const [updated] = await tx.update(companions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(companions.id, companion.id))
      .returning()

    const userUpdate = {}
    if (data.displayName) userUpdate.name = data.displayName
    if (data.city) userUpdate.city = data.city
    if (data.age != null) userUpdate.age = data.age
    if (Object.keys(userUpdate).length) {
      await tx.update(users)
        .set({ ...userUpdate, updatedAt: new Date() })
        .where(eq(users.id, userId))
    }
    return updated
  })
}

export async function completeOnboarding(input) {
  const userId = await getUser()
  const schema = z.object({
    role: z.enum(['CLIENT', 'COMPANION']),
    name: z.string().min(1).max(100),
    age: z.number().int().min(18).max(100),
    city: z.string().min(1).max(100),
    image: z.string().optional(),
    tags: z.array(z.string()).optional(),
    bio: z.string().min(10).max(1000).optional(),
    hourlyRate: z.number().min(100).optional(),
    languages: z.array(z.string()).optional(),
    displayName: z.string().min(1).max(50).optional(),
  }).superRefine((data, ctx) => {
    if (data.role === 'COMPANION' && !isCompanionAge(data.age)) {
      ctx.addIssue({
        code: 'custom',
        path: ['age'],
        message: 'Companions must be between 18 and 25 years old',
      })
    }
  })
  const data = schema.parse(input)

  return db.transaction(async (tx) => {
    const [user] = await tx.update(users)
      .set({
        role: data.role,
        name: data.name,
        age: data.age,
        city: data.city,
        image: data.image,
        onboarded: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning()

    if (data.role === 'COMPANION') {
      const profileData = {
        displayName: data.displayName || data.name,
        age: data.age,
        city: data.city,
        bio: data.bio || `Hi, I'm ${data.name}. Let's explore ${data.city} together!`,
        languages: data.languages?.length ? data.languages : ['English', 'Hindi'],
        photos: data.image ? [data.image] : [],
        tags: data.tags || [],
        hourlyRate: data.hourlyRate || 1000,
        isActive: true,
        updatedAt: new Date(),
      }
      const [existing] = await tx.select({ id: companions.id })
        .from(companions)
        .where(eq(companions.userId, userId))
        .limit(1)

      if (existing) {
        await tx.update(companions).set(profileData).where(eq(companions.id, existing.id))
      } else {
        await tx.insert(companions).values({
          userId,
          ...profileData,
          createdAt: new Date(),
        })
      }
    }

    return user
  })
}

export async function getSavedCompanions() {
  const userId = await getUser()
  const saved = await db.select()
    .from(savedCompanions)
    .where(eq(savedCompanions.userId, userId))
    .orderBy(savedCompanions.savedAt)

  const results = await Promise.all(saved.map(async (savedItem) => {
    const [companion] = await db.select()
      .from(companions)
      .where(eq(companions.id, savedItem.companionId))
      .limit(1)

    if (!companion || !companion.isActive || companion.isSuspended) {
      return null
    }

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
    await db.delete(savedCompanions).where(eq(savedCompanions.id, existing.id))
    import('@/app/actions/recommendations')
      .then(({ logUserEvent }) => logUserEvent(userId, input, 'profile_dismissed'))
      .catch(console.error)
    return { saved: false }
  }

  const [companion] = await db.select({
    isActive: companions.isActive,
    isSuspended: companions.isSuspended,
  })
    .from(companions)
    .where(eq(companions.id, input))
    .limit(1)

  if (!companion || !companion.isActive || companion.isSuspended) {
    throw new Error('This companion is currently unavailable')
  }

  await db.insert(savedCompanions).values({ userId, companionId: input })
  import('@/app/actions/recommendations')
    .then(({ logUserEvent }) => logUserEvent(userId, input, 'companion_saved'))
    .catch(console.error)
  return { saved: true }
}
