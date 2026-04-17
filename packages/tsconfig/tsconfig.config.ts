// Self-dogfood: this package imports its own dist rather than the published
// npm entry so `tsconfig gen` on the package itself works without installing
// the published version.
import { libNode } from './dist/index.mjs'

import type { DefineTsconfigInput } from './dist/index.mjs'

export default {
  profile: libNode(),
  compilerOptions: {
    // Tests use bun:test; libNode's default (`types: ['node']`) is appended, not replaced.
    types: ['bun'],
    // Relaxed for the package's own sources — our generic helpers return inferred types.
    isolatedDeclarations: false,
  },
  include: ['src/**/*', 'tests/**/*'],
  exclude: ['dist', 'node_modules'],
} satisfies DefineTsconfigInput
