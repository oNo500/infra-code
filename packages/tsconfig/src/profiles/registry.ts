import { nextjs } from './nextjs'

import type { Profile } from '../types'

export interface ProfileDescriptor {
  name: string
  label: string
  description: string
  factory: Profile
}

/**
 * Registry of all known profiles. Used by `tsconfig init` to present choices
 * and by templates to reference the correct import.
 */
export const PROFILES: readonly ProfileDescriptor[] = [
  {
    name: 'nextjs',
    label: 'Next.js App',
    description: 'Next.js 16 App Router with React 19, Turbopack, universal runtime',
    factory: nextjs,
  },
  // viteReact, libNode, libReact, appBun, appNestjs — coming in 0.1.0
]

export function findProfile(name: string): ProfileDescriptor | undefined {
  return PROFILES.find((p) => p.name === name)
}
