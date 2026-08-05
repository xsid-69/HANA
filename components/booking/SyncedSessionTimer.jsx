'use client'

import { motion } from 'framer-motion'
import { useSyncedCountdown } from '@/hooks/useSyncedCountdown'
import { SESSION_TIME_ACCELERATION } from '@/lib/session-timing'

export default function SyncedSessionTimer({ booking, onComplete }) {
  const time = useSyncedCountdown({ endsAt: booking.sessionEndsAt, serverNow: booking.serverNow, onComplete })
  const startMs = new Date(booking.verifiedAt).getTime()
  const endMs = new Date(booking.sessionEndsAt).getTime()
  const hasClock = Number.isFinite(startMs) && Number.isFinite(endMs)
  const totalMs = hasClock ? Math.max(1, endMs - startMs) : 1
  const progress = hasClock ? Math.min(100, Math.max(0, ((totalMs - time.remainingMs) / totalMs) * 100)) : 0

  if (!hasClock) return <span className="text-xs font-medium text-white/70">Synchronizing session clock…</span>

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div>
        <div className="flex items-center gap-1 font-mono text-lg font-semibold tabular-nums text-white" aria-live="off" aria-label={`${time.hours} hours, ${time.minutes} minutes, ${time.seconds} seconds remaining`}>
          <span className="rounded-lg bg-white/12 px-2 py-1">{String(time.hours).padStart(2, '0')}</span>
          <span className="text-white/40">:</span>
          <span className="rounded-lg bg-white/12 px-2 py-1">{String(time.minutes).padStart(2, '0')}</span>
          <span className="text-white/40">:</span>
          <span className="rounded-lg bg-white/12 px-2 py-1">{String(time.seconds).padStart(2, '0')}</span>
        </div>
        {SESSION_TIME_ACCELERATION > 1 && <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/55">Testing at {SESSION_TIME_ACCELERATION}× speed</p>}
      </div>
      <div className="hidden min-w-28 flex-1 sm:block">
        <div className="h-1.5 overflow-hidden rounded-full bg-white/12"><motion.div className="h-full origin-left rounded-full bg-white/85" animate={{ scaleX: progress / 100 }} transition={{ duration: 0.25 }} /></div>
        <p className="mt-1 text-center text-[10px] text-white/55">{progress.toFixed(0)}% elapsed</p>
      </div>
    </div>
  )
}
