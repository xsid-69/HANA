'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useAuthStore } from '@/lib/auth-store'
import { signOut } from 'next-auth/react'
import {
  User, Camera, Edit3, Star, MapPin, Clock, TrendingUp,
  Shield, Eye, Settings, LogOut, ChevronRight, Languages,
  Calendar, Award, BarChart3, Bell, CreditCard, HelpCircle,
} from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
}

const PROFILE_STATS = [
  { label: 'Total Bookings', value: '48', icon: Calendar },
  { label: 'Avg Rating', value: '4.95', icon: Star },
  { label: 'Response Rate', value: '98%', icon: Clock },
  { label: 'Profile Views', value: '1.2k', icon: Eye },
]

const MENU_SECTIONS = [
  {
    title: 'Profile Management',
    items: [
      { label: 'Edit Profile', icon: Edit3, href: '#', desc: 'Update bio, photos, and experiences' },
      { label: 'Availability Settings', icon: Clock, href: '/companion/calendar', desc: 'Manage your schedule' },
      { label: 'Pricing & Services', icon: CreditCard, href: '#', desc: 'Hourly rate and minimum hours' },
      { label: 'Verification', icon: Shield, href: '#', desc: 'ID and background check status', badge: 'Verified' },
    ],
  },
  {
    title: 'Performance',
    items: [
      { label: 'Analytics', icon: BarChart3, href: '/companion/earnings', desc: 'Earnings and growth metrics' },
      { label: 'Reviews & Ratings', icon: Star, href: '#', desc: 'View and respond to feedback' },
      { label: 'Growth Tips', icon: TrendingUp, href: '#', desc: 'Improve your profile ranking' },
    ],
  },
  {
    title: 'Settings',
    items: [
      { label: 'Notifications', icon: Bell, href: '#', desc: 'Booking alerts and reminders' },
      { label: 'Account Settings', icon: Settings, href: '#', desc: 'Email, password, and privacy' },
      { label: 'Help & Support', icon: HelpCircle, href: '#', desc: 'FAQs and contact support' },
    ],
  },
]

export default function CompanionProfilePage() {
  const { data: session } = useSession()
  const { user: jwtUser } = useAuthStore()
  const user = jwtUser || session?.user

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-4xl">
      {/* Profile Header */}
      <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden ring-2 ring-gray-100">
              {user?.image ? (
                <img src={user.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[var(--hana-blush)] to-[var(--hana-blush-dark)] flex items-center justify-center text-2xl font-bold text-white">
                  {user?.name?.[0] || 'C'}
                </div>
              )}
            </div>
            <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-lg bg-[var(--hana-charcoal)] flex items-center justify-center shadow-md">
              <Camera className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-xl md:text-2xl font-bold text-[var(--hana-charcoal)]">
                {user?.name || 'Companion'}
              </h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold rounded-full border border-emerald-100">
                <Shield className="w-3 h-3" /> Verified
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1.5 text-sm text-[var(--hana-muted)]">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Nagpur, Dharampeth</span>
              <span className="flex items-center gap-1"><Languages className="w-3.5 h-3.5" /> English, Hindi, Marathi</span>
            </div>
            <p className="text-sm text-[var(--hana-ash)] mt-2 max-w-xl leading-relaxed">
              Software engineer who loves coding by day and exploring Nagpur's cafe scene by night.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 shrink-0">
            <Link href="#" className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-sm font-medium text-[var(--hana-charcoal)] hover:bg-gray-100 transition-colors flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> Preview
            </Link>
            <Link href="#" className="px-4 py-2 rounded-xl bg-[var(--hana-charcoal)] text-sm font-medium text-white hover:bg-[var(--hana-ash)] transition-colors flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-gray-100">
          {PROFILE_STATS.map(stat => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="text-center p-3 rounded-xl bg-gray-50">
                <Icon className="w-4 h-4 text-[var(--hana-muted)] mx-auto mb-1.5" />
                <div className="text-lg font-bold text-[var(--hana-charcoal)] font-heading">{stat.value}</div>
                <div className="text-[11px] text-[var(--hana-muted)]">{stat.label}</div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Menu Sections */}
      {MENU_SECTIONS.map(section => (
        <motion.div key={section.title} variants={itemVariants} className="mt-5">
          <h2 className="text-xs font-semibold text-[var(--hana-muted)] uppercase tracking-wider mb-2 px-1">{section.title}</h2>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
            {section.items.map(item => {
              const Icon = item.icon
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                    <Icon className="w-4 h-4 text-[var(--hana-ash)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--hana-charcoal)]">{item.label}</span>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-bold rounded-full">{item.badge}</span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--hana-muted)] mt-0.5">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </Link>
              )
            })}
          </div>
        </motion.div>
      ))}

      {/* Logout */}
      <motion.div variants={itemVariants} className="mt-5 mb-8">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-4 px-5 py-4 bg-white rounded-2xl border border-gray-100 hover:bg-red-50 hover:border-red-100 transition-colors group"
        >
          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
            <LogOut className="w-4 h-4 text-red-500" />
          </div>
          <span className="text-sm font-medium text-red-600">Sign Out</span>
        </button>
      </motion.div>
    </motion.div>
  )
}
