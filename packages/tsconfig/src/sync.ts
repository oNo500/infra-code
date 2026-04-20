import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { isDeepStrictEqual } from 'node:util'

import { parse as parseJsonc } from 'jsonc-parser'

import { renderToString } from './define'
import { isErrnoException } from './utils'

import type { RenderedConfig } from './types'

export interface SyncResult {
  written: string[]
  unchanged: string[]
}

export interface CheckResult {
  ok: boolean
  mismatches: Array<{
    filename: string
    reason: 'missing' | 'changed'
  }>
}

export async function syncToDisk(config: RenderedConfig, cwd: string): Promise<SyncResult> {
  const results = await Promise.all(
    config.files.map(async (file) => {
      const absPath = resolve(cwd, file.filename)
      const expected = renderToString(file)
      const actual = await readIfExists(absPath)
      if (actual === expected) return { kind: 'unchanged' as const, filename: file.filename }
      await writeFile(absPath, expected, 'utf8')
      return { kind: 'written' as const, filename: file.filename }
    }),
  )

  const written: string[] = []
  const unchanged: string[] = []
  for (const r of results) {
    ;(r.kind === 'written' ? written : unchanged).push(r.filename)
  }
  return { written, unchanged }
}

/**
 * Semantic (not byte-wise) disk comparison: parses JSONC, deep-compares.
 * Formatter passes, key order, and whitespace changes are not drift.
 */
export async function checkAgainstDisk(config: RenderedConfig, cwd: string): Promise<CheckResult> {
  const results = await Promise.all(
    config.files.map(async (file) => {
      const absPath = resolve(cwd, file.filename)
      const actualRaw = await readIfExists(absPath)
      if (actualRaw === null) return { filename: file.filename, reason: 'missing' as const }
      const actualParsed = parseJsonc(actualRaw) as unknown
      if (!isDeepStrictEqual(actualParsed, file.content))
        return { filename: file.filename, reason: 'changed' as const }
      return null
    }),
  )

  const mismatches = results.filter((r): r is NonNullable<typeof r> => r !== null)
  return { ok: mismatches.length === 0, mismatches }
}

async function readIfExists(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf8')
  } catch (err) {
    if (isErrnoException(err) && err.code === 'ENOENT') return null
    throw err
  }
}
