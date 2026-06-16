'use client'

import { useState, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, CheckCircle2, AlertTriangle, Loader2, Sparkles } from 'lucide-react'
import { verifyMeetingCode } from '@/app/actions/bookings'
import { useBookingRealtime } from '@/hooks/useBookingRealtime'
import { useUIStore } from '@/store/useUIStore'

export default function VerifyMeetingCard({ bookingId, codeVerified: initialVerified }) {
  const [code, setCode] = useState('')
  const [verified, setVerified] = useState(initialVerified)
  const queryClient = useQueryClient()
  const addToast = useUIStore((s) => s.addToast)

  useBookingRealtime(bookingId, useCallback((updated) => {
    if (updated.codeVerified) setVerified(true)
    queryClient.invalidateQueries({ queryKey: ['companion-bookings'] })
  }, [bookingId, queryClient]))

  const verify = useMutation({
    mutationFn: () => verifyMeetingCode(bookingId, code.trim()),
    onSuccess: () => {
      setVerified(true)
      queryClient.invalidateQueries({ queryKey: ['companion-bookings'] })
      addToast({ type: 'success', title: 'Meetup Verified!', message: 'The session has started. Timer is now running.' })
    },
    onError: (err) => {
      addToast({ type: 'error', title: 'Verification Failed', message: err.message })
    },
  })

  if (verified) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-3 pt-3 border-t border-emerald-100"
      >
        <div className="flex items-center gap-2.5 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-700">Meetup Verified Successfully</p>
            <p className="text-xs text-emerald-600 mt-0.5">Booking is now in progress</p>
          </div>
          <Sparkles className="w-4 h-4 text-emerald-400 ml-auto" />
        </div>
      </motion.div>
    )
  }

  const isLocked = verify.error?.message?.includes('Maximum')

  return (
    <div className="mt-3 pt-3 border-t border-blue-100">
      <div className="flex items-center gap-2 mb-2.5">
        <Shield className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-semibold text-blue-800">Verify Meetup</span>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="Enter Meeting Code"
          disabled={isLocked || verify.isPending}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono tracking-widest text-center outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 placeholder:tracking-normal placeholder:font-sans disabled:bg-gray-50 disabled:opacity-60"
        />
        <button
          onClick={() => verify.mutate()}
          disabled={code.length !== 6 || verify.isPending || isLocked}
          className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          {verify.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Verify'
          )}
        </button>
      </div>

      <AnimatePresence>
        {verify.isError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 mt-2.5 p-2.5 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <p className="text-xs text-red-600">{verify.error.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
