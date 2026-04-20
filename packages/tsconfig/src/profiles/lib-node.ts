import { base, buildBundler, composeAtoms, projectLib, runtimeNode } from './atoms'

import type { Profile, ProfileResult } from '../types'

/**
 * Node library profile (published to npm, built with tsdown/tsup/rolldown).
 * Emits declarations; bundler handles JS output.
 * Composes: base + runtime-node + build-bundler + project-lib.
 */
export const libNode: Profile = (): ProfileResult => ({
  compilerOptions: composeAtoms(base(), runtimeNode(), buildBundler(), projectLib()),
  include: ['src/**/*'],
  exclude: ['node_modules', 'dist'],
})
