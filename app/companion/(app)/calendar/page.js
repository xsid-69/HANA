'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronLeft, ChevronRight, Clock, MapPin, User,
  ToggleLeft, ToggleRight, Calendar as CalendarIcon,
} from 'lucide-react'

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const BOOKED_DATES = {
  '2026-06-03': [
    { client: 'Rohan Gupta', time: '12:00 PM', activity: 'Food Adventure', duration: '2 hrs' },
  ],
  '2026-06-04': [
    { client: 'Arjun Mehta', time: '10:00 AM', activity: 'Coffee Date', duration: '2 hrs' },
  ],
  '2026-06-05': [
    { client: 'Priya Sharma', time: '4:00 PM', activity: 'Heritage Walk', duration: '3 hrs' },
  ],
  '2026-06-07': [
    { client: 'Karthik Nair', time: '11:00 AM', activity: 'Live Music Night', duration: '3 hrs' },
  ],
  '2026-06-10': [
    { client: 'Meera Desai', time: '2:00 PM', activity: 'Art Gallery Tour', duration: '2 hrs' },
  ],
  '2026-06-14': [
    { client: 'Aditya Kumar', time: '10:00 AM', activity: 'Coffee Date', duration: '2 hrs' },
    { client: 'Nisha Bhat', time: '5:00 PM', activity: 'Park Walk', duration: '2 hrs' },
  ],
  '2026-06-18': [
    { client: 'Rahul Verma', time: '6:00 PM', activity: 'Foodie Adventure', duration: '2 hrs' },
  ],
}

// Days marked unavailable
const UNAVAILABLE_DATES = ['2026-06-08', '2026-06-15', '2026-06-22', '2026-06-29']

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
}

export default function CompanionCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(5) // June (0-indexed)
  const [currentYear, setCurrentYear] = useState(2026)
  const [selectedDate, setSelectedDate] = useState('2026-06-04')
  const [availability, setAvailability] = useState(() => {
    const map = {}
    UNAVAILABLE_DATES.forEach(d => { map[d] = false })
    return map
  })

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDay = new Date(currentYear, currentMonth, 1).getDay()
  const calendarDays = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  const formatDateKey = (day) => {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const isBooked = (day) => {
    if (!day) return false
    return !!BOOKED_DATES[formatDateKey(day)]
  }

  const isUnavailable = (day) => {
    if (!day) return false
    return availability[formatDateKey(day)] === false
  }

  const toggleAvailability = (dateKey) => {
    setAvailability(prev => ({
      ...prev,
      [dateKey]: prev[dateKey] === false ? undefined : false,
    }))
  }

  const selectedBookings = BOOKED_DATES[selectedDate] || []

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-[var(--hana-charcoal)]">Calendar</h1>
        <p className="text-[var(--hana-muted)] text-sm mt-1">View your schedule and manage availability</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading font-semibold text-lg text-[var(--hana-charcoal)]">
              {MONTHS[currentMonth]} {currentYear}
            </h2>
            <div className="flex items-center gap-1">
              <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 text-[var(--hana-muted)] transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 text-[var(--hana-muted)] transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(day => (
              <div key={day} className="text-center text-xs font-semibold text-[var(--hana-muted)] uppercase tracking-wider py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="aspect-square" />
              const dateKey = formatDateKey(day)
              const booked = isBooked(day)
              const unavailable = isUnavailable(day)
              const isSelected = dateKey === selectedDate
              const isToday = dateKey === '2026-06-02'

              return (
                <button
                  key={dateKey}
                  onClick={() => setSelectedDate(dateKey)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-all duration-200 relative ${
                    isSelected
                      ? 'bg-[var(--hana-charcoal)] text-white shadow-md'
                      : unavailable
                        ? 'bg-gray-100 text-gray-400 line-through'
                        : booked
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : isToday
                            ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                            : 'text-[var(--hana-charcoal)] hover:bg-gray-50'
                  }`}
                >
                  {day}
                  {booked && !isSelected && (
                    <div className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-xs text-[var(--hana-muted)]">
              <div className="w-3 h-3 rounded-full bg-emerald-500" /> Booked
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--hana-muted)]">
              <div className="w-3 h-3 rounded-full bg-gray-300" /> Unavailable
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--hana-muted)]">
              <div className="w-3 h-3 rounded-full bg-blue-400" /> Today
            </div>
          </div>
        </motion.div>

        {/* Side Panel */}
        <motion.div variants={itemVariants} className="space-y-4">
          {/* Selected Day Info */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="w-4 h-4 text-[var(--hana-muted)]" />
              <h3 className="font-semibold text-sm text-[var(--hana-charcoal)]">
                {new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </h3>
            </div>

            {selectedBookings.length > 0 ? (
              <div className="space-y-3">
                {selectedBookings.map((booking, i) => (
                  <div key={i} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-2 mb-1.5">
                      <User className="w-3.5 h-3.5 text-[var(--hana-muted)]" />
                      <span className="text-sm font-medium text-[var(--hana-charcoal)]">{booking.client}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[var(--hana-muted)]">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {booking.time}
                      </span>
                      <span>· {booking.duration}</span>
                    </div>
                    <div className="text-xs text-[var(--hana-ash)] mt-1.5 font-medium">{booking.activity}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--hana-muted)]">No bookings for this day.</p>
            )}
          </div>

          {/* Availability Toggle */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-sm text-[var(--hana-charcoal)] mb-3">Availability</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--hana-ash)]">
                {new Date(selectedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
              <button
                onClick={() => toggleAvailability(selectedDate)}
                className="flex items-center gap-2"
              >
                {availability[selectedDate] === false ? (
                  <ToggleLeft className="w-8 h-8 text-gray-300" />
                ) : (
                  <ToggleRight className="w-8 h-8 text-emerald-500" />
                )}
                <span className={`text-xs font-medium ${availability[selectedDate] === false ? 'text-gray-400' : 'text-emerald-600'}`}>
                  {availability[selectedDate] === false ? 'Unavailable' : 'Available'}
                </span>
              </button>
            </div>
            <p className="text-xs text-[var(--hana-muted)] mt-3">
              Toggle off to block this day from new bookings.
            </p>
          </div>

          {/* Upcoming Summary */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-sm text-[var(--hana-charcoal)] mb-3">This Week</h3>
            <div className="space-y-2">
              {Object.entries(BOOKED_DATES).slice(0, 4).map(([date, bookings]) => (
                <div key={date} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-xs text-[var(--hana-muted)]">
                    {new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                  <span className="text-xs font-medium text-[var(--hana-charcoal)]">
                    {bookings.length} booking{bookings.length > 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
