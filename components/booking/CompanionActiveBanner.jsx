'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Clock, Timer } from 'lucide-react'
import { getCompanionBookings, autoCompleteBooking } from '@/app/actions/bookings'
import { getPendingExtension } from '@/app/actions/extensions'
import { useBookingRealtime } from '@/hooks/useBookingRealtime'
import { useExtensionRealtime } from '@/hooks/useExtensionRealtime'
import ExtensionApprovalCard from './ExtensionApprovalCard'
import SyncedSessionTimer from './SyncedSessionTimer'
import { formatINR } from '@/lib/format-currency'
import { useUIStore } from '@/store/useUIStore'

export default function CompanionActiveBanner() {
  const queryClient = useQueryClient()
  const addToast = useUIStore((s) => s.addToast)
  const [pendingExt, setPendingExt] = useState(null)

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

  // Poll the pending extension so requests appear even without realtime.
  const { data: polledExtension } = useQuery({
    queryKey: ['companion-pending-extension', activeBooking?.id],
    queryFn: () => getPendingExtension(activeBooking.id),
    enabled: !!activeBooking,
    refetchInterval: 5000,
  })

  const handleAutoComplete = useCallback(async () => {
    if (!activeBooking) return
    try {
      await autoCompleteBooking(activeBooking.id)
    } catch {}
    queryClient.invalidateQueries({ queryKey: ['companion-bookings'] })
  }, [activeBooking, queryClient])

  useBookingRealtime(activeBooking?.id, useCallback((updated) => {
    queryClient.invalidateQueries({ queryKey: ['companion-bookings'] })
    if (updated.status === 'COMPLETED') {
      addToast({ type: 'success', title: 'Session Complete', message: 'Great work! The booking has been completed.' })
    }
  }, [queryClient, addToast]))

  useExtensionRealtime(activeBooking?.id, useCallback((eventType, payload) => {
    if (eventType === 'INSERT' && payload?.status === 'PENDING') {
      setPendingExt(payload)
    }
    if (payload?.status === 'PAID') {
      setPendingExt(null)
      queryClient.setQueriesData({ queryKey: ['companion-pending-extension'] }, null)
      queryClient.invalidateQueries({ queryKey: ['companion-bookings'] })
      addToast({ type: 'success', title: 'Booking Extended', message: 'The booking has been extended successfully.' })
    }
  }, [queryClient, addToast]))

  const displayedExtension = pendingExt ?? (
    polledExtension?.status === 'PENDING' ? polledExtension : null
  )

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
          <div className="relative overflow-hidden rounded-[28px] bg-hana-gradient p-5 shadow-[0_20px_55px_-35px_rgba(233,30,99,0.75)] sm:p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(223,158,181,0.16),transparent_34%)] pointer-events-none" />
            <div className="absolute right-5 top-5" aria-hidden="true">
              <div className="size-2.5 rounded-full bg-[#79ba94] ring-4 ring-[#79ba94]/10" />
            </div>

            <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-[15px] bg-white/10 ring-1 ring-white/15">
                  {activeBooking.client?.image ? (
                    <img src={activeBooking.client.image} alt={activeBooking.client?.name || 'Client'} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-white">{(activeBooking.client?.name || 'C')[0]}</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white sm:text-base">Session in progress</h3>
                    <span className="rounded-lg bg-[#79ba94]/15 px-2 py-1 text-[10px] font-semibold text-[#9ed2b3]">
                      Live
                    </span>
                  </div>
                  <p className="text-white/70 text-xs mt-0.5">
                    with <span className="text-white font-medium">{activeBooking.client?.name || 'client'}</span> · {activeBooking.activityType}
                  </p>
                </div>
              </div>

              <SyncedSessionTimer booking={activeBooking} onComplete={handleAutoComplete} />
            </div>

            <div className="relative flex items-center mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center gap-4">
                <span className="text-xs text-white/60 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> {activeBooking.startTime} - {activeBooking.endTime}
                </span>
                <span className="text-xs text-white/60 flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5" /> {activeBooking.durationHours}h
                </span>
                <span className="text-xs font-bold text-white/80">
                  {formatINR(activeBooking.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {displayedExtension && activeBooking && (
        <motion.div
          key="extension-approval"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-6"
        >
          <ExtensionApprovalCard
            extension={displayedExtension}
            booking={activeBooking}
            clientName={activeBooking.client?.name || 'Client'}
            onResolved={(result) => {
              setPendingExt(null)
              queryClient.setQueriesData({ queryKey: ['companion-pending-extension'] }, null)
              if (result === 'approved') {
                addToast({ type: 'success', title: 'Extension Approved', message: 'Waiting for client payment.' })
              } else {
                addToast({ type: 'info', title: 'Extension Declined', message: 'The booking continues as scheduled.' })
              }
            }}
          />
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
          <div className="relative overflow-hidden rounded-[28px] border border-[var(--hana-subtle)] bg-white p-5 shadow-[0_18px_60px_-42px_rgba(66,25,43,0.5)] sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-3">
                <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-[15px] bg-[#ead9df] text-[#7c2848] ring-1 ring-[#decbd2]">
                  {upcomingBooking.client?.image ? (
                    <img src={upcomingBooking.client.image} alt={upcomingBooking.client?.name || 'Client'} className="size-full object-cover" />
                  ) : (
                    <span className="text-lg font-semibold">{(upcomingBooking.client?.name || 'C')[0]}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#20171b] sm:text-base">Next session ready</h3>
                  <p className="mt-0.5 text-xs text-[#75636b]">
                    <span className="font-medium text-[#45343b]">{upcomingBooking.client?.name || 'Client'}</span> · {upcomingBooking.activityType}
                  </p>
                  <p className="mt-1 text-[11px] text-[#8b7680]">Enter the client’s meeting code when you arrive.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#5f5057]">
                <span className="rounded-xl bg-[#f5eff1] px-3 py-2 text-xs font-semibold">
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
