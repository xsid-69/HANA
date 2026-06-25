import { NextResponse } from 'next/server'
import { expireStaleBookings } from '@/app/actions/bookings'

export const dynamic = 'force-dynamic'

// Scheduled cleanup endpoint. Expires:
//  - PENDING_ACCEPTANCE requests the companion never responded to
//  - AWAITING_PAYMENT bookings the client never paid for
//
// Wire this up to a scheduler (e.g. Vercel Cron) hitting it every few minutes.
// If CRON_SECRET is set, callers must send `Authorization: Bearer <CRON_SECRET>`.
export async function GET(request) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = request.headers.get('authorization')
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const result = await expireStaleBookings()
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    console.error('[cron/expire-bookings]', err)
    return NextResponse.json({ ok: false, error: 'Failed to expire bookings' }, { status: 500 })
  }
}
