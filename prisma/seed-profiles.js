import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import 'dotenv/config'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const profilesPath = resolve('C:/Users/siddh/.gemini/antigravity/scratch/profiles.json')
const PROFILES = JSON.parse(readFileSync(profilesPath, 'utf-8'))

async function main() {
  console.log('Seeding profiles from profiles.json...\n')

  for (const profile of PROFILES) {
    const { user: userData, companion: companionData, experiences, availability, reviews } = profile

    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        name: userData.name,
        password: userData.password,
        role: userData.role,
        image: userData.image,
        onboarded: userData.onboarded,
        city: companionData.city,
      },
    })

    const companion = await prisma.companion.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        displayName: companionData.displayName,
        age: companionData.age,
        city: companionData.city,
        district: companionData.district,
        bio: companionData.bio,
        languages: companionData.languages,
        photos: companionData.photos,
        tags: companionData.tags,
        hourlyRate: companionData.hourlyRate,
        minimumHours: companionData.minimumHours,
        isActive: companionData.isActive,
        isFeatured: companionData.isFeatured,
        verificationStatus: companionData.verificationStatus,
        averageRating: companionData.averageRating,
        totalReviews: companionData.totalReviews,
        totalBookings: companionData.totalBookings,
      },
    })

    for (const exp of experiences) {
      await prisma.experience.create({
        data: {
          companionId: companion.id,
          name: exp.name,
          emoji: exp.emoji,
          description: exp.description,
        },
      })
    }

    for (const slot of availability) {
      await prisma.availability.upsert({
        where: {
          companionId_dayOfWeek: {
            companionId: companion.id,
            dayOfWeek: slot.dayOfWeek,
          },
        },
        update: {
          startTime: slot.startTime,
          endTime: slot.endTime,
          isAvailable: slot.isAvailable,
        },
        create: {
          companionId: companion.id,
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isAvailable: slot.isAvailable,
        },
      })
    }

    for (const review of reviews) {
      const reviewerEmail = `${review.authorName.toLowerCase().replace(/[^a-z]/g, '')}.reviewer@demo.hana.app`

      const reviewer = await prisma.user.upsert({
        where: { email: reviewerEmail },
        update: {},
        create: {
          email: reviewerEmail,
          name: review.authorName,
          role: 'CLIENT',
          onboarded: true,
        },
      })

      const booking = await prisma.booking.create({
        data: {
          clientId: reviewer.id,
          companionId: companion.id,
          date: new Date('2025-01-15'),
          startTime: '18:00',
          endTime: '20:00',
          durationHours: 2,
          activityType: experiences[0]?.name || 'General',
          hourlyRate: companionData.hourlyRate,
          subtotal: companionData.hourlyRate * 2,
          serviceFee: Math.round(companionData.hourlyRate * 2 * 0.1),
          deposit: Math.round(companionData.hourlyRate * 2 * 0.25),
          totalAmount: Math.round(companionData.hourlyRate * 2 * 1.1),
          status: 'COMPLETED',
        },
      })

      await prisma.review.create({
        data: {
          bookingId: booking.id,
          authorId: reviewer.id,
          companionId: companion.id,
          rating: review.rating,
          content: review.content,
          isVisible: true,
        },
      })
    }

    console.log(`  ✓ ${userData.name} — ${companionData.city}, ${companionData.district}`)
  }

  console.log(`\nDone! Seeded ${PROFILES.length} companion profiles with reviews.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
