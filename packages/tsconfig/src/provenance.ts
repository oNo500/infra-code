import { isPlainObject, itemKey } from './utils'

import type { ArrayControl, ArrayField, CompilerOptions } from './types'

/**
 * A source describes where a value in the rendered config came from.
 * Used by `tsconfig explain` to show origin of each field.
 */
export interface Source {
  kind: 'profile' | 'root' | 'layer'
  /** Profile name, or 'root', or layer name like 'app', 'test'. */
  name: string
}

export interface FieldProvenance {
  /** Final value rendered to output. */
  value: unknown
  /** Sources that contributed to this field, in application order. */
  sources: Source[]
  /** If this is an array, which source each item came from. */
  itemSources?: Array<{ item: unknown; source: Source }>
}

export type Provenance = Record<string, FieldProvenance>

/**
 * Apply a partial compilerOptions onto a provenance map, tracking sources.
 * Semantics match mergeCompilerOptions: scalar replace, object deep merge,
 * array append + dedupe, ArrayField (array shorthand, 'none', or ArrayControl).
 */
export function applyProvenance(
  current: Provenance,
  over: CompilerOptions | undefined,
  source: Source,
): Provenance {
  if (!over) return current
  const result: Provenance = { ...current }

  for (const key of Object.keys(over)) {
    const value = (over as Record<string, unknown>)[key]
    if (value === undefined) continue

    const existing = result[key]
    const existingSources = existing?.sources ?? []

    if (isArrayField(value)) {
      const newValue = applyArrayFieldToProvenance(existing, value, source)
      result[key] = {
        value: newValue.value,
        sources: [...existingSources, source],
        itemSources: newValue.itemSources,
      }
      continue
    }

    if (isPlainObject(value) && isPlainObject(existing?.value)) {
      result[key] = {
        value: { ...(existing.value as object), ...value },
        sources: [...existingSources, source],
      }
      continue
    }

    // Scalar or object-overwrite.
    result[key] = {
      value,
      sources: [...existingSources, source],
    }
  }

  return result
}

function applyArrayFieldToProvenance(
  existing: FieldProvenance | undefined,
  field: ArrayField<unknown>,
  source: Source,
): { value: unknown[]; itemSources: Array<{ item: unknown; source: Source }> } {
  if (field === 'none') {
    return { value: [], itemSources: [] }
  }

  if (Array.isArray(field)) {
    // Array shorthand: append to existing
    const existingItems = existing?.itemSources ?? []
    const newItems = field.map((item) => ({ item, source }))
    const combined = dedupeItemSources([...existingItems, ...newItems])
    return { value: combined.map((x) => x.item), itemSources: combined }
  }

  // ArrayControl
  const ctrl = field as ArrayControl<unknown>
  if (ctrl.merge === 'none') {
    return { value: [], itemSources: [] }
  }
  if (ctrl.merge === 'replace') {
    const items = (ctrl.value ?? []).map((item) => ({ item, source }))
    const deduped = dedupeItemSources(items)
    return { value: deduped.map((x) => x.item), itemSources: deduped }
  }
  // merge === 'append' (default)
  const existingItems = existing?.itemSources ?? []
  const newItems = (ctrl.value ?? []).map((item) => ({ item, source }))
  const combined = dedupeItemSources([...existingItems, ...newItems])
  return { value: combined.map((x) => x.item), itemSources: combined }
}

function isArrayField(v: unknown): v is ArrayField<unknown> {
  if (v === 'none') return true
  if (Array.isArray(v)) return true
  if (isPlainObject(v) && 'merge' in v) return true
  return false
}

function dedupeItemSources(
  items: Array<{ item: unknown; source: Source }>,
): Array<{ item: unknown; source: Source }> {
  const seen = new Map<string, { item: unknown; source: Source }>()
  for (const entry of items) {
    const key = itemKey(entry.item)
    if (!seen.has(key)) seen.set(key, entry)
  }
  return [...seen.values()]
}

/** Collapse a Provenance back into a clean CompilerOptions object. */
export function provenanceToCompilerOptions(prov: Provenance): CompilerOptions {
  const result: CompilerOptions = {}
  for (const [key, entry] of Object.entries(prov)) {
    result[key] = entry.value
  }
  return result
}

/**
 * Compute the hypothetical value if a specific source were removed from a field.
 * Used by `explain --hypothetical`.
 */
export function valueWithoutSource(prov: FieldProvenance, removeSourceName: string): unknown {
  if (prov.itemSources) {
    return prov.itemSources.filter((x) => x.source.name !== removeSourceName).map((x) => x.item)
  }
  // For scalars/objects, last source wins. Strip it.
  const remaining = prov.sources.filter((s) => s.name !== removeSourceName)
  return remaining.length === 0 ? undefined : prov.value
}
