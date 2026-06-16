'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Clock, Timer, IndianRupee } from 'lucide-react'
import { getCompanionBookings, completeBooking } from '@/app/actions/bookings'
import { useBookingRealtime } from '@/hooks/useBookingRealtime'
import { useUIStore } from '@/store/useUIStore'

function CountdownTimer({ startTime, durationHours }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0, progress: 0 })

  useEffect(() => {
    const totalMs = durationHours * 60 * 60 * 1000
    const endTime = new Date(startTime).getTime() + totalMs

    function update() {
      const now = Date.now()
      const remaining = Math.max(0, endTime - now)
      const elapsed = totalMs - remaining
      const progress = Math.min(100, (elapsed / totalMs) * 100)

      const hours = Math.floor(remaining / (1000 * 60 * 60))
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000)

      setTimeLeft({ hours, minutes, seconds, progress })
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [startTime, durationHours])

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

export default function CompanionActiveBanner() {
  const queryClient = useQueryClient()
  const addToast = useUIStore((s) => s.addToast)
  const [completing, setCompleting] = useState(false)

  const { data: inProgressBookings = [] } = useQuery({
    queryKey: ['companion-bookings', 'IN_PROGRESS'],
    queryFn: () => getCompanionBookings({ status: 'IN_PROGRESS' }),
    refetchInterval: 30000,
  })

  const { data: confirmedBookings = [] } = useQuery({
    queryKey: ['companion-bookings', 'CONFIRMED'],
    queryFn: () => getCompanionBookings({ status: 'CONFIRMED' }),
  })

  const activeBooking = inProgressBookings[0]
  const upcomingBooking = confirmedBookings[0]

  useBookingRealtime(activeBooking?.id, useCallback((updated) => {
    queryClient.invalidateQueries({ queryKey: ['companion-bookings'] })
    if (updated.status === 'COMPLETED') {
      addToast({ type: 'success', title: 'Session Complete', message: 'Great work! The booking has been completed.' })
    }
  }, [queryClient, addToast]))

  async function handleComplete() {
    if (!activeBooking) return
    setCompleting(true)
    try {
      await completeBooking(activeBooking.id)
      queryClient.invalidateQueries({ queryKey: ['companion-bookings'] })
      addToast({ type: 'success', title: 'Session Completed!', message: 'Your earnings will be processed shortly.' })
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: err.message })
    } finally {
      setCompleting(false)
    }
  }

  if (!activeBooking && !upcomingBooking) return null

  return (
    <AnimatePresence mode="wait">
      {activeBooking && (
        <motion.div
          key="active-session"
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          className="overflow-hidden mb-6"
        >
          <div className="relative bg-gradient-to-r from-pink-600 via-rose-600 to-purple-600 rounded-2xl p-5 shadow-xl shadow-pink-500/20 overflow-hidden">
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
                  {activeBooking.client?.image ? (
                    <img src={activeBooking.client.image} alt={activeBooking.client?.name || 'Client'} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-white">{(activeBooking.client?.name || 'C')[0]}</span>
                  )}
                </motion.div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold text-sm sm:text-base">Session in Progress</h3>
                    <motion.span
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold text-white uppercase tracking-wide"
                    >
                      Live
                    </motion.span>
                  </div>
                  <p className="text-white/70 text-xs mt-0.5">
                    with <span className="text-white font-medium">{activeBooking.client?.name || 'client'}</span> · {activeBooking.activityType}
                  </p>
                </div>
              </div>

              <CountdownTimer
                startTime={activeBooking.verifiedAt || activeBooking.updatedAt}
                durationHours={activeBooking.durationHours}
              />
            </div>

            <div className="relative flex items-center justify-between mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center gap-4">
                <span className="text-xs text-white/60 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> {activeBooking.startTime} - {activeBooking.endTime}
                </span>
                <span className="text-xs text-white/60 flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5" /> {activeBooking.durationHours}h
                </span>
                <span className="text-xs font-bold text-white/80 flex items-center gap-1">
                  <IndianRupee className="w-3 h-3" /> {activeBooking.totalAmount?.toLocaleString('en-IN')}
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleComplete}
                disabled={completing}
                className="px-4 py-2 rounded-xl bg-white text-pink-600 text-xs font-bold shadow-lg hover:bg-white/90 transition-colors disabled:opacity-50"
              >
                {completing ? 'Completing...' : 'End Session'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {!activeBooking && upcomingBooking && !upcomingBooking.codeVerified && (
        <motion.div
          key="upcoming"
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          className="overflow-hidden mb-6"
        >
          <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-5 shadow-xl shadow-blue-500/20 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.08),transparent)] pointer-events-none" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0 overflow-hidden ring-2 ring-white/30">
                  {upcomingBooking.client?.image ? (
                    <img src={upcomingBooking.client.image} alt={upcomingBooking.client?.name || 'Client'} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-white">{(upcomingBooking.client?.name || 'C')[0]}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm sm:text-base">Next Session Ready</h3>
                  <p className="text-white/70 text-xs mt-0.5">
                    <span className="text-white font-medium">{upcomingBooking.client?.name || 'Client'}</span> · {upcomingBooking.activityType}
                  </p>
                  <p className="text-white/50 text-[10px] mt-0.5">Enter the meeting code from your client to start the session</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <span className="px-3 py-1.5 rounded-lg bg-white/15 text-xs font-medium text-white">
                  {new Date(upcomingBooking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {upcomingBooking.startTime}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
