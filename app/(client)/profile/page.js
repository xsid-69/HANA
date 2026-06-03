'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { getProfile } from '@/app/actions/users'
import { useAuthStore } from '@/lib/auth-store'
import BottomNav from '@/components/layout/BottomNav'
import TopNav from '@/components/layout/TopNav'
import {
  Heart, Calendar, Star, ChevronRight, LogOut, Bell,
  Shield, CreditCard, UserPlus, Settings, MapPin, Edit3,
  Camera, CheckCircle2, Clock, Bookmark, MessageCircle,
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

const MENU_SECTIONS = [
  {
    title: 'Activity',
    items: [
      { label: 'Saved Companions', icon: Bookmark, href: '/profile/saved', chip: 'chip-blush' },
      { label: 'Booking History', icon: Calendar, href: '/bookings', chip: 'chip-sage' },
      { label: 'My Reviews', icon: Star, href: '#', chip: 'chip-gold' },
      { label: 'Messages', icon: MessageCircle, href: '/messages', chip: 'chip-lavender' },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Payment Methods', icon: CreditCard, href: '#', chip: 'chip-gold' },
      { label: 'Notifications', icon: Bell, href: '#', chip: 'chip-blush' },
      { label: 'Privacy & Safety', icon: Shield, href: '#', chip: 'chip-lavender' },
      { label: 'Settings', icon: Settings, href: '#', chip: 'chip-sage' },
    ],
  },
  {
    title: 'More',
    items: [
      { label: 'Become a Companion', icon: UserPlus, href: '#', chip: 'chip-fuchsia' },
    ],
  },
]

function StatCard({ value, label }) {
  return (
    <div className="text-center px-2">
      <div className="text-2xl font-bold text-[var(--hana-charcoal)] font-heading">{value}</div>
      <div className="text-xs text-[var(--hana-muted)] font-medium mt-0.5">{label}</div>
    </div>
  )
}

function Avatar({ user, size = 'md' }) {
  const sizes = { sm: 'w-12 h-12 text-lg', md: 'w-24 h-24 text-3xl', lg: 'w-28 h-28 text-4xl' }
  return (
    <div className={`${sizes[size]} rounded-full overflow-hidden bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center font-bold text-white font-heading shadow-lg`}>
      {user?.image ? (
        <img src={user.image} alt={user.name || ''} className="w-full h-full object-cover" />
      ) : (
        <span>{user?.name?.[0]?.toUpperCase() || '?'}</span>
      )}
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const { user: jwtUser, logout, fetchMe } = useAuthStore()
  const { data: profile, isLoading } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => getProfile(),
    retry: false,
  })

  useEffect(() => { fetchMe() }, [fetchMe])

  const user = jwtUser || profile
  const name = user?.name || 'User'
  const email = user?.email || ''
  const city = profile?.city
  const bio = profile?.bio
  const role = profile?.role || user?.role || 'CLIENT'
  const joinedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null

  const handleLogout = async () => {
    await logout()
    try { await signOut({ redirect: false }) } catch {}
    router.push('/login')
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 14 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  }

  return (
    <div className="min-h-screen relative">
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-8%] right-[-8%] w-[400px] h-[400px] bg-pink-300/15 rounded-full blur-[90px] animate-pulse-soft" />
        <div className="absolute bottom-[10%] left-[-8%] w-[350px] h-[350px] bg-purple-200/12 rounded-full blur-[80px] animate-float-slow" />
      </div>

      <TopNav />

      {/* ===== MOBILE ===== */}
      <div className="md:hidden relative z-10">
        {/* Hero header */}
        <div className="bg-hana-gradient-animated px-5 pt-14 pb-24 rounded-b-[2.5rem] relative overflow-hidden shadow-xl shadow-pink-500/15">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.12),transparent_60%)] pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/8 rounded-full blur-2xl" />

          <div className="flex flex-col items-center relative z-10">
            <div className="relative">
              <Avatar user={user} size="md" />
              <button className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md border border-pink-100">
                <Camera className="w-3.5 h-3.5 text-pink-500" />
              </button>
            </div>
            <h1 className="mt-3 font-heading text-xl font-bold text-white">{name}</h1>
            <p className="text-white/75 text-sm">{email}</p>
            {city && (
              <div className="flex items-center gap-1 mt-1 text-white/65 text-xs">
                <MapPin className="w-3 h-3" /> {city}
              </div>
            )}
            <div className="flex items-center gap-1.5 mt-2 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full border border-white/15">
              <CheckCircle2 className="w-3 h-3 text-emerald-300" />
              <span className="text-white/90 text-xs font-medium capitalize">{role.toLowerCase()} Account</span>
            </div>
          </div>
        </div>

        {/* Stats card — overlaps header */}
        <div className="px-5 -mt-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-5 shadow-lg shadow-pink-200/20 border border-[var(--hana-subtle)]/30"
          >
            <div className="grid grid-cols-3 divide-x divide-[var(--hana-subtle)]/30">
              <StatCard value={profile?._count?.bookingsAsClient ?? 0} label="Bookings" />
              <StatCard value={profile?._count?.savedCompanions ?? 0} label="Saved" />
              <StatCard value={profile?._count?.reviewsWritten ?? 0} label="Reviews" />
            </div>
          </motion.div>
        </div>

        {/* Bio */}
        {bio && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mx-5 mt-4 p-4 bg-white rounded-2xl border border-[var(--hana-subtle)]/30 shadow-sm"
          >
            <p className="text-sm text-[var(--hana-ash)] leading-relaxed">{bio}</p>
          </motion.div>
        )}

        {/* Join date */}
        {joinedDate && (
          <div className="flex items-center gap-1.5 px-5 mt-3 text-xs text-[var(--hana-muted)]">
            <Clock className="w-3.5 h-3.5" /> Member since {joinedDate}
          </div>
        )}

        {/* Edit profile button */}
        <div className="px-5 mt-4">
          <button className="w-full flex items-center justify-center gap-2 py-3 border border-[var(--hana-subtle)]/50 rounded-2xl text-sm font-medium text-[var(--hana-ash)] bg-white hover:bg-[var(--hana-ivory)] transition-colors btn-press shadow-sm">
            <Edit3 className="w-4 h-4" /> Edit Profile
          </button>
        </div>

        {/* Menu sections */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="px-5 mt-5 space-y-4 pb-28">
          {MENU_SECTIONS.map(section => (
            <motion.div key={section.title} variants={itemVariants}>
              <p className="text-xs font-semibold text-[var(--hana-muted)] uppercase tracking-widest mb-2 px-1">{section.title}</p>
              <div className="bg-white rounded-2xl overflow-hidden border border-[var(--hana-subtle)]/25 shadow-sm">
                {section.items.map((item, i) => {
                  const Icon = item.icon
                  return (
                    <Link key={item.label} href={item.href}
                      className={`flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--hana-ivory)] transition-colors ${i < section.items.length - 1 ? 'border-b border-[var(--hana-subtle)]/15' : ''}`}>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${item.chip}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="flex-1 text-sm font-medium text-[var(--hana-ash)]">{item.label}</span>
                      <ChevronRight className="w-4 h-4 text-[var(--hana-subtle)]" />
                    </Link>
                  )
                })}
              </div>
            </motion.div>
          ))}

          {/* Logout */}
          <motion.button variants={itemVariants} onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-white rounded-2xl border border-red-100 shadow-sm hover:bg-red-50 transition-colors btn-press">
            <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
              <LogOut className="w-4 h-4 text-red-500" />
            </div>
            <span className="text-sm font-medium text-red-500">Log Out</span>
          </motion.button>
        </motion.div>
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden md:block relative z-10">
        <motion.div variants={containerVariants} initial="hidden" animate="visible"
          className="max-w-5xl mx-auto px-6 py-8">
          <div className="grid grid-cols-3 gap-8">

            {/* Left: profile card */}
            <motion.div variants={itemVariants} className="col-span-1 space-y-4">
              {/* Avatar card */}
              <div className="bg-white rounded-[1.75rem] p-6 border border-[var(--hana-subtle)]/30 shadow-sm text-center sticky top-24">
                <div className="relative inline-block">
                  <Avatar user={user} size="lg" />
                  <button className="absolute bottom-1 right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-pink-100 hover:bg-pink-50 transition-colors btn-press">
                    <Camera className="w-3.5 h-3.5 text-pink-500" />
                  </button>
                </div>

                <h1 className="mt-4 font-heading text-xl font-bold text-[var(--hana-charcoal)]">{name}</h1>
                <p className="text-[var(--hana-muted)] text-sm mt-0.5">{email}</p>

                {city && (
                  <div className="flex items-center justify-center gap-1 mt-1.5 text-[var(--hana-muted)] text-xs">
                    <MapPin className="w-3 h-3 text-pink-400" /> {city}
                  </div>
                )}

                <div className="flex items-center justify-center gap-1.5 mt-3 px-3 py-1.5 bg-[var(--hana-ivory)] rounded-full border border-[var(--hana-subtle)]/40 w-fit mx-auto">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[var(--hana-ash)] text-xs font-medium capitalize">{role.toLowerCase()} Account</span>
                </div>

                {joinedDate && (
                  <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-[var(--hana-muted)]">
                    <Clock className="w-3 h-3" /> Since {joinedDate}
                  </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 divide-x divide-[var(--hana-subtle)]/30 mt-5 pt-5 border-t border-[var(--hana-subtle)]/30">
                  <StatCard value={profile?._count?.bookingsAsClient ?? 0} label="Bookings" />
                  <StatCard value={profile?._count?.savedCompanions ?? 0} label="Saved" />
                  <StatCard value={profile?._count?.reviewsWritten ?? 0} label="Reviews" />
                </div>

                <button className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 border border-[var(--hana-subtle)]/50 rounded-xl text-sm font-medium text-[var(--hana-ash)] hover:bg-[var(--hana-ivory)] transition-colors btn-press">
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </button>
              </div>
            </motion.div>

            {/* Right: details + menu */}
            <div className="col-span-2 space-y-5">

              {/* About card */}
              <motion.div variants={itemVariants}
                className="bg-white rounded-[1.75rem] p-6 border border-[var(--hana-subtle)]/30 shadow-sm">
                <h2 className="text-xs font-bold text-[var(--hana-blush-dark)] uppercase tracking-widest mb-3">About</h2>
                {bio ? (
                  <p className="text-[var(--hana-ash)] leading-relaxed text-sm">{bio}</p>
                ) : (
                  <p className="text-[var(--hana-muted)] text-sm italic">No bio yet. Edit your profile to add one.</p>
                )}
              </motion.div>

              {/* Activity summary */}
              <motion.div variants={itemVariants}
                className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Total Bookings', value: profile?._count?.bookingsAsClient ?? 0, icon: Calendar, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                  { label: 'Saved Companions', value: profile?._count?.savedCompanions ?? 0, icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50', border: 'border-pink-100' },
                  { label: 'Reviews Written', value: profile?._count?.reviewsWritten ?? 0, icon: Star, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
                ].map(stat => {
                  const Icon = stat.icon
                  return (
                    <div key={stat.label} className={`bg-white rounded-2xl p-5 border ${stat.border} shadow-sm flex flex-col gap-3`}>
                      <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-[var(--hana-charcoal)] font-heading">{stat.value}</div>
                        <div className="text-xs text-[var(--hana-muted)] mt-0.5">{stat.label}</div>
                      </div>
                    </div>
                  )
                })}
              </motion.div>

              {/* Menu sections */}
              {MENU_SECTIONS.map(section => (
                <motion.div key={section.title} variants={itemVariants}>
                  <p className="text-xs font-semibold text-[var(--hana-muted)] uppercase tracking-widest mb-2 px-1">{section.title}</p>
                  <div className="bg-white rounded-[1.75rem] overflow-hidden border border-[var(--hana-subtle)]/25 shadow-sm">
                    {section.items.map((item, i) => {
                      const Icon = item.icon
                      return (
                        <Link key={item.label} href={item.href}
                          className={`flex items-center gap-3 px-5 py-4 hover:bg-[var(--hana-ivory)] transition-colors group ${i < section.items.length - 1 ? 'border-b border-[var(--hana-subtle)]/15' : ''}`}>
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.chip}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="flex-1 text-sm font-medium text-[var(--hana-ash)]">{item.label}</span>
                          <ChevronRight className="w-4 h-4 text-[var(--hana-subtle)] group-hover:text-[var(--hana-ash)] transition-colors" />
                        </Link>
                      )
                    })}
                  </div>
                </motion.div>
              ))}

              {/* Logout */}
              <motion.button variants={itemVariants} onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-4 bg-white rounded-2xl border border-red-100 shadow-sm hover:bg-red-50 transition-colors btn-press">
                <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                  <LogOut className="w-4 h-4 text-red-500" />
                </div>
                <span className="text-sm font-medium text-red-500">Log Out</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  )
}
