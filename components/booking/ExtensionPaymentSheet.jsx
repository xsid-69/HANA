'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IndianRupee, Clock, CheckCircle2, Loader2, X } from 'lucide-react'
import { payExtension } from '@/app/actions/extensions'

export default function ExtensionPaymentSheet({ extension, booking, onClose, onPaid }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

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

  function addMinutesToTime(timeStr, mins) {
    const { hours, minutes } = parseTimeStr(timeStr)
    const totalMinutes = hours * 60 + minutes + mins
    const newH = Math.floor(totalMinutes / 60) % 24
    const newM = totalMinutes % 60
    const period = newH >= 12 ? 'PM' : 'AM'
    const h = newH % 12 || 12
    return `${h}:${String(newM).padStart(2, '0')} ${period}`
  }

  const newEndTime = addMinutesToTime(booking.endTime, extension.extraMinutes)
  const durationLabel = extension.extraMinutes >= 60
    ? `${extension.extraMinutes / 60} hour${extension.extraMinutes > 60 ? 's' : ''}`
    : `${extension.extraMinutes} minutes`

  async function handlePay() {
    setLoading(true)
    try {
      const result = await payExtension(extension.id)
      setSuccess(true)
      setTimeout(() => onPaid?.(result), 1500)
    } catch (err) {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center"
        onClick={!loading && !success ? onClose : undefined}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          drag={!loading && !success ? 'y' : false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.4 }}
          onDragEnd={(e, info) => { if (!loading && !success && info.offset.y > 120) onClose() }}
          className="w-full sm:max-w-md bg-white rounded-t-3xl px-6 pt-7 pb-9 relative overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Drag handle */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-10 h-1.5 rounded-full bg-neutral-300" />
          {success ? (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10, stiffness: 200, delay: 0.1 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4"
              >
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </motion.div>
              <h2 className="text-xl font-bold text-neutral-900">Booking Extended!</h2>
              <p className="text-neutral-500 text-sm mt-1">
                New end time: <span className="font-semibold text-neutral-800">{newEndTime}</span>
              </p>
            </motion.div>
          ) : (
            <div className="relative">
              <button
                onClick={onClose}
                disabled={loading}
                className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4 text-neutral-500" />
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 mb-3">
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-xl font-bold text-neutral-900">Extension Approved</h2>
                <p className="text-neutral-500 text-sm mt-1">Complete payment to continue your booking</p>
              </div>

              <div className="bg-neutral-50 rounded-2xl p-4 mb-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Extension Duration</span>
                  <span className="text-sm font-semibold text-neutral-900">{durationLabel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">Current End Time</span>
                  <span className="text-sm font-semibold text-neutral-900">{booking.endTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">New End Time</span>
                  <span className="text-sm font-semibold text-emerald-600">{newEndTime}</span>
                </div>
                <div className="border-t border-neutral-200 pt-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-neutral-900">Additional Cost</span>
                  <span className="flex items-center gap-1 text-lg font-bold text-neutral-900">
                    <IndianRupee className="w-4 h-4" />
                    {extension.additionalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                disabled={loading}
                onClick={handlePay}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-base shadow-lg shadow-violet-200 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <IndianRupee className="w-4 h-4" />
                    Pay ₹{extension.additionalAmount.toLocaleString('en-IN')}
                  </>
                )}
              </motion.button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
