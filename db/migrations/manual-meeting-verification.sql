-- Migration: Add meeting verification code fields to bookings
-- Run this against your Supabase database

-- 1. Add IN_PROGRESS status to BookingStatus enum
ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'IN_PROGRESS';

-- 2. Add meeting verification columns to bookings table
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "meetingCode" text;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "codeGeneratedAt" timestamp;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "codeVerified" boolean NOT NULL DEFAULT false;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "verifiedAt" timestamp;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "verificationAttempts" integer NOT NULL DEFAULT 0;

-- Done!
