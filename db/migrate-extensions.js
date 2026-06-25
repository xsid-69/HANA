import pg from 'pg'
import 'dotenv/config'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

const steps = [
  // 1. Create the ExtensionStatus enum
  `DO $$ BEGIN CREATE TYPE "ExtensionStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED', 'PAID', 'EXPIRED'); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,

  // 2. Add the EXTENSION_* notification enum values (each its own statement)
  `ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'EXTENSION_REQUESTED'`,
  `ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'EXTENSION_APPROVED'`,
  `ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'EXTENSION_DECLINED'`,
  `ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'EXTENSION_PAYMENT_REQUIRED'`,
  `ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'EXTENSION_COMPLETED'`,
  `ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'EXTENSION_SUGGESTION'`,

  // 3. Create the booking_extensions table
  `CREATE TABLE IF NOT EXISTS "booking_extensions" (
    "id" text PRIMARY KEY NOT NULL,
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
  )`,

  // 4. Enable Supabase realtime for the table (best-effort)
  `DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE booking_extensions; EXCEPTION WHEN duplicate_object THEN NULL; WHEN undefined_object THEN NULL; END $$`,
]

let success = 0
for (const sql of steps) {
  try {
    await pool.query(sql)
    success++
    console.log(`  ✓ ${sql.slice(0, 60).replace(/\s+/g, ' ')}...`)
  } catch (e) {
    console.error(`  ✗ ${sql.slice(0, 60).replace(/\s+/g, ' ')}...`)
    console.error(`    Error: ${e.message}`)
  }
}

console.log(`\nMigration complete: ${success}/${steps.length} steps succeeded`)
await pool.end()
