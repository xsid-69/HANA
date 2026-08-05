'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getClockOffset } from '@/lib/session-timing'

function snapshot(endsAt, offset) {
  const endMs = new Date(endsAt).getTime()
  if (!Number.isFinite(endMs)) {
    return { remainingMs: Infinity, hours: 0, minutes: 0, seconds: 0, complete: false }
  }
  const remainingMs = Math.max(0, endMs - (Date.now() + offset))
  const totalSeconds = Math.ceil(remainingMs / 1000)
  return {
    remainingMs,
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    complete: remainingMs <= 0,
  }
}

export function useSyncedCountdown({ endsAt, serverNow, onComplete }) {
  const offset = useMemo(() => getClockOffset(serverNow), [serverNow])
  const [time, setTime] = useState(() => snapshot(endsAt, offset))
  const completedRef = useRef(false)
  const update = useCallback(() => setTime(snapshot(endsAt, offset)), [endsAt, offset])

  useEffect(() => {
    completedRef.current = false
    const syncId = setTimeout(update, 0)
    const correctedNow = Date.now() + offset
    const delay = 1000 - (correctedNow % 1000)
    let intervalId
    const timeoutId = setTimeout(() => {
      update()
      intervalId = setInterval(update, 1000)
    }, delay)
    return () => {
      clearTimeout(syncId)
      clearTimeout(timeoutId)
      clearInterval(intervalId)
    }
  }, [update, offset])

  useEffect(() => {
    if (time.complete && !completedRef.current) {
      completedRef.current = true
      onComplete?.()
    }
  }, [time.complete, onComplete])

  return time
}
