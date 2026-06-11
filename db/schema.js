import { pgTable, text, integer, boolean, timestamp, uniqueIndex, pgEnum, real, json } from 'drizzle-orm/pg-core'
import { createId } from './utils.js'

export const roleEnum = pgEnum('Role', ['CLIENT', 'COMPANION', 'ADMIN'])
export const bookingStatusEnum = pgEnum('BookingStatus', [
  'PENDING_ACCEPTANCE', 'REJECTED', 'AWAITING_PAYMENT',
  'CONFIRMED', 'COMPLETED', 'CANCELLED', 'EXPIRED'
])
export const paymentStatusEnum = pgEnum('PaymentStatus', ['PENDING', 'PAID', 'FAILED', 'EXPIRED'])
export const messageTypeEnum = pgEnum('MessageType', ['TEXT', 'IMAGE', 'SYSTEM'])
export const notificationTypeEnum = pgEnum('NotificationType', [
  'NEW_MESSAGE', 'BOOKING_REQUEST', 'BOOKING_ACCEPTED', 'BOOKING_CONFIRMED',
  'BOOKING_DECLINED', 'BOOKING_CANCELLED', 'BOOKING_COMPLETED',
  'PAYMENT_REMINDER', 'PAYMENT_EXPIRED', 'REVIEW_REMINDER', 'SYSTEM'
])
export const verificationStatusEnum = pgEnum('VerificationStatus', ['UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED'])

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(createId),
  email: text('email').notNull().unique(),
  name: text('name'),
  image: text('image'),
  banner: text('banner'),
  password: text('password'),
  role: roleEnum('role').default('CLIENT').notNull(),
  city: text('city'),
  bio: text('bio'),
  onboarded: boolean('onboarded').default(false).notNull(),
  trustScore: integer('trustScore').default(100).notNull(),
  cancellationCount: integer('cancellationCount').default(0).notNull(),
  noShowCount: integer('noShowCount').default(0).notNull(),
  completedBookings: integer('completedBookings').default(0).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
})

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey().$defaultFn(createId),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  provider: text('provider').notNull(),
  providerAccountId: text('providerAccountId').notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: text('token_type'),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
}, (table) => [
  uniqueIndex('accounts_provider_providerAccountId_key').on(table.provider, table.providerAccountId),
])

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey().$defaultFn(createId),
  sessionToken: text('sessionToken').notNull().unique(),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

export const verificationTokens = pgTable('verification_tokens', {
  identifier: text('identifier').notNull(),
  token: text('token').notNull().unique(),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
}, (table) => [
  uniqueIndex('verification_tokens_identifier_token_key').on(table.identifier, table.token),
])

export const companions = pgTable('companions', {
  id: text('id').primaryKey().$defaultFn(createId),
  userId: text('userId').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),
  displayName: text('displayName').notNull(),
  age: integer('age').notNull(),
  city: text('city').notNull(),
  district: text('district'),
  bio: text('bio').notNull(),
  languages: text('languages').array().notNull(),
  photos: text('photos').array().notNull(),
  tags: text('tags').array().notNull(),
  hourlyRate: integer('hourlyRate').notNull(),
  minimumHours: integer('minimumHours').default(2).notNull(),
  isActive: boolean('isActive').default(true).notNull(),
  isFeatured: boolean('isFeatured').default(false).notNull(),
  isSuspended: boolean('isSuspended').default(false).notNull(),
  verificationStatus: verificationStatusEnum('verificationStatus').default('UNVERIFIED').notNull(),
  verificationImages: text('verificationImages').array().default([]).notNull(),
  averageRating: real('averageRating').default(0).notNull(),
  totalReviews: integer('totalReviews').default(0).notNull(),
  totalBookings: integer('totalBookings').default(0).notNull(),
  trustScore: integer('trustScore').default(100).notNull(),
  acceptanceRate: real('acceptanceRate').default(100).notNull(),
  cancellationRate: real('cancellationRate').default(0).notNull(),
  cancellationCount: integer('cancellationCount').default(0).notNull(),
  lateCancellations: integer('lateCancellations').default(0).notNull(),
  completedBookings: integer('completedBookings').default(0).notNull(),
  totalRequests: integer('totalRequests').default(0).notNull(),
  responseTimeAvg: integer('responseTimeAvg').default(0).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
})

