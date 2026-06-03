import { db } from '@/db'
import { companions, users, experiences, availabilities, reviews } from '@/db/schema'
import { eq, and, desc, count } from 'drizzle-orm'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt'
import CompanionProfileClient from './CompanionProfileClient'
import { notFound } from 'next/navigation'

export default async function CompanionPage({ params }) {
  const { id } = await params

  const [companion] = await db.select()
    .from(companions)
    .where(eq(companions.id, id))
    .limit(1)

  if (!companion) notFound()

  const [user] = await db.select({ id: users.id, name: users.name, image: users.image })
    .from(users)
    .where(eq(users.id, companion.userId))
    .limit(1)

  const exps = await db.select()
    .from(experiences)
    .where(eq(experiences.companionId, companion.id))

  const avail = await db.select()
    .from(availabilities)
    .where(eq(availabilities.companionId, companion.id))

  const revs = await db.select()
    .from(reviews)
    .where(and(eq(reviews.companionId, companion.id), eq(reviews.isVisible, true)))
    .orderBy(desc(reviews.createdAt))
    .limit(10)

  const reviewsWithAuthor = await Promise.all(revs.map(async (rev) => {
    const [author] = await db.select({ name: users.name, image: users.image })
      .from(users)
      .where(eq(users.id, rev.authorId))
      .limit(1)
    return { ...rev, author }
  }))

  const [reviewCount] = await db.select({ count: count() })
    .from(reviews)
    .where(eq(reviews.companionId, companion.id))

  const [bookingCount] = await db.select({ count: count() })
    .from(companions)
    .where(eq(companions.id, companion.id))

  const data = {
    ...companion,
    user,
    experiences: exps,
    availability: avail,
    reviews: reviewsWithAuthor,
    _count: {
      reviews: reviewCount?.count ?? 0,
      bookings: bookingCount?.count ?? 0,
    },
  }

  let isOwnProfile = false
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('hana-token')?.value
    if (token) {
      const payload = await verifyToken(token)
      if (payload?.id && payload.id === companion.userId) {
        isOwnProfile = true
      }
    }
  } catch {}

  return (
    <CompanionProfileClient
      companion={JSON.parse(JSON.stringify(data))}
      isOwnProfile={isOwnProfile}
    />
  )
}
