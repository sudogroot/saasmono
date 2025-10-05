import { drizzle } from 'drizzle-orm/node-postgres'
import { getDatabaseUrl } from '../lib/secrets'

const DATABASE_URL =
  process.env.NODE_ENV === 'test'
    ? process.env.TEST_DATABASE_URL || ''
    : getDatabaseUrl()

export const db = drizzle(DATABASE_URL)
