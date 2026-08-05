'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  CalendarDays,
  CalendarRange,
  LayoutDashboard,
  MessageCircle,
  UserRound,
} from 'lucide-react'
import { getUnreadCount } from '@/app/actions/messages'

const NAV_ITEMS = [
  { href: '/companion/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/companion/bookings', icon: CalendarRange, label: 'Bookings' },
  { href: '/companion/calendar', icon: CalendarDays, label: 'Calendar' },
  { href: '/companion/messages', icon: MessageCircle, label: 'Messages' },
  { href: '/companion/profile', icon: UserRound, label: 'Profile' },
]

export default function CompanionBottomNav() {
  const pathname = usePathname()
  const { data: unread } = useQuery({
    queryKey: ['unread-messages'],
    queryFn: getUnreadCount,
    refetchInterval: 10000,
  })
  const unreadCount = unread?.count ?? 0

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden" aria-label="Companion navigation">
      <div className="mx-auto flex h-[68px] max-w-md items-center justify-around rounded-[22px] bg-[var(--hana-blush-dark)]/95 px-1.5 shadow-[0_18px_50px_-18px_rgba(233,30,99,0.55)] backdrop-blur-xl">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`)
          const showBadge = href === '/companion/messages' && unreadCount > 0
          return (
            <Link key={href} href={href} aria-current={active ? 'page' : undefined} className="relative flex min-h-12 flex-1 items-center justify-center rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-[#df9eb5]">
              {active && (
                <motion.span
                  layoutId="companion-mobile-indicator"
                  className="absolute inset-x-1 inset-y-1 rounded-[15px] bg-white/[0.11]"
                  transition={{ duration: 0.2 }}
                />
              )}
              <span className={`relative z-10 flex flex-col items-center gap-1 text-[9px] font-medium ${active ? 'text-white' : 'text-white/45'}`}>
                <span className="relative">
                  <Icon size={19} strokeWidth={active ? 2 : 1.65} aria-hidden="true" />
                  {showBadge && (
                    <span className="absolute -right-2.5 -top-1.5 flex min-w-4 items-center justify-center rounded-full bg-[var(--hana-pink-light)] px-1 text-[8px] font-bold leading-4 text-white ring-2 ring-[var(--hana-blush-dark)]">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </span>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}