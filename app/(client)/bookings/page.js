'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCompanionById } from '@/app/actions/companions'
import { createBooking, getMyBookings, confirmPayment, userCancelBooking } from '@/app/actions/bookings'
import BottomNav from '@/components/layout/BottomNav'
import TopNav from '@/components/layout/TopNav'
import {
  ArrowLeft, ChevronLeft, ChevronRight, Minus, Plus,
  ArrowRight, Check, Coffee, Music, TreePine, Palette,
  UtensilsCrossed, Star, MapPin, Compass, Clock, Calendar,
  CreditCard, X, Timer, AlertTriangle, CheckCircle2, Loader2,
  Sparkles, PartyPopper,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { getLastCompanion } from '@/lib/session-companion'

const EXPERIENCES = [
  { id: 'coffee', name: 'Coffee Date', desc: 'Cozy chats over artisan coffee', emoji: '☕', icon: Coffee, price: 800 },
  { id: 'music', name: 'Live Music Night', desc: 'Enjoy a vibrant gig together', emoji: '🎵', icon: Music, price: 1200 },
  { id: 'park', name: 'Park Walk', desc: 'A relaxing stroll through nature', emoji: '🌳', icon: TreePine, price: 600 },
  { id: 'art', name: 'Art Gallery Tour', desc: 'Explore exhibits and curated art', emoji: '🎨', icon: Palette, price: 1000 },
  { id: 'food', name: 'Foodie Adventure', desc: "Taste the city's best bites", emoji: '🍛', icon: UtensilsCrossed, price: 1100 },
]

const TIME_SLOTS = ['10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM', '6:00 PM']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const slideVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
}

const confettiParticles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 0.5,
  duration: 1.5 + Math.random() * 1,
  color: ['#E91E63', '#9C27B0', '#FF9800', '#4CAF50', '#2196F3', '#FFD700'][i % 6],
}))

