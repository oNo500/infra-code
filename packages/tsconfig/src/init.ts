import { defineTsconfig } from './define'
import {
  base,
  buildBundler,
  buildTscEmit,
  composeAtoms,
  frameworkNestjs,
  frameworkNextjs,
  frameworkReact,
  projectLib,
  runtimeBrowser,
  runtimeBun,
  runtimeEdge,
  runtimeNode,
} from './profiles/atoms'
import { syncToDisk } from './sync'
import { splitNames } from './utils'

import type { CompilerOptions, LayerInput } from './types'

export type Framework = 'none' | 'react' | 'nextjs' | 'nestjs'
export type Runtime = 'node' | 'bun' | 'browser' | 'edge'
export type ModuleMode = 'bundler' | 'nodenext'

export interface ViewInput {
  name: string
  types?: string[]
  include?: string[]
}

export interface GenOptions {
  cwd: string
  runtimes: Runtime[]
  module: ModuleMode
  framework?: Framework
  lib?: boolean
  views?: ViewInput[]
  references?: string[]
  paths?: Record<string, readonly string[]>
}

export interface GenResult {
  written: string[]
}

export async function generate(opts: GenOptions): Promise<GenResult> {
  const atoms: CompilerOptions[] = [base()]

  for (const rt of opts.runtimes) {
    if (rt === 'node') atoms.push(runtimeNode())
    else if (rt === 'bun') atoms.push(runtimeBun())
    else if (rt === 'browser') atoms.push(runtimeBrowser())
    else if (rt === 'edge') atoms.push(runtimeEdge())
  }

  atoms.push(opts.module === 'bundler' ? buildBundler() : buildTscEmit())

  if (opts.framework === 'react') atoms.push(frameworkReact())
  else if (opts.framework === 'nextjs') atoms.push(frameworkNextjs())
  else if (opts.framework === 'nestjs') atoms.push(frameworkNestjs())

  if (opts.lib) atoms.push(projectLib())

  const baseOptions = composeAtoms(...atoms)

  if (opts.paths) {
    baseOptions.paths = Object.fromEntries(
      Object.entries(opts.paths).map(([k, v]) => [k, [...v]]),
    )
  }

  let layers: Record<string, LayerInput> | undefined
  if (opts.views && opts.views.length > 0) {
    if (opts.views.some((v) => v.name === 'app')) {
      throw new Error("View name 'app' is reserved. Choose a different name.")
    }
    layers = { app: {} }
    for (const view of opts.views) {
      layers[view.name] = {
        extends: 'app',
        compilerOptions: view.types ? { types: view.types } : undefined,
        include: view.include,
      }
    }
  }

  const refs = opts.references?.map((p) => ({ path: p }))

  const rendered = defineTsconfig({
    profile: { compilerOptions: baseOptions },
    layers,
    references: refs,
  })

  const result = await syncToDisk(rendered, opts.cwd)
  return { written: result.written }
}

/** Parse a paths string like "@/*=./src/*,@ui/*=../ui/src/*" into an object. */
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
