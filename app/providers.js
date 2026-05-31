'use client'

import { useEffect } from 'react'
import { TRPCProvider } from '@/lib/trpc-client'
import { SessionProvider } from 'next-auth/react'

export function Providers({ children }) {
  useEffect(() => {
    // Suppress MetaMask extension injection errors that are not from our app
    const handler = (event) => {
      if (
        event?.reason?.message?.includes('MetaMask') ||
        event?.reason?.toString?.()?.includes('MetaMask')
      ) {
        event.preventDefault()
      }
    }
    window.addEventListener('unhandledrejection', handler)
    return () => window.removeEventListener('unhandledrejection', handler)
  }, [])

  return (
    <SessionProvider>
      <TRPCProvider>
        {children}
      </TRPCProvider>
    </SessionProvider>
  )
}
