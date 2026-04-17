import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

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
    expected: string
    actual: string | null
  }>
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

/** Compare generated output to what's on disk. Returns ok=false if any mismatch. */
export async function checkAgainstDisk(config: RenderedConfig, cwd: string): Promise<CheckResult> {
  const mismatches: CheckResult['mismatches'] = []

  for (const file of config.files) {
    const absPath = resolve(cwd, file.filename)
    const expected = renderToString(file)
    const actual = await readIfExists(absPath)
    if (actual === null) {
      mismatches.push({ filename: file.filename, reason: 'missing', expected, actual: null })
      continue
    }
    if (actual !== expected) {
      mismatches.push({ filename: file.filename, reason: 'changed', expected, actual })
    }
  }

  return { ok: mismatches.length === 0, mismatches }
}

async function readIfExists(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf8')
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw err
  }
}

