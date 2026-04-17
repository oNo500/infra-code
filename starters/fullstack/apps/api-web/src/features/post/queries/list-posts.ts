import 'server-only'
import { desc, eq } from 'drizzle-orm'

import { db } from '@/db'
import { post } from '@/db/schema'

/**
 * List posts authored by a specific user, ordered by creation time.
 * Called from Server Components or Route Handlers — never from client code.
 */
export function listPostsByAuthor(authorId: string) {
  return db.select().from(post).where(eq(post.authorId, authorId)).orderBy(desc(post.createdAt))
}
