import { access } from 'node:fs/promises'
import { resolve } from 'node:path'

import { loadConfig } from 'c12'

import type { DefineTsconfigInput, RenderedConfig } from './types'

const CONFIG_NAMES = ['tsconfig.config.ts', 'tsconfig.config.mjs', 'tsconfig.config.js']

/** Check whether a tsconfig.config.{ts,mjs,js} exists in the given directory. */
export async function configExists(cwd: string): Promise<boolean> {
  for (const name of CONFIG_NAMES) {
    try {
      await access(resolve(cwd, name))
      return true
    } catch {
      // continue
    }
  }
  return false
}

/**
 * Load `tsconfig.config.ts` (or .js/.mjs) from a directory using c12.
 * c12 handles TS → JS transformation via jiti under the hood.
 */
export async function loadTsconfigConfig(
  cwd: string,
): Promise<DefineTsconfigInput | RenderedConfig> {
  const { config } = await loadConfig({
    cwd,
    name: 'tsconfig',
    configFile: 'tsconfig.config',
    // c12 auto-resolves .ts/.js/.mjs extensions
  })
  if (!config) {
    throw new Error(`No tsconfig.config found in ${cwd}`)
  }
  return config
}

/**
 * Type guard: a RenderedConfig is the output of defineTsconfig (has .files).
 * A DefineTsconfigInput is raw user input (no .files).
 */
export function isRenderedConfig(v: DefineTsconfigInput | RenderedConfig): v is RenderedConfig {
  return 'files' in v && Array.isArray(v.files)
}
