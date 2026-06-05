'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CalendarCheck, Calendar, MessageCircle, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { getUnreadCount } from '@/app/actions/messages'

const NAV_ITEMS = [
  { href: '/companion/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/companion/bookings', icon: CalendarCheck, label: 'Bookings' },
  { href: '/companion/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/companion/messages', icon: MessageCircle, label: 'Messages' },
  { href: '/companion/profile', icon: User, label: 'Profile' },
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="bg-white/98 backdrop-blur-md border-t shadow-[0_-2px_12px_rgba(0,0,0,0.04)]" style={{ borderColor: 'var(--hana-subtle)' }}>
        <div className="flex items-center justify-around h-[68px] max-w-md mx-auto px-1">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const showBadge = item.href === '/companion/messages' && unreadCount > 0

            return (
              <Link key={item.href} href={item.href} className="flex-1 flex justify-center">
                <motion.div
                  className="relative flex flex-col items-center justify-center gap-0.5 px-2 py-2"
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="companion-bottom-nav-indicator"
                      className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-full"
                      style={{ background: 'var(--hana-blush-dark)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    />
                  )}

                  <div className="relative">
                    <Icon
                      className="w-[21px] h-[21px] transition-colors duration-200"
                      style={{ color: isActive ? 'var(--hana-blush-dark)' : 'var(--hana-muted)' }}
                      strokeWidth={isActive ? 2.3 : 1.8}
                    />
                    {showBadge && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-0.5 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full z-20 shadow-sm border-2 border-white"
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </motion.span>
                    )}
                  </div>
                  <span
                    className="text-[10px] tracking-wide transition-colors duration-200"
                    style={{
                      fontFamily: 'var(--font-inter)',
                      fontWeight: isActive ? 600 : 450,
                      color: isActive ? 'var(--hana-blush-dark)' : 'var(--hana-muted)',
                    }}
                  >
                    {item.label}
                  </span>
                </motion.div>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
