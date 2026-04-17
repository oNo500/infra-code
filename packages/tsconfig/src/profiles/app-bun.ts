import { base, buildBundler, composeAtoms, runtimeBun } from './atoms'

import type { Profile, ProfileResult } from '../types'

/**
 * Bun HTTP service / CLI profile.
 * Composes: base + runtime-bun + build-bundler.
 *
 * Use libNode() if you intend to publish to npm — appBun assumes Bun-only consumers.
 */
export const appBun: Profile = (): ProfileResult => ({
  label: 'app-bun',
  compilerOptions: composeAtoms(base(), runtimeBun(), buildBundler()),
  include: ['src/**/*', 'tests/**/*'],
  exclude: ['node_modules', 'dist'],
})
