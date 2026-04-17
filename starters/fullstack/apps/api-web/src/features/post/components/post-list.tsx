import type { post } from '@/db/schema'

type Post = typeof post.$inferSelect

interface PostListProps {
  posts: Post[]
}

export function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return <p className="text-sm text-muted-foreground">No posts yet.</p>
  }

  return (
    <ul className="flex flex-col gap-4">
      {posts.map((item) => (
        <li key={item.id} className="rounded-lg border p-4">
          <h3 className="font-medium">{item.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{item.content}</p>
        </li>
      ))}
    </ul>
  )
}
