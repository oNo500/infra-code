import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { appPaths } from '@/config/app-paths'
import { PostForm } from '@/features/post/components/post-form'
import { PostList } from '@/features/post/components/post-list'
import { listPostsByAuthor } from '@/features/post/queries/list-posts'
import { auth } from '@/lib/auth'

export default async function PostsPage() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    redirect(appPaths.auth.login.getHref(appPaths.dashboard.posts.href))
  }

  const posts = await listPostsByAuthor(session.user.id)

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="text-2xl font-bold">Posts</h1>
        <p className="text-sm text-muted-foreground">Create and manage your posts.</p>
      </section>
      <section>
        <PostForm />
      </section>
      <section>
        <PostList posts={posts} />
      </section>
    </div>
  )
}
