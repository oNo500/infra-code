'use server'

import { revalidateTag } from 'next/cache'

/**
 * Thin Server Action used purely to trigger cache revalidation after a
 * client-side mutation via the REST API. Business logic stays in the
 * API Route + feature mutations; this action only touches Next.js cache APIs.
 */
export async function revalidatePosts() {
  revalidateTag('posts', 'max')
}
