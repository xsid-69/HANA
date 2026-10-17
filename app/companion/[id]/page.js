import { getCompanionById } from '@/app/actions/companions'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/jwt'
import CompanionProfileClient from './CompanionProfileClient'
import { notFound } from 'next/navigation'

export default async function CompanionPage({ params }) {
  const { id } = await params

  let viewerUserId = null
  try {
    const token = (await cookies()).get('hana-token')?.value
    if (token) viewerUserId = (await verifyToken(token))?.id ?? null
  } catch {}

  if (!viewerUserId) {
    try {
      const { auth } = await import('@/lib/auth')
      viewerUserId = (await auth())?.user?.id ?? null
    } catch {}
  }

  let companion
  try {
    companion = await getCompanionById(id)
  } catch {
    notFound()
  }

  return (
    <CompanionProfileClient
      companion={JSON.parse(JSON.stringify(companion))}
      isOwnProfile={viewerUserId === companion.userId}
      viewerUserId={viewerUserId}
    />
  )
}
