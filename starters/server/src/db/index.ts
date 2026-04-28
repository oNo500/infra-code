import { Database } from 'bun:sqlite'

import { drizzle } from 'drizzle-orm/bun-sqlite'

import { env } from '@/env'

import * as schema from './schema'

const sqlite = new Database(env.DATABASE_URL)
sqlite.run('PRAGMA journal_mode = WAL;')

export const db = drizzle(sqlite, { schema })
export * from './schema'
