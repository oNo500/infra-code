import { env } from '@/config/env'

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container py-6">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {'© '}
            {new Date().getFullYear()} {env.NEXT_PUBLIC_APP_NAME}
          </p>
        </div>
      </div>
    </footer>
  )
}
