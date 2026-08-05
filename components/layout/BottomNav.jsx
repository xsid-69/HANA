'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Compass, Calendar, MessageCircle, User, LogIn } from 'lucide-react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { getUnreadCount } from '@/app/actions/messages'
import { useAuthStore } from '@/lib/auth-store'

const NAV_ITEMS = [
  { href: '/discover', icon: Compass, label: 'Discover' },
  { href: '/bookings', icon: Calendar, label: 'Bookings', auth: true },
  { href: '/messages', icon: MessageCircle, label: 'Messages', auth: true },
  { href: '/profile', icon: User, label: 'Profile', auth: true },
]

export default function BottomNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { user: jwtUser } = useAuthStore()
  const user = jwtUser || session?.user
  const isLoggedIn = !!user

  const { data: unread } = useQuery({
    queryKey: ['unread-messages'],
    queryFn: getUnreadCount,
    refetchInterval: 10000,
    enabled: isLoggedIn,
  })

  const unreadCount = unread?.count ?? 0

  const visibleItems = isLoggedIn
    ? NAV_ITEMS
    : [...NAV_ITEMS.filter(item => !item.auth), { href: '/login', icon: LogIn, label: 'Sign In' }]

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden" aria-label="Primary navigation">
      <div className="pointer-events-auto mx-auto flex h-[68px] max-w-md items-center rounded-[22px] border border-white/70 bg-white/92 p-1.5 shadow-[0_20px_55px_-22px_rgba(96,31,58,0.38)] backdrop-blur-xl">
        {visibleItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`) || (item.href === '/discover' && pathname.startsWith('/companion'))
          const Icon = item.icon
          const showBadge = item.href === '/messages' && unreadCount > 0
          return (
            <Link key={item.href} href={item.href} aria-current={isActive ? 'page' : undefined} className="flex min-h-12 flex-1 items-center justify-center rounded-[17px] outline-none focus-visible:ring-2 focus-visible:ring-[var(--hana-blush-dark)]">
              <motion.span whileTap={{ scale: 0.92 }} className={`relative flex min-h-12 w-full flex-col items-center justify-center gap-1 rounded-[17px] ${isActive ? 'text-white' : 'text-[var(--hana-muted)]'}`}>
                {isActive && (
                  <motion.span layoutId="bottom-nav-pill" className="absolute inset-0 rounded-[17px] bg-hana-gradient shadow-[0_10px_24px_-12px_rgba(233,30,99,0.75)]" transition={{ type: 'spring', stiffness: 420, damping: 30 }} />
                )}
                <span className="relative z-10">
                  <Icon className="size-5" strokeWidth={isActive ? 2.35 : 1.8} aria-hidden="true" />
                  {showBadge && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -right-2.5 -top-2 flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold leading-[18px] text-white ring-2 ring-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </motion.span>
                  )}
                </span>
                <span className="relative z-10 text-[9px] font-semibold tracking-[-0.01em]">{item.label}</span>
              </motion.span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
