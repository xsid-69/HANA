'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useBookingRealtime(bookingId, onUpdate) {
  useEffect(() => {
    if (!bookingId) return

    const channel = supabase
      .channel(`booking:${bookingId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'bookings',
        filter: `id=eq.${bookingId}`
      }, (payload) => onUpdate(payload.new))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [bookingId, onUpdate])
}

export function useBookingsRealtime(userId, onUpdate) {
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`user-bookings:${userId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'bookings',
        filter: `clientId=eq.${userId}`
      }, (payload) => onUpdate(payload.new))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, onUpdate])
}
