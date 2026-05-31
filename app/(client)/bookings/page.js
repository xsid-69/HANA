'use client'

import { useState } from 'react'
import BottomNav from '@/components/layout/BottomNav'
import TopNav from '@/components/layout/TopNav'
import { ArrowLeft, ChevronLeft, ChevronRight, Minus, Plus, ArrowRight, Check, Coffee, Music, TreePine, Palette, UtensilsCrossed, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const EXPERIENCES = [
  { id: 'coffee', name: 'Coffee Date', desc: 'Cozy chats over artisan coffee', emoji: '☕', icon: Coffee, price: 45 },
  { id: 'music', name: 'Live Music Night', desc: 'Enjoy a vibrant gig together', emoji: '🎵', icon: Music, price: 60 },
  { id: 'park', name: 'Park Walk', desc: 'A relaxing stroll through nature', emoji: '🌳', icon: TreePine, price: 40 },
  { id: 'art', name: 'Art Gallery Tour', desc: 'Explore exhibits and curated art', emoji: '🎨', icon: Palette, price: 55 },
  { id: 'food', name: 'Foodie Adventure', desc: "Taste the city's best bites", emoji: '🍽️', icon: UtensilsCrossed, price: 65 },
]

const TIME_SLOTS = ['10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const slideVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 }
}

export default function BookingsPage() {
  const [step, setStep] = useState(1)
  const [selectedExperience, setSelectedExperience] = useState(EXPERIENCES[0])
  const [notes, setNotes] = useState('')
  const [selectedDate, setSelectedDate] = useState(12)
  const [selectedTime, setSelectedTime] = useState('12:00 PM')
  const [duration, setDuration] = useState(2)

  const total = selectedExperience.price * duration

  const month = 5
  const year = 2025
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: firstDay }, () => null)
  const calendarDays = [...blanks, ...days]

  return (
    <div className="min-h-screen relative">
      <TopNav />

      <div className="max-w-lg mx-auto md:max-w-4xl md:py-8 md:px-6 relative z-10">
        {/* Header */}
        <header className="px-5 pt-12 md:pt-0 pb-4 flex items-center gap-3">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : null}
            className="w-9 h-9 rounded-full bg-[var(--hana-warm-white)] border border-[var(--hana-subtle)]/40 shadow-sm flex items-center justify-center hover:bg-[var(--hana-ivory)] transition-colors btn-press"
          >
            <ArrowLeft className="w-4 h-4 text-[var(--hana-ash)]" />
          </button>
          <h1 className="font-heading text-xl font-bold text-[var(--hana-charcoal)]">Book a Moment</h1>
        </header>

        {/* Progress bar */}
        <div className="px-5 mb-5">
          <div className="flex gap-1.5">
            {[1, 2, 3].map(i => (
              <motion.div
                key={i}
                className={`flex-1 h-1.5 rounded-full transition-colors duration-500 ${i <= step ? 'bg-[var(--hana-blush-dark)]' : 'bg-[var(--hana-subtle)]/40'}`}
                initial={false}
                animate={{ scaleX: i <= step ? 1 : 0.95 }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
          <p className="text-center text-xs text-[var(--hana-muted)] mt-2 font-body">Step {step} of 3</p>
        </div>

        {/* Companion info */}
        <div className="mx-5 p-4 bg-[var(--hana-warm-white)] rounded-2xl border border-[var(--hana-subtle)]/30 shadow-sm flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--hana-blush)]/30 to-[var(--hana-lavender)]/30 flex items-center justify-center text-xl">
            🌸
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-[var(--hana-charcoal)] font-body">Isabelle</h3>
            <p className="text-xs text-[var(--hana-blush-dark)] font-body">☕ Coffee Date</p>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 chip-gold rounded-lg">
            <Star className="w-3 h-3 text-[var(--hana-gold)] fill-[var(--hana-gold)]" />
            <span className="text-xs font-semibold">4.9</span>
          </div>
        </div>

        <div className="md:grid md:grid-cols-3 md:gap-6 md:mx-5">
          <div className="md:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 1: Choose Experience */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  className="px-5 md:px-0"
                >
                  <h2 className="font-heading text-base font-bold text-[var(--hana-charcoal)] mb-3">Choose Your Experience</h2>
                  <div className="space-y-2">
                    {EXPERIENCES.map(exp => {
                      const isSelected = selectedExperience.id === exp.id
                      const Icon = exp.icon
                      return (
                        <motion.button
                          key={exp.id}
                          onClick={() => setSelectedExperience(exp)}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                            isSelected
                              ? 'border-[var(--hana-blush-dark)] bg-[var(--hana-blush)]/8 shadow-sm'
                              : 'border-transparent bg-[var(--hana-warm-white)] hover:bg-[var(--hana-ivory)]'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-[var(--hana-blush-dark)] text-white' : 'bg-[var(--hana-ivory)] text-[var(--hana-ash)]'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-[var(--hana-charcoal)] font-body">{exp.name}</h4>
                            <p className="text-xs text-[var(--hana-muted)] font-body">{exp.desc}</p>
                          </div>
                          <span className={`text-sm font-semibold font-body ${isSelected ? 'text-[var(--hana-blush-dark)]' : 'text-[var(--hana-ash)]'}`}>
                            ${exp.price}/hr
                          </span>
                        </motion.button>
                      )
                    })}
                  </div>

                  <div className="mt-5">
                    <h3 className="font-heading text-base font-bold text-[var(--hana-charcoal)] mb-2">Notes for Isabelle</h3>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special requests or preferences..."
                      className="w-full p-4 bg-[var(--hana-warm-white)] rounded-2xl border border-[var(--hana-subtle)]/40 text-sm resize-none h-24 outline-none focus:ring-2 focus:ring-[var(--hana-blush)]/30 focus:border-[var(--hana-blush-dark)] placeholder:text-[var(--hana-muted)] text-[var(--hana-charcoal)] font-body transition-all"
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 2: Date & Time */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  className="px-5 md:px-0 space-y-5"
                >
                  {/* Calendar */}
                  <div className="p-5 bg-[var(--hana-warm-white)] rounded-2xl border border-[var(--hana-subtle)]/30 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <button className="p-1 text-[var(--hana-blush-dark)] hover:bg-[var(--hana-blush)]/10 rounded-lg btn-press">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <h3 className="font-heading text-base font-bold text-[var(--hana-charcoal)]">{MONTHS[month]} {year}</h3>
                      <button className="p-1 text-[var(--hana-blush-dark)] hover:bg-[var(--hana-blush)]/10 rounded-lg btn-press">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <div key={i} className="text-xs font-medium text-[var(--hana-muted)] py-1 font-body">{d}</div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center">
                      {calendarDays.map((day, i) => (
                        <button
                          key={i}
                          disabled={!day}
                          onClick={() => day && setSelectedDate(day)}
                          className={`w-9 h-9 rounded-full text-sm font-medium flex items-center justify-center mx-auto transition-all duration-200 font-body ${
                            !day ? '' :
                            day === selectedDate
                              ? 'bg-[var(--hana-blush-dark)] text-white shadow-md shadow-[var(--hana-blush)]/25'
                              : day === 5
                                ? 'bg-[var(--hana-blush)]/15 text-[var(--hana-blush-dark)]'
                                : 'text-[var(--hana-ash)] hover:bg-[var(--hana-ivory)]'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div>
                    <h3 className="font-heading text-base font-bold text-[var(--hana-charcoal)] mb-3">Select Time Slot</h3>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                      {TIME_SLOTS.map(time => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 btn-press font-body ${
                            selectedTime === time
                              ? 'bg-[var(--hana-blush-dark)] text-white shadow-md shadow-[var(--hana-blush)]/25'
                              : 'bg-[var(--hana-warm-white)] text-[var(--hana-ash)] border border-[var(--hana-subtle)]/40'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <h3 className="font-heading text-base font-bold text-[var(--hana-charcoal)] mb-3">Duration</h3>
                    <div className="flex items-center justify-between p-4 bg-[var(--hana-warm-white)] rounded-2xl border border-[var(--hana-subtle)]/30 shadow-sm">
                      <button
                        onClick={() => setDuration(Math.max(1, duration - 1))}
                        className="w-10 h-10 rounded-full border-2 border-[var(--hana-blush)]/40 flex items-center justify-center text-[var(--hana-blush-dark)] hover:bg-[var(--hana-blush)]/10 transition-colors btn-press"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <div className="text-center">
                        <span className="text-lg font-bold text-[var(--hana-charcoal)] font-body">{duration} hours</span>
                        <p className="text-xs text-[var(--hana-muted)] font-body">${selectedExperience.price} per hour</p>
                      </div>
                      <button
                        onClick={() => setDuration(Math.min(8, duration + 1))}
                        className="w-10 h-10 rounded-full bg-[var(--hana-blush-dark)] flex items-center justify-center text-white shadow-md shadow-[var(--hana-blush)]/25 hover:bg-[var(--hana-coral)] transition-colors btn-press"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Summary */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.28, ease: 'easeOut' }}
                  className="px-5 md:px-0"
                >
                  <h2 className="font-heading text-base font-bold text-[var(--hana-charcoal)] mb-4">Booking Summary</h2>

                  <div className="relative rounded-2xl overflow-hidden h-44 bg-gradient-to-br from-[var(--hana-blush)]/25 to-[var(--hana-lavender)]/25 mb-5 flex items-center justify-center">
                    <div className="text-6xl animate-float-gentle">🌸</div>
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 glass rounded-lg">
                      <Star className="w-3 h-3 text-[var(--hana-gold)] fill-[var(--hana-gold)]" />
                      <span className="text-xs font-bold text-[var(--hana-charcoal)]">4.9</span>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className="text-white font-heading font-bold text-lg drop-shadow-md">Isabelle</span>
                    </div>
                  </div>

                  <div className="bg-[var(--hana-warm-white)] rounded-2xl p-5 border border-[var(--hana-subtle)]/30 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[var(--hana-muted)] font-body">Experience</span>
                      <span className="text-sm font-medium text-[var(--hana-charcoal)] flex items-center gap-1 font-body">
                        ☕ {selectedExperience.name}
                      </span>
                    </div>
                    <div className="border-t border-[var(--hana-subtle)]/20" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[var(--hana-muted)] font-body">Date</span>
                      <span className="text-sm font-medium text-[var(--hana-charcoal)] font-body">
                        Friday, {MONTHS[month]} {selectedDate}, {year}
                      </span>
                    </div>
                    <div className="border-t border-[var(--hana-subtle)]/20" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[var(--hana-muted)] font-body">Time</span>
                      <span className="text-sm font-medium text-[var(--hana-charcoal)] font-body">{selectedTime} — {getEndTime(selectedTime, duration)}</span>
                    </div>
                    <div className="border-t border-[var(--hana-subtle)]/20" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[var(--hana-muted)] font-body">Duration</span>
                      <span className="text-sm font-medium text-[var(--hana-charcoal)] font-body">{duration} hours</span>
                    </div>
                    <div className="border-t border-[var(--hana-subtle)]/20" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[var(--hana-muted)] font-body">Location</span>
                      <span className="text-sm font-medium text-[var(--hana-charcoal)] font-body">Central Park Café, NYC</span>
                    </div>
                  </div>

                  <div className="bg-[var(--hana-warm-white)] rounded-2xl p-5 border border-[var(--hana-subtle)]/30 shadow-sm mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[var(--hana-muted)] font-body">Payment Method</span>
                      <span className="text-sm font-medium text-[var(--hana-charcoal)] tracking-widest font-body">•••• •••• •••• 4242</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden md:block">
            <div className="bg-[var(--hana-warm-white)] rounded-2xl p-6 border border-[var(--hana-subtle)]/30 shadow-sm sticky top-24 space-y-4">
              <h3 className="font-heading text-lg font-bold text-[var(--hana-charcoal)]">Summary</h3>
              <div className="space-y-3 text-sm font-body">
                <div className="flex justify-between">
                  <span className="text-[var(--hana-muted)]">Experience</span>
                  <span className="font-medium text-[var(--hana-charcoal)]">{selectedExperience.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--hana-muted)]">Rate</span>
                  <span className="font-medium text-[var(--hana-charcoal)]">${selectedExperience.price}/hr</span>
                </div>
                {step >= 2 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-[var(--hana-muted)]">Date</span>
                      <span className="font-medium text-[var(--hana-charcoal)]">{MONTHS[month]} {selectedDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--hana-muted)]">Time</span>
                      <span className="font-medium text-[var(--hana-charcoal)]">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--hana-muted)]">Duration</span>
                      <span className="font-medium text-[var(--hana-charcoal)]">{duration} hours</span>
                    </div>
                  </>
                )}
                <div className="border-t border-[var(--hana-subtle)]/30 pt-3 flex justify-between">
                  <span className="text-[var(--hana-charcoal)] font-semibold">Total</span>
                  <span className="text-xl font-bold text-[var(--hana-blush-dark)]">${total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar (mobile) */}
        <div className="fixed bottom-[80px] md:bottom-0 left-0 right-0 bg-white border-t border-[var(--hana-subtle)]/30 px-5 py-4 flex items-center justify-between md:hidden z-40">
          <div>
            {step === 1 && (
              <>
                <p className="text-xs text-[var(--hana-muted)] font-body">{selectedExperience.name}</p>
                <p className="text-lg font-bold text-[var(--hana-charcoal)] font-body">${selectedExperience.price}/hr</p>
              </>
            )}
            {step >= 2 && (
              <>
                <p className="text-xs text-[var(--hana-muted)] font-body">Total</p>
                <p className="text-2xl font-bold text-[var(--hana-charcoal)] font-body">${total}</p>
              </>
            )}
          </div>
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-8 py-3.5 bg-hana-gradient text-white rounded-full text-sm font-semibold shadow-lg shadow-[var(--hana-blush)]/20 flex items-center gap-2 btn-press hover:shadow-xl transition-shadow"
            >
              {step === 1 ? 'Next' : 'Continue'} <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button className="px-6 py-3.5 bg-hana-gradient text-white rounded-full text-sm font-semibold shadow-lg shadow-[var(--hana-blush)]/20 flex items-center gap-2 btn-press hover:shadow-xl transition-shadow">
              <Check className="w-4 h-4" /> Confirm Booking
            </button>
          )}
        </div>

        {/* Desktop bottom action */}
        <div className="hidden md:flex justify-end px-5 mt-6">
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-8 py-3.5 bg-hana-gradient text-white rounded-xl text-sm font-semibold shadow-lg shadow-[var(--hana-blush)]/20 flex items-center gap-2 hover:shadow-xl transition-shadow btn-press"
            >
              {step === 1 ? 'Next' : 'Continue'} <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button className="px-8 py-3.5 bg-hana-gradient text-white rounded-xl text-sm font-semibold shadow-lg shadow-[var(--hana-blush)]/20 flex items-center gap-2 hover:shadow-xl transition-shadow btn-press">
              <Check className="w-4 h-4" /> Confirm Booking
            </button>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
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
