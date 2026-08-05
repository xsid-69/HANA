'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  CalendarDays,
  CalendarRange,
  LayoutDashboard,
  MessageCircle,
  UserRound,
} from 'lucide-react'
import { useAuthStore } from '@/lib/auth-store'

const NAV_ITEMS = [
  { href: '/companion/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/companion/bookings', icon: CalendarRange, label: 'Bookings' },
  { href: '/companion/calendar', icon: CalendarDays, label: 'Calendar' },
  { href: '/companion/messages', icon: MessageCircle, label: 'Messages' },
  { href: '/companion/profile', icon: UserRound, label: 'Profile' },
]

export default function CompanionSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const jwtUser = useAuthStore((state) => state.user)
  const user = jwtUser || session?.user

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col overflow-hidden border-r border-white/[0.07] bg-[#121819] text-[#f3f1e9] shadow-[18px_0_55px_-40px_rgba(7,12,13,0.9)] md:flex">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_15%_0%,rgba(170,199,181,0.13),transparent_62%)]" aria-hidden="true" />

      <div className="relative px-5 pb-6 pt-6">
        <Link href="/companion/dashboard" className="group flex min-h-12 items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#abc6b5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#121819]">
          <span className="flex size-10 items-center justify-center rounded-[14px] bg-[#dce7dc] font-heading text-base font-bold text-[#18201f] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_10px_28px_-16px_rgba(181,208,190,0.8)] transition-colors group-hover:bg-[#edf3ea]">
            H
          </span>
          <span className="min-w-0">
            <span className="block font-heading text-lg font-semibold tracking-[-0.035em] text-[#f7f5ee]">Hana</span>
            <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.16em] text-[#81918c]">Companion desk</span>
          </span>
        </Link>
      </div>
      <nav className="relative flex-1 px-3" aria-label="Companion navigation">
        <div className="mx-2 mb-5 h-px bg-white/[0.07]" />
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#687873]">Workspace</p>
        <div className="space-y-1.5">
          {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`)
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className="group relative block min-h-12 overflow-hidden rounded-[14px] outline-none focus-visible:ring-2 focus-visible:ring-[#abc6b5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#121819]"
              >
                {active && (
                  <motion.span
                    layoutId="companion-sidebar-indicator"
                    className="absolute inset-0 rounded-[14px] bg-[#e8eee7] shadow-[0_10px_32px_-18px_rgba(190,214,197,0.55)]"
                    transition={{ type: 'spring', stiffness: 430, damping: 34 }}
                  />
                )}
                <span className={`relative flex min-h-12 items-center gap-3 px-3.5 text-sm transition-colors duration-200 ${active ? 'text-[#18201f]' : 'text-[#93a19c] group-hover:bg-white/[0.045] group-hover:text-[#f3f1e9]'}`}>
                  <span className={`flex size-8 items-center justify-center rounded-[10px] transition-colors ${active ? 'bg-[#cbdccc] text-[#24322e]' : 'bg-white/[0.045] text-[#7f918b] group-hover:bg-white/[0.08] group-hover:text-[#c7d4cf]'}`}>
                    <Icon size={17} strokeWidth={active ? 2.1 : 1.7} aria-hidden="true" />
                  </span>
                  <span className={active ? 'font-semibold tracking-[-0.01em]' : 'font-medium'}>{label}</span>
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      <div className="relative p-3">
        <div className="mb-3 flex items-center gap-2 px-3 text-[10px] font-medium text-[#82918c]">
          <span className="relative flex size-2" aria-hidden="true">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#77b795] opacity-40" />
            <span className="relative inline-flex size-2 rounded-full bg-[#77b795]" />
          </span>
          Available for new requests
        </div>
        <Link
          href="/companion/profile"
          className="group flex min-h-[66px] items-center gap-3 rounded-[17px] border border-white/[0.08] bg-white/[0.045] p-3 outline-none transition-colors hover:border-white/[0.13] hover:bg-white/[0.07] focus-visible:ring-2 focus-visible:ring-[#abc6b5]"
        >
          <span className="relative size-10 shrink-0 overflow-hidden rounded-[13px] bg-[#273331] ring-1 ring-white/[0.08]">
            {user?.image ? (
              <img src={user.image} alt={`${user.name || 'Companion'} profile`} className="size-full object-cover" />
            ) : (
              <span className="flex size-full items-center justify-center text-sm font-semibold text-[#e8eee7]">{user?.name?.[0] || '?'}</span>
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold text-[#f1efe8]">{user?.name || 'Companion'}</span>
            <span className="mt-0.5 block text-[11px] text-[#788883]">Manage profile</span>
          </span>
          <ArrowUpRight size={16} className="text-[#65756f] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#bed0c2]" aria-hidden="true" />
        </Link>
      </div>
    </aside>
  )
}
