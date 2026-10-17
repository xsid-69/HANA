import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './db/schema.js',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    // Prefer the session pooler for migrations; runtime can use the transaction pooler.
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
})
