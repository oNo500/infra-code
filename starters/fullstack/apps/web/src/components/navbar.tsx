import { Github } from '@workspace/icons'
import { Button } from '@workspace/ui/components/button'
import Link from 'next/link'

import { Logo } from '@/components/logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { appPaths } from '@/config/app-paths'
import { env } from '@/config/env'

export function Navbar() {
  return (
    <header className="border-b border-border">
      <div className="container py-3.5">
        <div className="flex items-center justify-between">
          <Link
            href={appPaths.home.href}
            className="flex items-center gap-2 text-foreground"
            aria-label={env.NEXT_PUBLIC_APP_NAME}
          >
            <Logo />
            <span className="text-sm font-semibold">{env.NEXT_PUBLIC_APP_NAME}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              render={
                <a
                  href="https://github.com/oNo500/base"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
              nativeButton={false}
              variant="ghost"
              size="icon"
              aria-label="GitHub"
            >
              <Github className="size-4" aria-hidden="true" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
