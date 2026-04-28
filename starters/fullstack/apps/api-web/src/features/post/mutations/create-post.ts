import 'server-only'
import { randomUUID } from 'node:crypto'

import { db } from '@/db'
import { post } from '@/db/schema'

import type { CreatePostInput } from '@/features/post/lib/validators'

/**
 * Create a new post. Pure business logic — no auth checks, no HTTP concerns.
 * Auth is enforced at the Route Handler layer via `withAuth`.
 */
export async function createPost(authorId: string, input: CreatePostInput) {
  const [created] = await db
    .insert(post)
    .values({
      id: randomUUID(),
      authorId,
      title: input.title,
      content: input.content,
    })
    .returning()

  return created
}
