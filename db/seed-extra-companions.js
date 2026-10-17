import 'dotenv/config'
import pg from 'pg'
import bcrypt from 'bcryptjs'
import { drizzle } from 'drizzle-orm/node-postgres'
import { and, eq, inArray, sql } from 'drizzle-orm'
import { availabilities, companions, experiences, users } from './schema.js'
import { EXTRA_COMPANIONS } from './extra-companions.js'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const db = drizzle(pool)

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')
  const password = await bcrypt.hash('sid123', 12)

  await db.transaction(async (tx) => {
    await tx.execute(sql`SELECT pg_advisory_xact_lock(721905)`)

    for (const data of EXTRA_COMPANIONS) {
      const [user] = await tx.insert(users).values({
        email: data.email,
        name: data.name,
        image: data.photos[0],
        password,
        role: 'COMPANION',
        age: data.age,
        city: data.city,
        onboarded: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).onConflictDoUpdate({
        target: users.email,
        set: { name: data.name, image: data.photos[0], role: 'COMPANION', age: data.age, city: data.city, onboarded: true, updatedAt: new Date() },
      }).returning()
      const [companion] = await tx.insert(companions).values({
        userId: user.id,
        displayName: data.displayName,
        age: data.age,
        city: data.city,
        district: data.district,
        bio: data.bio,
        languages: data.languages,
        photos: data.photos,
        tags: data.tags,
        hourlyRate: data.hourlyRate,
        isActive: true,
        verificationStatus: 'VERIFIED',
        averageRating: data.averageRating,
        totalReviews: data.totalReviews,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).onConflictDoUpdate({
        target: companions.userId,
        set: {
          displayName: data.displayName,
          age: data.age,
          city: data.city,
          district: data.district,
          bio: data.bio,
          languages: data.languages,
          photos: data.photos,
          tags: data.tags,
          hourlyRate: data.hourlyRate,
          isActive: true,
          verificationStatus: 'VERIFIED',
          averageRating: data.averageRating,
          totalReviews: data.totalReviews,
          updatedAt: new Date(),
        },
      }).returning()

      for (const experience of data.experiences) {
        const [existing] = await tx.select({ id: experiences.id }).from(experiences).where(and(
          eq(experiences.companionId, companion.id),
          eq(experiences.name, experience.name),
        )).limit(1)
        if (!existing) await tx.insert(experiences).values({ companionId: companion.id, ...experience })
      }

      for (let dayOfWeek = 1; dayOfWeek <= 6; dayOfWeek += 1) {
        await tx.insert(availabilities).values({
          companionId: companion.id,
          dayOfWeek,
          startTime: '10:00',
          endTime: '21:00',
          isAvailable: true,
        }).onConflictDoUpdate({
          target: [availabilities.companionId, availabilities.dayOfWeek],
          set: { startTime: '10:00', endTime: '21:00', isAvailable: true },
        })
      }

      console.log(`Upserted ${data.displayName} in ${data.city}`)
    }

    const activeCompanions = await tx.select({ id: companions.id, hourlyRate: companions.hourlyRate, averageRating: companions.averageRating })
      .from(companions)
      .where(eq(companions.isActive, true))
    const topIds = activeCompanions
      .sort((a, b) => b.hourlyRate - a.hourlyRate || b.averageRating - a.averageRating)
      .slice(0, 5)
      .map((companion) => companion.id)
    await tx.update(companions).set({ isFeatured: false })
    await tx.update(companions).set({ isFeatured: true }).where(inArray(companions.id, topIds))
  })

  console.log(`Added or updated ${EXTRA_COMPANIONS.length} adult companion profiles.`)
}

main()
  .catch((error) => {
    console.error('Extra companion seed failed:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await pool.end()
  })
