'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

export function useMessageStream(onMessage) {
  const [connected, setConnected] = useState(false)
  const eventSourceRef = useRef(null)
  const reconnectTimer = useRef(null)

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    const es = new EventSource('/api/messages/stream')
    eventSourceRef.current = es

    es.onopen = () => {
      setConnected(true)
    }

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type !== 'connected') {
          onMessage(data)
        }
      } catch {}
    }

    es.onerror = () => {
      setConnected(false)
      es.close()
      reconnectTimer.current = setTimeout(connect, 3000)
    }
  }, [onMessage])

  useEffect(() => {
    connect()
    return () => {
      if (eventSourceRef.current) eventSourceRef.current.close()
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current)
    }
  }, [connect])

  return { connected }
}
