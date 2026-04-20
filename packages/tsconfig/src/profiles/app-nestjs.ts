import { base, buildBundler, composeAtoms, frameworkNestjs, runtimeNode } from './atoms'

import type { Profile, ProfileResult } from '../types'

/**
 * NestJS app profile.
 * Composes: base + runtime-node + build-bundler + framework-nestjs.
 *
 * NestJS uses decorators + DI at runtime, so experimentalDecorators +
 * emitDecoratorMetadata are enabled; strictPropertyInitialization is
 * relaxed because DI injects properties.
 */
export const appNestjs: Profile = (): ProfileResult => ({
  compilerOptions: composeAtoms(base(), runtimeNode(), buildBundler(), frameworkNestjs()),
  include: ['src/**/*', 'tests/**/*'],
  exclude: ['node_modules', 'dist'],
})
