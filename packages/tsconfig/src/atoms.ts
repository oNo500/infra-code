import { dedupe } from './utils'

import type { CompilerOptions } from './types'

export const base = (): CompilerOptions => ({
  target: 'esnext',
  esModuleInterop: true,
  skipLibCheck: true,
  resolveJsonModule: true,
  moduleDetection: 'force',
  isolatedModules: true,
  verbatimModuleSyntax: true,
  strict: true,
  noUncheckedIndexedAccess: true,
  noImplicitOverride: true,
  noUnusedLocals: true,
  noUnusedParameters: true,
  noFallthroughCasesInSwitch: true,
  noImplicitReturns: true,
  forceConsistentCasingInFileNames: true,
  incremental: true,
  tsBuildInfoFile: './node_modules/.cache/tsconfig.tsbuildinfo',
})

export const runtimeNode = (): CompilerOptions => ({
  types: ['node'],
  lib: ['esnext'],
})

export const runtimeBun = (): CompilerOptions => ({
  types: ['bun'],
  lib: ['esnext'],
})

export const runtimeBrowser = (): CompilerOptions => ({
  lib: ['esnext', 'DOM', 'DOM.Iterable'],
})

export const runtimeEdge = (): CompilerOptions => ({
  lib: ['esnext'],
})

export const buildBundler = (): CompilerOptions => ({
  module: 'preserve',
  moduleResolution: 'bundler',
  noEmit: true,
})

export const buildTscEmit = (): CompilerOptions => ({
  module: 'nodenext',
  moduleResolution: 'nodenext',
  noEmit: false,
  outDir: 'dist',
})

export const projectLib = (): CompilerOptions => ({
  declaration: true,
  isolatedDeclarations: true,
  allowJs: false,
  noPropertyAccessFromIndexSignature: true,
})

export const frameworkReact = (): CompilerOptions => ({
  jsx: 'react-jsx',
})

export const frameworkNextjs = (): CompilerOptions => ({
  jsx: 'react-jsx',
  // Next.js uses its own bundler (Turbopack/webpack) — always override module
  // resolution to bundler mode, regardless of the build atom selected.
  module: 'preserve',
  moduleResolution: 'bundler',
})

export const frameworkNestjs = (): CompilerOptions => ({
  experimentalDecorators: true,
  emitDecoratorMetadata: true,
  strictPropertyInitialization: false,
})

export const testingVitest = (): CompilerOptions => ({
  types: ['vitest/globals'],
})

export const strictErasable = (): CompilerOptions => ({
  erasableSyntaxOnly: true,
})

/**
 * Merge atoms sequentially. Scalar/object overwrite is last-wins.
 * Array fields are concat+dedup so later atoms add to earlier ones
 * without silent loss.
 */
export function composeAtoms(...atoms: CompilerOptions[]): CompilerOptions {
  const result: CompilerOptions = {}
  for (const atom of atoms) {
    for (const [key, value] of Object.entries(atom)) {
      result[key] =
        Array.isArray(value) && Array.isArray(result[key])
          ? dedupe([...(result[key] as unknown[]), ...value])
          : value
    }
  }
  return result
}
