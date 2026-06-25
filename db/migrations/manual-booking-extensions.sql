-- Smart Date Extension feature migration
-- Creates the booking_extensions table and adds extension notification types

-- Step 1: Create ExtensionStatus enum
DO $$ BEGIN
  CREATE TYPE "ExtensionStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED', 'PAID', 'EXPIRED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Step 2: Add extension notification types
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'EXTENSION_REQUESTED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'EXTENSION_APPROVED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'EXTENSION_DECLINED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'EXTENSION_PAYMENT_REQUIRED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'EXTENSION_COMPLETED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'EXTENSION_SUGGESTION';

-- Step 3: Create booking_extensions table
CREATE TABLE IF NOT EXISTS "booking_extensions" (
  "id" text PRIMARY KEY,
  "bookingId" text NOT NULL REFERENCES "bookings"("id"),
  "requestedBy" text NOT NULL REFERENCES "users"("id"),
  "extraMinutes" integer NOT NULL,
  "additionalAmount" integer NOT NULL,
  "status" "ExtensionStatus" NOT NULL DEFAULT 'PENDING',
  "approvedBy" text REFERENCES "users"("id"),
  "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "approvedAt" timestamp,
  "paidAt" timestamp
);

-- Step 4: Index for quick lookups by booking
CREATE INDEX IF NOT EXISTS "booking_extensions_bookingId_idx" ON "booking_extensions"("bookingId");
CREATE INDEX IF NOT EXISTS "booking_extensions_status_idx" ON "booking_extensions"("status");

-- Step 5: Change durationHours to real to support fractional hours from extensions
ALTER TABLE "bookings" ALTER COLUMN "durationHours" TYPE real;
