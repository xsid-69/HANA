'use client'

import { useSession } from 'next-auth/react'
import { useAuthStore } from '@/lib/auth-store'
import { Search } from 'lucide-react'
import NotificationDropdown from '@/components/notifications/NotificationDropdown'

export default function CompanionTopNav() {
  const { data: session } = useSession()
  const { user: jwtUser } = useAuthStore()
  const user = jwtUser || session?.user

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-8 py-3 bg-white/80 backdrop-blur-md border-b"
      style={{ borderColor: 'var(--hana-subtle)' }}
    >
      <div className="flex items-center gap-3 flex-1">
        <div className="relative hidden sm:block max-w-[280px] flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--hana-muted)]" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border bg-gray-50/80 text-sm placeholder:text-[var(--hana-muted)] focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all"
            style={{ borderColor: 'var(--hana-subtle)' }}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <NotificationDropdown />

        <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-[var(--hana-subtle)]">
          {user?.image ? (
            <img src={user.image} alt="" className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, var(--hana-blush), var(--hana-blush-dark))' }}
            >
              {user?.name?.[0] || '?'}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
