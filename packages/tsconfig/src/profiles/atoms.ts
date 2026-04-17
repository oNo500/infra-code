import type { CompilerOptions } from '../types'

/**
 * Internal atoms used to compose profiles. Not exported publicly — users
 * consume profile functions instead. Keeping this file private lets us
 * refactor the composition without API surface changes.
 */

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
  types: [],
  lib: ['esnext', 'DOM', 'DOM.Iterable'],
})

export const runtimeUniversal = (): CompilerOptions => ({
  types: ['node'],
  lib: ['esnext', 'DOM', 'DOM.Iterable'],
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

export const frameworkNestjs = (): CompilerOptions => ({
  experimentalDecorators: true,
  emitDecoratorMetadata: true,
  strictPropertyInitialization: false,
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
      if (Array.isArray(value) && Array.isArray(result[key])) {
        result[key] = dedupe([...(result[key] as unknown[]), ...value])
      } else {
        result[key] = value
      }
    }
  }
  return result
}

function dedupe<T>(arr: T[]): T[] {
  const seen = new Set<string>()
  const out: T[] = []
  for (const item of arr) {
    const key = typeof item === 'object' && item !== null ? JSON.stringify(item) : String(item)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(item)
  }
  return out
}
