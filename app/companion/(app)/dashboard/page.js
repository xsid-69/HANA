'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCompanionDashboardStats, getCompanionBookings, acceptBooking, rejectBooking } from '@/app/actions/bookings'
import {
  IndianRupee, Calendar, Clock, Star, ChevronRight,
  Check, X, TrendingUp, Shield, User,
  MapPin, Bell, Loader2, Sparkles,
  CheckCircle2, BarChart3, XCircle, MessageCircle,
  Zap, ArrowUpRight,
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
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i = 0) => ({
    opacity: 1, scale: 1,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

function TrustScoreRing({ score }) {
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
  const bgColor = score >= 80 ? '#d1fae5' : score >= 50 ? '#fef3c7' : '#fee2e2'

  return (
    <motion.div
      className="relative w-28 h-28 flex items-center justify-center"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
    >
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke={bgColor} strokeWidth="7" />
        <motion.circle
          cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={circumference}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-2xl font-bold text-[var(--hana-charcoal)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {score}
        </motion.span>
        <span className="text-[10px] text-[var(--hana-muted)] font-medium">Trust Score</span>
      </div>
    </motion.div>
  )
}

function StatCard({ label, value, icon: Icon, accent, sub, index }) {
  return (
    <motion.div
      variants={scaleIn}
      custom={index}
      whileHover={{ y: -4, scale: 1.02, boxShadow: '0 12px 24px -4px rgba(0,0,0,0.08)' }}
      whileTap={{ scale: 0.98 }}
      className="rounded-2xl p-5 border bg-white cursor-default select-none transition-colors"
      style={{ borderColor: 'var(--hana-subtle)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <motion.div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${accent}18`, color: accent }}
          whileHover={{ rotate: 8, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Icon size={18} />
        </motion.div>
        <ArrowUpRight size={14} className="text-[var(--hana-subtle)]" />
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-[var(--hana-charcoal)] tracking-tight">{value}</p>
      <p className="text-xs mt-1 text-[var(--hana-muted)] font-medium">{label}</p>
      {sub && <p className="text-[10px] mt-0.5 text-[var(--hana-muted)]">{sub}</p>}
    </motion.div>
  )
}

function PendingRequestCard({ request, onAccept, onReject, acceptPending, rejectPending }) {
  const [showActions, setShowActions] = useState(true)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.01, borderColor: 'rgba(236, 72, 153, 0.3)' }}
      className="p-4 rounded-xl border bg-white/80 backdrop-blur-sm transition-all"
      style={{ borderColor: 'var(--hana-subtle)' }}
    >
      <div className="flex items-center gap-3 mb-3">
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-sm font-bold text-pink-600 shrink-0"
        >
          {request.client?.name?.[0] || '?'}
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--hana-charcoal)] truncate">{request.client?.name || 'Unknown'}</p>
          <p className="text-xs text-[var(--hana-muted)]">{request.activityType}</p>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-lg">
          <Shield className="w-3 h-3 text-emerald-500" />
          <span className="text-[10px] font-bold text-emerald-600">{request.client?.trustScore ?? 100}%</span>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-[var(--hana-ash)] mb-3">
        <span className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg">
          <Calendar size={12} /> {new Date(request.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </span>
        <span className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg">
          <Clock size={12} /> {request.durationHours}h
        </span>
        <span className="ml-auto text-sm font-bold text-[var(--hana-charcoal)]">
          ₹{request.totalAmount?.toLocaleString('en-IN')}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReject}
          disabled={rejectPending}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-2 border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 disabled:opacity-50 transition-colors"
        >
          <X size={15} /> Decline
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 6px 20px rgba(16, 185, 129, 0.3)' }}
          whileTap={{ scale: 0.95 }}
          onClick={onAccept}
          disabled={acceptPending}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600 disabled:opacity-50 transition-colors shadow-md shadow-emerald-500/20"
        >
          {acceptPending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
          Accept
        </motion.button>
      </div>
    </motion.div>
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
    refetchInterval: 15000,
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
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
        >
          <Loader2 className="w-8 h-8 text-pink-500" />
        </motion.div>
        <p className="text-sm text-[var(--hana-muted)]">Loading your dashboard...</p>
      </div>
    )
  }

  const companionName = stats?.companion?.displayName || 'Companion'

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <motion.h1
            className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--hana-charcoal)]"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {getGreeting()}, <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">{companionName}</span>
          </motion.h1>
          <motion.p
            className="mt-1 text-sm text-[var(--hana-muted)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {formatDate()}
          </motion.p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOnline(!isOnline)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
            isOnline
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-gray-50 border-gray-200 text-gray-500'
          }`}
        >
          <motion.span
            className="w-2.5 h-2.5 rounded-full"
            animate={{
              backgroundColor: isOnline ? '#10b981' : '#9ca3af',
              scale: isOnline ? [1, 1.3, 1] : 1,
            }}
            transition={{ scale: { repeat: isOnline ? Infinity : 0, duration: 2 } }}
          />
          {isOnline ? 'Online' : 'Offline'}
        </motion.button>
      </motion.header>

      {/* Quick Stats */}
      <motion.section
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        initial="hidden" animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      >
        <StatCard index={0} label="Monthly Earnings" value={`₹${(stats?.monthlyEarnings ?? 0).toLocaleString('en-IN')}`} icon={IndianRupee} accent="#4ade80" />
        <StatCard index={1} label="Pending Requests" value={stats?.pendingRequests ?? 0} icon={Zap} accent="#f59e0b" />
        <StatCard index={2} label="Upcoming Bookings" value={stats?.upcomingBookings ?? 0} icon={Calendar} accent="#ec4899" />
        <StatCard index={3} label="Average Rating" value={(stats?.averageRating ?? 0).toFixed(1)} icon={Star} accent="#f59e0b" sub={`${stats?.totalReviews ?? 0} reviews`} />
      </motion.section>

      {/* Trust Score & Performance */}
      <motion.section
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        initial="hidden" animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } } }}
      >
        {/* Trust Score */}
        <motion.div
          variants={fadeUp}
          whileHover={{ y: -3 }}
          className="rounded-2xl border bg-white p-6 flex flex-col items-center transition-shadow hover:shadow-lg"
          style={{ borderColor: 'var(--hana-subtle)' }}
        >
          <TrustScoreRing score={stats?.trustScore ?? 100} />
          <p className="text-xs text-[var(--hana-muted)] mt-3 text-center max-w-[180px]">
            Based on reliability, reviews & response time
          </p>
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          variants={fadeUp}
          whileHover={{ y: -3 }}
          className="rounded-2xl border bg-white p-6 space-y-5 transition-shadow hover:shadow-lg"
          style={{ borderColor: 'var(--hana-subtle)' }}
        >
          <h3 className="text-sm font-bold text-[var(--hana-charcoal)] flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[var(--hana-blush-dark)]" /> Performance
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-[var(--hana-muted)] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Acceptance Rate
                </span>
                <span className="text-sm font-bold text-emerald-600">{(stats?.acceptanceRate ?? 100).toFixed(0)}%</span>
              </div>
              <div className="h-2.5 bg-emerald-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats?.acceptanceRate ?? 100}%` }}
                  transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-[var(--hana-muted)] flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-red-400" /> Cancellation Rate
                </span>
                <span className="text-sm font-bold text-red-500">{(stats?.cancellationRate ?? 0).toFixed(0)}%</span>
              </div>
              <div className="h-2.5 bg-red-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-300 to-red-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats?.cancellationRate ?? 0}%` }}
                  transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
              <span className="text-xs text-[var(--hana-muted)] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Completed
              </span>
              <span className="text-lg font-bold text-blue-600">{stats?.completedBookings ?? 0}</span>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          variants={fadeUp}
          whileHover={{ y: -3 }}
          className="rounded-2xl border bg-white p-6 space-y-4 transition-shadow hover:shadow-lg"
          style={{ borderColor: 'var(--hana-subtle)' }}
        >
          <h3 className="text-sm font-bold text-[var(--hana-charcoal)] flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" /> Quick Actions
          </h3>
          <div className="space-y-2.5">
            {[
              { label: 'View All Bookings', href: '/companion/bookings', icon: Calendar, color: 'pink' },
              { label: 'Messages', href: '/companion/messages', icon: MessageCircle, color: 'blue' },
              { label: 'Earnings Report', href: '/companion/earnings', icon: IndianRupee, color: 'emerald' },
              { label: 'Edit Profile', href: '/companion/profile', icon: User, color: 'purple' },
            ].map((link, i) => {
              const Icon = link.icon
              return (
                <motion.div key={link.href} whileHover={{ x: 4, scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                  <Link href={link.href}
                    className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-pink-100 hover:bg-pink-50/40 transition-all group"
                  >
                    <div className={`w-9 h-9 rounded-xl bg-${link.color}-50 flex items-center justify-center text-${link.color}-500 group-hover:scale-110 transition-transform`}>
                      <Icon size={16} />
                    </div>
                    <span className="text-sm font-medium text-[var(--hana-ash)] group-hover:text-[var(--hana-charcoal)] transition-colors flex-1">
                      {link.label}
                    </span>
                    <ChevronRight size={14} className="text-[var(--hana-subtle)] group-hover:text-pink-400 transition-colors" />
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </motion.section>

      {/* Pending Requests + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        {/* Pending Requests */}
        <motion.section
          className="lg:col-span-2 rounded-2xl border p-5 bg-white/90 backdrop-blur-sm"
          style={{ borderColor: 'var(--hana-subtle)' }}
          initial="hidden" animate="visible" variants={fadeUp} custom={5}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[var(--hana-charcoal)] flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Pending Requests
            </h2>
            {pendingBookings.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-xs font-bold px-2.5 py-1 rounded-full bg-pink-100 text-pink-600 border border-pink-200"
              >
                {pendingBookings.length} new
              </motion.span>
            )}
          </div>
          <div className="space-y-3">
            <AnimatePresence>
              {pendingBookings.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-10"
                >
                  <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gray-50 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-sm text-[var(--hana-muted)]">All caught up!</p>
                  <p className="text-xs text-[var(--hana-muted)] mt-0.5">No pending requests</p>
                </motion.div>
              )}
              {pendingBookings.slice(0, 5).map((request) => (
                <PendingRequestCard
                  key={request.id}
                  request={request}
                  onAccept={() => accept.mutate(request.id)}
                  onReject={() => reject.mutate({ id: request.id, reason: 'Not available' })}
                  acceptPending={accept.isPending}
                  rejectPending={reject.isPending}
                />
              ))}
            </AnimatePresence>
          </div>
        </motion.section>

        {/* Upcoming Bookings */}
        <motion.section
          className="lg:col-span-3 rounded-2xl border p-5 bg-white/90 backdrop-blur-sm"
          style={{ borderColor: 'var(--hana-subtle)' }}
          initial="hidden" animate="visible" variants={fadeUp} custom={4}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[var(--hana-charcoal)] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-pink-500" />
              Upcoming Bookings
            </h2>
            <Link href="/companion/bookings" className="text-xs font-medium flex items-center gap-0.5 text-[var(--hana-blush-dark)] hover:underline">
              View all <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {confirmedBookings.length === 0 && (
              <div className="text-center py-10">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gray-50 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-sm text-[var(--hana-muted)]">No upcoming bookings</p>
              </div>
            )}
            {confirmedBookings.slice(0, 5).map((booking, i) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ scale: 1.01, x: 4, borderColor: 'rgba(16, 185, 129, 0.3)' }}
                className="flex items-center gap-3 p-4 rounded-xl border transition-all cursor-default"
                style={{ borderColor: 'var(--hana-subtle)' }}
              >
                <div className="w-1.5 self-stretch rounded-full shrink-0 bg-gradient-to-b from-emerald-400 to-emerald-300" />
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-sm font-bold text-pink-600 shrink-0"
                >
                  {booking.client?.name?.[0] || '?'}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold truncate text-[var(--hana-charcoal)]">{booking.client?.name || 'Unknown'}</p>
                    <span className="text-xs font-bold text-emerald-600 px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded-full shrink-0">Confirmed</span>
                  </div>
                  <p className="text-xs text-[var(--hana-muted)] mt-0.5">{booking.activityType}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs flex items-center gap-1 text-[var(--hana-ash)]">
                      <Calendar size={11} /> {new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                    <span className="text-xs flex items-center gap-1 text-[var(--hana-ash)]">
                      <Clock size={11} /> {booking.startTime} - {booking.endTime}
                    </span>
                    <span className="text-xs font-bold text-[var(--hana-charcoal)] ml-auto">
                      ₹{booking.totalAmount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  )
}
