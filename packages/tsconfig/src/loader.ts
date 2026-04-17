import { loadConfig } from 'c12'

import type { DefineTsconfigInput, RenderedConfig } from './types'

/**
 * Load `tsconfig.config.ts` (or .js/.mjs) from a directory using c12.
 * c12 handles TS → JS transformation via jiti under the hood.
 */
export async function loadTsconfigConfig(cwd: string): Promise<DefineTsconfigInput | RenderedConfig> {
  const { config } = await loadConfig<DefineTsconfigInput | RenderedConfig>({
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
export function isRenderedConfig(
  v: DefineTsconfigInput | RenderedConfig,
): v is RenderedConfig {
  return Array.isArray((v as RenderedConfig).files)
}
