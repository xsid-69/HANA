'use client'

import { useEffect, useCallback, useState, useId } from 'react'
import { supabase } from '@/lib/supabase'
import { getClockOffset, scaleSessionDuration } from '@/lib/session-timing'

export function useExtensionRealtime(bookingId, onUpdate) {
  const instanceId = useId()

  useEffect(() => {
    if (!bookingId) return

    const channel = supabase
      .channel(`extension:${bookingId}:${instanceId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'booking_extensions',
        filter: `bookingId=eq.${bookingId}`
      }, (payload) => onUpdate(payload.eventType, payload.new))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [bookingId, onUpdate, instanceId])
}

export function useExtensionTimer(booking) {
  const [shouldShowPrompt, setShouldShowPrompt] = useState(false)
  const [hasShownPrompt, setHasShownPrompt] = useState(false)

  useEffect(() => {
    if (!booking || booking.status !== 'IN_PROGRESS' || !booking.codeVerified || !booking.sessionEndsAt) return

    const offset = getClockOffset(booking.serverNow)
    const endMs = new Date(booking.sessionEndsAt).getTime()

    function check() {
      const remaining = endMs - (Date.now() + offset)
      if (remaining <= scaleSessionDuration(15 * 60 * 1000) && remaining > 0 && !hasShownPrompt) {
        setShouldShowPrompt(true)
        setHasShownPrompt(true)
      }
    }

    check()
    const interval = setInterval(check, 1000)
    return () => clearInterval(interval)
  }, [booking, hasShownPrompt])

  const dismiss = useCallback(() => setShouldShowPrompt(false), [])

  return { shouldShowPrompt, dismiss }
}