function SuccessOverlay({ show, title, subtitle, onDone }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={onDone}
        >
          {confettiParticles.map(p => (
            <motion.div
              key={p.id}
              initial={{ y: -20, x: `${p.x}vw`, opacity: 1, scale: 1 }}
              animate={{ y: '100vh', opacity: 0, scale: 0.5, rotate: 360 }}
              transition={{ duration: p.duration, delay: p.delay, ease: 'easeIn' }}
              className="absolute top-0 w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: p.color, left: `${p.x}%` }}
            />
          ))}

          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
            className="bg-white rounded-3xl p-8 mx-6 max-w-sm w-full text-center shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10, stiffness: 200, delay: 0.3 }}
              className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30"
            >
              <motion.div
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <Check className="w-10 h-10 text-white stroke-[3]" />
              </motion.div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="font-heading text-xl font-bold text-[var(--hana-charcoal)] mb-2"
            >
              {title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-[var(--hana-muted)] leading-relaxed"
            >
              {subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 flex items-center justify-center gap-1 text-xs text-[var(--hana-muted)]"
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>Tap anywhere to continue</span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function BookingsInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const companionId = searchParams.get('companionId')

  const { data: companionData } = useQuery({
    queryKey: ['companion', companionId],
    queryFn: () => getCompanionById(companionId),
    enabled: !!companionId,
  })

  const [sessionCompanion] = useState(() => getLastCompanion())
  const companion = companionData || (!companionId ? sessionCompanion : null)

  const [activeView, setActiveView] = useState('book')
  const [step, setStep] = useState(1)
  const [selectedExperience, setSelectedExperience] = useState(EXPERIENCES[0])
  const [notes, setNotes] = useState('')
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState('12:00 PM')
  const [duration, setDuration] = useState(2)
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const [calYear, setCalYear] = useState(new Date().getFullYear())
  const [bookingSuccess, setBookingSuccess] = useState(false)

  const bookMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      setBookingSuccess(true)
    },
    onError: (err) => console.error('[booking error]', err.message),
  })

  const handleConfirm = () => {
    if (!companion?.id) return alert('No companion selected')
    if (!selectedDate) return alert('Please select a date')
    const dateStr = new Date(calYear, calMonth, selectedDate).toISOString()
    const startTime = selectedTime
    const endTime = getEndTime(selectedTime, duration)
    bookMutation.mutate({
      companionId: companion.id,
      date: dateStr,
      startTime,
      endTime,
      durationHours: duration,
      activityType: selectedExperience.name,
      notes: notes || undefined,
    })
  }

  const hourlyRate = companion?.hourlyRate || selectedExperience.price
  const total = hourlyRate * duration

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const firstDay = new Date(calYear, calMonth, 1).getDay()
  const calendarDays = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  const isPastDay = (day) => {
    if (!day) return false
    const d = new Date(calYear, calMonth, day)
    d.setHours(0, 0, 0, 0)
    const t = new Date(); t.setHours(0, 0, 0, 0)
    return d < t
  }

  if (!companion) {
    return <MyBookingsList />
  }

  if (activeView === 'myBookings') {
    return <MyBookingsList onSwitchToBook={() => setActiveView('book')} showCapsules companion={companion} />
  }

  return (
    <div className="min-h-screen relative">
      <TopNav />

      <div className="max-w-lg mx-auto md:max-w-4xl md:py-8 md:px-6 relative z-10">
        {/* Header */}
        <header className="px-5 pt-12 md:pt-0 pb-4 flex items-center gap-3">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : router.back()}
            className="w-9 h-9 rounded-full bg-white border border-[var(--hana-subtle)]/40 shadow-sm flex items-center justify-center hover:bg-[var(--hana-ivory)] transition-colors btn-press"
          >
            <ArrowLeft className="w-4 h-4 text-[var(--hana-ash)]" />
          </button>
          <h1 className="font-heading text-xl font-bold text-[var(--hana-charcoal)]">Bookings</h1>
        </header>

        {/* Capsule Switcher */}
        <div className="px-5 mb-5">
          <div className="flex items-center gap-2 bg-white rounded-full p-1.5 border border-[var(--hana-subtle)]/30 shadow-sm">
            <button
              onClick={() => setActiveView('book')}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeView === 'book'
                  ? 'bg-hana-gradient text-white shadow-md shadow-pink-500/20'
                  : 'text-[var(--hana-muted)] hover:text-[var(--hana-charcoal)]'
              }`}
            >
              Book a Moment
            </button>
            <button
              onClick={() => setActiveView('myBookings')}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                activeView === 'myBookings'
                  ? 'bg-hana-gradient text-white shadow-md shadow-pink-500/20'
                  : 'text-[var(--hana-muted)] hover:text-[var(--hana-charcoal)]'
              }`}
            >
              My Bookings
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="px-5 mb-5">
          <div className="flex gap-1.5">
            {[1, 2, 3].map(i => (
              <div key={i} className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${i <= step ? 'bg-[var(--hana-blush-dark)]' : 'bg-[var(--hana-subtle)]/40'}`} />
            ))}
          </div>
          <p className="text-center text-xs text-[var(--hana-muted)] mt-2">Step {step} of 3</p>
        </div>

        {/* Companion card */}
        <div className="mx-5 p-4 bg-white rounded-2xl border border-[var(--hana-subtle)]/30 shadow-sm flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-xl shrink-0">
            {companion?.photos?.[0] ? (
              <img src={companion.photos[0]} alt={companion.displayName} className="w-full h-full object-cover" />
            ) : '🌸'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-[var(--hana-charcoal)] truncate">
              {companion?.displayName || '...'}
            </h3>
            <p className="text-xs text-[var(--hana-muted)] flex items-center gap-1">
              <MapPin className="w-3 h-3 text-pink-400" />
              {companion?.city}{companion?.district ? `, ${companion.district}` : ''}
            </p>
          </div>
          {companion?.averageRating && (
            <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 rounded-lg shrink-0">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-xs font-semibold text-amber-700">{companion.averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <div className="md:grid md:grid-cols-3 md:gap-6 md:mx-5">
          <div className="md:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 1: Experience */}
              {step === 1 && (
                <motion.div key="step1" variants={slideVariants} initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.25, ease: 'easeOut' }} className="px-5 md:px-0">
                  <h2 className="font-heading text-base font-bold text-[var(--hana-charcoal)] mb-3">Choose Your Experience</h2>
                  <div className="space-y-2">
                    {EXPERIENCES.map(exp => {
                      const isSelected = selectedExperience.id === exp.id
                      const Icon = exp.icon
                      return (
                        <button key={exp.id} onClick={() => setSelectedExperience(exp)}
                          className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                            isSelected
                              ? 'border-[var(--hana-blush-dark)] bg-pink-50/60 shadow-sm'
                              : 'border-transparent bg-white hover:bg-[var(--hana-ivory)]'
                          }`}>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-[var(--hana-blush-dark)] text-white' : 'bg-[var(--hana-ivory)] text-[var(--hana-ash)]'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-[var(--hana-charcoal)]">{exp.name}</h4>
                            <p className="text-xs text-[var(--hana-muted)]">{exp.desc}</p>
                          </div>
                          <span className={`text-sm font-semibold ${isSelected ? 'text-[var(--hana-blush-dark)]' : 'text-[var(--hana-ash)]'}`}>
                            ₹{exp.price}/hr
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  <div className="mt-5">
                    <h3 className="font-heading text-base font-bold text-[var(--hana-charcoal)] mb-2">
                      Notes for {companion?.displayName}
                    </h3>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)}
                      placeholder="Any special requests or preferences..."
                      className="w-full p-4 bg-white rounded-2xl border border-[var(--hana-subtle)]/40 text-sm resize-none h-24 outline-none focus:ring-2 focus:ring-pink-400/25 focus:border-pink-400 placeholder:text-[var(--hana-muted)] text-[var(--hana-charcoal)] transition-all" />
                  </div>
                </motion.div>
              )}

              {/* Step 2: Date & Time */}
              {step === 2 && (
                <motion.div key="step2" variants={slideVariants} initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.25, ease: 'easeOut' }} className="px-5 md:px-0 space-y-5">
                  {/* Calendar */}
                  <div className="p-5 bg-white rounded-2xl border border-[var(--hana-subtle)]/30 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <button onClick={() => {
                        if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) }
                        else setCalMonth(m => m - 1)
                      }} className="p-1.5 text-[var(--hana-blush-dark)] hover:bg-pink-50 rounded-lg btn-press">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <h3 className="font-heading text-base font-bold text-[var(--hana-charcoal)]">{MONTHS[calMonth]} {calYear}</h3>
                      <button onClick={() => {
                        if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) }
                        else setCalMonth(m => m + 1)
                      }} className="p-1.5 text-[var(--hana-blush-dark)] hover:bg-pink-50 rounded-lg btn-press">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                      {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                        <div key={d} className="text-xs font-medium text-[var(--hana-muted)] py-1">{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {calendarDays.map((day, i) => (
                        <button key={i} disabled={!day || isPastDay(day)}
                          onClick={() => day && !isPastDay(day) && setSelectedDate(day)}
                          className={`w-9 h-9 rounded-full text-sm font-medium flex items-center justify-center mx-auto transition-all duration-200 ${
                            !day ? '' :
                            isPastDay(day) ? 'text-[var(--hana-subtle)] cursor-not-allowed' :
                            day === selectedDate
                              ? 'bg-[var(--hana-blush-dark)] text-white shadow-md shadow-pink-500/25'
                              : 'text-[var(--hana-ash)] hover:bg-[var(--hana-ivory)]'
                          }`}>
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div>
                    <h3 className="font-heading text-base font-bold text-[var(--hana-charcoal)] mb-3">Select Time Slot</h3>
                    <div className="flex gap-2 flex-wrap">
                      {TIME_SLOTS.map(time => (
                        <button key={time} onClick={() => setSelectedTime(time)}
                          className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-250 btn-press ${
                            selectedTime === time
                              ? 'bg-[var(--hana-blush-dark)] text-white shadow-md shadow-pink-500/25'
                              : 'bg-white text-[var(--hana-ash)] border border-[var(--hana-subtle)]/40 hover:border-pink-300'
                          }`}>
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <h3 className="font-heading text-base font-bold text-[var(--hana-charcoal)] mb-3">Duration</h3>
                    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[var(--hana-subtle)]/30 shadow-sm">
                      <button onClick={() => setDuration(d => Math.max(1, d - 1))}
                        className="w-10 h-10 rounded-full border-2 border-pink-200 flex items-center justify-center text-[var(--hana-blush-dark)] hover:bg-pink-50 transition-colors btn-press">
                        <Minus className="w-4 h-4" />
                      </button>
                      <div className="text-center">
                        <span className="text-lg font-bold text-[var(--hana-charcoal)]">{duration} hour{duration > 1 ? 's' : ''}</span>
                        <p className="text-xs text-[var(--hana-muted)]">₹{hourlyRate} per hour</p>
                      </div>
                      <button onClick={() => setDuration(d => Math.min(8, d + 1))}
                        className="w-10 h-10 rounded-full bg-[var(--hana-blush-dark)] flex items-center justify-center text-white shadow-md shadow-pink-500/25 hover:opacity-90 transition-opacity btn-press">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Summary */}
              {step === 3 && (
                <motion.div key="step3" variants={slideVariants} initial="enter" animate="center" exit="exit"
                  transition={{ duration: 0.25, ease: 'easeOut' }} className="px-5 md:px-0">
                  <h2 className="font-heading text-base font-bold text-[var(--hana-charcoal)] mb-4">Booking Summary</h2>

                  <div className="relative rounded-2xl overflow-hidden h-44 mb-5 bg-gradient-to-br from-pink-100 to-purple-100">
                    {companion?.photos?.[0] ? (
                      <img src={companion.photos[0]} alt={companion.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl animate-float-gentle">🌸</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {companion?.averageRating && (
                      <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 glass rounded-lg">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-bold text-[var(--hana-charcoal)]">{companion.averageRating.toFixed(1)}</span>
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3">
                      <span className="text-white font-heading font-bold text-lg drop-shadow-md">{companion?.displayName}</span>
                      <p className="text-white/80 text-xs">{companion?.city}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-[var(--hana-subtle)]/30 shadow-sm space-y-3.5">
                    {[
                      { label: 'Experience', value: `${selectedExperience.emoji} ${selectedExperience.name}` },
                      { label: 'Date', value: selectedDate ? `${MONTHS[calMonth]} ${selectedDate}, ${calYear}` : 'Not selected' },
                      { label: 'Time', value: `${selectedTime} — ${getEndTime(selectedTime, duration)}` },
                      { label: 'Duration', value: `${duration} hour${duration > 1 ? 's' : ''}` },
                      { label: 'Location', value: companion?.city || 'TBD' },
                    ].map(({ label, value }, i, arr) => (
                      <div key={label}>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[var(--hana-muted)]">{label}</span>
                          <span className="text-sm font-medium text-[var(--hana-charcoal)]">{value}</span>
                        </div>
                        {i < arr.length - 1 && <div className="border-t border-[var(--hana-subtle)]/20 mt-3.5" />}
                      </div>
                    ))}
                  </div>

                  <div className="bg-white rounded-2xl p-5 border border-[var(--hana-subtle)]/30 shadow-sm mt-3 flex justify-between items-center">
                    <span className="text-sm font-semibold text-[var(--hana-charcoal)]">Total</span>
                    <span className="text-xl font-bold text-[var(--hana-blush-dark)]">₹{total.toLocaleString('en-IN')}</span>
                  </div>

                  {bookingSuccess && (
                    <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
                      <p className="text-sm font-semibold text-emerald-700">Request Sent!</p>
                      <p className="text-xs text-emerald-600 mt-1">Your companion will review and accept your booking.</p>
                    </div>
                  )}
                  {bookMutation.isError && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-center">
                      <p className="text-sm font-semibold text-red-600">Failed to send request</p>
                      <p className="text-xs text-red-500 mt-1">{bookMutation.error?.message || 'Something went wrong'}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden md:block">
            <div className="bg-white rounded-2xl p-6 border border-[var(--hana-subtle)]/30 shadow-sm sticky top-24 space-y-4">
              <h3 className="font-heading text-lg font-bold text-[var(--hana-charcoal)]">Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--hana-muted)]">Companion</span>
                  <span className="font-medium text-[var(--hana-charcoal)]">{companion?.displayName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--hana-muted)]">Experience</span>
                  <span className="font-medium text-[var(--hana-charcoal)]">{selectedExperience.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--hana-muted)]">Rate</span>
                  <span className="font-medium text-[var(--hana-charcoal)]">₹{hourlyRate}/hr</span>
                </div>
                {step >= 2 && selectedDate && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-[var(--hana-muted)]">Date</span>
                      <span className="font-medium text-[var(--hana-charcoal)]">{MONTHS[calMonth]} {selectedDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--hana-muted)]">Time</span>
                      <span className="font-medium text-[var(--hana-charcoal)]">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--hana-muted)]">Duration</span>
                      <span className="font-medium text-[var(--hana-charcoal)]">{duration} hr{duration > 1 ? 's' : ''}</span>
                    </div>
                  </>
                )}
                <div className="border-t border-[var(--hana-subtle)]/30 pt-3 flex justify-between">
                  <span className="font-semibold text-[var(--hana-charcoal)]">Total</span>
                  <span className="text-xl font-bold text-[var(--hana-blush-dark)]">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile bottom bar */}
        <div className="fixed bottom-[72px] left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-[var(--hana-subtle)]/30 px-5 py-4 flex items-center justify-between md:hidden z-40 shadow-[0_-4px_20px_rgba(233,30,99,0.06)]">
          <div>
            <p className="text-xs text-[var(--hana-muted)]">{step === 1 ? selectedExperience.name : 'Total'}</p>
            <p className="text-xl font-bold text-[var(--hana-charcoal)]">
              ₹{step === 1 ? `${hourlyRate}/hr` : total.toLocaleString('en-IN')}
            </p>
          </div>
          {step < 3 ? (
            <button onClick={() => setStep(s => s + 1)}
              className="px-8 py-3.5 bg-hana-gradient text-white rounded-full text-sm font-semibold shadow-lg shadow-pink-500/20 flex items-center gap-2 btn-press">
              {step === 1 ? 'Next' : 'Continue'} <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleConfirm} disabled={bookMutation.isPending || bookingSuccess}
              className="px-6 py-3.5 bg-hana-gradient text-white rounded-full text-sm font-semibold shadow-lg shadow-pink-500/20 flex items-center gap-2 btn-press disabled:opacity-50">
              <Check className="w-4 h-4" /> {bookMutation.isPending ? 'Sending...' : bookingSuccess ? 'Sent!' : 'Send Request'}
            </button>
          )}
        </div>

        {/* Desktop action */}
        <div className="hidden md:flex justify-end px-5 mt-6 pb-8">
          {step < 3 ? (
            <button onClick={() => setStep(s => s + 1)}
              className="px-8 py-3.5 bg-hana-gradient text-white rounded-xl text-sm font-semibold shadow-lg shadow-pink-500/20 flex items-center gap-2 btn-press">
              {step === 1 ? 'Next' : 'Continue'} <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleConfirm} disabled={bookMutation.isPending || bookingSuccess}
              className="px-8 py-3.5 bg-hana-gradient text-white rounded-xl text-sm font-semibold shadow-lg shadow-pink-500/20 flex items-center gap-2 btn-press disabled:opacity-50">
              <Check className="w-4 h-4" /> {bookMutation.isPending ? 'Sending...' : bookingSuccess ? 'Request Sent!' : 'Send Booking Request'}
            </button>
          )}
        </div>
      </div>

      <SuccessOverlay
        show={bookingSuccess}
        title="Request Sent!"
        subtitle="Your companion will review your request. You'll be notified once they accept."
        onDone={() => {
          setBookingSuccess(false)
          setActiveView('myBookings')
        }}
      />

      <BottomNav />
    </div>
  )
}

function CountdownTimer({ expiresAt }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const update = () => {
      const now = Date.now()
      const expires = new Date(expiresAt).getTime()
      const diff = expires - now
      if (diff <= 0) { setTimeLeft('Expired'); return }
      const mins = Math.floor(diff / 60000)
      const secs = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  const isUrgent = timeLeft !== 'Expired' && parseInt(timeLeft) < 5

  return (
    <div className={`flex items-center gap-1.5 text-sm font-mono font-bold ${
      timeLeft === 'Expired' ? 'text-red-500' : isUrgent ? 'text-red-500 animate-pulse' : 'text-purple-600'
    }`}>
      <Timer className="w-4 h-4" />
      {timeLeft}
    </div>
  )
}

const BOOKING_STATUS_CONFIG = {
  PENDING_ACCEPTANCE: { label: 'Pending Acceptance', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  AWAITING_PAYMENT: { label: 'Awaiting Payment', color: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  CONFIRMED: { label: 'Confirmed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  COMPLETED: { label: 'Completed', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-50 text-red-600 border-red-200', dot: 'bg-red-500' },
  REJECTED: { label: 'Rejected', color: 'bg-gray-50 text-gray-600 border-gray-200', dot: 'bg-gray-500' },
  EXPIRED: { label: 'Expired', color: 'bg-gray-50 text-gray-500 border-gray-200', dot: 'bg-gray-400' },
}

const BOOKING_TABS = ['All', 'Active', 'Completed', 'Cancelled']

function BookingCard({ booking }) {
  const queryClient = useQueryClient()
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false)
  const cfg = BOOKING_STATUS_CONFIG[booking.status] || BOOKING_STATUS_CONFIG.EXPIRED

  const pay = useMutation({
    mutationFn: () => confirmPayment(booking.id),
    onSuccess: () => {
      setShowPaymentSuccess(true)
    },
  })

  const cancel = useMutation({
    mutationFn: () => userCancelBooking(booking.id, 'Cancelled by me'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-bookings'] }),
  })

  const canCancel = ['PENDING_ACCEPTANCE', 'AWAITING_PAYMENT', 'CONFIRMED'].includes(booking.status)
  const needsPayment = booking.status === 'AWAITING_PAYMENT'

  return (
    <>
      <SuccessOverlay
        show={showPaymentSuccess}
        title="Booking Confirmed!"
        subtitle="Payment complete. Your session is locked in. Chat is now enabled with your companion."
        onDone={() => {
          setShowPaymentSuccess(false)
          queryClient.invalidateQueries({ queryKey: ['my-bookings'] })
        }}
      />
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center overflow-hidden shrink-0">
              {booking.companion?.photos?.[0] || booking.companion?.user?.image ? (
                <img src={booking.companion?.photos?.[0] || booking.companion?.user?.image} alt="" className="w-full h-full object-cover" />
              ) : <span className="text-lg">🌸</span>}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--hana-charcoal)]">
                {booking.companion?.displayName || 'Companion'}
              </h3>
              <p className="text-xs text-[var(--hana-muted)] flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {booking.companion?.city}
              </p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${cfg.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-[var(--hana-muted)]">
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{booking.startTime} - {booking.endTime}</span>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
          <span className="text-xs text-[var(--hana-muted)]">{booking.activityType} · {booking.durationHours}h</span>
          <span className="text-base font-bold text-[var(--hana-charcoal)]">₹{booking.totalAmount?.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {needsPayment && (
        <div className="px-4 py-3 bg-purple-50/50 border-t border-purple-100">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-semibold text-purple-700">Payment Required</p>
              <p className="text-xs text-purple-600 mt-0.5">Complete payment to confirm</p>
            </div>
            {booking.paymentExpiresAt && <CountdownTimer expiresAt={booking.paymentExpiresAt} />}
          </div>
          <div className="flex gap-2">
            <button onClick={() => pay.mutate()} disabled={pay.isPending}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-hana-gradient text-white rounded-xl text-sm font-semibold shadow-lg shadow-pink-500/20 disabled:opacity-50 btn-press">
              {pay.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              {pay.isPending ? 'Processing...' : 'Pay Now'}
            </button>
            <button onClick={() => cancel.mutate()} disabled={cancel.isPending}
              className="px-4 py-3 border border-red-200 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 disabled:opacity-50 btn-press">
              <X className="w-4 h-4" />
            </button>
          </div>
          {pay.isError && <p className="mt-2 text-xs text-red-500 text-center">{pay.error?.message}</p>}
        </div>
      )}

      {canCancel && !needsPayment && (
        <div className="px-4 py-3 border-t border-gray-50 flex justify-end">
          <button onClick={() => cancel.mutate()} disabled={cancel.isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
            <X className="w-3.5 h-3.5" /> Cancel Booking
          </button>
        </div>
      )}

      {booking.status === 'CONFIRMED' && (
        <div className="px-4 py-3 border-t border-emerald-100 bg-emerald-50/30 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className="text-xs text-emerald-700 font-medium">Confirmed! Chat enabled.</span>
        </div>
      )}
    </motion.div>
    </>
  )
}

function MyBookingsList({ onSwitchToBook, showCapsules, companion }) {
  const [activeTab, setActiveTab] = useState('All')

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => getMyBookings(),
    refetchInterval: 10000,
  })

  const filtered = activeTab === 'All' ? bookings :
    activeTab === 'Active' ? bookings.filter(b => ['PENDING_ACCEPTANCE', 'AWAITING_PAYMENT', 'CONFIRMED'].includes(b.status)) :
    activeTab === 'Completed' ? bookings.filter(b => b.status === 'COMPLETED') :
    bookings.filter(b => ['CANCELLED', 'REJECTED', 'EXPIRED'].includes(b.status))

  const awaitingPayment = bookings.filter(b => b.status === 'AWAITING_PAYMENT').length

  return (
    <div className="min-h-screen relative">
      <TopNav />
      <div className="max-w-2xl mx-auto px-5 pt-14 md:pt-8 pb-28 relative z-10">
        <header className="mb-5">
          <h1 className="font-heading text-2xl font-bold text-[var(--hana-charcoal)]">My Bookings</h1>
          <p className="text-sm text-[var(--hana-muted)] mt-0.5">Track your requests and upcoming sessions</p>
        </header>

        {showCapsules && (
          <div className="mb-5">
            <div className="flex items-center gap-2 bg-white rounded-full p-1.5 border border-[var(--hana-subtle)]/30 shadow-sm">
              <button
                onClick={() => onSwitchToBook?.()}
                className="flex-1 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 text-[var(--hana-muted)] hover:text-[var(--hana-charcoal)]"
              >
                Book a Moment
              </button>
              <button
                className="flex-1 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 bg-hana-gradient text-white shadow-md shadow-pink-500/20"
              >
                My Bookings
              </button>
            </div>
          </div>
        )}

        {awaitingPayment > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-700">{awaitingPayment} booking{awaitingPayment > 1 ? 's' : ''} awaiting payment</p>
              <p className="text-xs text-purple-600">Complete payment before the timer expires</p>
            </div>
          </motion.div>
        )}

        <div className="flex items-center gap-1 bg-white rounded-xl p-1.5 border border-gray-100 shadow-sm mb-5 overflow-x-auto">
          {BOOKING_TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-[var(--hana-charcoal)] text-white shadow-sm'
                  : 'text-[var(--hana-muted)] hover:text-[var(--hana-charcoal)] hover:bg-gray-50'
              }`}>
              {tab}
              {tab === 'Active' && awaitingPayment > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-purple-500 text-white rounded-full">
                  {awaitingPayment}
                </span>
              )}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-pink-100 to-purple-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-gray-100 rounded-full w-28" />
                    <div className="h-2.5 bg-gray-50 rounded-full w-20" />
                  </div>
                  <div className="h-6 w-24 bg-gray-100 rounded-full" />
                </div>
                <div className="flex gap-4">
                  <div className="h-3 bg-gray-50 rounded-full w-24" />
                  <div className="h-3 bg-gray-50 rounded-full w-28" />
                </div>
                <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between">
                  <div className="h-3 bg-gray-50 rounded-full w-32" />
                  <div className="h-4 bg-gray-100 rounded-full w-16" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && (
          <div className="space-y-4">
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-[var(--hana-muted)] text-sm">No bookings in this category</p>
                <Link href="/discover" className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-hana-gradient text-white rounded-full text-sm font-semibold shadow-md shadow-pink-500/20 btn-press">
                  <Compass className="w-4 h-4" /> Discover Companions
                </Link>
              </div>
            )}
            {filtered.map(booking => <BookingCard key={booking.id} booking={booking} />)}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}

function SelectCompanionPrompt() {
  return (
    <div className="min-h-screen relative">
      <TopNav />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-sm"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-pink-100 to-purple-100 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg shadow-pink-200/30">
            🌸
          </div>
          <h1 className="font-heading text-2xl font-bold text-[var(--hana-charcoal)] mb-3">
            Choose a Companion First
          </h1>
          <p className="text-[var(--hana-muted)] text-sm leading-relaxed mb-8">
            Browse our verified companions, find someone who matches your vibe, and tap <strong className="text-[var(--hana-charcoal)]">Book a Moment</strong> on their profile to get started.
          </p>
          <div className="space-y-3">
            <Link href="/discover"
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-hana-gradient text-white rounded-2xl text-sm font-semibold shadow-lg shadow-pink-500/20 btn-press">
              <Compass className="w-4 h-4" /> Browse Companions
            </Link>
            <Link href="/home"
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-white border border-[var(--hana-subtle)]/50 text-[var(--hana-ash)] rounded-2xl text-sm font-medium hover:bg-[var(--hana-ivory)] transition-colors btn-press">
              Go to Home
            </Link>
          </div>
        </motion.div>
      </div>
      <BottomNav />
    </div>
  )
}

export default function BookingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-pink-500 border-t-transparent animate-spin" /></div>}>
      <BookingsInner />
    </Suspense>
  )
}

function getEndTime(startTime, hours) {
  const [time, period] = startTime.split(' ')
  let [h] = time.split(':').map(Number)
  if (period === 'PM' && h !== 12) h += 12
  if (period === 'AM' && h === 12) h = 0
  h += hours
  const newPeriod = h >= 12 ? 'PM' : 'AM'
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${displayH}:00 ${newPeriod}`
}
