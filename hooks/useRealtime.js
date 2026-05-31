'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useRealtimeMessages(conversationId, onMessage) {
  useEffect(() => {
    if (!conversationId) return

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => onMessage(payload.new))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [conversationId, onMessage])
}

export function useTypingIndicator(conversationId, onTyping) {
  useEffect(() => {
    if (!conversationId) return

    const channel = supabase.channel(`typing:${conversationId}`)
    channel.on('broadcast', { event: 'typing' }, ({ payload }) => {
      onTyping(payload)
    }).subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [conversationId, onTyping])
}

export function sendTypingEvent(conversationId, userId, isTyping) {
  const channel = supabase.channel(`typing:${conversationId}`)
  channel.send({
    type: 'broadcast',
    event: 'typing',
    payload: { userId, isTyping }
  })
}
