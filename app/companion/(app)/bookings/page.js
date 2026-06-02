'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle2, XCircle, MessageCircle, Clock, Calendar,
  IndianRupee, Filter, ChevronDown, User, MoreVertical,
} from 'lucide-react'

const TABS = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled']

const MOCK_BOOKINGS = [
  {
    id: 1,
    client: 'Arjun Mehta',
    date: '2026-06-04',
    time: '10:00 AM',
    activity: 'Coffee Date',
    status: 'pending',
    amount: 1600,
    duration: '2 hrs',
    avatar: 'AM',
  },
  {
    id: 2,
    client: 'Priya Sharma',
    date: '2026-06-05',
    time: '4:00 PM',
    activity: 'Heritage Walk',
    status: 'confirmed',
    amount: 2400,
    duration: '3 hrs',
    avatar: 'PS',
  },
  {
    id: 3,
    client: 'Rohan Gupta',
    date: '2026-06-03',
    time: '12:00 PM',
    activity: 'Food Adventure',
    status: 'confirmed',
    amount: 2200,
    duration: '2 hrs',
    avatar: 'RG',
  },
  {
    id: 4,
    client: 'Sneha Reddy',
    date: '2026-05-30',
    time: '6:00 PM',
    activity: 'Art Gallery Tour',
    status: 'completed',
    amount: 2000,
    duration: '2 hrs',
    avatar: 'SR',
  },
  {
    id: 5,
    client: 'Vikram Patel',
    date: '2026-05-28',
    time: '2:00 PM',
    activity: 'Park Walk',
    status: 'completed',
    amount: 1200,
    duration: '2 hrs',
    avatar: 'VP',
  },
  {
    id: 6,
    client: 'Ananya Iyer',
    date: '2026-05-26',
    time: '10:00 AM',
    activity: 'Coffee Date',
    status: 'cancelled',
    amount: 1600,
    duration: '2 hrs',
    avatar: 'AI',
  },
  {
    id: 7,
    client: 'Karthik Nair',
    date: '2026-06-07',
    time: '11:00 AM',
    activity: 'Live Music Night',
    status: 'pending',
    amount: 3600,
    duration: '3 hrs',
    avatar: 'KN',
  },
  {
    id: 8,
    client: 'Deepika Joshi',
    date: '2026-05-25',
    time: '3:00 PM',
    activity: 'Shopping & Markets',
    status: 'completed',
    amount: 1800,
    duration: '2 hrs',
    avatar: 'DJ',
  },
]

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  confirmed: { label: 'Confirmed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  completed: { label: 'Completed', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  cancelled: { label: 'Cancelled', color: 'bg-red-50 text-red-600 border-red-200' },
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

  const filtered = activeTab === 'All'
    ? MOCK_BOOKINGS
    : MOCK_BOOKINGS.filter(b => b.status === activeTab.toLowerCase())

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-[var(--hana-charcoal)]">Bookings</h1>
        <p className="text-[var(--hana-muted)] text-sm mt-1">Manage your upcoming and past bookings</p>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Pending', value: MOCK_BOOKINGS.filter(b => b.status === 'pending').length, color: 'text-amber-600' },
          { label: 'Confirmed', value: MOCK_BOOKINGS.filter(b => b.status === 'confirmed').length, color: 'text-emerald-600' },
          { label: 'Completed', value: MOCK_BOOKINGS.filter(b => b.status === 'completed').length, color: 'text-blue-600' },
          { label: 'This Month', value: `₹${MOCK_BOOKINGS.filter(b => b.status === 'completed').reduce((s, b) => s + b.amount, 0).toLocaleString('en-IN')}`, color: 'text-[var(--hana-charcoal)]' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="text-xs text-[var(--hana-muted)] font-medium">{stat.label}</div>
            <div className={`text-xl font-bold mt-1 ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </motion.div>

      {/* Tab Navigation */}
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
          </button>
        ))}
      </motion.div>

      {/* Desktop Table */}
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
            {filtered.map(booking => (
              <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-[var(--hana-ash)]">
                      {booking.avatar}
                    </div>
                    <span className="font-medium text-sm text-[var(--hana-charcoal)]">{booking.client}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="text-sm text-[var(--hana-charcoal)]">{new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                  <div className="text-xs text-[var(--hana-muted)]">{booking.time} · {booking.duration}</div>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm text-[var(--hana-ash)]">{booking.activity}</span>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_CONFIG[booking.status].color}`}>
                    {STATUS_CONFIG[booking.status].label}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <span className="font-semibold text-sm text-[var(--hana-charcoal)]">₹{booking.amount.toLocaleString('en-IN')}</span>
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {booking.status === 'pending' && (
                      <>
                        <button className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors" title="Confirm">
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title="Decline">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button className="p-1.5 rounded-lg bg-gray-50 text-[var(--hana-muted)] hover:bg-gray-100 transition-colors" title="Message">
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[var(--hana-muted)] text-sm">No bookings found in this category.</div>
        )}
      </motion.div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filtered.map(booking => (
          <motion.div
            key={booking.id}
            variants={itemVariants}
            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-[var(--hana-ash)]">
                  {booking.avatar}
                </div>
                <div>
                  <div className="font-medium text-sm text-[var(--hana-charcoal)]">{booking.client}</div>
                  <div className="text-xs text-[var(--hana-muted)]">{booking.activity}</div>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_CONFIG[booking.status].color}`}>
                {STATUS_CONFIG[booking.status].label}
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
                  <span className="text-xs">{booking.time}</span>
                </div>
              </div>
              <span className="font-semibold text-[var(--hana-charcoal)]">₹{booking.amount.toLocaleString('en-IN')}</span>
            </div>

            {booking.status === 'pending' && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-medium hover:bg-emerald-100 transition-colors">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Confirm
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-red-50 text-red-500 text-xs font-medium hover:bg-red-100 transition-colors">
                  <XCircle className="w-3.5 h-3.5" /> Decline
                </button>
                <button className="flex items-center justify-center p-2 rounded-lg bg-gray-50 text-[var(--hana-muted)] hover:bg-gray-100 transition-colors">
                  <MessageCircle className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-[var(--hana-muted)] text-sm">No bookings found.</div>
        )}
      </div>
    </motion.div>
  )
}
