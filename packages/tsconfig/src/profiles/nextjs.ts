import type { Profile, ProfileResult } from '../types'

/**
 * Next.js 16 App Router profile.
 * Composes: base + runtime-universal + build-bundler + framework-react + Next plugin hint.
 */
export const nextjs: Profile = (): ProfileResult => ({
  label: 'nextjs',
  compilerOptions: {
    // base (universal strictness)
    strict: true,
    target: 'esnext',
    esModuleInterop: true,
    skipLibCheck: true,
    forceConsistentCasingInFileNames: true,
    resolveJsonModule: true,
    noUncheckedIndexedAccess: true,
    // runtime-universal (Node types + DOM libs)
    types: ['node'],
    lib: ['esnext', 'DOM', 'DOM.Iterable'],
    // build-bundler
    module: 'esnext',
    moduleResolution: 'bundler',
    noEmit: true,
    allowImportingTsExtensions: true,
    // framework-react
    jsx: 'preserve',
    // next plugin (user can prepend/append their own)
    plugins: [{ name: 'next' }],
    // Next.js-specific defaults commonly expected
    isolatedModules: true,
    incremental: true,
  },
  include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
  exclude: ['node_modules'],
})
