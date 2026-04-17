'use client'

import { useEffect } from 'react'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Error</p>
          <h1 className="text-3xl font-bold tracking-tight text-balance text-foreground">
            Something went wrong
          </h1>
          <p className="text-sm text-pretty text-muted-foreground">
            {error.message || 'An unexpected error occurred.'}
          </p>
        </div>
        <button
          onClick={reset}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
