import {
  base,
  buildBundler,
  composeAtoms,
  frameworkReact,
  projectLib,
  runtimeBrowser,
} from './atoms'
import type { Profile, ProfileResult } from '../types'

/**
 * React component library profile (published to npm).
 * Composes: base + runtime-browser + build-bundler + project-lib + framework-react.
 *
 * Note: isolatedDeclarations can be overly strict for React components that
 * rely on cva/forwardRef inference. Users can override with
 * `compilerOptions: { isolatedDeclarations: false }` when needed.
 */
export const libReact: Profile = (): ProfileResult => ({
  label: 'lib-react',
  compilerOptions: composeAtoms(
    base(),
    runtimeBrowser(),
    buildBundler(),
    projectLib(),
    frameworkReact(),
  ),
  include: ['src/**/*'],
  exclude: ['node_modules', 'dist'],
})
