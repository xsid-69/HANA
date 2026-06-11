'use server'

import { db } from '@/db'
import { notifications } from '@/db/schema'
import { eq, and, desc, count } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { verifyToken } from '@/lib/jwt'
import { cookies } from 'next/headers'

async function getUser() {
  let userId = null
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('hana-token')?.value
    if (token) {
      const payload = await verifyToken(token)
      if (payload?.id) userId = payload.id
    }
  } catch {}

  if (!userId) {
    try {
      const session = await auth()
      userId = session?.user?.id
    } catch {}
  }

  if (!userId) throw new Error('Unauthorized')
  return userId
}

export async function getNotifications({ limit = 20, unreadOnly = false } = {}) {
  const userId = await getUser()

  const conditions = [eq(notifications.userId, userId)]
  if (unreadOnly) {
    conditions.push(eq(notifications.isRead, false))
  }

  const results = await db.select()
    .from(notifications)
    .where(and(...conditions))
    .orderBy(desc(notifications.createdAt))
    .limit(limit)

  return results
}

export async function getUnreadCount() {
  const userId = await getUser()

  const [result] = await db.select({ count: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))

  return result?.count ?? 0
}

export async function markNotificationRead(notificationId) {
  const userId = await getUser()

  await db.update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
}

export async function markAllNotificationsRead() {
  const userId = await getUser()

  await db.update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
}
