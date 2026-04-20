import {
  base,
  buildBundler,
  buildTscEmit,
  composeAtoms,
  frameworkNestjs,
  frameworkNextjs,
  frameworkReact,
  projectLib,
  strictErasable,
  testingVitest,
  runtimeBrowser,
  runtimeBun,
  runtimeEdge,
  runtimeNode,
} from './atoms'
import { renderConfig } from './render'
import { applyWrites, planWrites, writeFiles } from './write'
import { splitNames } from './utils'

import type { CompilerOptions, RenderInput, ViewInput as RenderViewInput } from './types'
import type { FilePlan, WriteResult } from './write'

export type Framework = 'none' | 'react' | 'nextjs' | 'nestjs'
export type Testing = 'vitest'
export type Runtime = 'node' | 'bun' | 'browser' | 'edge'
export type ModuleMode = 'bundler' | 'nodenext'

export interface ViewSpec {
  name: string
  types?: string[]
  include?: string[]
}

export interface GenOptions {
  cwd: string
  runtimes: Runtime[]
  module: ModuleMode
  framework?: Framework
  testing?: Testing
  lib?: boolean
  erasable?: boolean
  views?: ViewSpec[]
  references?: string[]
  paths?: Record<string, readonly string[]>
}

export async function generate(opts: GenOptions): Promise<WriteResult> {
  return writeFiles(renderConfig(buildRenderInput(opts)), opts.cwd)
}

export async function planGenerate(opts: GenOptions): Promise<FilePlan[]> {
  return planWrites(renderConfig(buildRenderInput(opts)), opts.cwd)
}

export { applyWrites }
export type { FilePlan, WriteResult } from './write'

const RUNTIME_ATOMS: Record<Runtime, () => CompilerOptions> = {
  node: runtimeNode,
  bun: runtimeBun,
  browser: runtimeBrowser,
  edge: runtimeEdge,
}

const FRAMEWORK_ATOMS: Record<Exclude<Framework, 'none'>, () => CompilerOptions> = {
  react: frameworkReact,
  nextjs: frameworkNextjs,
  nestjs: frameworkNestjs,
}

function buildRenderInput(opts: GenOptions): RenderInput {
  const atoms: CompilerOptions[] = [base()]

  for (const rt of opts.runtimes) atoms.push(RUNTIME_ATOMS[rt]())

  atoms.push(opts.module === 'bundler' ? buildBundler() : buildTscEmit())

  if (opts.framework && opts.framework !== 'none') atoms.push(FRAMEWORK_ATOMS[opts.framework]())
  if (opts.testing === 'vitest') atoms.push(testingVitest())
  if (opts.erasable) atoms.push(strictErasable())

  if (opts.lib) atoms.push(projectLib())

  const compilerOptions = composeAtoms(...atoms)

  if (opts.paths) {
    compilerOptions.paths = Object.fromEntries(
      Object.entries(opts.paths).map(([k, v]) => [k, [...v]]),
    )
  }

  const views: RenderViewInput[] | undefined = opts.views?.map((v) => ({
    name: v.name,
    compilerOptions: v.types ? { types: v.types } : undefined,
    include: v.include,
  }))

  return {
    compilerOptions,
    views,
    references: opts.references?.map((p) => ({ path: p })),
  }
}

export function parsePathsArg(input: string): Record<string, readonly string[]> {
  const result: Record<string, readonly string[]> = {}
  for (const pair of splitNames(input)) {
    const eq = pair.indexOf('=')
    if (eq < 0) continue
    const key = pair.slice(0, eq).trim()
    const value = pair.slice(eq + 1).trim()
    if (!key || !value) continue
    result[key] = [value]
  }
  return result
}