export const experiences = pgTable('experiences', {
  id: text('id').primaryKey().$defaultFn(createId),
  companionId: text('companionId').notNull().references(() => companions.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  emoji: text('emoji').notNull(),
  description: text('description'),
})

export const availabilities = pgTable('availabilities', {
  id: text('id').primaryKey().$defaultFn(createId),
  companionId: text('companionId').notNull().references(() => companions.id, { onDelete: 'cascade' }),
  dayOfWeek: integer('dayOfWeek').notNull(),
  startTime: text('startTime').notNull(),
  endTime: text('endTime').notNull(),
  isAvailable: boolean('isAvailable').default(true).notNull(),
}, (table) => [
  uniqueIndex('availabilities_companionId_dayOfWeek_key').on(table.companionId, table.dayOfWeek),
])

export const blockedDates = pgTable('blocked_dates', {
  id: text('id').primaryKey().$defaultFn(createId),
  companionId: text('companionId').notNull(),
  date: timestamp('date', { mode: 'date' }).notNull(),
  reason: text('reason'),
})

export const bookings = pgTable('bookings', {
  id: text('id').primaryKey().$defaultFn(createId),
  clientId: text('clientId').notNull().references(() => users.id),
  companionId: text('companionId').notNull().references(() => companions.id),
  date: timestamp('date', { mode: 'date' }).notNull(),
  startTime: text('startTime').notNull(),
  endTime: text('endTime').notNull(),
  durationHours: integer('durationHours').notNull(),
  activityType: text('activityType').notNull(),
  notes: text('notes'),
  hourlyRate: integer('hourlyRate').notNull(),
  subtotal: integer('subtotal').notNull(),
  serviceFee: integer('serviceFee').notNull(),
  deposit: integer('deposit').notNull(),
  totalAmount: integer('totalAmount').notNull(),
  status: bookingStatusEnum('status').default('PENDING_ACCEPTANCE').notNull(),
  paymentStatus: paymentStatusEnum('paymentStatus').default('PENDING').notNull(),
  paymentExpiresAt: timestamp('paymentExpiresAt', { mode: 'date' }),
  acceptedAt: timestamp('acceptedAt', { mode: 'date' }),
  rejectedAt: timestamp('rejectedAt', { mode: 'date' }),
  cancelledBy: text('cancelledBy'),
  cancelledAt: timestamp('cancelledAt', { mode: 'date' }),
  cancelReason: text('cancelReason'),
  isLateCancellation: boolean('isLateCancellation').default(false).notNull(),
  stripePaymentIntentId: text('stripePaymentIntentId'),
  paidAt: timestamp('paidAt', { mode: 'date' }),
  refundedAt: timestamp('refundedAt', { mode: 'date' }),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
})

export const reviews = pgTable('reviews', {
  id: text('id').primaryKey().$defaultFn(createId),
  bookingId: text('bookingId').notNull().unique().references(() => bookings.id),
  authorId: text('authorId').notNull().references(() => users.id),
  companionId: text('companionId').notNull().references(() => companions.id),
  rating: integer('rating').notNull(),
  content: text('content').notNull(),
  isVisible: boolean('isVisible').default(true).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
})

export const savedCompanions = pgTable('saved_companions', {
  id: text('id').primaryKey().$defaultFn(createId),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  companionId: text('companionId').notNull().references(() => companions.id, { onDelete: 'cascade' }),
  savedAt: timestamp('savedAt', { mode: 'date' }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('saved_companions_userId_companionId_key').on(table.userId, table.companionId),
])

export const conversations = pgTable('conversations', {
  id: text('id').primaryKey().$defaultFn(createId),
  bookingId: text('bookingId').unique().references(() => bookings.id),
  lastMessageAt: timestamp('lastMessageAt', { mode: 'date' }),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
})

export const conversationParticipants = pgTable('conversation_participants', {
  id: text('id').primaryKey().$defaultFn(createId),
  conversationId: text('conversationId').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  lastReadAt: timestamp('lastReadAt', { mode: 'date' }),
}, (table) => [
  uniqueIndex('conversation_participants_conversationId_userId_key').on(table.conversationId, table.userId),
])

export const messages = pgTable('messages', {
  id: text('id').primaryKey().$defaultFn(createId),
  conversationId: text('conversationId').notNull().references(() => conversations.id, { onDelete: 'cascade' }),
  senderId: text('senderId').notNull().references(() => users.id),
  type: messageTypeEnum('type').default('TEXT').notNull(),
  content: text('content').notNull(),
  reaction: text('reaction'),
  isRead: boolean('isRead').default(false).notNull(),
  readAt: timestamp('readAt', { mode: 'date' }),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
})

export const notifications = pgTable('notifications', {
  id: text('id').primaryKey().$defaultFn(createId),
  userId: text('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: notificationTypeEnum('type').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  data: json('data'),
  isRead: boolean('isRead').default(false).notNull(),
  readAt: timestamp('readAt', { mode: 'date' }),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
})
