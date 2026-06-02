'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  IndianRupee, Calendar, Clock, Star, ChevronRight,
  Check, X, TrendingUp, TrendingDown, User, Coffee,
  MapPin, MessageCircle, Bell, ToggleLeft, ToggleRight,
} from 'lucide-react'

// --- Mock Data ---

const COMPANION = {
  name: 'Sneha',
  avatar: '/avatars/sneha.jpg',
  rating: 4.95,
  totalReviews: 127,
}

const QUICK_STATS = [
  {
    label: "Today's Earnings",
    value: '₹4,800',
    icon: IndianRupee,
    trend: '+12%',
    trendUp: true,
    accent: 'var(--hana-sage)',
  },
  {
    label: 'Active Bookings',
    value: '3',
    icon: Calendar,
    trend: '+1 new',
    trendUp: true,
    accent: 'var(--hana-blush)',
  },
  {
    label: "This Week's Hours",
    value: '18.5',
    icon: Clock,
    trend: '2.5h left',
    trendUp: null,
    accent: 'var(--hana-gold)',
  },
  {
    label: 'Rating',
    value: '4.95',
    icon: Star,
    trend: '127 reviews',
    trendUp: null,
    accent: 'var(--hana-gold)',
  },
]

const TODAYS_SCHEDULE = [
  {
    id: 1,
    time: '10:00 AM - 12:00 PM',
    client: 'Arjun Mehta',
    avatar: '/avatars/arjun.jpg',
    activity: 'Coffee & Conversation',
    location: 'Blue Tokai, Koramangala',
    status: 'confirmed',
  },
  {
    id: 2,
    time: '2:00 PM - 4:00 PM',
    client: 'Priya Sharma',
    avatar: '/avatars/priya.jpg',
    activity: 'Art Gallery Walk',
    location: 'National Gallery of Modern Art',
    status: 'confirmed',
  },
  {
    id: 3,
    time: '6:30 PM - 8:30 PM',
    client: 'Rohan Kapoor',
    avatar: '/avatars/rohan.jpg',
    activity: 'Dinner Companion',
    location: 'Olive Bar & Kitchen, Mehrauli',
    status: 'pending',
  },
]

const PENDING_REQUESTS = [
  {
    id: 101,
    client: 'Vikram Desai',
    avatar: '/avatars/vikram.jpg',
    date: 'Tomorrow, 4:00 PM',
    activity: 'City Heritage Walk',
    duration: '3 hours',
    earnings: '₹3,600',
  },
  {
    id: 102,
    client: 'Ananya Iyer',
    avatar: '/avatars/ananya.jpg',
    date: 'Jun 5, 11:00 AM',
    activity: 'Brunch & Shopping',
    duration: '2 hours',
    earnings: '₹2,400',
  },
]

const WEEKLY_EARNINGS = [
  { day: 'Mon', amount: 3200 },
  { day: 'Tue', amount: 4800 },
  { day: 'Wed', amount: 2400 },
  { day: 'Thu', amount: 5600 },
  { day: 'Fri', amount: 4000 },
  { day: 'Sat', amount: 7200 },
  { day: 'Sun', amount: 4800 },
]

const RECENT_REVIEWS = [
  {
    id: 1,
    client: 'Arjun Mehta',
    avatar: '/avatars/arjun.jpg',
    rating: 5,
    text: 'Sneha made the entire evening feel effortless. Great conversation, wonderful recommendations for food. Will definitely book again.',
    date: '2 days ago',
  },
  {
    id: 2,
    client: 'Meera Nair',
    avatar: '/avatars/meera.jpg',
    rating: 5,
    text: 'Such a warm and engaging companion. She knew all the hidden spots in Hauz Khas and the conversation never felt forced.',
    date: '5 days ago',
  },
  {
    id: 3,
    client: 'Karthik Rajan',
    avatar: '/avatars/karthik.jpg',
    rating: 4,
    text: 'Very professional and punctual. Made my client dinner much less awkward. Highly recommended for business settings.',
    date: '1 week ago',
  },
]

// --- Helpers ---

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDate() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' },
  }),
}

// --- Components ---

function StatusBadge({ status }) {
  const styles = {
    confirmed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[status] || styles.pending}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function StarRating({ rating, size = 14 }) {
  const full = Math.floor(rating)
  const hasHalf = rating - full >= 0.5
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={
            i < full
              ? 'fill-amber-400 text-amber-400'
              : i === full && hasHalf
              ? 'fill-amber-400/50 text-amber-400'
              : 'text-gray-200'
          }
        />
      ))}
    </span>
  )
}

