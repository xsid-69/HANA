'use client'

import { useEffect, useRef } from 'react'

export function useOnlineStatus(userId) {
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!userId) return

    const ping = async () => {
      try {
        await fetch('/api/online', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        })
      } catch {}
    }

    ping()
    intervalRef.current = setInterval(ping, 20000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [userId])
}
