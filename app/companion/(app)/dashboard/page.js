'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  IndianRupee,
  Loader2,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
  Star,
  BarChart3,
  CircleGauge,
  Sparkles,
  TrendingUp,
  UserRound,
} from 'lucide-react'
import {
  acceptBooking,
  getCompanionBookings,
  getCompanionDashboardStats,
  rejectBooking,
} from '@/app/actions/bookings'
import { getExtensionAnalytics } from '@/app/actions/extensions'
import CompanionActiveBanner from '@/components/booking/CompanionActiveBanner'
import VerifyMeetingCard from '@/components/booking/VerifyMeetingCard'
import { formatCompactINR, formatINR, formatSignedINR } from '@/lib/format-currency'
import { useUIStore } from '@/store/useUIStore'

const ease = [0.16, 1, 0.3, 1]

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDay(value) {
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  })
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-[1400px] animate-pulse space-y-6" aria-label="Loading dashboard">
      <div className="h-7 w-48 rounded-lg bg-black/[0.06]" />
      <div className="h-32 rounded-[28px] bg-white/70" />
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="h-[430px] rounded-[28px] bg-white/70 lg:col-span-7" />
        <div className="h-[430px] rounded-[28px] bg-white/70 lg:col-span-5" />
      </div>
    </div>
  )
}

function StatusMessage({ onRetry }) {
  return (
    <div role="alert" className="flex flex-col gap-4 rounded-[24px] bg-[#fff7f7] p-5 text-[#7d2929] sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold">Dashboard data could not be loaded</p>
        <p className="mt-1 text-sm text-[#8f4b4b]">Check your connection and try again. Your bookings have not changed.</p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#7d2929] px-4 text-sm font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-[#7d2929] focus-visible:ring-offset-2"
      >
        <RotateCcw size={15} aria-hidden="true" /> Try again
      </button>
    </div>
  )
}

function MetricStrip({ stats }) {
  const metrics = [
    {
      label: 'This month',
      value: formatINR(stats?.monthlyEarnings),
      detail: 'Earnings',
      icon: IndianRupee,
    },
    {
      label: 'Needs attention',
      value: stats?.pendingRequests ?? 0,
      detail: 'Requests',
      icon: Clock3,
    },
    {
      label: 'On your calendar',
      value: stats?.upcomingBookings ?? 0,
      detail: 'Upcoming',
      icon: CalendarDays,
    },
    {
      label: `${stats?.totalReviews ?? 0} client reviews`,
      value: (stats?.averageRating ?? 0).toFixed(1),
      detail: 'Rating',
      icon: Star,
    },
  ]

  return (
    <section aria-label="Monthly summary" className="grid grid-cols-2 overflow-hidden rounded-[26px] bg-hana-gradient text-white shadow-[0_18px_44px_-28px_rgba(233,30,99,0.65)] lg:grid-cols-4">
      {metrics.map(({ label, value, detail, icon: Icon }, index) => (
        <div key={detail} className={`relative px-4 py-5 sm:px-6 ${index % 2 ? 'border-l border-white/10' : ''} ${index > 1 ? 'border-t border-white/10 lg:border-t-0' : ''} ${index === 2 ? 'lg:border-l' : ''}`}>
          <div className="mb-4 flex items-center justify-between text-white/55">
            <span className="text-xs font-medium">{label}</span>
            <Icon size={16} strokeWidth={1.7} aria-hidden="true" />
          </div>
          <p className="font-heading text-2xl font-semibold tracking-[-0.03em] tabular-nums sm:text-[1.75rem]">{value}</p>
          <p className="mt-1 text-xs text-white/60">{detail}</p>
        </div>
      ))}
    </section>
  )
}

const STATUS_GROUPS = [
  { key: 'COMPLETED', label: 'Completed', color: '#e91e63' },
  { key: 'CONFIRMED', label: 'Scheduled', color: '#ff6b8a' },
  { key: 'PENDING_ACCEPTANCE', label: 'Pending', color: '#f5a623' },
  { key: 'CANCELLED', label: 'Closed', color: '#9e8a92' },
]