function AvatarPlaceholder({ name, size = 40 }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
  return (
    <div
      className="rounded-full flex items-center justify-center font-semibold text-white shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: 'var(--hana-ash)',
        fontSize: size * 0.36,
      }}
    >
      {initials}
    </div>
  )
}

// --- Page ---

export default function CompanionDashboard() {
  const [isOnline, setIsOnline] = useState(true)

  return (
    <div
      className="min-h-screen pb-8"
      style={{ backgroundColor: 'var(--hana-cream)' }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-30 border-b px-4 py-3 sm:px-6"
        style={{
          backgroundColor: 'white',
          borderColor: 'var(--hana-subtle)',
        }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell size={20} style={{ color: 'var(--hana-muted)' }} />
            <span
              className="text-sm font-medium"
              style={{ color: 'var(--hana-charcoal)' }}
            >
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
            aria-label={isOnline ? 'Go offline' : 'Go online'}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: isOnline ? 'var(--hana-online)' : 'var(--hana-muted)',
              }}
            />
            {isOnline ? 'Online' : 'Offline'}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Welcome Section */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight"
            style={{ color: 'var(--hana-charcoal)' }}
          >
            {getGreeting()}, {COMPANION.name}
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--hana-muted)' }}>
            {formatDate()}
          </p>
        </motion.section>

        {/* Quick Stats */}
        <motion.section
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
        >
          {QUICK_STATS.map((stat) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                className="rounded-xl p-4 border"
                style={{
                  backgroundColor: 'white',
                  borderColor: 'var(--hana-subtle)',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${stat.accent}15`, color: stat.accent }}
                  >
                    <Icon size={16} />
                  </div>
                  {stat.trendUp !== null && (
                    <span
                      className="text-xs font-medium flex items-center gap-0.5"
                      style={{ color: stat.trendUp ? 'var(--hana-sage)' : 'var(--hana-blush-dark)' }}
                    >
                      {stat.trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {stat.trend}
                    </span>
                  )}
                </div>
                <p
                  className="text-xl sm:text-2xl font-bold"
                  style={{ color: 'var(--hana-charcoal)' }}
                >
                  {stat.value}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--hana-muted)' }}>
                  {stat.label}
                </p>
                {stat.trendUp === null && stat.trend && (
                  <p className="text-xs mt-1" style={{ color: 'var(--hana-muted)' }}>
                    {stat.trend}
                  </p>
                )}
              </motion.div>
            )
          })}
        </motion.section>

        {/* Two column layout for schedule + pending */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
          {/* Today's Schedule */}
          <motion.section
            className="lg:col-span-3 rounded-xl border p-4 sm:p-5"
            style={{ backgroundColor: 'white', borderColor: 'var(--hana-subtle)' }}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={4}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-base font-semibold"
                style={{ color: 'var(--hana-charcoal)' }}
              >
                Today&apos;s Schedule
              </h2>
              <span className="text-xs" style={{ color: 'var(--hana-muted)' }}>
                {TODAYS_SCHEDULE.length} bookings
              </span>
            </div>
            <div className="space-y-3">
              {TODAYS_SCHEDULE.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-start gap-3 p-3 rounded-lg border transition-colors hover:border-pink-200"
                  style={{ borderColor: 'var(--hana-subtle)' }}
                >
                  <div
                    className="w-1 self-stretch rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        booking.status === 'confirmed'
                          ? 'var(--hana-sage)'
                          : 'var(--hana-gold)',
                    }}
                  />
                  <AvatarPlaceholder name={booking.client} size={36} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: 'var(--hana-charcoal)' }}
                      >
                        {booking.client}
                      </p>
                      <StatusBadge status={booking.status} />
                    </div>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--hana-muted)' }}>
                      {booking.activity}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span
                        className="text-xs flex items-center gap-1"
                        style={{ color: 'var(--hana-ash)' }}
                      >
                        <Clock size={11} /> {booking.time}
                      </span>
                      <span
                        className="text-xs flex items-center gap-1"
                        style={{ color: 'var(--hana-ash)' }}
                      >
                        <MapPin size={11} /> {booking.location}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Pending Requests */}
          <motion.section
            className="lg:col-span-2 rounded-xl border p-4 sm:p-5"
            style={{ backgroundColor: 'white', borderColor: 'var(--hana-subtle)' }}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={5}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                className="text-base font-semibold"
                style={{ color: 'var(--hana-charcoal)' }}
              >
                Pending Requests
              </h2>
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: 'rgba(255, 107, 138, 0.1)',
                  color: 'var(--hana-blush-dark)',
                }}
              >
                {PENDING_REQUESTS.length} new
              </span>
            </div>
            <div className="space-y-3">
              {PENDING_REQUESTS.map((request) => (
                <div
                  key={request.id}
                  className="p-3 rounded-lg border"
                  style={{ borderColor: 'var(--hana-subtle)' }}
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <AvatarPlaceholder name={request.client} size={32} />
                    <div className="min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: 'var(--hana-charcoal)' }}
                      >
                        {request.client}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--hana-muted)' }}>
                        {request.activity}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs mb-3" style={{ color: 'var(--hana-ash)' }}>
                    <span className="flex items-center gap-1">
                      <Calendar size={11} /> {request.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {request.duration}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: 'var(--hana-charcoal)' }}
                    >
                      {request.earnings}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        className="w-8 h-8 rounded-full flex items-center justify-center border transition-colors hover:bg-red-50"
                        style={{ borderColor: 'var(--hana-subtle)' }}
                        aria-label={`Decline request from ${request.client}`}
                      >
                        <X size={14} style={{ color: 'var(--hana-blush-dark)' }} />
                      </button>
                      <button
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-opacity hover:opacity-90"
                        style={{ backgroundColor: 'var(--hana-sage)' }}
                        aria-label={`Accept request from ${request.client}`}
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

        {/* Earnings Overview */}
        <motion.section
          className="rounded-xl border p-4 sm:p-5"
          style={{ backgroundColor: 'white', borderColor: 'var(--hana-subtle)' }}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={6}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-base font-semibold"
              style={{ color: 'var(--hana-charcoal)' }}
            >
              Weekly Earnings
            </h2>
            <span className="text-sm font-semibold" style={{ color: 'var(--hana-charcoal)' }}>
              ₹{WEEKLY_EARNINGS.reduce((s, d) => s + d.amount, 0).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex items-end justify-between gap-2 h-32 sm:h-40">
            {WEEKLY_EARNINGS.map((day) => {
              const maxAmount = Math.max(...WEEKLY_EARNINGS.map((d) => d.amount))
              const heightPercent = (day.amount / maxAmount) * 100
              const isToday = new Date().toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3) === day.day
              return (
                <div key={day.day} className="flex flex-col items-center gap-1.5 flex-1">
                  <span className="text-xs font-medium" style={{ color: 'var(--hana-muted)' }}>
                    ₹{(day.amount / 1000).toFixed(1)}k
                  </span>
                  <div
                    className="w-full max-w-[36px] rounded-md transition-all"
                    style={{
                      height: `${heightPercent}%`,
                      backgroundColor: isToday ? 'var(--hana-blush)' : 'var(--hana-subtle)',
                    }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{ color: isToday ? 'var(--hana-blush-dark)' : 'var(--hana-muted)' }}
                  >
                    {day.day}
                  </span>
                </div>
              )
            })}
          </div>
        </motion.section>

        {/* Recent Reviews */}
        <motion.section
          className="rounded-xl border p-4 sm:p-5"
          style={{ backgroundColor: 'white', borderColor: 'var(--hana-subtle)' }}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          custom={7}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-base font-semibold"
              style={{ color: 'var(--hana-charcoal)' }}
            >
              Recent Reviews
            </h2>
            <button
              className="text-xs font-medium flex items-center gap-0.5"
              style={{ color: 'var(--hana-blush-dark)' }}
            >
              View all <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {RECENT_REVIEWS.map((review) => (
              <div
                key={review.id}
                className="p-3 rounded-lg border"
                style={{ borderColor: 'var(--hana-subtle)' }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <AvatarPlaceholder name={review.client} size={28} />
                    <span
                      className="text-sm font-medium"
                      style={{ color: 'var(--hana-charcoal)' }}
                    >
                      {review.client}
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--hana-muted)' }}>
                    {review.date}
                  </span>
                </div>
                <div className="mb-1.5">
                  <StarRating rating={review.rating} size={12} />
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--hana-ash)' }}>
                  {review.text}
                </p>
              </div>
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  )
}
