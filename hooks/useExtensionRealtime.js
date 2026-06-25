'use client'

import { useEffect, useCallback, useState, useId } from 'react'
import { supabase } from '@/lib/supabase'

// TESTING: must match ActiveBookingBanner. Remove for production.
const TIME_ACCELERATION = 24

function parseTimeStr(timeStr) {
  if (!timeStr) return { hours: 0, minutes: 0 }
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i)
  if (!match) return { hours: 0, minutes: 0 }
  let hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const period = match[3]
  if (period) {
    if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12
    if (period.toUpperCase() === 'AM' && hours === 12) hours = 0
  }
  return { hours, minutes }
}

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
    if (!booking || booking.status !== 'IN_PROGRESS' || !booking.codeVerified) return

    const { hours: endH, minutes: endM } = parseTimeStr(booking.endTime)
    const bookingDate = new Date(booking.date)
    const endDate = new Date(bookingDate)
    endDate.setHours(endH, endM, 0, 0)

    const startMs = new Date(booking.verifiedAt || booking.updatedAt).getTime()
    const totalMs = endDate.getTime() - startMs

    function check() {
      const realElapsed = Date.now() - startMs
      const virtualElapsed = realElapsed * TIME_ACCELERATION
      const virtualRemaining = totalMs - virtualElapsed

      if (virtualRemaining <= 15 * 60 * 1000 && virtualRemaining > 0 && !hasShownPrompt) {
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
