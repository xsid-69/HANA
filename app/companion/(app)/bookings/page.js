'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCompanionBookings, acceptBooking, rejectBooking, companionCancelBooking, completeBooking } from '@/app/actions/bookings'
import {
  CheckCircle2, XCircle, MessageCircle, Clock, Calendar,
  IndianRupee, User, Shield, AlertTriangle, Timer, Loader2,
} from 'lucide-react'

const TABS = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled']

const STATUS_CONFIG = {
  PENDING_ACCEPTANCE: { label: 'Pending Acceptance', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  AWAITING_PAYMENT: { label: 'Awaiting Payment', color: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  CONFIRMED: { label: 'Confirmed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  COMPLETED: { label: 'Completed', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-50 text-red-600 border-red-200', dot: 'bg-red-500' },
  REJECTED: { label: 'Rejected', color: 'bg-gray-50 text-gray-600 border-gray-200', dot: 'bg-gray-500' },
  EXPIRED: { label: 'Expired', color: 'bg-gray-50 text-gray-500 border-gray-200', dot: 'bg-gray-400' },
}

const TAB_FILTER = {
  All: null,
  Pending: 'PENDING_ACCEPTANCE',
  Confirmed: 'CONFIRMED',
  Completed: 'COMPLETED',
  Cancelled: 'CANCELLED',
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
}

export default function CompanionBookingsPage() {
  const [activeTab, setActiveTab] = useState('All')
  const [rejectingId, setRejectingId] = useState(null)
  const [cancellingId, setCancellingId] = useState(null)
  const queryClient = useQueryClient()

  const statusFilter = TAB_FILTER[activeTab]
  const { data: allBookings = [], isLoading } = useQuery({
    queryKey: ['companion-bookings', statusFilter],
    queryFn: () => getCompanionBookings(statusFilter ? { status: statusFilter } : undefined),
  })

  const accept = useMutation({
    mutationFn: acceptBooking,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['companion-bookings'] }),
  })

  const reject = useMutation({
    mutationFn: ({ id, reason }) => rejectBooking(id, reason),
    onSuccess: () => {
      setRejectingId(null)
      queryClient.invalidateQueries({ queryKey: ['companion-bookings'] })
    },
  })

  const cancel = useMutation({
    mutationFn: ({ id, reason }) => companionCancelBooking(id, reason),
    onSuccess: () => {
      setCancellingId(null)
      queryClient.invalidateQueries({ queryKey: ['companion-bookings'] })
    },
  })

  const complete = useMutation({
    mutationFn: completeBooking,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['companion-bookings'] }),
  })

  const pendingCount = allBookings.filter(b => b.status === 'PENDING_ACCEPTANCE').length
  const confirmedCount = allBookings.filter(b => b.status === 'CONFIRMED').length
  const completedCount = allBookings.filter(b => b.status === 'COMPLETED').length
  const earnings = allBookings.filter(b => b.status === 'COMPLETED').reduce((s, b) => s + b.totalAmount, 0)

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-[var(--hana-charcoal)]">Bookings</h1>
        <p className="text-[var(--hana-muted)] text-sm mt-1">Manage your booking requests and upcoming sessions</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Pending', value: pendingCount, color: 'text-amber-600' },
          { label: 'Confirmed', value: confirmedCount, color: 'text-emerald-600' },
          { label: 'Completed', value: completedCount, color: 'text-blue-600' },
          { label: 'This Month', value: `₹${earnings.toLocaleString('en-IN')}`, color: 'text-[var(--hana-charcoal)]' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="text-xs text-[var(--hana-muted)] font-medium">{stat.label}</div>
            <div className={`text-xl font-bold mt-1 ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex items-center gap-1 bg-white rounded-xl p-1.5 border border-gray-100 shadow-sm mb-6 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
              activeTab === tab
                ? 'bg-[var(--hana-charcoal)] text-white shadow-sm'
                : 'text-[var(--hana-muted)] hover:text-[var(--hana-charcoal)] hover:bg-gray-50'
            }`}
          >
            {tab}
            {tab === 'Pending' && pendingCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-amber-500 text-white rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </motion.div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-pink-500" />
        </div>
      )}

      {/* Desktop Table */}
      {!isLoading && (
        <motion.div variants={itemVariants} className="hidden md:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-[var(--hana-muted)] uppercase tracking-wider px-5 py-3.5">Client</th>
                <th className="text-left text-xs font-semibold text-[var(--hana-muted)] uppercase tracking-wider px-5 py-3.5">Date & Time</th>
                <th className="text-left text-xs font-semibold text-[var(--hana-muted)] uppercase tracking-wider px-5 py-3.5">Activity</th>
                <th className="text-left text-xs font-semibold text-[var(--hana-muted)] uppercase tracking-wider px-5 py-3.5">Status</th>
                <th className="text-right text-xs font-semibold text-[var(--hana-muted)] uppercase tracking-wider px-5 py-3.5">Amount</th>
                <th className="text-right text-xs font-semibold text-[var(--hana-muted)] uppercase tracking-wider px-5 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allBookings.map(booking => {
                const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.EXPIRED
                return (
                  <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-xs font-semibold text-pink-600">
                          {booking.client?.name?.[0] || '?'}
                        </div>
                        <div>
                          <span className="font-medium text-sm text-[var(--hana-charcoal)]">{booking.client?.name || 'Unknown'}</span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Shield className="w-3 h-3 text-emerald-500" />
                            <span className="text-[10px] text-emerald-600 font-medium">{booking.client?.trustScore ?? 100}%</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm text-[var(--hana-charcoal)]">{new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      <div className="text-xs text-[var(--hana-muted)]">{booking.startTime} - {booking.endTime} · {booking.durationHours}h</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-[var(--hana-ash)]">{booking.activityType}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="font-semibold text-sm text-[var(--hana-charcoal)]">₹{booking.totalAmount.toLocaleString('en-IN')}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {booking.status === 'PENDING_ACCEPTANCE' && (
                          <>
                            <button
                              onClick={() => accept.mutate(booking.id)}
                              disabled={accept.isPending}
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                              title="Accept"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => reject.mutate({ id: booking.id, reason: 'Not available' })}
                              disabled={reject.isPending}
                              className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-50"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {booking.status === 'CONFIRMED' && (
                          <>
                            <button
                              onClick={() => complete.mutate(booking.id)}
                              disabled={complete.isPending}
                              className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors disabled:opacity-50"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => cancel.mutate({ id: booking.id, reason: 'Cancelled by companion' })}
                              disabled={cancel.isPending}
                              className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors disabled:opacity-50"
                              title="Cancel"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {allBookings.length === 0 && (
            <div className="text-center py-12 text-[var(--hana-muted)] text-sm">No bookings found in this category.</div>
          )}
        </motion.div>
      )}

      {/* Mobile Cards */}
      {!isLoading && (
        <div className="md:hidden space-y-3">
          {allBookings.map(booking => {
            const cfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.EXPIRED
            return (
              <motion.div
                key={booking.id}
                variants={itemVariants}
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center text-xs font-semibold text-pink-600">
                      {booking.client?.name?.[0] || '?'}
                    </div>
                    <div>
                      <div className="font-medium text-sm text-[var(--hana-charcoal)]">{booking.client?.name || 'Unknown'}</div>
                      <div className="text-xs text-[var(--hana-muted)]">{booking.activityType}</div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm border-t border-gray-50 pt-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-[var(--hana-muted)]">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-xs">{new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[var(--hana-muted)]">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-xs">{booking.startTime}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[var(--hana-muted)]">
                      <Shield className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-xs text-emerald-600">{booking.client?.trustScore ?? 100}%</span>
                    </div>
                  </div>
                  <span className="font-semibold text-[var(--hana-charcoal)]">₹{booking.totalAmount.toLocaleString('en-IN')}</span>
                </div>

                {booking.status === 'PENDING_ACCEPTANCE' && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                    <button
                      onClick={() => accept.mutate(booking.id)}
                      disabled={accept.isPending}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-medium hover:bg-emerald-100 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                    </button>
                    <button
                      onClick={() => reject.mutate({ id: booking.id, reason: 'Not available' })}
                      disabled={reject.isPending}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-red-50 text-red-500 text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Decline
                    </button>
                  </div>
                )}

                {booking.status === 'CONFIRMED' && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                    <button
                      onClick={() => complete.mutate(booking.id)}
                      disabled={complete.isPending}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark Complete
                    </button>
                    <button
                      onClick={() => cancel.mutate({ id: booking.id, reason: 'Cancelled by companion' })}
                      disabled={cancel.isPending}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-red-50 text-red-500 text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </div>
                )}

                {booking.status === 'AWAITING_PAYMENT' && booking.paymentExpiresAt && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                    <Timer className="w-4 h-4 text-purple-500" />
                    <span className="text-xs text-purple-600 font-medium">Awaiting client payment...</span>
                  </div>
                )}
              </motion.div>
            )
          })}
          {allBookings.length === 0 && !isLoading && (
            <div className="text-center py-12 text-[var(--hana-muted)] text-sm">No bookings found.</div>
          )}
        </div>
      )}
    </motion.div>
  )
}
