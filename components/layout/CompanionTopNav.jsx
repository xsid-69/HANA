'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Heart } from 'lucide-react'
import NotificationDropdown from '@/components/notifications/NotificationDropdown'
import { useAuthStore } from '@/lib/auth-store'

export default function CompanionTopNav() {
  const { data: session } = useSession()
  const jwtUser = useAuthStore((state) => state.user)
  const user = jwtUser || session?.user

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--hana-subtle)]/80 bg-[var(--hana-cream)]/90 px-4 py-3 backdrop-blur-xl sm:px-6 md:px-8 xl:px-10">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-[#20171b] focus:px-3 focus:py-2 focus:text-sm focus:text-white">
        Skip to dashboard
      </a>
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4">
        <Link href="/companion/dashboard" className="flex min-h-10 items-center gap-2 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#a33b63] md:pointer-events-none">
          <span className="flex size-8 items-center justify-center rounded-[11px] bg-[#a9476b] text-white md:hidden">
            <Heart size={14} fill="currentColor" aria-hidden="true" />
          </span>
          <span className="font-heading text-sm font-semibold text-[#45343b] md:text-[#75636b]">Companion workspace</span>
        </Link>

        <div className="flex items-center gap-2">
          <NotificationDropdown />
          <Link href="/companion/profile" aria-label="Open your profile" className="rounded-[13px] outline-none focus-visible:ring-2 focus-visible:ring-[#a33b63] focus-visible:ring-offset-2">
            <span className="block size-9 overflow-hidden rounded-[13px] bg-[#a9476b] ring-1 ring-black/[0.06]">
              {user?.image ? (
                <img src={user.image} alt={`${user.name || 'Companion'} profile`} className="size-full object-cover" />
              ) : (
                <span className="flex size-full items-center justify-center text-xs font-semibold text-white">{user?.name?.[0] || '?'}</span>
              )}
            </span>
          </Link>
        </div>
      </div>
    </header>
  )
}