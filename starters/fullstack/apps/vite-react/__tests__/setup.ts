import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

beforeEach(() => {
  // jsdom does not evaluate media queries. These tests use the desktop layout.
  vi.stubGlobal(
    'matchMedia',
    (query: string): MediaQueryList =>
      Object.assign(new EventTarget(), {
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
      }),
  )
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  document.cookie = 'sidebar_state=; path=/; max-age=0'
})
