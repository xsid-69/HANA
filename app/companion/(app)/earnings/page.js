'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, TrendingDown, IndianRupee, ArrowUpRight,
  ArrowDownRight, CreditCard, Wallet, Clock, CheckCircle2,
  ChevronRight, Calendar,
} from 'lucide-react'

const WEEKLY_DATA = [
  { day: 'Mon', amount: 2400, max: 4800 },
  { day: 'Tue', amount: 1600, max: 4800 },
  { day: 'Wed', amount: 3200, max: 4800 },
  { day: 'Thu', amount: 0, max: 4800 },
  { day: 'Fri', amount: 4800, max: 4800 },
  { day: 'Sat', amount: 3600, max: 4800 },
  { day: 'Sun', amount: 2000, max: 4800 },
]

const TRANSACTIONS = [
  { id: 1, client: 'Sneha Reddy', activity: 'Art Gallery Tour', date: '2026-05-30', amount: 2000, status: 'paid' },
  { id: 2, client: 'Vikram Patel', activity: 'Park Walk', date: '2026-05-28', amount: 1200, status: 'paid' },
  { id: 3, client: 'Deepika Joshi', activity: 'Shopping & Markets', date: '2026-05-25', amount: 1800, status: 'paid' },
  { id: 4, client: 'Ananya Iyer', activity: 'Coffee Date', date: '2026-05-22', amount: 1600, status: 'paid' },
  { id: 5, client: 'Rohan Gupta', activity: 'Food Adventure', date: '2026-05-20', amount: 2200, status: 'paid' },
  { id: 6, client: 'Priya Sharma', activity: 'Heritage Walk', date: '2026-05-18', amount: 2400, status: 'paid' },
  { id: 7, client: 'Karthik Nair', activity: 'Live Music Night', date: '2026-05-15', amount: 3600, status: 'pending' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
}

export default function CompanionEarningsPage() {
  const thisMonth = 14800
  const lastMonth = 13200
  const allTime = 86400
  const growthPercent = Math.round(((thisMonth - lastMonth) / lastMonth) * 100)

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-6">
        <h1 className="font-heading font-bold text-2xl text-[var(--hana-charcoal)]">Earnings</h1>
        <p className="text-[var(--hana-muted)] text-sm mt-1">Track your income and payouts</p>
      </motion.div>

      {/* Earnings Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* This Month */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[var(--hana-muted)] uppercase tracking-wider">This Month</span>
            <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" />
              <span className="text-xs font-semibold">{growthPercent}%</span>
            </div>
          </div>
          <div className="text-3xl font-bold text-[var(--hana-charcoal)]">
            ₹{thisMonth.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-[var(--hana-muted)] mt-1.5 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 text-emerald-500" />
            ₹{(thisMonth - lastMonth).toLocaleString('en-IN')} more than last month
          </div>
        </div>

        {/* Last Month */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[var(--hana-muted)] uppercase tracking-wider">Last Month</span>
            <Calendar className="w-4 h-4 text-[var(--hana-muted)]" />
          </div>
          <div className="text-3xl font-bold text-[var(--hana-charcoal)]">
            ₹{lastMonth.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-[var(--hana-muted)] mt-1.5">
            May 2026
          </div>
        </div>

        {/* All Time */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[var(--hana-muted)] uppercase tracking-wider">All Time</span>
            <Wallet className="w-4 h-4 text-[var(--hana-muted)]" />
          </div>
          <div className="text-3xl font-bold text-[var(--hana-charcoal)]">
            ₹{allTime.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-[var(--hana-muted)] mt-1.5">
            Since Jan 2026
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Chart + Transactions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly Bar Chart */}
          <motion.div variants={itemVariants} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-sm text-[var(--hana-charcoal)]">This Week</h2>
              <span className="text-xs text-[var(--hana-muted)]">
                Total: ₹{WEEKLY_DATA.reduce((s, d) => s + d.amount, 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-end gap-2 h-40">
              {WEEKLY_DATA.map(d => {
                const height = d.amount > 0 ? Math.max((d.amount / d.max) * 100, 8) : 4
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[10px] font-medium text-[var(--hana-muted)]">
                      {d.amount > 0 ? `₹${(d.amount / 1000).toFixed(1)}k` : '—'}
                    </span>
                    <div className="w-full flex justify-center">
                      <div
                        className={`w-full max-w-[32px] rounded-t-lg transition-all duration-500 ${
                          d.amount > 0 ? 'bg-[var(--hana-charcoal)]' : 'bg-gray-200'
                        }`}
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-medium text-[var(--hana-muted)]">{d.day}</span>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Transaction History */}
          <motion.div variants={itemVariants} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-sm text-[var(--hana-charcoal)]">Recent Transactions</h2>
              <button className="text-xs font-medium text-[var(--hana-muted)] hover:text-[var(--hana-charcoal)] transition-colors flex items-center gap-0.5">
                View all <ChevronRight className="w-3 h-3" />
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {TRANSACTIONS.map(tx => (
                <div key={tx.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                      <IndianRupee className="w-4 h-4 text-[var(--hana-ash)]" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[var(--hana-charcoal)]">{tx.client}</div>
                      <div className="text-xs text-[var(--hana-muted)]">{tx.activity} · {new Date(tx.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-[var(--hana-charcoal)]">+₹{tx.amount.toLocaleString('en-IN')}</div>
                    <div className={`text-[10px] font-medium ${tx.status === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {tx.status === 'paid' ? 'Paid' : 'Pending'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Payout Status */}
          <motion.div variants={itemVariants} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-sm text-[var(--hana-charcoal)] mb-4">Payout Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm text-[var(--hana-ash)]">Last Payout</span>
                </div>
                <span className="text-sm font-semibold text-[var(--hana-charcoal)]">₹8,200</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="text-sm text-[var(--hana-ash)]">Pending</span>
                </div>
                <span className="text-sm font-semibold text-amber-600">₹3,600</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[var(--hana-muted)]" />
                  <span className="text-sm text-[var(--hana-ash)]">Next Payout</span>
                </div>
                <span className="text-xs text-[var(--hana-muted)]">Jun 7</span>
              </div>
            </div>
            <div className="mt-4 p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div className="text-xs text-[var(--hana-muted)]">Payout Account</div>
              <div className="text-sm font-medium text-[var(--hana-charcoal)] mt-0.5">HDFC Bank ****4521</div>
            </div>
          </motion.div>

          {/* Performance */}
          <motion.div variants={itemVariants} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-semibold text-sm text-[var(--hana-charcoal)] mb-4">Performance</h3>
            <div className="space-y-3">
              {[
                { label: 'Bookings Completed', value: '24', change: '+3 this month', up: true },
                { label: 'Avg. Booking Value', value: '₹1,850', change: '↑ 8% vs last month', up: true },
                { label: 'Repeat Clients', value: '6', change: '25% repeat rate', up: true },
                { label: 'Rating', value: '4.9', change: '32 reviews', up: true },
              ].map(metric => (
                <div key={metric.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <div className="text-xs text-[var(--hana-muted)]">{metric.label}</div>
                    <div className="text-sm font-semibold text-[var(--hana-charcoal)] mt-0.5">{metric.value}</div>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    metric.up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {metric.change}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Insight */}
          <motion.div variants={itemVariants} className="bg-gradient-to-br from-[var(--hana-charcoal)] to-[var(--hana-ash)] rounded-xl p-5 text-white">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-medium text-white/70 uppercase tracking-wider">Insight</span>
            </div>
            <p className="text-sm leading-relaxed text-white/90">
              Your earnings are up <span className="font-bold text-emerald-400">{growthPercent}%</span> compared to last month. Weekend bookings drive 60% of your revenue.
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
