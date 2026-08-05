import { getInteractionMatrix } from '@/app/actions/recommendations'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST() {
  try {
    return Response.json(await getInteractionMatrix())
  } catch (error) {
    const unauthorized = error?.message === 'Unauthorized'
    console.error('ML interactions request failed:', error)
    return Response.json(
      { error: unauthorized ? 'Unauthorized' : 'Unable to fetch interactions' },
      { status: unauthorized ? 401 : 500 },
    )
  }
}