import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import * as schema from './schema'

const { Pool } = pg

const globalForDb = globalThis

function getConnectionString() {
  const runtimeUrl = process.env.DATABASE_URL
  const poolerUrl = process.env.DIRECT_URL

  if (!runtimeUrl) return poolerUrl

  try {
    const hostname = new URL(runtimeUrl).hostname
    const isSupabaseDirectHost = hostname.startsWith('db.') && hostname.endsWith('.supabase.co')
    if (isSupabaseDirectHost && poolerUrl) return poolerUrl
  } catch {}

  return runtimeUrl
}

function createDb() {
  const pool = globalForDb.__dbPool ?? new Pool({
    connectionString: getConnectionString(),
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  })
  if (process.env.NODE_ENV !== 'production') {
    globalForDb.__dbPool = pool
  }
  return drizzle(pool, { schema })
}

export const db = globalForDb.__db ?? createDb()

if (process.env.NODE_ENV !== 'production') globalForDb.__db = db
