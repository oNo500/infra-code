import { defineTsconfig } from './define'
import { buildLayer } from './layer-presets'
import { PROFILES, findProfile } from './profiles/registry'
import { syncToDisk } from './sync'

import type { CompilerOptions, LayerInput } from './types'

export interface GenOptions {
  cwd: string
  profile: string
  layers: readonly string[]
  paths?: Record<string, readonly string[]>
}

export interface GenResult {
  written: string[]
}

export async function generate(opts: GenOptions): Promise<GenResult> {
  const descriptor = findProfile(opts.profile)
  if (!descriptor) {
    const available = PROFILES.map((p) => p.name).join(', ')
    throw new Error(`Unknown profile '${opts.profile}'. Available: ${available}`)
  }

  const layersObj: Record<string, LayerInput> = {}
  const base = opts.layers[0]
  for (const name of opts.layers) {
    layersObj[name] = buildLayer(name, base)
  }

  const compilerOptions: CompilerOptions | undefined = opts.paths
    ? { paths: Object.fromEntries(Object.entries(opts.paths).map(([k, v]) => [k, [...v]])) }
    : undefined

  const rendered = defineTsconfig({
    profile: descriptor.factory(),
    compilerOptions,
    layers: opts.layers.length > 0 ? layersObj : undefined,
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
