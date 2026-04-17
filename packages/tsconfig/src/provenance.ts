import type { CompilerOptions } from './types'

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
 * array append + dedupe, $set/$remove/$prepend/$append verbs.
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

    if (isArrayVerb(value)) {
      const newValue = applyVerbToProvenance(existing, value as ArrayVerb, source)
      result[key] = {
        value: newValue.value,
        sources: [...existingSources, source],
        itemSources: newValue.itemSources,
      }
      continue
    }

    if (Array.isArray(value)) {
      const combinedItems: Array<{ item: unknown; source: Source }> = [
        ...(existing?.itemSources ?? []),
        ...value.map((item) => ({ item, source })),
      ]
      const deduped = dedupeItemSources(combinedItems)
      result[key] = {
        value: deduped.map((x) => x.item),
        sources: [...existingSources, source],
        itemSources: deduped,
      }
      continue
    }

    if (isPlainObject(value) && isPlainObject(existing?.value)) {
      result[key] = {
        value: { ...(existing!.value as object), ...value },
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

interface ArrayVerb {
  $set?: readonly unknown[]
  $remove?: readonly unknown[]
  $prepend?: readonly unknown[]
  $append?: readonly unknown[]
}

function applyVerbToProvenance(
  existing: FieldProvenance | undefined,
  verb: ArrayVerb,
  source: Source,
): { value: unknown[]; itemSources: Array<{ item: unknown; source: Source }> } {
  if (verb.$set !== undefined) {
    const items = verb.$set.map((item) => ({ item, source }))
    const deduped = dedupeItemSources(items)
    return { value: deduped.map((x) => x.item), itemSources: deduped }
  }

  let items: Array<{ item: unknown; source: Source }> = [...(existing?.itemSources ?? [])]

  if (verb.$remove) {
    const removeKeys = new Set(verb.$remove.map((item) => itemKey(item)))
    items = items.filter(({ item }) => !removeKeys.has(itemKey(item)))
  }
  if (verb.$prepend) {
    items = dedupeItemSources([
      ...verb.$prepend.map((item) => ({ item, source })),
      ...items,
    ])
  }
  if (verb.$append) {
    items = dedupeItemSources([
      ...items,
      ...verb.$append.map((item) => ({ item, source })),
    ])
  }
  return { value: items.map((x) => x.item), itemSources: items }
}

function isArrayVerb(v: unknown): v is ArrayVerb {
  if (!isPlainObject(v)) return false
  const keys = Object.keys(v)
  if (keys.length === 0) return false
  return keys.every((k) => k === '$set' || k === '$remove' || k === '$prepend' || k === '$append')
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v) && (v as object).constructor === Object
}

function itemKey(item: unknown): string {
  return typeof item === 'object' && item !== null ? JSON.stringify(item) : String(item)
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
export function valueWithoutSource(
  prov: FieldProvenance,
  removeSourceName: string,
): unknown {
  if (prov.itemSources) {
    return prov.itemSources
      .filter((x) => x.source.name !== removeSourceName)
      .map((x) => x.item)
  }
  // For scalars/objects, last source wins. Strip it.
  const remaining = prov.sources.filter((s) => s.name !== removeSourceName)
  return remaining.length === 0 ? undefined : prov.value
}
