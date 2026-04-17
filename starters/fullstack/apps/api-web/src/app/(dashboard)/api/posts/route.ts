import { createPostSchema } from '@/features/post/lib/validators'
import { createPost } from '@/features/post/mutations/create-post'
import { listPostsByAuthor } from '@/features/post/queries/list-posts'
import { withAuth } from '@/lib/api/with-auth'

export const GET = withAuth(async (_request, { session }) => {
  const posts = await listPostsByAuthor(session.user.id)
  return Response.json(posts)
})

export const POST = withAuth(async (request, { session }) => {
  const parsed = createPostSchema.safeParse(await request.json())

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    )
  }

  const post = await createPost(session.user.id, parsed.data)
  return Response.json(post, { status: 201 })
})
