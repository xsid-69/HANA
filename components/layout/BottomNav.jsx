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
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="bg-white/95 backdrop-blur-lg border-t border-pink-100/50 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-around h-[72px] max-w-md mx-auto px-2 pt-2 pb-3">
          {visibleItems.map(item => {
            const isActive = pathname === item.href || (item.href === '/discover' && pathname.startsWith('/companion'))
            const Icon = item.icon
            const showBadge = item.href === '/messages' && unreadCount > 0
            return (
              <Link key={item.href} href={item.href} className="flex-1 flex justify-center">
                <motion.div
                  className="relative flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-2xl"
                  whileTap={{ scale: 0.88 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="bottom-nav-pill"
                      className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl shadow-lg shadow-pink-500/20"
                      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                    />
                  )}
                  <div className="relative">
                    <Icon
                      className={`w-[22px] h-[22px] relative z-10 transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-400'}`}
                      strokeWidth={isActive ? 2.5 : 1.8}
                    />
                    {showBadge && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full z-20 shadow-sm border-2 border-white"
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </motion.span>
                    )}
                  </div>
                  <span className={`text-[10px] font-medium tracking-wide relative z-10 transition-colors duration-300 ${isActive ? 'text-white font-semibold' : 'text-gray-400'}`}>
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
