-- Migration: Add booking lifecycle, trust scores, and payment tracking
-- Run this against your Supabase database

-- 1. Add new enum values to BookingStatus
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'PENDING_ACCEPTANCE';
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'REJECTED';
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'AWAITING_PAYMENT';
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'EXPIRED';

-- 2. Create PaymentStatus enum
DO $$ BEGIN
  CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'EXPIRED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. Add new notification types
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'BOOKING_ACCEPTED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'PAYMENT_REMINDER';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'PAYMENT_EXPIRED';

-- 4. Add trust/cancellation columns to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "trustScore" integer NOT NULL DEFAULT 100;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "cancellationCount" integer NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "noShowCount" integer NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "completedBookings" integer NOT NULL DEFAULT 0;

-- 5. Add trust/stats columns to companions table
ALTER TABLE "companions" ADD COLUMN IF NOT EXISTS "isSuspended" boolean NOT NULL DEFAULT false;
ALTER TABLE "companions" ADD COLUMN IF NOT EXISTS "trustScore" integer NOT NULL DEFAULT 100;
ALTER TABLE "companions" ADD COLUMN IF NOT EXISTS "acceptanceRate" real NOT NULL DEFAULT 100;
ALTER TABLE "companions" ADD COLUMN IF NOT EXISTS "cancellationRate" real NOT NULL DEFAULT 0;
ALTER TABLE "companions" ADD COLUMN IF NOT EXISTS "cancellationCount" integer NOT NULL DEFAULT 0;
ALTER TABLE "companions" ADD COLUMN IF NOT EXISTS "lateCancellations" integer NOT NULL DEFAULT 0;
ALTER TABLE "companions" ADD COLUMN IF NOT EXISTS "completedBookings" integer NOT NULL DEFAULT 0;
ALTER TABLE "companions" ADD COLUMN IF NOT EXISTS "totalRequests" integer NOT NULL DEFAULT 0;
ALTER TABLE "companions" ADD COLUMN IF NOT EXISTS "responseTimeAvg" integer NOT NULL DEFAULT 0;

-- 6. Add new booking lifecycle columns
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "paymentExpiresAt" timestamp;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "acceptedAt" timestamp;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "rejectedAt" timestamp;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "isLateCancellation" boolean NOT NULL DEFAULT false;

-- 7. Update existing bookings from old status values to new ones
-- PENDING -> PENDING_ACCEPTANCE (if your old data uses PENDING)
UPDATE "bookings" SET "status" = 'PENDING_ACCEPTANCE' WHERE "status" = 'PENDING';
-- DECLINED -> REJECTED
UPDATE "bookings" SET "status" = 'REJECTED' WHERE "status" = 'DECLINED';

-- Done!
