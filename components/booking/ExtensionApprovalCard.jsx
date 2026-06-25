'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, IndianRupee, Check, X, AlertCircle, Loader2 } from 'lucide-react'
import { approveExtension, declineExtension } from '@/app/actions/extensions'

export default function ExtensionApprovalCard({ extension, booking, clientName, onResolved }) {
  const [loading, setLoading] = useState(null)

  const durationLabel = extension.extraMinutes >= 60
    ? `${extension.extraMinutes / 60} hour${extension.extraMinutes > 60 ? 's' : ''}`
    : `${extension.extraMinutes} minutes`

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

  async function handleAccept() {
    setLoading('accept')
    try {
      await approveExtension(extension.id)
      onResolved?.('approved')
    } catch (err) {
      setLoading(null)
    }
  }

  async function handleDecline() {
    setLoading('decline')
    try {
      await declineExtension(extension.id)
      onResolved?.('declined')
    } catch (err) {
      setLoading(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="bg-gradient-to-br from-violet-50 to-amber-50 border-2 border-violet-200 rounded-2xl p-5 shadow-lg shadow-violet-100/50"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5 text-violet-600" />
        </div>
        <div>
          <h3 className="font-bold text-neutral-900 text-sm">Extension Request</h3>
          <p className="text-neutral-600 text-sm mt-0.5">
            {clientName} wants to extend by {durationLabel}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-xl p-3 border border-neutral-100">
          <p className="text-[11px] text-neutral-500 uppercase tracking-wide font-medium">Additional Earnings</p>
          <p className="flex items-center gap-1 font-bold text-lg text-emerald-600 mt-0.5">
            <IndianRupee className="w-4 h-4" />
            {extension.additionalAmount.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-neutral-100">
          <p className="text-[11px] text-neutral-500 uppercase tracking-wide font-medium">New End Time</p>
          <p className="font-bold text-lg text-neutral-800 mt-0.5">{newEndTime}</p>
        </div>
      </div>

      {extension._conflictWarning && (
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl mb-4">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-xs text-amber-700">You have another booking scheduled.</p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          disabled={loading || extension._conflictWarning}
          onClick={handleAccept}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm shadow-md shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === 'accept' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          Accept
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          disabled={!!loading}
          onClick={handleDecline}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-neutral-100 text-neutral-700 font-semibold text-sm hover:bg-neutral-200 disabled:opacity-50"
        >
          {loading === 'decline' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <X className="w-4 h-4" />
          )}
          Decline
        </motion.button>
      </div>
    </motion.div>
  )
}
