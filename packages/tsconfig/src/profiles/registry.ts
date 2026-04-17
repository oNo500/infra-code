import { appBun } from './app-bun'
import { appNestjs } from './app-nestjs'
import { libNode } from './lib-node'
import { libReact } from './lib-react'
import { nextjs } from './nextjs'
import { viteReact } from './vite-react'

import type { Profile } from '../types'

export interface ProfileDescriptor {
  /** Kebab-case key used as CLI arg value and in error messages. */
  name: string
  /** Human-readable label for interactive prompts. */
  label: string
  /** Short description shown as hint in prompts. */
  description: string
  /** Camel-case function name, used when rendering tsconfig.config.ts template. */
  fnName: string
  factory: Profile
}

/**
 * Registry of all known profiles. Presented in prompts and referenced by
 * scaffolded tsconfig.config.ts imports.
 */
export const PROFILES: readonly ProfileDescriptor[] = [
  {
    name: 'nextjs',
    label: 'Next.js App',
    description: 'Next.js 16 App Router, React 19, universal runtime',
    fnName: 'nextjs',
    factory: nextjs,
  },
  {
    name: 'vite-react',
    label: 'Vite + React',
    description: 'Browser-only SPA with Vite bundler + React',
    fnName: 'viteReact',
    factory: viteReact,
  },
  {
    name: 'app-bun',
    label: 'Bun App',
    description: 'Bun HTTP service or CLI (Hono, citty, etc.)',
    fnName: 'appBun',
    factory: appBun,
  },
  {
    name: 'app-nestjs',
    label: 'NestJS App',
    description: 'NestJS with decorators + DI',
    fnName: 'appNestjs',
    factory: appNestjs,
  },
  {
    name: 'lib-node',
    label: 'Node Library',
    description: 'Published npm library targeting Node',
    fnName: 'libNode',
    factory: libNode,
  },
  {
    name: 'lib-react',
    label: 'React Component Library',
    description: 'Published React component library',
    fnName: 'libReact',
    factory: libReact,
  },
]

export function findProfile(name: string): ProfileDescriptor | undefined {
  return PROFILES.find((p) => p.name === name)
}
