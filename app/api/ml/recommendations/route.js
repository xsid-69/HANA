import { saveRecommendations } from '@/app/actions/recommendations'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request) {
  try {
    const body = await request.json()
    return Response.json(await saveRecommendations(body?.recommendations))
  } catch (error) {
    const unauthorized = error?.message === 'Unauthorized'
    const invalid = error?.name === 'ZodError' || error instanceof SyntaxError
    console.error('ML recommendations request failed:', error)
    return Response.json(
      { error: unauthorized ? 'Unauthorized' : invalid ? 'Invalid recommendations payload' : 'Unable to save recommendations' },
      { status: unauthorized ? 401 : invalid ? 400 : 500 },
    )
  }
}