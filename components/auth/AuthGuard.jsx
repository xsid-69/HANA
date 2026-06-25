'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'

/**
 * Client-side route guard used by the (client) and companion layouts.
 *
 * It treats a user as authenticated if EITHER auth system says so:
 *   - NextAuth session (Google / magic link)
 *   - custom JWT user from /api/auth/me (email + password)
 *
 * It is intentionally lenient: it only redirects to /login once BOTH systems
 * have definitively resolved to "not authenticated". A transient network error
 * never wipes the session or bounces the user mid-process.
 */
export default function AuthGuard({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const { status } = useSession()
  const user = useAuthStore((s) => s.user)
  const initialized = useAuthStore((s) => s.initialized)
  const fetchMe = useAuthStore((s) => s.fetchMe)

  useEffect(() => {
    if (!initialized) fetchMe()
  }, [initialized, fetchMe])

  const stillChecking = status === 'loading' || !initialized
  const authenticated = status === 'authenticated' || Boolean(user)

  useEffect(() => {
    if (!stillChecking && !authenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }, [stillChecking, authenticated, pathname, router])

  if (stillChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--hana-cream)]">
        <Loader2 className="w-7 h-7 text-pink-500 animate-spin" />
      </div>
    )
  }

  if (!authenticated) {
    // Redirect is in flight — render nothing to avoid a flash of protected UI.
    return null
  }

  return children
}
