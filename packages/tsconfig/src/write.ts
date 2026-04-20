import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { fileToString, GENERATED_HEADER } from './render'
import { isErrnoException, isPlainObject } from './utils'

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
      const actual = await readIfExists(absPath)

      if (actual === null) return { kind: 'new', filename: file.filename, absPath, content: fileToString(file) }

      const currentObj = parseJson(actual)
      if (currentObj === null) return { kind: 'new', filename: file.filename, absPath, content: fileToString(file) }

      const generatedObj = file.content as unknown as Record<string, unknown>
      const changes = diffObjects(currentObj, generatedObj)
      if (changes.length === 0) return { kind: 'unchanged', filename: file.filename }

      return { kind: 'changed', filename: file.filename, absPath, current: currentObj, generated: generatedObj, changes }
    }),
  )
}

export function mergeWithChanges(plan: Extract<FilePlan, { kind: 'changed' }>, accepted: Set<string>): string {
  const result = structuredClone(plan.current)
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

// Fields owned by the project — never overwrite unless the user explicitly selects them.
// 'added' changes to paths are allowed (tool is introducing aliases for the first time).
export const PRESERVE_KEYS: readonly string[] = ['include', 'exclude', 'references']
export const PRESERVE_IF_EXISTING_KEYS: readonly string[] = ['compilerOptions.paths']

function isPreserved(c: FieldChange): boolean {
  if (PRESERVE_KEYS.includes(c.key)) return true
  if (PRESERVE_IF_EXISTING_KEYS.includes(c.key) && c.kind !== 'added') return true
  return false
}

// Used by non-interactive writeFiles: accept everything except project-owned structural fields.
export function autoAccepted(changes: FieldChange[]): Set<string> {
  return new Set(changes.filter((c) => !isPreserved(c)).map((c) => c.key))
}

// Used by interactive CLI: added fields default to unselected (user decides).
export function defaultSelected(changes: FieldChange[]): string[] {
  return changes.filter((c) => !isPreserved(c) && c.kind !== 'added').map((c) => c.key)
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
  const plans = await planWrites(config, cwd)
  const merges = new Map<string, string>()
  for (const plan of plans) {
    if (plan.kind === 'changed') {
      merges.set(plan.filename, mergeWithChanges(plan, autoAccepted(plan.changes)))
    }
  }
  return applyWrites(plans, new Set(), merges)
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
    } else if (isPlainObject(current[key]) && isPlainObject(generated[key])) {
      changes.push(...diffObjects(current[key], generated[key], path))
    } else if (JSON.stringify(current[key]) !== JSON.stringify(generated[key])) {
      changes.push({ kind: 'modified', key: path, oldValue: current[key], newValue: generated[key] })
    }
  }
  return changes
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
