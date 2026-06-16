'use server'

import { db } from '@/db'
import { conversations, conversationParticipants, messages, users, notifications, companions, bookings } from '@/db/schema'
import { eq, and, not, desc, lt, inArray, count } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { verifyToken } from '@/lib/jwt'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { publish } from '@/lib/message-events'

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

export async function getCurrentUserId() {
  return await getUser()
}

export async function getConversations() {
  const userId = await getUser()

  const participations = await db.select()
    .from(conversationParticipants)
    .where(eq(conversationParticipants.userId, userId))

  const results = await Promise.all(participations.map(async (p) => {
    const [conversation] = await db.select()
      .from(conversations)
      .where(eq(conversations.id, p.conversationId))
      .limit(1)

    if (!conversation) return null

    let bookingStatus = null
    if (conversation.bookingId) {
      const [booking] = await db.select({ status: bookings.status })
        .from(bookings)
        .where(eq(bookings.id, conversation.bookingId))
        .limit(1)
      bookingStatus = booking?.status || null
    }

    const participants = await db.select()
      .from(conversationParticipants)
      .where(eq(conversationParticipants.conversationId, conversation.id))

    const participantsWithUser = await Promise.all(participants.map(async (part) => {
      const [user] = await db.select({ id: users.id, name: users.name, image: users.image })
        .from(users)
        .where(eq(users.id, part.userId))
        .limit(1)

      const [companion] = await db.select({ photos: companions.photos, displayName: companions.displayName })
        .from(companions)
        .where(eq(companions.userId, part.userId))
        .limit(1)

      const resolvedImage = user?.image || companion?.photos?.[0] || null
      const resolvedName = companion?.displayName || user?.name

      return { ...part, user: { ...user, image: resolvedImage, name: resolvedName } }
    }))

    const lastMessages = await db.select()
      .from(messages)
      .where(eq(messages.conversationId, conversation.id))
      .orderBy(desc(messages.createdAt))
      .limit(1)

    const [unreadResult] = await db.select({ count: count() })
      .from(messages)
      .where(and(
        eq(messages.conversationId, conversation.id),
        not(eq(messages.senderId, userId)),
        eq(messages.isRead, false),
      ))

    return {
      ...conversation,
      bookingStatus,
      participants: participantsWithUser,
      messages: lastMessages,
      unreadCount: unreadResult?.count ?? 0,
    }
  }))

  return results
    .filter(Boolean)
    .sort((a, b) => {
      const aTime = a.lastMessageAt?.getTime() ?? 0
      const bTime = b.lastMessageAt?.getTime() ?? 0
      return bTime - aTime
    })
}

export async function getMessages(input) {
  const userId = await getUser()

  const schema = z.object({
    conversationId: z.string(),
    cursor: z.string().optional(),
    limit: z.number().default(20),
  })

  const data = schema.parse(input)

  const [participant] = await db.select()
    .from(conversationParticipants)
    .where(and(
      eq(conversationParticipants.conversationId, data.conversationId),
      eq(conversationParticipants.userId, userId),
    ))
    .limit(1)

  if (!participant) throw new Error('Forbidden')

  const conditions = [eq(messages.conversationId, data.conversationId)]

  if (data.cursor) {
    const [cursorMsg] = await db.select({ createdAt: messages.createdAt })
      .from(messages)
      .where(eq(messages.id, data.cursor))
      .limit(1)

    if (cursorMsg) {
      conditions.push(lt(messages.createdAt, cursorMsg.createdAt))
    }
  }

  const rows = await db.select()
    .from(messages)
    .where(and(...conditions))
    .orderBy(desc(messages.createdAt))
    .limit(data.limit + 1)

  const msgsWithSender = await Promise.all(rows.map(async (msg) => {
    const [sender] = await db.select({ id: users.id, name: users.name, image: users.image })
      .from(users)
      .where(eq(users.id, msg.senderId))
      .limit(1)
    return { ...msg, sender }
  }))

  let nextCursor = undefined
  if (msgsWithSender.length > data.limit) {
    const next = msgsWithSender.pop()
    nextCursor = next.id
  }

  return { messages: msgsWithSender, nextCursor }
}

export async function sendMessage(input) {
  const userId = await getUser()

  const schema = z.object({
    conversationId: z.string(),
    content: z.string().min(1).max(2000),
    type: z.enum(['TEXT', 'IMAGE']).default('TEXT'),
  })

  const data = schema.parse(input)

  const [participant] = await db.select()
    .from(conversationParticipants)
    .where(and(
      eq(conversationParticipants.conversationId, data.conversationId),
      eq(conversationParticipants.userId, userId),
    ))
    .limit(1)

  if (!participant) throw new Error('Forbidden')

  const [message] = await db.insert(messages).values({
    conversationId: data.conversationId,
    senderId: userId,
    content: data.content,
    type: data.type,
  }).returning()

  const [sender] = await db.select({ id: users.id, name: users.name, image: users.image })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  await db.update(conversations)
    .set({ lastMessageAt: new Date() })
    .where(eq(conversations.id, data.conversationId))

  const otherParticipants = await db.select()
    .from(conversationParticipants)
    .where(and(
      eq(conversationParticipants.conversationId, data.conversationId),
      not(eq(conversationParticipants.userId, userId))
    ))

  for (const p of otherParticipants) {
    await db.insert(notifications).values({
      userId: p.userId,
      type: 'NEW_MESSAGE',
      title: 'New Message',
      body: data.content.slice(0, 100),
      data: { conversationId: data.conversationId },
    })

    publish(p.userId, {
      type: 'new_message',
      message: { ...message, sender },
      conversationId: data.conversationId,
    })
  }

  return { ...message, sender }
}

export async function markMessagesRead(conversationId) {
  const userId = await getUser()

  await db.update(messages)
    .set({ isRead: true, readAt: new Date() })
    .where(and(
      eq(messages.conversationId, conversationId),
      not(eq(messages.senderId, userId)),
      eq(messages.isRead, false),
    ))

  await db.update(conversationParticipants)
    .set({ lastReadAt: new Date() })
    .where(and(
      eq(conversationParticipants.conversationId, conversationId),
      eq(conversationParticipants.userId, userId),
    ))

  return { success: true }
}

export async function getUnreadCount() {
  const userId = await getUser()

  const participations = await db.select({ conversationId: conversationParticipants.conversationId })
    .from(conversationParticipants)
    .where(eq(conversationParticipants.userId, userId))

  if (participations.length === 0) return { count: 0 }

  const convIds = participations.map(p => p.conversationId)

  const [result] = await db.select({ count: count() })
    .from(messages)
    .where(and(
      inArray(messages.conversationId, convIds),
      not(eq(messages.senderId, userId)),
      eq(messages.isRead, false),
    ))

  return { count: result?.count ?? 0 }
}
