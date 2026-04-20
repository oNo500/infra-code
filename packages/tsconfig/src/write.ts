import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { fileToString, GENERATED_HEADER } from './render'
import { isErrnoException } from './utils'

import type { RenderedConfig } from './types'

export interface WriteResult {
  written: string[]
  unchanged: string[]
  skipped: string[]
}

export type FieldChange =
  | { kind: 'added'; key: string; newValue: unknown }
  | { kind: 'removed'; key: string; oldValue: unknown }
  | { kind: 'modified'; key: string; oldValue: unknown; newValue: unknown }

export type FilePlan =
  | { kind: 'new'; filename: string; absPath: string; content: string }
  | { kind: 'changed'; filename: string; absPath: string; current: Record<string, unknown>; generated: Record<string, unknown>; changes: FieldChange[] }
  | { kind: 'unchanged'; filename: string }

export async function planWrites(config: RenderedConfig, cwd: string): Promise<FilePlan[]> {
  return Promise.all(
    config.files.map(async (file): Promise<FilePlan> => {
      const absPath = resolve(cwd, file.filename)
      const content = fileToString(file)
      const actual = await readIfExists(absPath)

      if (actual === null) return { kind: 'new', filename: file.filename, absPath, content }

      const currentObj = parseJson(actual)
      const generatedObj = parseJson(content)

      if (currentObj === null || generatedObj === null) {
        // fallback: treat as new if parse fails
        return { kind: 'new', filename: file.filename, absPath, content }
      }

      const changes = diffObjects(currentObj, generatedObj)
      if (changes.length === 0) return { kind: 'unchanged', filename: file.filename }

      return { kind: 'changed', filename: file.filename, absPath, current: currentObj, generated: generatedObj, changes }
    }),
  )
}

export function mergeWithChanges(plan: Extract<FilePlan, { kind: 'changed' }>, accepted: Set<string>): string {
  const result = deepClone(plan.current)
  for (const change of plan.changes) {
    if (!accepted.has(change.key)) continue
    const parts = change.key.split('.')
    const last = parts[parts.length - 1]!
    let obj = result
    for (const part of parts.slice(0, -1)) {
      if (typeof obj[part] !== 'object' || obj[part] === null) obj[part] = {}
      obj = obj[part] as Record<string, unknown>
    }
    if (change.kind === 'removed') {
      delete obj[last]
    } else {
      obj[last] = change.newValue
    }
  }
  return `${GENERATED_HEADER}\n${JSON.stringify(result, null, 2)}\n`
}

function deepClone(obj: Record<string, unknown>): Record<string, unknown> {
  return JSON.parse(JSON.stringify(obj)) as Record<string, unknown>
}

export async function applyWrites(plans: FilePlan[], skip: Set<string> = new Set(), merges: Map<string, string> = new Map()): Promise<WriteResult> {
  const result: WriteResult = { written: [], unchanged: [], skipped: [] }
  await Promise.all(
    plans.map(async (plan) => {
      if (plan.kind === 'unchanged') {
        result.unchanged.push(plan.filename)
      } else if (skip.has(plan.filename)) {
        result.skipped.push(plan.filename)
      } else {
        const content = plan.kind === 'changed'
          ? (merges.get(plan.filename) ?? JSON.stringify(plan.generated, null, 2) + '\n')
          : plan.content
        await writeFile(plan.absPath, content, 'utf8')
        result.written.push(plan.filename)
      }
    }),
  )
  return result
}

export async function writeFiles(config: RenderedConfig, cwd: string): Promise<WriteResult> {
  return applyWrites(await planWrites(config, cwd))
}

function diffObjects(current: Record<string, unknown>, generated: Record<string, unknown>, prefix = ''): FieldChange[] {
  const changes: FieldChange[] = []
  const allKeys = new Set([...Object.keys(current), ...Object.keys(generated)])
  for (const key of allKeys) {
    const path = prefix ? `${prefix}.${key}` : key
    const inCurrent = Object.hasOwn(current, key)
    const inGenerated = Object.hasOwn(generated, key)
    if (!inCurrent) {
      changes.push({ kind: 'added', key: path, newValue: generated[key] })
    } else if (!inGenerated) {
      changes.push({ kind: 'removed', key: path, oldValue: current[key] })
    } else if (isPlainObj(current[key]) && isPlainObj(generated[key])) {
      changes.push(...diffObjects(
        current[key] as Record<string, unknown>,
        generated[key] as Record<string, unknown>,
        path,
      ))
    } else if (JSON.stringify(current[key]) !== JSON.stringify(generated[key])) {
      changes.push({ kind: 'modified', key: path, oldValue: current[key], newValue: generated[key] })
    }
  }
  return changes
}

function isPlainObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function parseJson(text: string): Record<string, unknown> | null {
  try {
    const stripped = text.replace(/^\s*\/\/.*$/gm, '').trim()
    const parsed = JSON.parse(stripped) as unknown
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : null
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
