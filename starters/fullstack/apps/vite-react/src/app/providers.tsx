import { Toaster } from '@workspace/ui/components/sonner'
import { TooltipProvider } from '@workspace/ui/components/tooltip'

import { ThemeProvider } from '@/features/theme/theme-provider'

import type { ReactNode } from 'react'

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <TooltipProvider>{children}</TooltipProvider>
      <Toaster closeButton />
    </ThemeProvider>
  )
}
