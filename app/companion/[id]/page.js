import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt'
import CompanionProfileClient from './CompanionProfileClient'
import { notFound } from 'next/navigation'

export default async function CompanionPage({ params }) {
  const { id } = await params

  const companion = await prisma.companion.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, image: true } },
      experiences: true,
      availability: true,
      reviews: {
        where: { isVisible: true },
        include: { author: { select: { name: true, image: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      _count: { select: { reviews: true, bookings: true } }
    }
  })

  if (!companion) notFound()

  let isOwnProfile = false
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('hana-token')?.value
    if (token) {
      const payload = await verifyToken(token)
      if (payload?.id && payload.id === companion.user?.id) {
        isOwnProfile = true
      }
    }
  } catch {}

  return (
    <CompanionProfileClient
      companion={JSON.parse(JSON.stringify(companion))}
      isOwnProfile={isOwnProfile}
    />
  )
}
