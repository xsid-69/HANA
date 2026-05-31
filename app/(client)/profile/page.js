'use client'

import { useSession, signOut } from 'next-auth/react'
import { trpc } from '@/lib/trpc-client'
import BottomNav from '@/components/layout/BottomNav'
import TopNav from '@/components/layout/TopNav'
import { Heart, Calendar, Star, ChevronRight, LogOut, Bell, Shield, CreditCard, UserPlus, Settings } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const MENU_ITEMS = [
  { label: 'Saved Companions', icon: Heart, href: '/profile/saved', color: 'chip-blush' },
  { label: 'Booking History', icon: Calendar, href: '/bookings', color: 'chip-sage' },
  { label: 'Payment Methods', icon: CreditCard, href: '#', color: 'chip-gold' },
  { label: 'Privacy & Safety', icon: Shield, href: '#', color: 'chip-lavender' },
  { label: 'Notifications', icon: Bell, href: '#', color: 'chip-blush' },
  { label: 'Settings', icon: Settings, href: '#', color: 'chip-sage' },
  { label: 'Become a Companion', icon: UserPlus, href: '#', color: 'chip-gold' },
]

export default function ProfilePage() {
  const { data: session } = useSession()
  const { data: profile } = trpc.user.getProfile.useQuery(undefined, { retry: false })

  return (
    <div className="min-h-screen relative">
      <TopNav />

      {/* Mobile Header */}
      <div className="md:hidden bg-hana-gradient-animated px-5 pt-14 pb-20 rounded-b-[2rem] relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.1),transparent_60%)] pointer-events-none" />
        <div className="flex flex-col items-center relative z-10">
          <div className="w-24 h-24 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center border-3 border-white/30 shadow-lg">
            {session?.user?.image ? (
              <img src={session.user.image} alt="" className="w-24 h-24 rounded-full object-cover" />
            ) : (
              <span className="text-white text-3xl font-bold font-heading">{session?.user?.name?.[0] || '?'}</span>
            )}
          </div>
          <h1 className="mt-3 font-heading text-xl font-bold text-white">{session?.user?.name || 'User'}</h1>
          <p className="text-white/75 text-sm font-body">{session?.user?.email}</p>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="max-w-5xl mx-auto md:px-6 md:py-8 relative z-10">
        <div className="md:grid md:grid-cols-3 md:gap-8">
          {/* Desktop Profile Card */}
          <div className="hidden md:block">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-[var(--hana-warm-white)] rounded-[1.75rem] p-6 border border-[var(--hana-subtle)]/30 shadow-sm text-center sticky top-24 hover-glow transition-all"
            >
              <div className="w-28 h-28 rounded-full mx-auto bg-gradient-to-br from-[var(--hana-blush)]/25 to-[var(--hana-lavender)]/25 flex items-center justify-center border-4 border-[var(--hana-blush)]/20">
                {session?.user?.image ? (
                  <img src={session.user.image} alt="" className="w-28 h-28 rounded-full object-cover" />
                ) : (
                  <span className="text-[var(--hana-blush-dark)] text-4xl font-bold font-heading">{session?.user?.name?.[0] || '?'}</span>
                )}
              </div>
              <h1 className="mt-4 font-heading text-xl font-bold text-[var(--hana-charcoal)]">{session?.user?.name || 'User'}</h1>
              <p className="text-[var(--hana-muted)] text-sm font-body">{session?.user?.email}</p>

              <div className="grid grid-cols-3 divide-x divide-[var(--hana-subtle)]/30 mt-6 pt-5 border-t border-[var(--hana-subtle)]/30">
                <div className="text-center">
                  <div className="text-xl font-bold text-[var(--hana-charcoal)] font-body">{profile?._count?.bookingsAsClient || 0}</div>
                  <div className="text-xs text-[var(--hana-muted)] font-medium mt-0.5 font-body">Bookings</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-[var(--hana-charcoal)] font-body">{profile?._count?.savedCompanions || 0}</div>
                  <div className="text-xs text-[var(--hana-muted)] font-medium mt-0.5 font-body">Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-[var(--hana-charcoal)] font-body">{profile?._count?.reviewsWritten || 0}</div>
                  <div className="text-xs text-[var(--hana-muted)] font-medium mt-0.5 font-body">Reviews</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main content */}
          <div className="md:col-span-2">
            {/* Mobile Stats Card */}
            <div className="px-5 -mt-10 md:hidden">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-[var(--hana-warm-white)] rounded-2xl p-5 shadow-md border border-[var(--hana-subtle)]/20"
              >
                <div className="grid grid-cols-3 divide-x divide-[var(--hana-subtle)]/30">
                  <div className="text-center">
                    <div className="text-xl font-bold text-[var(--hana-charcoal)] font-body">{profile?._count?.bookingsAsClient || 0}</div>
                    <div className="text-xs text-[var(--hana-muted)] font-medium mt-0.5 font-body">Bookings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-[var(--hana-charcoal)] font-body">{profile?._count?.savedCompanions || 0}</div>
                    <div className="text-xs text-[var(--hana-muted)] font-medium mt-0.5 font-body">Saved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-[var(--hana-charcoal)] font-body">{profile?._count?.reviewsWritten || 0}</div>
                    <div className="text-xs text-[var(--hana-muted)] font-medium mt-0.5 font-body">Reviews</div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Menu */}
            <div className="px-5 md:px-0 mt-5">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-[var(--hana-warm-white)] rounded-[1.75rem] overflow-hidden border border-[var(--hana-subtle)]/20 shadow-sm"
              >
                {MENU_ITEMS.map((item, i) => {
                  const Icon = item.icon
                  return (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.04 }}
                    >
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 px-5 py-4 border-b border-[var(--hana-subtle)]/15 last:border-0 hover:bg-[var(--hana-ivory)] transition-colors btn-press"
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="flex-1 text-sm font-medium text-[var(--hana-ash)] font-body">{item.label}</span>
                        <ChevronRight className="w-4 h-4 text-[var(--hana-subtle)]" />
                      </Link>
                    </motion.div>
                  )
                })}
              </motion.div>
            </div>

            {/* Logout */}
            <div className="px-5 md:px-0 mt-4 pb-24 md:pb-0">
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full flex items-center gap-3 px-5 py-4 bg-[var(--hana-warm-white)] rounded-2xl border border-[var(--hana-subtle)]/20 shadow-sm hover:bg-[var(--hana-coral)]/5 hover:border-[var(--hana-coral)]/20 transition-all btn-press"
              >
                <div className="w-9 h-9 rounded-xl bg-[var(--hana-coral)]/10 flex items-center justify-center">
                  <LogOut className="w-4 h-4 text-[var(--hana-coral)]" />
                </div>
                <span className="text-sm font-medium text-[var(--hana-coral)] font-body">Log Out</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
