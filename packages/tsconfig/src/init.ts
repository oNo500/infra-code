import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { defineTsconfig } from './define'
import { buildLayer } from './layer-presets'
import { PROFILES, findProfile } from './profiles/registry'
import { syncToDisk } from './sync'
import { renderConfigTemplate } from './template'

import type { CompilerOptions, LayerInput } from './types'

function isErrnoException(err: unknown): err is NodeJS.ErrnoException {
  return err instanceof Error && 'code' in err
}

export interface InitOptions {
  cwd: string
  profile: string
  layers: readonly string[]
  paths?: Record<string, readonly string[]>
  force?: boolean
  /** When true, generate tsconfig.*.json but skip writing tsconfig.config.ts. */
  once?: boolean
  /** When true, skip writing tsconfig.*.json (write DSL only). */
  skipJson?: boolean
}

export interface InitResult {
  /** The DSL file written, or null if `once` mode skipped it. */
  configFile: string | null
  generatedFiles: string[]
}

/**
 * Scaffold tsconfig.config.ts + initial tsconfig.*.json files.
 * Pure function — no prompts, no console output. The CLI layer owns UX.
 */
export async function runInit(opts: InitOptions): Promise<InitResult> {
  const descriptor = findProfile(opts.profile)
  if (!descriptor) {
    const available = PROFILES.map((p) => p.name).join(', ')
    throw new Error(`Unknown profile '${opts.profile}'. Available: ${available}`)
  }

  const configPath = resolve(opts.cwd, 'tsconfig.config.ts')

  if (!opts.once) {
    const templateSrc = renderConfigTemplate({
      profileFnName: descriptor.fnName,
      layers: opts.layers,
      paths: opts.paths,
    })
    try {
      await writeFile(configPath, templateSrc, {
        encoding: 'utf8',
        flag: opts.force ? 'w' : 'wx',
      })
    } catch (err) {
      if (isErrnoException(err) && err.code === 'EEXIST') {
        throw new Error('tsconfig.config.ts already exists. Use --force to overwrite.', {
          cause: err,
        })
      }
      throw err
    }
  }

  const layersObj: Record<string, LayerInput> = {}
  const base = opts.layers[0]
  for (const name of opts.layers) {
    layersObj[name] = buildLayer(name, base)
  }

  // Guard: skipJson + once = nothing to write.
  if (opts.skipJson && opts.once) {
    throw new Error(
      'Cannot combine once (no DSL) with skipJson (no JSON) — nothing would be written.',
    )
  }

  if (opts.skipJson) {
    return {
      configFile: 'tsconfig.config.ts',
      generatedFiles: [],
    }
  }

  const compilerOptions: CompilerOptions | undefined = opts.paths
    ? { paths: Object.fromEntries(Object.entries(opts.paths).map(([k, v]) => [k, [...v]])) }
    : undefined

  const rendered = defineTsconfig({
    profile: descriptor.factory(),
    compilerOptions,
    layers: opts.layers.length > 0 ? layersObj : undefined,
  })

  const sync = await syncToDisk(rendered, opts.cwd)
  return {
    configFile: opts.once ? null : 'tsconfig.config.ts',
    generatedFiles: sync.written,
  }
}

/** Parse a paths string like "@/*=./src/*,@ui/*=../ui/src/*" into an object. */
export function parsePathsArg(input: string): Record<string, readonly string[]> {
  const result: Record<string, readonly string[]> = {}
  for (const pair of input
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)) {
    const eq = pair.indexOf('=')
    if (eq < 0) continue
    const key = pair.slice(0, eq).trim()
    const value = pair.slice(eq + 1).trim()
    if (!key || !value) continue
    result[key] = [value]
  }
  return result
}
