import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { isDeepStrictEqual } from 'node:util'

import { parse as parseJsonc } from 'jsonc-parser'

import { renderToString } from './define'

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

function isErrnoException(err: unknown): err is NodeJS.ErrnoException {
  return err instanceof Error && 'code' in err
}

/** Write all generated files to disk, relative to cwd. */
export async function syncToDisk(config: RenderedConfig, cwd: string): Promise<SyncResult> {
  const written: string[] = []
  const unchanged: string[] = []

  for (const file of config.files) {
    const absPath = resolve(cwd, file.filename)
    const expected = renderToString(file)
    const actual = await readIfExists(absPath)
    if (actual === expected) {
      unchanged.push(file.filename)
    } else {
      await writeFile(absPath, expected, 'utf8')
      written.push(file.filename)
    }
  }

  return { written, unchanged }
}

/**
 * Compare generated output to what's on disk — semantically, not byte-wise.
 * Disk JSON is parsed as JSONC (tolerates comments and trailing commas), then
 * deep-compared with the DSL output. This means formatter passes, key order
 * changes, and whitespace variation don't count as drift — only actual
 * compilerOptions / include / exclude / references differences do.
 */
export async function checkAgainstDisk(config: RenderedConfig, cwd: string): Promise<CheckResult> {
  const mismatches: CheckResult['mismatches'] = []

  for (const file of config.files) {
    const absPath = resolve(cwd, file.filename)
    const actualRaw = await readIfExists(absPath)
    if (actualRaw === null) {
      mismatches.push({ filename: file.filename, reason: 'missing' })
      continue
    }
    const actualParsed = parseJsonc(actualRaw) as unknown
    if (!isDeepStrictEqual(actualParsed, file.content)) {
      mismatches.push({ filename: file.filename, reason: 'changed' })
    }
  }

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