function WeeklyBars({ trend = [] }) {
  const maxEarnings = Math.max(1, ...trend.map((day) => Math.abs(day.earnings)))
  const maxBookings = Math.max(1, ...trend.map((day) => Math.abs(day.bookings)))
  const total = trend.reduce((sum, day) => sum + day.earnings, 0)

  return (
    <section className="overflow-hidden rounded-[28px] bg-white p-5 shadow-[0_18px_60px_-42px_rgba(66,25,43,0.45)] sm:p-7 lg:col-span-8" aria-labelledby="weekly-trend-title">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="weekly-trend-title" className="font-heading text-lg font-semibold tracking-[-0.02em] text-[#20171b]">Seven-day momentum</h2>
          <p className="mt-1 max-w-xl text-sm text-[#75636b]">Completed value rises above zero; cancelled, rejected, and expired opportunity value falls below it.</p>
        </div>
        <div className="text-right">
          <p className={`font-heading text-xl font-semibold tabular-nums ${total < 0 ? 'text-[#b64952]' : 'text-[#20171b]'}`}>{formatSignedINR(total)}</p>
          <p className="text-[11px] text-[#8b7680]">net movement</p>
        </div>
      </div>

      <div className="mt-7" role="img" aria-label="Diverging bar chart of net bookings and value movement for the last seven days">
        <div className="relative flex h-52 gap-2 sm:gap-4">
          <div className="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-px bg-[#d9cbd0]" aria-hidden="true" />
          {trend.map((day) => {
            const bookingHeight = day.bookings === 0 ? 0 : Math.max(5, (Math.abs(day.bookings) / maxBookings) * 46)
            const earningsHeight = day.earnings === 0 ? 0 : Math.max(5, (Math.abs(day.earnings) / maxEarnings) * 46)
            const signedBookings = `${day.bookings > 0 ? '+' : ''}${day.bookings}`
            return (
              <div key={day.date} className="relative min-w-0 flex-1" title={`${day.label}: ${signedBookings} net bookings, ${formatSignedINR(day.earnings)} net value`}>
                <div className="absolute inset-0 flex justify-center gap-1 sm:gap-1.5">
                  <span className="relative h-full w-2.5 sm:w-3.5">
                    <motion.span
                      initial={false}
                      animate={{ height: `${bookingHeight}%` }}
                      transition={{ duration: 0.45, ease }}
                      style={day.bookings >= 0 ? { bottom: '50%' } : { top: '50%' }}
                      className={`absolute inset-x-0 rounded-full ${day.bookings >= 0 ? 'bg-[#88aa99]' : 'bg-[#e7a05c]'}`}
                    />
                  </span>
                  <span className="relative h-full w-3.5 sm:w-5">
                    <motion.span
                      initial={false}
                      animate={{ height: `${earningsHeight}%` }}
                      transition={{ duration: 0.55, ease }}
                      style={day.earnings >= 0 ? { bottom: '50%' } : { top: '50%' }}
                      className={`absolute inset-x-0 rounded-full shadow-[0_8px_18px_-10px_rgba(91,35,55,0.5)] ${day.earnings >= 0 ? 'bg-[var(--hana-blush-dark)]' : 'bg-[#c95761]'}`}
                    />
                  </span>
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-2 flex gap-2 sm:gap-4">
          {trend.map((day) => <span key={day.date} className="min-w-0 flex-1 text-center text-[10px] font-medium text-[#8b7680]">{day.label}</span>)}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#f1e7eb] pt-4 text-[11px] text-[#75636b]">
        <span className="inline-flex items-center gap-2"><i className="size-2 rounded-full bg-[var(--hana-blush-dark)]" /> Net value</span>
        <span className="inline-flex items-center gap-2"><i className="size-2 rounded-full bg-[#88aa99]" /> Net bookings</span>
        <span className="inline-flex items-center gap-2"><i className="size-2 rounded-full bg-[#c95761]" /> Closed / lost</span>
      </div>
    </section>
  )
}

function BookingDonut({ stats }) {
  const countFor = (status) => stats?.statusBreakdown?.find((item) => item.status === status)?.count ?? 0
  const values = [
    countFor('COMPLETED'),
    countFor('CONFIRMED') + countFor('IN_PROGRESS'),
    countFor('PENDING_ACCEPTANCE') + countFor('AWAITING_PAYMENT'),
    countFor('CANCELLED') + countFor('REJECTED') + countFor('EXPIRED'),
  ]
  const total = Math.max(1, values.reduce((sum, value) => sum + value, 0))
  let cursor = 0
  const stops = STATUS_GROUPS.map((group, index) => {
    const start = cursor
    cursor += (values[index] / total) * 100
    return `${group.color} ${start}% ${cursor}%`
  }).join(', ')
  const chartBackground = values.some(Boolean) ? `conic-gradient(${stops})` : 'var(--hana-ivory)'

  return (
    <section className="rounded-[28px] bg-[#f3e4ec] p-5 sm:p-7 lg:col-span-4" aria-labelledby="booking-mix-title">
      <div className="flex items-center justify-between">
        <div>
          <h2 id="booking-mix-title" className="font-heading text-lg font-semibold text-[#20171b]">Booking mix</h2>
          <p className="mt-1 text-sm text-[#75636b]">All-time request outcomes.</p>
        </div>
        <CircleGauge size={19} className="text-[var(--hana-blush-dark)]" />
      </div>
      <div className="mt-6 flex items-center gap-6">
        <div className="relative size-36 shrink-0 rounded-full" style={{ background: chartBackground }} role="img" aria-label={`Donut chart of ${stats?.totalRequests ?? 0} total requests`}>
          <div className="absolute inset-[18px] flex flex-col items-center justify-center rounded-full bg-[#f3e4ec]">
            <strong className="font-heading text-3xl font-semibold tabular-nums text-[#20171b]">{stats?.totalRequests ?? 0}</strong>
            <span className="text-[10px] font-medium text-[#8b7680]">requests</span>
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-2.5">
          {STATUS_GROUPS.map((group, index) => (
            <div key={group.key} className="flex items-center gap-2 text-xs">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: group.color }} />
              <span className="flex-1 text-[#695861]">{group.label}</span>
              <strong className="tabular-nums text-[#20171b]">{values[index]}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ActivityMix({ activities = [] }) {
  const maxCount = Math.max(1, ...activities.map((item) => item.count))
  return (
    <section className="rounded-[28px] bg-white p-5 shadow-[0_18px_60px_-42px_rgba(66,25,43,0.45)] sm:p-7 lg:col-span-5" aria-labelledby="activity-mix-title">
      <div className="flex items-center justify-between">
        <div>
          <h2 id="activity-mix-title" className="font-heading text-lg font-semibold text-[#20171b]">Experience demand</h2>
          <p className="mt-1 text-sm text-[#75636b]">Your most requested formats.</p>
        </div>
        <BarChart3 size={19} className="text-[var(--hana-blush-dark)]" />
      </div>
      <div className="mt-6 space-y-4">
        {activities.length === 0 ? <p className="py-10 text-center text-sm text-[#8b7680]">Activity trends will appear after your first requests.</p> : activities.map((item) => (
          <div key={item.activity}>
            <div className="mb-2 flex items-center justify-between gap-3 text-xs">
              <span className="truncate font-medium text-[#45343b]">{item.activity}</span>
              <span className="shrink-0 tabular-nums text-[#8b7680]">{item.count} requests · {item.hours.toFixed(1)}h</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--hana-ivory)]">
              <motion.div initial={false} animate={{ scaleX: item.count / maxCount }} transition={{ duration: 0.4, ease }} className="h-full origin-left rounded-full bg-[var(--hana-rose)]" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function ServicePulse({ stats, extensionStats }) {
  const signals = [
    { label: 'Completion', value: stats?.completionRate ?? 0 },
    { label: 'Acceptance', value: Math.round(stats?.acceptanceRate ?? 0) },
    { label: 'Trust', value: Math.round(stats?.trustScore ?? 0) },
  ]
  return (
    <section className="relative overflow-hidden rounded-[28px] bg-hana-gradient p-5 text-white shadow-[0_24px_60px_-36px_rgba(233,30,99,0.8)] sm:p-7 lg:col-span-7" aria-labelledby="service-pulse-title">
      <div className="absolute -right-16 -top-20 size-56 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-sm">
          <div className="flex items-center gap-2">
            <Sparkles size={17} className="text-white/80" />
            <h2 id="service-pulse-title" className="font-heading text-lg font-semibold">Service pulse</h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-white/72">Reliability is your strongest growth signal. Keep decisions prompt and sessions consistent.</p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/65">
            <span><strong className="mr-1 text-white">{stats?.completedBookings ?? 0}</strong>completed</span>
            <span><strong className="mr-1 text-white">{extensionStats?.completedExtensions ?? 0}</strong>extensions</span>
            <span><strong className="mr-1 text-white">{formatCompactINR(extensionStats?.extensionRevenue ?? 0)}</strong>extension value</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {signals.map((signal) => (
            <div key={signal.label} className="flex size-24 flex-col items-center justify-center rounded-full border border-white/18 bg-white/10 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
              <strong className="font-heading text-xl tabular-nums">{signal.value}%</strong>
              <span className="mt-1 text-[9px] font-medium text-white/65">{signal.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function AnalyticsBoard({ stats, extensionStats }) {
  return (
    <div className="grid grid-flow-dense grid-cols-1 gap-5 lg:grid-cols-12" aria-label="Performance analytics">
      <WeeklyBars trend={stats?.weeklyTrend} />
      <BookingDonut stats={stats} />
      <ActivityMix activities={stats?.activityBreakdown} />
      <ServicePulse stats={stats} extensionStats={extensionStats} />
    </div>
  )
}

function RequestCard({ request, onAccept, onReject, accepting, rejecting }) {
  const [confirmDecline, setConfirmDecline] = useState(false)
  const busy = accepting || rejecting

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.22, ease }}
      className="rounded-[20px] bg-[#faf7f8] p-4 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-[#ead9df] font-heading text-sm font-semibold text-[#7c2848]">
          {request.client?.name?.[0] || '?'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="truncate text-sm font-semibold text-[#20171b]">{request.client?.name || 'New client'}</h3>
              <p className="mt-0.5 text-xs text-[#75636b]">{request.activityType}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--hana-ivory)] px-2 py-1 text-[11px] font-semibold text-[var(--hana-blush-dark)]">
              <ShieldCheck size={12} aria-hidden="true" /> {request.client?.trustScore ?? 100} trust
            </span>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#5f5057]">
            <span className="inline-flex items-center gap-1.5"><CalendarDays size={13} /> {formatDay(request.date)}</span>
            <span className="inline-flex items-center gap-1.5"><Clock3 size={13} /> {request.durationHours} hours</span>
            <strong className="ml-auto text-sm font-semibold text-[#20171b]">{formatINR(request.totalAmount)}</strong>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {confirmDecline ? (
          <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 flex flex-col gap-3 rounded-2xl bg-white p-3 sm:flex-row sm:items-center">
            <p className="flex-1 text-xs leading-5 text-[#5f5057]">Decline this request because you are unavailable?</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setConfirmDecline(false)} className="min-h-10 flex-1 rounded-xl px-3 text-xs font-semibold text-[#5f5057] hover:bg-[#f4eef0] sm:flex-none">Keep</button>
              <button type="button" onClick={onReject} disabled={busy} className="min-h-10 flex-1 rounded-xl bg-[#7d2929] px-3 text-xs font-semibold text-white disabled:opacity-50 sm:flex-none">
                {rejecting ? 'Declining…' : 'Confirm decline'}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4 flex gap-2">
            <button type="button" onClick={() => setConfirmDecline(true)} disabled={busy} className="min-h-11 flex-1 rounded-xl bg-white px-4 text-sm font-semibold text-[#66545c] ring-1 ring-inset ring-[#ded1d6] hover:bg-[#f6f1f3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a33b63] disabled:opacity-50">
              Decline
            </button>
            <button type="button" onClick={onAccept} disabled={busy} className="inline-flex min-h-11 flex-[1.35] items-center justify-center gap-2 rounded-xl bg-[var(--hana-blush-dark)] px-4 text-sm font-semibold text-white hover:bg-[#c2185b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hana-blush-dark)] focus-visible:ring-offset-2 disabled:opacity-50">
              {accepting ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              {accepting ? 'Accepting…' : 'Accept request'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}

function RequestQueue({ requests, accept, reject }) {
  return (
    <section className="rounded-[28px] bg-white p-4 shadow-[0_18px_60px_-42px_rgba(66,25,43,0.45)] sm:p-6 lg:col-span-7" aria-labelledby="request-queue-title">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 id="request-queue-title" className="font-heading text-lg font-semibold tracking-[-0.02em] text-[#20171b]">Request queue</h2>
            {requests.length > 0 && <span className="rounded-lg bg-[#f6e5eb] px-2 py-1 text-[11px] font-semibold text-[#8f3155]">{requests.length} waiting</span>}
          </div>
          <p className="mt-1 text-sm text-[#75636b]">Review the newest requests while dates are still open.</p>
        </div>
        <Link href="/companion/bookings" className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-xl px-2 text-xs font-semibold text-[#8f3155] hover:bg-[#faf0f4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a33b63]">
          All requests <ChevronRight size={14} />
        </Link>
      </div>

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {requests.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex min-h-56 flex-col items-center justify-center rounded-[20px] bg-[#faf7f8] px-6 text-center">
              <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-[var(--hana-ivory)] text-[var(--hana-blush-dark)]">
                <Check size={20} aria-hidden="true" />
              </div>
              <h3 className="text-sm font-semibold text-[#20171b]">You are caught up</h3>
              <p className="mt-1 max-w-xs text-sm leading-6 text-[#75636b]">New booking requests will appear here automatically.</p>
            </motion.div>
          ) : requests.slice(0, 4).map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onAccept={() => accept.mutate(request.id)}
              onReject={() => reject.mutate({ id: request.id, reason: 'Not available' })}
              accepting={accept.isPending && accept.variables === request.id}
              rejecting={reject.isPending && reject.variables?.id === request.id}
            />
          ))}
        </AnimatePresence>
      </div>
    </section>
  )
}

function UpcomingSchedule({ bookings }) {
  return (
    <section className="rounded-[28px] bg-[#f0e5e9] p-4 sm:p-6 lg:col-span-5" aria-labelledby="upcoming-title">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 id="upcoming-title" className="font-heading text-lg font-semibold tracking-[-0.02em] text-[#20171b]">Upcoming schedule</h2>
          <p className="mt-1 text-sm text-[#6f5d65]">Your next confirmed sessions.</p>
        </div>
        <Link href="/companion/calendar" aria-label="Open calendar" className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/70 text-[#6f304a] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a33b63]">
          <CalendarDays size={17} strokeWidth={1.8} />
        </Link>
      </div>

      <div className="space-y-2.5">
        {bookings.length === 0 ? (
          <div className="flex min-h-56 flex-col items-center justify-center rounded-[20px] bg-white/55 px-6 text-center">
            <CalendarDays className="mb-4 text-[#a88d98]" size={26} strokeWidth={1.5} />
            <h3 className="text-sm font-semibold text-[#20171b]">No confirmed sessions</h3>
            <p className="mt-1 text-sm leading-6 text-[#75636b]">Accepted and paid bookings will build your schedule here.</p>
          </div>
        ) : bookings.slice(0, 4).map((booking, index) => (
          <article key={booking.id} className="rounded-[20px] bg-white p-4 shadow-[0_12px_30px_-28px_rgba(66,25,43,0.6)]">
            <div className="flex gap-3">
              <div className="flex w-12 shrink-0 flex-col items-center justify-center rounded-[14px] bg-[var(--hana-blush-dark)] py-2 text-white">
                <span className="text-[10px] text-white/60">{new Date(booking.date).toLocaleDateString('en-IN', { month: 'short' })}</span>
                <strong className="text-lg leading-5 tabular-nums">{new Date(booking.date).getDate()}</strong>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-[#20171b]">{booking.client?.name || 'Client'}</h3>
                    <p className="mt-0.5 truncate text-xs text-[#75636b]">{booking.activityType}</p>
                  </div>
                  {index === 0 && <span className="rounded-lg bg-[var(--hana-ivory)] px-2 py-1 text-[10px] font-semibold text-[var(--hana-blush-dark)]">Next</span>}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#695861]">
                  <span className="inline-flex items-center gap-1"><Clock3 size={12} /> {booking.startTime}–{booking.endTime}</span>
                  <strong className="ml-auto text-xs text-[#20171b]">{formatINR(booking.totalAmount)}</strong>
                </div>
              </div>
            </div>
            {!booking.codeVerified && <VerifyMeetingCard bookingId={booking.id} codeVerified={booking.codeVerified} />}
          </article>
        ))}
      </div>
    </section>
  )
}

function PerformancePanel({ stats, extensionStats }) {
  const acceptance = Math.max(0, Math.min(100, stats?.acceptanceRate ?? 100))
  const cancellation = Math.max(0, Math.min(100, stats?.cancellationRate ?? 0))
  const trust = stats?.trustScore ?? 100

  return (
    <section className="grid overflow-hidden rounded-[28px] bg-white lg:grid-cols-[1.35fr_0.65fr]" aria-labelledby="performance-title">
      <div className="p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 id="performance-title" className="font-heading text-lg font-semibold tracking-[-0.02em] text-[#20171b]">Service health</h2>
            <p className="mt-1 text-sm text-[#75636b]">A clear view of reliability and client confidence.</p>
          </div>
          <div className="flex items-baseline gap-2 rounded-2xl bg-[var(--hana-ivory)] px-4 py-3 text-[var(--hana-blush-dark)]">
            <strong className="font-heading text-2xl tabular-nums">{trust}</strong>
            <span className="text-xs font-semibold">trust score</span>
          </div>
        </div>

        <div className="mt-7 grid gap-6 sm:grid-cols-2">
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#5f5057]">Acceptance rate</span>
              <strong className="tabular-nums text-[var(--hana-blush-dark)]">{acceptance.toFixed(0)}%</strong>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--hana-ivory)]">
              <motion.div initial={false} animate={{ scaleX: acceptance / 100 }} transition={{ duration: 0.35, ease }} className="h-full origin-left rounded-full bg-[var(--hana-rose)]" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#5f5057]">Cancellation rate</span>
              <strong className="tabular-nums text-[#8b3e3e]">{cancellation.toFixed(0)}%</strong>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#f5e7e7]">
              <motion.div initial={false} animate={{ scaleX: cancellation / 100 }} transition={{ duration: 0.35, ease }} className="h-full origin-left rounded-full bg-[#b66565]" />
            </div>
          </div>
        </div>

        <div className="mt-7 flex flex-wrap gap-x-8 gap-y-3 border-t border-[#eee5e8] pt-5 text-sm">
          <span className="text-[#75636b]"><strong className="mr-1.5 text-[#20171b]">{stats?.completedBookings ?? 0}</strong>completed bookings</span>
          <span className="text-[#75636b]"><strong className="mr-1.5 text-[#20171b]">{stats?.totalReviews ?? 0}</strong>reviews received</span>
          {extensionStats?.totalExtensions > 0 && (
            <span className="text-[#75636b]"><strong className="mr-1.5 text-[#20171b]">{formatINR(extensionStats.extensionRevenue)}</strong>extension revenue</span>
          )}
        </div>
      </div>

      <aside className="bg-[#faf7f8] p-5 sm:p-7" aria-label="Quick actions">
        <h3 className="text-sm font-semibold text-[#20171b]">Common tasks</h3>
        <nav className="mt-4 space-y-1">
          {[
            { label: 'Manage calendar', href: '/companion/calendar', icon: CalendarDays },
            { label: 'Open messages', href: '/companion/messages', icon: MessageCircle },
            { label: 'View earnings', href: '/companion/earnings', icon: TrendingUp },
            { label: 'Edit public profile', href: '/companion/profile', icon: UserRound },
          ].map(({ label, href, icon: Icon }) => (
            <Link key={href} href={href} className="group flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium text-[#5f5057] hover:bg-white hover:text-[#20171b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a33b63]">
              <Icon size={16} strokeWidth={1.7} className="text-[#9b7886] group-hover:text-[#8f3155]" />
              <span className="flex-1">{label}</span>
              <ArrowUpRight size={14} className="text-[#b6a2aa] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          ))}
        </nav>
      </aside>
    </section>
  )
}

export default function CompanionDashboard() {
  const queryClient = useQueryClient()
  const addToast = useUIStore((state) => state.addToast)

  const statsQuery = useQuery({
    queryKey: ['companion-dashboard-stats'],
    queryFn: getCompanionDashboardStats,
  })
  const extensionQuery = useQuery({
    queryKey: ['extension-analytics'],
    queryFn: getExtensionAnalytics,
  })
  const pendingQuery = useQuery({
    queryKey: ['companion-bookings', 'PENDING_ACCEPTANCE'],
    queryFn: () => getCompanionBookings({ status: 'PENDING_ACCEPTANCE' }),
    refetchInterval: 15000,
  })
  const confirmedQuery = useQuery({
    queryKey: ['companion-bookings', 'CONFIRMED'],
    queryFn: () => getCompanionBookings({ status: 'CONFIRMED' }),
  })

  const refreshDashboard = () => {
    statsQuery.refetch()
    extensionQuery.refetch()
    pendingQuery.refetch()
    confirmedQuery.refetch()
  }

  const accept = useMutation({
    mutationFn: acceptBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companion-bookings'] })
      queryClient.invalidateQueries({ queryKey: ['companion-dashboard-stats'] })
      addToast({ type: 'success', title: 'Booking accepted', message: 'The client can now complete payment.' })
    },
    onError: (error) => addToast({ type: 'error', title: 'Could not accept booking', message: error.message }),
  })

  const reject = useMutation({
    mutationFn: ({ id, reason }) => rejectBooking(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companion-bookings'] })
      queryClient.invalidateQueries({ queryKey: ['companion-dashboard-stats'] })
      addToast({ type: 'info', title: 'Booking declined', message: 'The client has been notified.' })
    },
    onError: (error) => addToast({ type: 'error', title: 'Could not decline booking', message: error.message }),
  })

  if (statsQuery.isLoading) return <DashboardSkeleton />

  const hasError = statsQuery.isError || pendingQuery.isError || confirmedQuery.isError
  const stats = statsQuery.data
  const pendingBookings = pendingQuery.data ?? []
  const confirmedBookings = confirmedQuery.data ?? []
  const companionName = stats?.companion?.displayName || 'there'

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 pb-8 sm:space-y-6">
      <header className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-medium text-[#8f3155]">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <h1 className="max-w-3xl text-balance font-heading text-[1.75rem] font-semibold leading-tight tracking-[-0.035em] text-[#20171b] sm:text-[2.25rem]">
            {greeting()}, {companionName}
          </h1>
          <p className="mt-2 max-w-xl text-pretty text-sm leading-6 text-[#75636b]">Your next decisions, sessions, and service health in one place.</p>
        </div>
        <Link href="/companion/calendar" className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#5f3445] shadow-[0_10px_28px_-20px_rgba(66,25,43,0.5)] hover:bg-[#fffafb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a33b63] focus-visible:ring-offset-2">
          <CalendarDays size={16} strokeWidth={1.8} /> Manage availability
        </Link>
      </header>

      {hasError && <StatusMessage onRetry={refreshDashboard} />}

      <CompanionActiveBanner />
      <MetricStrip stats={stats} />
      <AnalyticsBoard stats={stats} extensionStats={extensionQuery.data} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start">
        <RequestQueue requests={pendingBookings} accept={accept} reject={reject} />
        <UpcomingSchedule bookings={confirmedBookings} />
      </div>

      <PerformancePanel stats={stats} extensionStats={extensionQuery.data} />
    </div>
  )
}