import { base, buildBundler, composeAtoms, frameworkReact, runtimeBrowser } from './atoms'

import type { Profile, ProfileResult } from '../types'

/**
 * Vite + React SPA profile (browser-only, no Node types).
 * Composes: base + runtime-browser + build-bundler + framework-react.
 */
export const viteReact: Profile = (): ProfileResult => ({
  label: 'vite-react',
  compilerOptions: composeAtoms(base(), runtimeBrowser(), buildBundler(), frameworkReact()),
  include: ['src/**/*'],
  exclude: ['node_modules', 'dist'],
})
