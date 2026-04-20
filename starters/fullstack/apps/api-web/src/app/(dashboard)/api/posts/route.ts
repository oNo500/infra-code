import { createPostSchema } from '@/features/post/lib/validators'
import { createPost } from '@/features/post/mutations/create-post'
import { listPostsByAuthor } from '@/features/post/queries/list-posts'
import { withAuth } from '@/lib/api/with-auth'
import { withErrorHandler } from '@/lib/api/with-error-handler'

export const GET = withErrorHandler(
  withAuth(async (_request, { session }) => {
    const posts = await listPostsByAuthor(session.user.id)
    return Response.json(posts)
  }),
)

export const POST = withErrorHandler(
  withAuth(async (request, { session }) => {
    const body = createPostSchema.parse(await request.json())
    const post = await createPost(session.user.id, body)
    return Response.json(post, { status: 201 })
  }),
)
