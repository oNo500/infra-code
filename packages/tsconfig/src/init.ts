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
}

export interface InitResult {
  configFile: string
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

  if (!opts.force) {
    const exists = await fileExists(configPath)
    if (exists) {
      throw new Error('tsconfig.config.ts already exists. Use --force to overwrite.')
    }
  }

  const templateSrc = renderConfigTemplate({
    profileName: opts.profile,
    layers: opts.layers,
    paths: opts.paths,
  })
  await writeFile(configPath, templateSrc, 'utf8')

  const layersObj: Record<string, LayerInput> = {}
  for (const name of opts.layers) {
    if (name === 'test') {
      layersObj[name] = {
        extends: opts.layers[0]!,
        compilerOptions: { types: ['vitest/globals'] },
        include: ['**/*.test.ts', '**/*.test.tsx', '__tests__/**'],
      }
    } else {
      layersObj[name] = {}
    }
  }

  const rendered = defineTsconfig({
    profile: descriptor.factory(),
    compilerOptions: opts.paths ? { paths: opts.paths as Record<string, string[]> } : undefined,
    layers: opts.layers.length > 0 ? layersObj : undefined,
  })

  const sync = await syncToDisk(rendered, opts.cwd)
  return {
    configFile: 'tsconfig.config.ts',
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
