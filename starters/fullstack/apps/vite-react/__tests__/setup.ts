/// <reference types="vitest/jsdom" />
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

// jsdom has no pointer capture; click tests do not exercise drag gestures.
Object.defineProperty(HTMLElement.prototype, 'setPointerCapture', {
  configurable: true,
  value: () => {},
})

beforeEach(() => {
  // Node 26 exposes its own storage getter; use this test's jsdom storage.
  vi.stubGlobal('localStorage', jsdom.window.localStorage)
  localStorage.clear()
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
  localStorage.clear()
  document.documentElement.classList.remove('dark', 'light')
  vi.unstubAllGlobals()
  document.cookie = 'sidebar_state=; path=/; max-age=0'
})
