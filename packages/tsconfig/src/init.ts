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

  // runtime atoms
  for (const rt of opts.runtimes) {
    if (rt === 'node') atoms.push(runtimeNode())
    else if (rt === 'bun') atoms.push(runtimeBun())
    else if (rt === 'browser') atoms.push(runtimeBrowser())
    else if (rt === 'edge') atoms.push(runtimeEdge())
  }

  // module/build atoms
  if (opts.module === 'bundler') {
    atoms.push(buildBundler())
  } else {
    atoms.push(buildTscEmit())
  }

  // framework atoms
  if (opts.framework === 'react') atoms.push(frameworkReact())
  else if (opts.framework === 'nextjs') atoms.push(frameworkNextjs())
  else if (opts.framework === 'nestjs') atoms.push(frameworkNestjs())

  // lib mode
  if (opts.lib) atoms.push(projectLib())

  const baseOptions = composeAtoms(...atoms)

  // inject user paths
  if (opts.paths && Object.keys(opts.paths).length > 0) {
    baseOptions.paths = Object.fromEntries(
      Object.entries(opts.paths).map(([k, v]) => [k, [...v]]),
    )
  }

  // build views (extra tsconfig files)
  const layers: Record<string, LayerInput> = {}
  if (opts.views && opts.views.length > 0) {
    layers['app'] = {}
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
    layers: Object.keys(layers).length > 0 ? layers : undefined,
    references: refs,
  })

  const result = await syncToDisk(rendered, opts.cwd)
  return { written: result.written }
}

/** Parse a paths string like "@/*=./src/*,@ui/*=../ui/src/*" into an object. */
export function parsePathsArg(input: string): Record<string, readonly string[]> {
  const result: Record<string, readonly string[]> = {}
  for (const pair of input.split(',').map((s) => s.trim()).filter(Boolean)) {
    const eq = pair.indexOf('=')
    if (eq < 0) continue
    const key = pair.slice(0, eq).trim()
    const value = pair.slice(eq + 1).trim()
    if (!key || !value) continue
    result[key] = [value]
  }
  return result
}
