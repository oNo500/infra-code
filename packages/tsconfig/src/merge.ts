import type { ArrayField, ArrayVerb, CompilerOptions } from './types'

/**
 * Merge two CompilerOptions layers. `base` is the lower layer (profile default),
 * `over` is the higher layer (user input). User input wins for scalars, merges
 * for objects, and appends to arrays by default (overridable via verbs).
 */
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

    if (isArrayVerb(overValue)) {
      result[key] = applyVerb(baseValue as readonly unknown[] | undefined, overValue)
      continue
    }

    if (Array.isArray(overValue)) {
      result[key] = dedupe([...(asArray(baseValue) ?? []), ...overValue])
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

/** Strip any ArrayVerb wrappers so the output is a clean JSON object. */
export function normalizeCompilerOptions(opts: CompilerOptions): CompilerOptions {
  const result: CompilerOptions = {}
  for (const [key, value] of Object.entries(opts)) {
    if (isArrayVerb(value)) {
      result[key] = applyVerb(undefined, value)
    } else {
      result[key] = value
    }
  }
  return result
}

function applyVerb<T>(
  base: readonly T[] | undefined,
  verb: ArrayVerb<T>,
): readonly T[] {
  if (verb.$set !== undefined) return dedupe([...verb.$set])

  let result: T[] = base ? [...base] : []

  if (verb.$remove) {
    const removeSet = new Set(verb.$remove as readonly T[])
    result = result.filter((item) => !removeSet.has(item))
  }
  if (verb.$prepend) {
    result = dedupe([...verb.$prepend, ...result])
  }
  if (verb.$append) {
    result = dedupe([...result, ...verb.$append])
  }
  return result
}

function isArrayVerb(v: unknown): v is ArrayVerb<unknown> {
  if (!isPlainObject(v)) return false
  const keys = Object.keys(v)
  if (keys.length === 0) return false
  return keys.every((k) => k === '$set' || k === '$remove' || k === '$prepend' || k === '$append')
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v) && (v as object).constructor === Object
}

function asArray<T>(v: unknown): readonly T[] | undefined {
  if (Array.isArray(v)) return v as readonly T[]
  return undefined
}

function dedupe<T>(arr: readonly T[]): T[] {
  const seen = new Set<string>()
  const out: T[] = []
  for (const item of arr) {
    const key = typeof item === 'object' && item !== null ? JSON.stringify(item) : String(item)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(item)
  }
  return out
}

export type { ArrayField }
