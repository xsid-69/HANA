import pg from 'pg'
import 'dotenv/config'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

const steps = [
  // Step 1: Add enum values (each must be its own transaction)
  `ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'PENDING_ACCEPTANCE'`,
  `ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'REJECTED'`,
  `ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'AWAITING_PAYMENT'`,
  `ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'EXPIRED'`,
  `DO $$ BEGIN CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'EXPIRED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  `ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'BOOKING_ACCEPTED'`,
  `ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'PAYMENT_REMINDER'`,
  `ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'PAYMENT_EXPIRED'`,

  // Step 2: Add columns to users
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "trustScore" integer NOT NULL DEFAULT 100`,
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "cancellationCount" integer NOT NULL DEFAULT 0`,
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "noShowCount" integer NOT NULL DEFAULT 0`,
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "completedBookings" integer NOT NULL DEFAULT 0`,

  // Step 3: Add columns to companions
  `ALTER TABLE "companions" ADD COLUMN IF NOT EXISTS "isSuspended" boolean NOT NULL DEFAULT false`,
  `ALTER TABLE "companions" ADD COLUMN IF NOT EXISTS "trustScore" integer NOT NULL DEFAULT 100`,
  `ALTER TABLE "companions" ADD COLUMN IF NOT EXISTS "acceptanceRate" real NOT NULL DEFAULT 100`,
  `ALTER TABLE "companions" ADD COLUMN IF NOT EXISTS "cancellationRate" real NOT NULL DEFAULT 0`,
  `ALTER TABLE "companions" ADD COLUMN IF NOT EXISTS "cancellationCount" integer NOT NULL DEFAULT 0`,
  `ALTER TABLE "companions" ADD COLUMN IF NOT EXISTS "lateCancellations" integer NOT NULL DEFAULT 0`,
  `ALTER TABLE "companions" ADD COLUMN IF NOT EXISTS "completedBookings" integer NOT NULL DEFAULT 0`,
  `ALTER TABLE "companions" ADD COLUMN IF NOT EXISTS "totalRequests" integer NOT NULL DEFAULT 0`,
  `ALTER TABLE "companions" ADD COLUMN IF NOT EXISTS "responseTimeAvg" integer NOT NULL DEFAULT 0`,

  // Step 4: Add columns to bookings
  `ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "paymentStatus" text NOT NULL DEFAULT 'PENDING'`,
  `ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "paymentExpiresAt" timestamp`,
  `ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "acceptedAt" timestamp`,
  `ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "rejectedAt" timestamp`,
  `ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "isLateCancellation" boolean NOT NULL DEFAULT false`,

  // Step 5: Migrate old status values
  `UPDATE "bookings" SET "status" = 'PENDING_ACCEPTANCE' WHERE "status" = 'PENDING'`,
  `UPDATE "bookings" SET "status" = 'REJECTED' WHERE "status" = 'DECLINED'`,
]

let success = 0
for (const sql of steps) {
  try {
    await pool.query(sql)
    success++
  } catch (e) {
    console.error(`Failed: ${sql.slice(0, 60)}...`)
    console.error(`  Error: ${e.message}`)
  }
}

console.log(`Migration complete: ${success}/${steps.length} steps succeeded`)
await pool.end()
