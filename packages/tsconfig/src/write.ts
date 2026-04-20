import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { createTwoFilesPatch } from 'diff'

import { fileToString } from './render'
import { isErrnoException } from './utils'

import type { RenderedConfig } from './types'

export interface WriteResult {
  written: string[]
  unchanged: string[]
  skipped: string[]
}

export type FilePlan =
  | { kind: 'new'; filename: string; absPath: string; content: string }
  | { kind: 'changed'; filename: string; absPath: string; content: string; diff: string }
  | { kind: 'unchanged'; filename: string }

export async function planWrites(config: RenderedConfig, cwd: string): Promise<FilePlan[]> {
  return Promise.all(
    config.files.map(async (file): Promise<FilePlan> => {
      const absPath = resolve(cwd, file.filename)
      const content = fileToString(file)
      const actual = await readIfExists(absPath)

      if (actual === null) return { kind: 'new', filename: file.filename, absPath, content }

      const normalizedActual = normalizeJson(actual) ?? actual
      const normalizedExpected = normalizeJson(content) ?? content

      if (normalizedActual === normalizedExpected) return { kind: 'unchanged', filename: file.filename }

      const diff = createTwoFilesPatch(
        file.filename,
        file.filename,
        normalizedActual,
        normalizedExpected,
        'current',
        'generated',
        { context: 3 },
      )
      return { kind: 'changed', filename: file.filename, absPath, content, diff }
    }),
  )
}

export async function applyWrites(plans: FilePlan[], skip: Set<string> = new Set()): Promise<WriteResult> {
  const result: WriteResult = { written: [], unchanged: [], skipped: [] }
  await Promise.all(
    plans.map(async (plan) => {
      if (plan.kind === 'unchanged') {
        result.unchanged.push(plan.filename)
      } else if (skip.has(plan.filename)) {
        result.skipped.push(plan.filename)
      } else {
        await writeFile(plan.absPath, plan.content, 'utf8')
        result.written.push(plan.filename)
      }
    }),
  )
  return result
}

export async function writeFiles(config: RenderedConfig, cwd: string): Promise<WriteResult> {
  return applyWrites(await planWrites(config, cwd))
}

function normalizeJson(text: string): string | null {
  try {
    const stripped = text.replace(/^\s*\/\/.*$/gm, '').trim()
    return JSON.stringify(JSON.parse(stripped), null, 2) + '\n'
  } catch {
    return null
  }
}

async function readIfExists(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf8')
  } catch (err) {
    if (isErrnoException(err) && err.code === 'ENOENT') return null
    throw err
  }
}
