import pg from 'pg'
import 'dotenv/config'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

const queries = [
  `ALTER TABLE "users" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
  `ALTER TABLE "users" ALTER COLUMN "createdAt" SET DEFAULT now()`,
  `ALTER TABLE "companions" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
  `ALTER TABLE "companions" ALTER COLUMN "createdAt" SET DEFAULT now()`,
  `ALTER TABLE "bookings" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
  `ALTER TABLE "bookings" ALTER COLUMN "createdAt" SET DEFAULT now()`,
]

for (const q of queries) {
  await pool.query(q)
}
console.log('Defaults set on all timestamp columns')
await pool.end()
