import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'

import { appPaths } from '@/config/app-paths'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">404</p>
          <h1 className="text-3xl font-bold tracking-tight text-balance text-foreground">
            Page Not Found
          </h1>
          <p className="text-sm text-pretty text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <Button render={<Link href={appPaths.home.href} />} nativeButton={false} variant="outline">
          Back to Home
        </Button>
      </div>
    </div>
  )
}
