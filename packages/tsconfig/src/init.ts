import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { defineTsconfig } from './define'
import { PROFILES, findProfile } from './profiles/registry'
import { syncToDisk } from './sync'
import { renderConfigTemplate } from './template'
import type { LayerInput } from './types'

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

  if (!opts.once && !opts.force) {
    const exists = await fileExists(configPath)
    if (exists) {
      throw new Error('tsconfig.config.ts already exists. Use --force to overwrite.')
    }
  }

  if (!opts.once) {
    const templateSrc = renderConfigTemplate({
      profileFnName: descriptor.fnName,
      layers: opts.layers,
      paths: opts.paths,
    })
    await writeFile(configPath, templateSrc, 'utf8')
  }

  const layersObj: Record<string, LayerInput> = {}
  const base = opts.layers[0]
  for (const name of opts.layers) {
    if (name === 'test' && name !== base && base) {
      layersObj[name] = {
        extends: base,
        compilerOptions: { types: ['vitest/globals'] },
        include: ['**/*.test.ts', '**/*.test.tsx', '__tests__/**'],
      }
    } else if (name === 'build' && name !== base && base) {
      layersObj[name] = {
        extends: base,
        exclude: ['**/*.test.ts', '**/*.test.tsx', '__tests__/**'],
      }
    } else if (name === 'ci' && name !== base && base) {
      layersObj[name] = {
        extends: base,
        compilerOptions: { declarationMap: true, sourceMap: true },
      }
    } else {
      layersObj[name] = {}
    }
  }

  // Guard: skipJson + once = nothing to write.
  if (opts.skipJson && opts.once) {
    throw new Error('Cannot combine once (no DSL) with skipJson (no JSON) — nothing would be written.')
  }

  if (opts.skipJson) {
    return {
      configFile: 'tsconfig.config.ts',
      generatedFiles: [],
    }
  }

  const rendered = defineTsconfig({
    profile: descriptor.factory(),
    compilerOptions: opts.paths ? { paths: opts.paths as Record<string, string[]> } : undefined,
    layers: opts.layers.length > 0 ? layersObj : undefined,
  })

  const sync = await syncToDisk(rendered, opts.cwd)
  return {
    configFile: opts.once ? null : 'tsconfig.config.ts',
    generatedFiles: sync.written,
  }
}

async function fileExists(path: string): Promise<boolean> {
  const { access } = await import('node:fs/promises')
  try {
    await access(path)
    return true
  } catch {
    return false
  }
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
