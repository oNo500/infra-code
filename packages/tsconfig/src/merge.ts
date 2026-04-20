import { dedupe, isPlainObject } from './utils'

import type { ArrayControl, ArrayField, CompilerOptions } from './types'

export function mergeCompilerOptions(
  base: CompilerOptions | undefined,
  over: CompilerOptions | undefined,
): CompilerOptions {
  if (!base && !over) return {}
  if (!base) return normalizeCompilerOptions(over!)
  if (!over) return { ...base }

  const result: CompilerOptions = { ...base }

  for (const key of Object.keys(over)) {
    const baseValue = result[key]
    const overValue = over[key]

    if (overValue === undefined) continue

    if (isArrayField(overValue)) {
      const baseArray = Array.isArray(baseValue) ? (baseValue as readonly unknown[]) : []
      result[key] = applyArrayField(baseArray, overValue)
      continue
    }

    if (isPlainObject(overValue) && isPlainObject(baseValue)) {
      result[key] = { ...baseValue, ...overValue }
      continue
    }

    result[key] = overValue
  }

  return result
}

export function normalizeCompilerOptions(opts: CompilerOptions): CompilerOptions {
  const result: CompilerOptions = {}
  for (const [key, value] of Object.entries(opts)) {
    if (isArrayField(value)) {
      result[key] = applyArrayField([], value)
    } else {
      result[key] = value
    }
  }
  return result
}

function applyArrayField<T>(base: readonly T[], field: ArrayField<T>): readonly T[] {
  if (field === 'none') return []
  if (Array.isArray(field)) return dedupe([...base, ...(field as readonly T[])])
  const ctrl = field as ArrayControl<T>
  if (ctrl.merge === 'none') return []
  if (ctrl.merge === 'replace') return dedupe([...(ctrl.value ?? [])])
  return dedupe([...base, ...(ctrl.value ?? [])])
}

function isArrayField(v: unknown): v is ArrayField<unknown> {
  if (v === 'none') return true
  if (Array.isArray(v)) return true
  if (isPlainObject(v) && 'merge' in v) return true
  return false
}

export type { ArrayField }
