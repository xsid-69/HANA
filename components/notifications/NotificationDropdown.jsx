'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usePathname } from 'next/navigation'
import { getNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead } from '@/app/actions/notifications'
import { Bell, Check, CheckCheck, Calendar, MessageCircle, IndianRupee, AlertCircle, X } from 'lucide-react'
import Link from 'next/link'

const ICON_MAP = {
  BOOKING_REQUEST: { icon: Calendar, color: '#f59e0b', bg: '#fef3c7' },
  BOOKING_ACCEPTED: { icon: Check, color: '#10b981', bg: '#d1fae5' },
  BOOKING_CONFIRMED: { icon: Calendar, color: '#10b981', bg: '#d1fae5' },
  BOOKING_DECLINED: { icon: X, color: '#ef4444', bg: '#fee2e2' },
  BOOKING_CANCELLED: { icon: X, color: '#ef4444', bg: '#fee2e2' },
  BOOKING_COMPLETED: { icon: CheckCheck, color: '#6366f1', bg: '#e0e7ff' },
  NEW_MESSAGE: { icon: MessageCircle, color: '#3b82f6', bg: '#dbeafe' },
  PAYMENT_REMINDER: { icon: IndianRupee, color: '#f59e0b', bg: '#fef3c7' },
  PAYMENT_EXPIRED: { icon: AlertCircle, color: '#ef4444', bg: '#fee2e2' },
  REVIEW_REMINDER: { icon: MessageCircle, color: '#8b5cf6', bg: '#ede9fe' },
  SYSTEM: { icon: AlertCircle, color: '#6b7280', bg: '#f3f4f6' },
}

function getNotifLink(notif, isCompanion) {
  const prefix = isCompanion ? '/companion' : ''
  if (notif.type === 'BOOKING_REQUEST' || notif.type === 'BOOKING_ACCEPTED' || notif.type === 'BOOKING_CONFIRMED' || notif.type === 'BOOKING_DECLINED' || notif.type === 'BOOKING_CANCELLED' || notif.type === 'BOOKING_COMPLETED') {
    return `${prefix}/bookings`
  }
  if (notif.type === 'NEW_MESSAGE') return `${prefix}/messages`
  if (notif.type === 'PAYMENT_REMINDER' || notif.type === 'PAYMENT_EXPIRED') return `${prefix}/bookings`
  return null
}

function timeAgo(date) {
  const now = new Date()
  const diff = now - new Date(date)
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const queryClient = useQueryClient()
  const pathname = usePathname()
  const isCompanion = pathname?.startsWith('/companion')

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: getUnreadCount,
    refetchInterval: 15000,
  })

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications-list'],
    queryFn: () => getNotifications({ limit: 20 }),
    enabled: open,
    refetchInterval: open ? 10000 : false,
  })

  const markRead = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-list'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
    },
  })

  const markAllRead = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-list'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
    },
  })

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="relative w-10 h-10 rounded-xl flex items-center justify-center border bg-white hover:bg-gray-50 transition-colors"
        style={{ borderColor: 'var(--hana-subtle)' }}
        aria-label="Notifications"
      >
        <Bell size={18} className="text-[var(--hana-ash)]" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-12 w-[360px] max-h-[480px] rounded-2xl border bg-white shadow-xl overflow-hidden z-50"
            style={{ borderColor: 'var(--hana-subtle)' }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--hana-subtle)' }}>
              <h3 className="text-sm font-bold text-[var(--hana-charcoal)]">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead.mutate()}
                  className="text-xs font-medium text-pink-500 hover:text-pink-600 transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="overflow-y-auto max-h-[420px] divide-y" style={{ divideColor: 'var(--hana-subtle)' }}>
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                  <p className="text-sm text-[var(--hana-muted)]">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const config = ICON_MAP[notif.type] || ICON_MAP.SYSTEM
                  const Icon = config.icon
                  const link = getNotifLink(notif, isCompanion)
                  const Wrapper = link ? Link : 'div'
                  const wrapperProps = link ? { href: link, onClick: () => setOpen(false) } : {}

                  return (
                    <Wrapper
                      key={notif.id}
                      {...wrapperProps}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50/80 transition-colors cursor-pointer ${!notif.isRead ? 'bg-pink-50/30' : ''}`}
                      onClick={() => {
                        if (!notif.isRead) markRead.mutate(notif.id)
                        if (link) setOpen(false)
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                        style={{ backgroundColor: config.bg, color: config.color }}
                      >
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notif.isRead ? 'font-semibold' : 'font-medium'} text-[var(--hana-charcoal)] leading-snug`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-[var(--hana-muted)] mt-0.5 line-clamp-2">{notif.body}</p>
                        <p className="text-[10px] text-[var(--hana-muted)] mt-1">{timeAgo(notif.createdAt)}</p>
                      </div>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0 mt-2" />
                      )}
                    </Wrapper>
                  )
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
