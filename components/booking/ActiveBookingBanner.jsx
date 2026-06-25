'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Clock, Timer, AlertTriangle, Sparkles } from 'lucide-react'
import { getMyBookings, autoCompleteBooking } from '@/app/actions/bookings'
import { getExtensionOptions, getPendingExtension } from '@/app/actions/extensions'
import { useBookingRealtime } from '@/hooks/useBookingRealtime'
import { useExtensionTimer, useExtensionRealtime } from '@/hooks/useExtensionRealtime'
import ExtensionPromptSheet from './ExtensionPromptSheet'
import ExtensionPaymentSheet from './ExtensionPaymentSheet'
import Link from 'next/link'
import { getImageUrl } from '@/lib/image-url'

// TESTING: 24x speed — 2 hours completes in 5 real minutes. Remove for production.
const TIME_ACCELERATION = 24

function parseTimeStr(timeStr) {
  if (!timeStr) return { hours: 0, minutes: 0 }
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i)
  if (!match) return { hours: 0, minutes: 0 }
  let hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const period = match[3]
  if (period) {
    if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12
    if (period.toUpperCase() === 'AM' && hours === 12) hours = 0
  }
  return { hours, minutes }
}

function CountdownTimer({ bookingDate, endTimeStr, startTime, durationHours, onComplete }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, progress: 0 })
  const completedRef = useRef(false)

  useEffect(() => {
    let endMs
    if (endTimeStr && bookingDate) {
      const { hours: eh, minutes: em } = parseTimeStr(endTimeStr)
      const end = new Date(bookingDate)
      end.setHours(eh, em, 0, 0)
      endMs = end.getTime()
    } else {
      const totalMs = durationHours * 60 * 60 * 1000
      endMs = new Date(startTime).getTime() + totalMs
    }

    const startMs = new Date(startTime).getTime()
    const totalMs = endMs - startMs

    function update() {
      const realElapsed = Date.now() - startMs
      const virtualElapsed = realElapsed * TIME_ACCELERATION
      const remaining = Math.max(0, totalMs - virtualElapsed)
      const progress = Math.min(100, (virtualElapsed / totalMs) * 100)

      const hours = Math.floor(remaining / (1000 * 60 * 60))
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000)

      setTimeLeft({ hours, minutes, seconds, progress })

      // Session time is up — auto-complete once.
      if (remaining <= 0 && !completedRef.current) {
        completedRef.current = true
        onComplete?.()
      }
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [bookingDate, endTimeStr, startTime, durationHours, onComplete])

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1 font-mono text-lg font-bold text-white">
        <span className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1">{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="text-white/60 animate-pulse">:</span>
        <span className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1">{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="text-white/60 animate-pulse">:</span>
        <span className="bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1">{String(timeLeft.seconds).padStart(2, '0')}</span>
      </div>
      <div className="hidden sm:block flex-1 max-w-32">
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white/80 rounded-full"
            style={{ width: `${timeLeft.progress}%` }}
            transition={{ duration: 1 }}
          />
        </div>
        <p className="text-[10px] text-white/60 mt-0.5 text-center">{timeLeft.progress.toFixed(0)}% elapsed</p>
      </div>
    </div>
  )
}

function PaymentCountdown({ expiresAt }) {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    function update() {
      const remaining = Math.max(0, new Date(expiresAt).getTime() - Date.now())
      const min = Math.floor(remaining / 60000)
      const sec = Math.floor((remaining % 60000) / 1000)
      setTimeLeft(`${min}:${String(sec).padStart(2, '0')}`)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])

  return <span className="font-mono font-bold">{timeLeft}</span>
}

