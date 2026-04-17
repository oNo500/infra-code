'use client'

import { useEffect } from 'react'

export default function GlobalError({
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
    <html>
      <body>
        <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
          <div className="max-w-md space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium">Error</p>
              <h1 className="text-3xl font-bold">Something went wrong</h1>
              <p className="text-sm">{error.message || 'An unexpected error occurred.'}</p>
            </div>
            <button onClick={reset}>Try again</button>
          </div>
        </div>
      </body>
    </html>
  )
}
