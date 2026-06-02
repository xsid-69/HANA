'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useAuthStore } from '@/lib/auth-store'
import { LayoutDashboard, CalendarCheck, Calendar, MessageCircle, User, Heart } from 'lucide-react'
import { motion } from 'framer-motion'

const NAV_ITEMS = [
  { href: '/companion/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/companion/bookings', icon: CalendarCheck, label: 'Bookings' },
  { href: '/companion/calendar', icon: Calendar, label: 'Calendar' },
  { href: '/companion/messages', icon: MessageCircle, label: 'Messages' },
  { href: '/companion/profile', icon: User, label: 'Profile' },
]

export default function CompanionSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { user: jwtUser } = useAuthStore()
  const user = jwtUser || session?.user

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[240px] flex-col bg-white border-r z-50" style={{ borderColor: 'var(--hana-subtle)' }}>
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-6">
        <Link href="/companion/dashboard" className="flex items-center gap-2.5 group">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm"
            style={{ background: 'linear-gradient(135deg, var(--hana-blush), var(--hana-blush-dark))' }}
          >
            <Heart className="w-4.5 h-4.5 text-white fill-white/30" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-lg tracking-tight" style={{ fontFamily: 'var(--font-outfit)', color: 'var(--hana-charcoal)' }}>
              Hana
            </span>
            <span
              className="text-[10px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded"
              style={{ background: 'var(--hana-subtle)', color: 'var(--hana-blush-dark)', fontFamily: 'var(--font-inter)' }}
            >
              Pro
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link key={item.href} href={item.href} className="block">
              <motion.div
                className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-200"
                whileTap={{ scale: 0.98 }}
                style={{
                  background: isActive ? 'var(--hana-subtle)' : 'transparent',
                }}
              >
                {/* Active left accent bar */}
                {isActive && (
                  <motion.div
                    layoutId="companion-sidebar-accent"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                    style={{ background: 'var(--hana-blush-dark)' }}
                    transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                  />
                )}

                <Icon
                  className="w-5 h-5 shrink-0 transition-colors duration-200"
                  style={{ color: isActive ? 'var(--hana-blush-dark)' : 'var(--hana-muted)' }}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                <span
                  className="text-sm transition-colors duration-200"
                  style={{
                    fontFamily: 'var(--font-inter)',
                    fontWeight: isActive ? 600 : 450,
                    color: isActive ? 'var(--hana-charcoal)' : 'var(--hana-ash)',
                  }}
                >
                  {item.label}
                </span>
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="px-4 py-4 border-t" style={{ borderColor: 'var(--hana-subtle)' }}>
        <div className="flex items-center gap-3 px-2">
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full overflow-hidden ring-2" style={{ ringColor: 'var(--hana-subtle)' }}>
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
            {/* Online indicator */}
            <span
              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
              style={{ background: '#22c55e' }}
              aria-label="Online"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-medium truncate"
              style={{ color: 'var(--hana-charcoal)', fontFamily: 'var(--font-inter)' }}
            >
              {user?.name || 'Companion'}
            </p>
            <p className="text-xs flex items-center gap-1" style={{ color: 'var(--hana-muted)' }}>
              Online
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
