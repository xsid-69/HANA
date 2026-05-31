import { prisma } from '@/lib/prisma'
import CompanionProfileClient from './CompanionProfileClient'
import { notFound } from 'next/navigation'

export default async function CompanionPage({ params }) {
  const { id } = await params

  const companion = await prisma.companion.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, image: true } },
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

  return <CompanionProfileClient companion={JSON.parse(JSON.stringify(companion))} />
}
