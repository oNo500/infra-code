import {
  base,
  buildBundler,
  composeAtoms,
  frameworkReact,
  runtimeUniversal,
} from './atoms'
import type { Profile, ProfileResult } from '../types'

/**
 * Next.js 16 App Router profile.
 * Composes: base + runtime-universal + build-bundler + framework-react,
 * plus Next-specific overrides (jsx: preserve, next plugin, allowImportingTsExtensions).
 */
export const nextjs: Profile = (): ProfileResult => ({
  label: 'nextjs',
  compilerOptions: composeAtoms(
    base(),
    runtimeUniversal(),
    buildBundler(),
    frameworkReact(),
    // Next.js-specific: Next transforms JSX itself; use preserve.
    {
      jsx: 'preserve',
      plugins: [{ name: 'next' }],
      allowImportingTsExtensions: true,
    },
  ),
  include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
  exclude: ['node_modules'],
})
