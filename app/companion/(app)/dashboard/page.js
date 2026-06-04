'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCompanionDashboardStats, getCompanionBookings, acceptBooking, rejectBooking } from '@/app/actions/bookings'
import {
  IndianRupee, Calendar, Clock, Star, ChevronRight,
  Check, X, TrendingUp, Shield, User,
  MapPin, Bell, ToggleLeft, ToggleRight, Loader2,
  CheckCircle2, BarChart3, XCircle, Percent,
} from 'lucide-react'
import Link from 'next/link'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDate() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' },
  }),
}

function TrustScoreRing({ score }) {
  const radius = 38
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="6" />
        <circle cx="48" cy="48" r={radius} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-[var(--hana-charcoal)]">{score}%</span>
        <span className="text-[10px] text-[var(--hana-muted)]">Trust</span>
      </div>
    </div>
  )
}

export default function CompanionDashboard() {
  const [isOnline, setIsOnline] = useState(true)
  const queryClient = useQueryClient()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['companion-dashboard-stats'],
    queryFn: getCompanionDashboardStats,
  })

  const { data: pendingBookings = [] } = useQuery({
    queryKey: ['companion-bookings', 'PENDING_ACCEPTANCE'],
    queryFn: () => getCompanionBookings({ status: 'PENDING_ACCEPTANCE' }),
  })

  const { data: confirmedBookings = [] } = useQuery({
    queryKey: ['companion-bookings', 'CONFIRMED'],
    queryFn: () => getCompanionBookings({ status: 'CONFIRMED' }),
  })

  const accept = useMutation({
    mutationFn: acceptBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companion-bookings'] })
      queryClient.invalidateQueries({ queryKey: ['companion-dashboard-stats'] })
    },
  })

  const reject = useMutation({
    mutationFn: ({ id, reason }) => rejectBooking(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companion-bookings'] })
      queryClient.invalidateQueries({ queryKey: ['companion-dashboard-stats'] })
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    )
  }

  const companionName = stats?.companion?.displayName || 'Companion'

  return (
    <div className="min-h-screen pb-8" style={{ backgroundColor: 'var(--hana-cream)' }}>
      {/* Header */}
      <header className="sticky top-0 z-30 border-b px-4 py-3 sm:px-6 bg-white" style={{ borderColor: 'var(--hana-subtle)' }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell size={20} style={{ color: 'var(--hana-muted)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--hana-charcoal)' }}>
              Companion Dashboard
            </span>
          </div>
          <button
            onClick={() => setIsOnline(!isOnline)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
            style={{
              backgroundColor: isOnline ? 'rgba(0, 230, 118, 0.1)' : 'rgba(158, 138, 146, 0.1)',
              color: isOnline ? 'var(--hana-online)' : 'var(--hana-muted)',
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isOnline ? 'var(--hana-online)' : 'var(--hana-muted)' }} />
            {isOnline ? 'Online' : 'Offline'}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Welcome */}
        <motion.section initial="hidden" animate="visible" variants={fadeUp}>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--hana-charcoal)' }}>
            {getGreeting()}, {companionName}
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--hana-muted)' }}>{formatDate()}</p>
        </motion.section>

        {/* Quick Stats */}
        <motion.section
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
          initial="hidden" animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
        >
          {[
            { label: 'Monthly Earnings', value: `₹${(stats?.monthlyEarnings ?? 0).toLocaleString('en-IN')}`, icon: IndianRupee, accent: 'var(--hana-sage)' },
            { label: 'Pending Requests', value: stats?.pendingRequests ?? 0, icon: Clock, accent: 'var(--hana-gold)' },
            { label: 'Upcoming Bookings', value: stats?.upcomingBookings ?? 0, icon: Calendar, accent: 'var(--hana-blush)' },
            { label: 'Average Rating', value: (stats?.averageRating ?? 0).toFixed(1), icon: Star, accent: 'var(--hana-gold)', sub: `${stats?.totalReviews ?? 0} reviews` },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <motion.div key={stat.label} variants={fadeUp} className="rounded-xl p-4 border bg-white" style={{ borderColor: 'var(--hana-subtle)' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.accent}15`, color: stat.accent }}>
                    <Icon size={16} />
                  </div>
                </div>
                <p className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--hana-charcoal)' }}>{stat.value}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--hana-muted)' }}>{stat.label}</p>
                {stat.sub && <p className="text-xs mt-0.5" style={{ color: 'var(--hana-muted)' }}>{stat.sub}</p>}
              </motion.div>
            )
          })}
        </motion.section>

        {/* Trust Score & Metrics */}
        <motion.section
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          initial="hidden" animate="visible" variants={fadeUp} custom={3}
        >
          {/* Trust Score Card */}
          <div className="rounded-xl border bg-white p-5 flex flex-col items-center" style={{ borderColor: 'var(--hana-subtle)' }}>
            <h3 className="text-sm font-semibold text-[var(--hana-charcoal)] mb-3">Trust Score</h3>
            <TrustScoreRing score={stats?.trustScore ?? 100} />
            <p className="text-xs text-[var(--hana-muted)] mt-2 text-center">Based on reliability, reviews & response time</p>
          </div>

          {/* Acceptance & Cancellation */}
          <div className="rounded-xl border bg-white p-5 space-y-4" style={{ borderColor: 'var(--hana-subtle)' }}>
            <h3 className="text-sm font-semibold text-[var(--hana-charcoal)]">Performance</h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[var(--hana-muted)] flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Acceptance Rate</span>
                  <span className="text-sm font-bold text-emerald-600">{(stats?.acceptanceRate ?? 100).toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${stats?.acceptanceRate ?? 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[var(--hana-muted)] flex items-center gap-1"><XCircle className="w-3 h-3 text-red-400" /> Cancellation Rate</span>
                  <span className="text-sm font-bold text-red-500">{(stats?.cancellationRate ?? 0).toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-red-400 rounded-full transition-all duration-700" style={{ width: `${stats?.cancellationRate ?? 0}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[var(--hana-muted)] flex items-center gap-1"><BarChart3 className="w-3 h-3 text-blue-500" /> Completed</span>
                  <span className="text-sm font-bold text-blue-600">{stats?.completedBookings ?? 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="rounded-xl border bg-white p-5 space-y-3" style={{ borderColor: 'var(--hana-subtle)' }}>
            <h3 className="text-sm font-semibold text-[var(--hana-charcoal)]">Quick Actions</h3>
            {[
              { label: 'View All Bookings', href: '/companion/bookings', icon: Calendar },
              { label: 'Earnings Report', href: '/companion/earnings', icon: IndianRupee },
              { label: 'Edit Profile', href: '/companion/profile', icon: User },
            ].map(link => {
              const Icon = link.icon
              return (
                <Link key={link.href} href={link.href}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:border-pink-200 transition-colors group"
                  style={{ borderColor: 'var(--hana-subtle)' }}>
                  <div className="w-8 h-8 rounded-lg bg-[var(--hana-ivory)] flex items-center justify-center text-[var(--hana-ash)] group-hover:text-pink-500 transition-colors">
                    <Icon size={14} />
                  </div>
                  <span className="text-sm font-medium text-[var(--hana-ash)] group-hover:text-[var(--hana-charcoal)] transition-colors flex-1">{link.label}</span>
                  <ChevronRight size={14} className="text-[var(--hana-subtle)]" />
                </Link>
              )
            })}
          </div>
        </motion.section>

        {/* Two columns: Upcoming + Pending */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
          {/* Upcoming Bookings */}
          <motion.section
            className="lg:col-span-3 rounded-xl border p-4 sm:p-5 bg-white"
            style={{ borderColor: 'var(--hana-subtle)' }}
            initial="hidden" animate="visible" variants={fadeUp} custom={4}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold" style={{ color: 'var(--hana-charcoal)' }}>Upcoming Bookings</h2>
              <Link href="/companion/bookings" className="text-xs font-medium flex items-center gap-0.5" style={{ color: 'var(--hana-blush-dark)' }}>
                View all <ChevronRight size={12} />
              </Link>
            </div>
            <div className="space-y-3">
              {confirmedBookings.length === 0 && (
                <p className="text-sm text-[var(--hana-muted)] text-center py-8">No upcoming bookings</p>
              )}
              {confirmedBookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex items-start gap-3 p-3 rounded-lg border transition-colors hover:border-pink-200" style={{ borderColor: 'var(--hana-subtle)' }}>
                  <div className="w-1 self-stretch rounded-full shrink-0 bg-emerald-400" />
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-xs font-semibold text-pink-600 shrink-0">
                    {booking.client?.name?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--hana-charcoal)' }}>{booking.client?.name || 'Unknown'}</p>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Confirmed</span>
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--hana-muted)' }}>{booking.activityType}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs flex items-center gap-1" style={{ color: 'var(--hana-ash)' }}>
                        <Calendar size={11} /> {new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </span>
                      <span className="text-xs flex items-center gap-1" style={{ color: 'var(--hana-ash)' }}>
                        <Clock size={11} /> {booking.startTime} - {booking.endTime}
                      </span>
                      <span className="text-xs font-semibold" style={{ color: 'var(--hana-charcoal)' }}>
                        ₹{booking.totalAmount?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Pending Requests */}
          <motion.section
            className="lg:col-span-2 rounded-xl border p-4 sm:p-5 bg-white"
            style={{ borderColor: 'var(--hana-subtle)' }}
            initial="hidden" animate="visible" variants={fadeUp} custom={5}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold" style={{ color: 'var(--hana-charcoal)' }}>Pending Requests</h2>
              {pendingBookings.length > 0 && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(255, 107, 138, 0.1)', color: 'var(--hana-blush-dark)' }}>
                  {pendingBookings.length} new
                </span>
              )}
            </div>
            <div className="space-y-3">
              {pendingBookings.length === 0 && (
                <p className="text-sm text-[var(--hana-muted)] text-center py-8">No pending requests</p>
              )}
              {pendingBookings.slice(0, 5).map((request) => (
                <div key={request.id} className="p-3 rounded-lg border" style={{ borderColor: 'var(--hana-subtle)' }}>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-xs font-semibold text-pink-600">
                      {request.client?.name?.[0] || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--hana-charcoal)' }}>{request.client?.name || 'Unknown'}</p>
                      <p className="text-xs" style={{ color: 'var(--hana-muted)' }}>{request.activityType}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1">
                      <Shield className="w-3 h-3 text-emerald-500" />
                      <span className="text-[10px] font-medium text-emerald-600">{request.client?.trustScore ?? 100}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs mb-3" style={{ color: 'var(--hana-ash)' }}>
                    <span className="flex items-center gap-1">
                      <Calendar size={11} /> {new Date(request.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {request.durationHours}h
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold" style={{ color: 'var(--hana-charcoal)' }}>
                      ₹{request.totalAmount?.toLocaleString('en-IN')}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => reject.mutate({ id: request.id, reason: 'Not available' })}
                        disabled={reject.isPending}
                        className="w-8 h-8 rounded-full flex items-center justify-center border transition-colors hover:bg-red-50 disabled:opacity-50"
                        style={{ borderColor: 'var(--hana-subtle)' }}
                      >
                        <X size={14} style={{ color: 'var(--hana-blush-dark)' }} />
                      </button>
                      <button
                        onClick={() => accept.mutate(request.id)}
                        disabled={accept.isPending}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                        style={{ backgroundColor: 'var(--hana-sage)' }}
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  )
}
