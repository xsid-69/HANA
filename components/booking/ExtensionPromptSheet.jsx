'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Sparkles, IndianRupee, X, Loader2 } from 'lucide-react'
import { requestExtension } from '@/app/actions/extensions'

export default function ExtensionPromptSheet({ booking, options, onClose, onRequested }) {
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)

  async function handleRequest(opt) {
    setSelected(opt.minutes)
    setLoading(true)
    try {
      const extension = await requestExtension({
        bookingId: booking.id,
        extraMinutes: opt.minutes,
      })
      onRequested?.(extension)
    } catch (err) {
      setLoading(false)
      setSelected(null)
    }
  }

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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.4 }}
          onDragEnd={(e, info) => { if (info.offset.y > 120) onClose() }}
          className="w-full sm:max-w-md bg-white rounded-t-3xl px-6 pt-7 pb-9 relative overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Drag handle */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-10 h-1.5 rounded-full bg-neutral-300" />
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-amber-50 pointer-events-none" />

          <div className="relative">
            <button
              onClick={onClose}
              className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
            >
              <X className="w-4 h-4 text-neutral-500" />
            </button>

            <div className="text-center mb-6">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-amber-500 mb-3"
              >
                <Sparkles className="w-7 h-7 text-white" />
              </motion.div>
              <h2 className="text-xl font-bold text-neutral-900">Enjoying your time together?</h2>
              <p className="text-neutral-500 text-sm mt-1">Need a little more time?</p>
            </div>

            <div className="space-y-3 mb-5">
              {options.map(opt => (
                <motion.button
                  key={opt.minutes}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={loading}
                  onClick={() => handleRequest(opt)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                    selected === opt.minutes
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-neutral-200 bg-white hover:border-violet-300 hover:bg-violet-50/50'
                  } disabled:opacity-60`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-amber-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-violet-600" />
                    </div>
                    <div className="text-left">
                      <span className="font-semibold text-neutral-900">{opt.label}</span>
                      <p className="text-xs text-neutral-500">
                        Until {addMinutesToTime(booking.endTime, opt.minutes)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-neutral-800">
                    {selected === opt.minutes && loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <IndianRupee className="w-3.5 h-3.5" />
                        <span>{opt.amount.toLocaleString('en-IN')}</span>
                      </>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            {options.length === 0 && (
              <div className="text-center py-6 text-neutral-500 text-sm">
                No extension options available right now.
              </div>
            )}

            <p className="text-center text-xs text-neutral-400">
              Your companion will be asked to approve the extension
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
