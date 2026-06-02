'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc-client'
import BottomNav from '@/components/layout/BottomNav'
import TopNav from '@/components/layout/TopNav'
import {
  ArrowLeft, ChevronLeft, ChevronRight, Minus, Plus,
  ArrowRight, Check, Coffee, Music, TreePine, Palette,
  UtensilsCrossed, Star, MapPin, Compass,
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

function BookingsInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const companionId = searchParams.get('companionId')

  const { data: companionData } = trpc.companion.getById.useQuery(
    { id: companionId },
    { enabled: !!companionId }
  )

  // Fall back to last viewed companion from session storage
  const [sessionCompanion] = useState(() => getLastCompanion())
  const companion = companionData || (!companionId ? sessionCompanion : null)

  const [step, setStep] = useState(1)
  const [selectedExperience, setSelectedExperience] = useState(EXPERIENCES[0])
  const [notes, setNotes] = useState('')
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedTime, setSelectedTime] = useState('12:00 PM')
  const [duration, setDuration] = useState(2)
  const [calMonth, setCalMonth] = useState(new Date().getMonth())
  const [calYear, setCalYear] = useState(new Date().getFullYear())

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

  // If no companion selected, show selection prompt
  if (!companion) {
    return <SelectCompanionPrompt />
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
          <h1 className="font-heading text-xl font-bold text-[var(--hana-charcoal)]">Book a Moment</h1>
        </header>

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
            <button className="px-6 py-3.5 bg-hana-gradient text-white rounded-full text-sm font-semibold shadow-lg shadow-pink-500/20 flex items-center gap-2 btn-press">
              <Check className="w-4 h-4" /> Confirm
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
            <button className="px-8 py-3.5 bg-hana-gradient text-white rounded-xl text-sm font-semibold shadow-lg shadow-pink-500/20 flex items-center gap-2 btn-press">
              <Check className="w-4 h-4" /> Confirm Booking
            </button>
          )}
        </div>
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
