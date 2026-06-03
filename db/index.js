import { drizzle } from 'drizzle-orm/node-postgres'
import pg from 'pg'
import * as schema from './schema'

const { Pool } = pg

const globalForDb = globalThis

function createDb() {
  const pool = globalForDb.__dbPool ?? new Pool({
    connectionString: process.env.DATABASE_URL,
  })
  if (process.env.NODE_ENV !== 'production') {
    globalForDb.__dbPool = pool
  }
  return drizzle(pool, { schema })
}

export const db = globalForDb.__db ?? createDb()

if (process.env.NODE_ENV !== 'production') globalForDb.__db = db
