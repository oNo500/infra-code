import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { renderToString } from './define'
import { isErrnoException } from './utils'

import type { RenderedConfig } from './types'

export interface SyncResult {
  written: string[]
  unchanged: string[]
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

async function readIfExists(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf8')
  } catch (err) {
    if (isErrnoException(err) && err.code === 'ENOENT') return null
    throw err
  }
}
