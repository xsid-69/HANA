'use client'

import { useState, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, CheckCircle2, Shield, Sparkles } from 'lucide-react'
import { getMeetingCode } from '@/app/actions/bookings'
import { useBookingRealtime } from '@/hooks/useBookingRealtime'

export default function MeetingCodeCard({ bookingId }) {
  const [copied, setCopied] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['meeting-code', bookingId],
    queryFn: () => getMeetingCode(bookingId),
    enabled: !!bookingId,
  })

  useBookingRealtime(bookingId, useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['meeting-code', bookingId] })
    queryClient.invalidateQueries({ queryKey: ['my-bookings'] })
  }, [bookingId, queryClient]))

  const handleCopy = async () => {
    if (!data?.meetingCode) return
    await navigator.clipboard.writeText(data.meetingCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="px-4 py-4 border-t border-emerald-100 bg-emerald-50/30 animate-pulse">
        <div className="h-4 bg-emerald-100 rounded w-40 mb-3" />
        <div className="h-10 bg-emerald-100 rounded w-full" />
      </div>
    )
  }

  if (!data?.meetingCode) return null

  if (data.codeVerified) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 py-4 border-t border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-700">Meetup Verified Successfully</p>
            <p className="text-xs text-emerald-600 mt-0.5">Booking Started</p>
          </div>
          <Sparkles className="w-4 h-4 text-emerald-400 ml-auto" />
        </div>
      </motion.div>
    )
  }

  return (
    <div className="px-4 py-4 border-t border-blue-100 bg-gradient-to-r from-blue-50/80 to-indigo-50/80">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-semibold text-blue-800">Meeting Verification Code</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 bg-white rounded-xl border-2 border-blue-200 px-4 py-3 flex items-center justify-center">
          <span className="text-2xl font-mono font-bold tracking-[0.3em] text-[var(--hana-charcoal)]">
            {data.meetingCode}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="shrink-0 w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20"
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <CheckCircle2 className="w-5 h-5" />
              </motion.div>
            ) : (
              <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <Copy className="w-4.5 h-4.5" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      <p className="text-xs text-blue-600 mt-2.5 leading-relaxed">
        Show this code to your companion when you meet.
      </p>
    </div>
  )
}
