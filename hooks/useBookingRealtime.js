'use client'

import { useEffect, useId } from 'react'
import { supabase } from '@/lib/supabase'

export function useBookingRealtime(bookingId, onUpdate) {
  const instanceId = useId()

  useEffect(() => {
    if (!bookingId) return

    const channel = supabase
      .channel(`booking:${bookingId}:${instanceId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'bookings',
        filter: `id=eq.${bookingId}`
      }, (payload) => onUpdate(payload.new))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [bookingId, onUpdate, instanceId])
}

export function useBookingsRealtime(userId, onUpdate) {
  const instanceId = useId()

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`user-bookings:${userId}:${instanceId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'bookings',
        filter: `clientId=eq.${userId}`
      }, (payload) => onUpdate(payload.new))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, onUpdate, instanceId])
}
