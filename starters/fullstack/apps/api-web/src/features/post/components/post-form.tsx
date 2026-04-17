'use client'

import { Button } from '@workspace/ui/components/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@workspace/ui/components/field'
import { Input } from '@workspace/ui/components/input'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { revalidatePosts } from '../actions/revalidate-posts'
import { createPostSchema } from '../lib/validators'

export function PostForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const title = (form.elements.namedItem('title') as HTMLInputElement).value
    const content = (form.elements.namedItem('content') as HTMLInputElement).value

    const parsed = createPostSchema.safeParse({ title, content })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid input')
      return
    }

    setError(null)
    setLoading(true)

    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(parsed.data),
    })

    setLoading(false)

    if (!response.ok) {
      const body = (await response.json()) as { error?: string }
      setError(body.error ?? 'Failed to create post')
      return
    }

    form.reset()
    await revalidatePosts()
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <Input id="title" name="title" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="content">Content</FieldLabel>
          <Input id="content" name="content" required />
        </Field>
        {error && <FieldDescription className="text-destructive">{error}</FieldDescription>}
        <Field>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create post'}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