export default function ActiveBookingBanner() {
  const queryClient = useQueryClient()
  const [showExtensionPrompt, setShowExtensionPrompt] = useState(false)
  const [showExtensionPayment, setShowExtensionPayment] = useState(false)
  const [pendingExt, setPendingExt] = useState(null)

  const { data: inProgressBookings = [] } = useQuery({
    queryKey: ['my-bookings', 'IN_PROGRESS'],
    queryFn: () => getMyBookings({ status: 'IN_PROGRESS' }),
    refetchInterval: 30000,
  })

  const { data: awaitingPayment = [] } = useQuery({
    queryKey: ['my-bookings', 'AWAITING_PAYMENT'],
    queryFn: () => getMyBookings({ status: 'AWAITING_PAYMENT' }),
    refetchInterval: 15000,
  })

  const { data: confirmedBookings = [] } = useQuery({
    queryKey: ['my-bookings', 'CONFIRMED'],
    queryFn: () => getMyBookings({ status: 'CONFIRMED' }),
  })

  const activeBooking = inProgressBookings[0]
  const paymentBooking = awaitingPayment[0]
  const upcomingBooking = confirmedBookings[0]

  const { shouldShowPrompt, dismiss: dismissPrompt } = useExtensionTimer(activeBooking)

  const { data: extensionOptions } = useQuery({
    queryKey: ['extension-options', activeBooking?.id],
    queryFn: () => getExtensionOptions(activeBooking.id),
    enabled: !!activeBooking && (shouldShowPrompt || showExtensionPrompt),
  })

  // Poll the pending extension so approval is detected even without realtime.
  const { data: polledExtension } = useQuery({
    queryKey: ['pending-extension', activeBooking?.id],
    queryFn: () => getPendingExtension(activeBooking.id),
    enabled: !!activeBooking,
    refetchInterval: 5000,
  })

  const handleAutoComplete = useCallback(async () => {
    if (!activeBooking) return
    try {
      await autoCompleteBooking(activeBooking.id)
    } catch {}
    queryClient.invalidateQueries({ queryKey: ['my-bookings'] })
  }, [activeBooking, queryClient])

  useExtensionRealtime(activeBooking?.id, useCallback((eventType, payload) => {
    if (payload?.status === 'APPROVED') {
      setPendingExt(payload)
      setShowExtensionPayment(true)
      setShowExtensionPrompt(false)
    }
    if (payload?.status === 'DECLINED') {
      setShowExtensionPrompt(false)
      setPendingExt(null)
    }
    if (payload?.status === 'PAID') {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] })
    }
  }, [queryClient]))

  useEffect(() => {
    if (shouldShowPrompt && activeBooking && !showExtensionPayment) {
      setShowExtensionPrompt(true)
    }
  }, [shouldShowPrompt, activeBooking, showExtensionPayment])

  // When the companion approves, open the payment sheet (polling-driven).
  useEffect(() => {
    if (polledExtension?.status === 'APPROVED') {
      setPendingExt(polledExtension)
      setShowExtensionPayment(true)
      setShowExtensionPrompt(false)
    }
  }, [polledExtension])

  useBookingRealtime(activeBooking?.id, useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['my-bookings'] })
  }, [queryClient]))

  if (!activeBooking && !paymentBooking && !upcomingBooking) return null

  return (
    <>
      <AnimatePresence mode="wait">
      {activeBooking && (
        <motion.div
          key="in-progress"
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          className="overflow-hidden"
        >
          <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-5 shadow-xl shadow-emerald-500/20 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
            <div className="absolute top-2 right-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-3 h-3 rounded-full bg-white/80 shadow-lg shadow-white/50"
              />
            </div>

            <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-white/30"
                >
                  {activeBooking.companion?.photos?.[0] || activeBooking.companion?.user?.image ? (
                    <img src={getImageUrl(activeBooking.companion?.photos?.[0] || activeBooking.companion?.user?.image)} alt={activeBooking.companion?.user?.name || 'Companion'} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-white">{(activeBooking.companion?.user?.name || 'C')[0]}</span>
                  )}
                </motion.div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold text-sm sm:text-base">Date in Progress</h3>
                    <motion.span
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold text-white uppercase tracking-wide"
                    >
                      Live
                    </motion.span>
                  </div>
                  <p className="text-white/70 text-xs mt-0.5">
                    with <span className="text-white font-medium">{activeBooking.companion?.user?.name || 'your companion'}</span> · {activeBooking.activityType}
                  </p>
                </div>
              </div>

              <CountdownTimer
                bookingDate={activeBooking.date}
                endTimeStr={activeBooking.endTime}
                startTime={activeBooking.verifiedAt || activeBooking.updatedAt}
                durationHours={activeBooking.durationHours}
                onComplete={handleAutoComplete}
              />
            </div>

            <div className="relative flex items-center gap-4 mt-3 pt-3 border-t border-white/10">
              <span className="text-xs text-white/60 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> {activeBooking.startTime} - {activeBooking.endTime}
              </span>
              <span className="text-xs text-white/60 flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5" /> {activeBooking.durationHours}h session
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowExtensionPrompt(true)}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold hover:bg-white/30 transition-colors"
              >
                <Sparkles className="w-3 h-3" /> Extend
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {!activeBooking && paymentBooking && (
        <motion.div
          key="awaiting-payment"
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          className="overflow-hidden"
        >
          <Link href="/bookings">
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl p-5 shadow-xl shadow-amber-500/20 overflow-hidden cursor-pointer"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(255,255,255,0.12),transparent)] pointer-events-none" />
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-white/30"
                  >
                    {paymentBooking.companion?.photos?.[0] || paymentBooking.companion?.user?.image ? (
                      <img src={getImageUrl(paymentBooking.companion?.photos?.[0] || paymentBooking.companion?.user?.image)} alt={paymentBooking.companion?.user?.name || 'Companion'} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-white">{(paymentBooking.companion?.user?.name || 'C')[0]}</span>
                    )}
                  </motion.div>
                  <div>
                    <h3 className="text-white font-bold text-sm sm:text-base">Payment Pending</h3>
                    <p className="text-white/70 text-xs mt-0.5">
                      Complete payment for your booking with <span className="text-white font-medium">{paymentBooking.companion?.user?.name || 'companion'}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-white/15 backdrop-blur-sm rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-white" />
                    <span className="text-white text-sm font-medium">
                      Expires in <PaymentCountdown expiresAt={paymentBooking.paymentExpiresAt} />
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>
        </motion.div>
      )}

      {!activeBooking && !paymentBooking && upcomingBooking && (
        <motion.div
          key="confirmed"
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          className="overflow-hidden"
        >
          <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-5 shadow-xl shadow-blue-500/20 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.08),transparent)] pointer-events-none" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-white/30">
                  {upcomingBooking.companion?.photos?.[0] || upcomingBooking.companion?.user?.image ? (
                    <img src={getImageUrl(upcomingBooking.companion?.photos?.[0] || upcomingBooking.companion?.user?.image)} alt={upcomingBooking.companion?.user?.name || 'Companion'} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-white">{(upcomingBooking.companion?.user?.name || 'C')[0]}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm sm:text-base">Upcoming Date Confirmed</h3>
                  <p className="text-white/70 text-xs mt-0.5">
                    with <span className="text-white font-medium">{upcomingBooking.companion?.user?.name || 'companion'}</span> · {upcomingBooking.activityType}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <span className="px-3 py-1.5 rounded-lg bg-white/15 text-xs font-medium">
                  {new Date(upcomingBooking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {upcomingBooking.startTime}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {showExtensionPrompt && activeBooking && (
        <ExtensionPromptSheet
          booking={activeBooking}
          options={extensionOptions?.options || []}
          onClose={() => { setShowExtensionPrompt(false); dismissPrompt() }}
          onRequested={(ext) => {
            setShowExtensionPrompt(false)
            setPendingExt(ext)
          }}
        />
      )}

      {showExtensionPayment && pendingExt && activeBooking && (
        <ExtensionPaymentSheet
          extension={pendingExt}
          booking={activeBooking}
          onClose={() => setShowExtensionPayment(false)}
          onPaid={() => {
            setShowExtensionPayment(false)
            setPendingExt(null)
            queryClient.invalidateQueries({ queryKey: ['my-bookings'] })
          }}
        />
      )}
    </>
  )
}
