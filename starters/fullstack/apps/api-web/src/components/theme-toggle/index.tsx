'use client'

import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import * as React from 'react'

const isMounted = () => globalThis.window !== undefined

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const mounted = React.useSyncExternalStore(
    (cb) => {
      window.addEventListener('load', cb)
      return () => window.removeEventListener('load', cb)
    },
    isMounted,
    () => false,
  )

  function changeTheme(newTheme: string) {
    if (!document.startViewTransition) {
      setTheme(newTheme)
      return
    }

    document.documentElement.dataset.themeTransition = ''
    const transition = document.startViewTransition(() => {
      setTheme(newTheme)
    })
    void transition.finished.then(() => {
      delete document.documentElement.dataset.themeTransition
    })
  }

  const isDark = mounted && resolvedTheme === 'dark'

  const toggleTheme = () => {
    changeTheme(isDark ? 'light' : 'dark')
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      type="button"
      aria-label="Toggle theme"
      aria-pressed={isDark}
      className="relative"
      onClick={toggleTheme}
    >
      <Sun
        className={cn('size-4 transition-all', isDark ? 'scale-0 rotate-90' : 'scale-100 rotate-0')}
      />
      <Moon
        className={cn(
          'absolute size-4 transition-all',
          isDark ? 'scale-100 rotate-0' : 'scale-0 -rotate-90',
        )}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
