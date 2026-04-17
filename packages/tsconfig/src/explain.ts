import { buildLayerChain, pickExclude, pickInclude, resolvePrimary } from './layer-chain'
import { applyProvenance, valueWithoutSource } from './provenance'
import type { Provenance, Source } from './provenance'
import type { DefineTsconfigInput, LayerInput } from './types'

export interface ExplainedLayer {
  filename: string
  layerName: string | null
  compilerOptions: Provenance
  include?: readonly string[]
  exclude?: readonly string[]
}

export interface ExplainedConfig {
  layers: ExplainedLayer[]
}

/** Like defineTsconfig, but returns per-field source metadata. */
export function explainTsconfig(input: DefineTsconfigInput): ExplainedConfig {
  const layers = input.layers ?? {}
  const layerNames = Object.keys(layers)

  if (layerNames.length === 0) {
    return { layers: [explainSingle(input)] }
  }

  const primaryName = resolvePrimary(input.primary, layerNames)
  return {
    layers: layerNames.map((name) =>
      explainLayer(name, input, layers, name === primaryName),
    ),
  }
}

function explainSingle(input: DefineTsconfigInput): ExplainedLayer {
  let prov: Provenance = {}
  if (input.profile) {
    prov = applyProvenance(prov, input.profile.compilerOptions, {
      kind: 'profile',
      name: input.profile.label,
    })
  }
  prov = applyProvenance(prov, input.compilerOptions, { kind: 'root', name: 'root' })
  return {
    filename: 'tsconfig.json',
    layerName: null,
    compilerOptions: prov,
    include: input.include ?? input.profile?.include,
    exclude: input.exclude ?? input.profile?.exclude,
  }
}

function explainLayer(
  name: string,
  input: DefineTsconfigInput,
  layers: Record<string, LayerInput>,
  isPrimary: boolean,
): ExplainedLayer {
  let prov: Provenance = {}
  if (input.profile) {
    prov = applyProvenance(prov, input.profile.compilerOptions, {
      kind: 'profile',
      name: input.profile.label,
    })
  }
  prov = applyProvenance(prov, input.compilerOptions, { kind: 'root', name: 'root' })

  const chain = buildLayerChain(name, layers, new Set())
  for (const stepName of chain) {
    prov = applyProvenance(prov, layers[stepName]!.compilerOptions, {
      kind: 'layer',
      name: stepName,
    })
  }

  return {
    filename: isPrimary ? 'tsconfig.json' : `tsconfig.${name}.json`,
    layerName: name,
    compilerOptions: prov,
    include: pickInclude(input, chain, layers),
    exclude: pickExclude(input, chain, layers),
  }
}


export interface RenderExplainOptions {
  layer?: string
  field?: string
  hypothetical?: boolean
  format?: 'text' | 'json'
}

/**
 * Render an ExplainedConfig into a human-readable (or JSON) string.
 * This is the dump used by `tsconfig explain` CLI.
 */
export function renderExplain(
  explained: ExplainedConfig,
  opts: RenderExplainOptions = {},
): string {
  const format = opts.format ?? 'text'
  const layers = opts.layer
    ? explained.layers.filter((l) => l.layerName === opts.layer || l.filename === opts.layer)
    : explained.layers

  if (layers.length === 0) {
    const available = explained.layers.map((l) => l.layerName ?? l.filename).join(', ')
    throw new Error(`Layer '${opts.layer!}' not found. Available: ${available}`)
  }

  if (format === 'json') {
    return JSON.stringify(
      layers.map((l) => renderLayerJson(l, opts)),
      null,
      2,
    )
  }

  return layers.map((l) => renderLayerText(l, opts)).join('\n\n')
}

function renderLayerJson(layer: ExplainedLayer, opts: RenderExplainOptions): object {
  const fields: Record<string, object> = {}
  for (const [key, entry] of Object.entries(layer.compilerOptions)) {
    if (opts.field && key !== opts.field) continue
    const item: Record<string, unknown> = {
      value: entry.value,
      sources: entry.sources,
    }
    if (entry.itemSources) {
      item['itemSources'] = entry.itemSources
    }
    if (opts.hypothetical) {
      item['ifRemoved'] = Object.fromEntries(
        entry.sources.map((s) => [s.name, valueWithoutSource(entry, s.name)]),
      )
    }
    fields[key] = item
  }
  return {
    filename: layer.filename,
    layer: layer.layerName,
    compilerOptions: fields,
    include: layer.include,
    exclude: layer.exclude,
  }
}

function renderLayerText(layer: ExplainedLayer, opts: RenderExplainOptions): string {
  const header = layer.layerName
    ? `${layer.filename}   (layer: ${layer.layerName})`
    : layer.filename
  const lines: string[] = [header, '═'.repeat(header.length), '']
  lines.push('compilerOptions:')

  const entries = Object.entries(layer.compilerOptions)
  const filtered = opts.field ? entries.filter(([k]) => k === opts.field) : entries

  if (filtered.length === 0 && opts.field) {
    lines.push(`  (field '${opts.field}' not present)`)
  }

  for (const [key, entry] of filtered) {
    lines.push(...renderField(key, entry, opts))
  }

  if (layer.include) {
    lines.push('', `include: ${JSON.stringify(layer.include)}`)
  }
  if (layer.exclude) {
    lines.push(`exclude: ${JSON.stringify(layer.exclude)}`)
  }

  return lines.join('\n')
}

function renderField(
  key: string,
  entry: { value: unknown; sources: Source[]; itemSources?: Array<{ item: unknown; source: Source }> },
  opts: RenderExplainOptions,
): string[] {
  const lines: string[] = []
  const sourceLabel = entry.sources.map((s) => `${s.kind}:${s.name}`).join(' → ')

  if (entry.itemSources && entry.itemSources.length > 0) {
    lines.push(`  ${key}:   [${sourceLabel}]`)
    for (const { item, source } of entry.itemSources) {
      lines.push(`    - ${formatValue(item)}   [${source.kind}:${source.name}]`)
    }
  } else {
    lines.push(`  ${key}: ${formatValue(entry.value)}   [${sourceLabel}]`)
  }

  if (opts.hypothetical) {
    for (const s of entry.sources) {
      const hypo = valueWithoutSource(
        { value: entry.value, sources: entry.sources, itemSources: entry.itemSources },
        s.name,
      )
      lines.push(`    if without ${s.kind}:${s.name} → ${formatValue(hypo)}`)
    }
  }
  return lines
}

function formatValue(v: unknown): string {
  if (v === undefined) return '(unset)'
  if (typeof v === 'string') return JSON.stringify(v)
  if (Array.isArray(v) || (typeof v === 'object' && v !== null)) {
    return JSON.stringify(v)
  }
  return String(v)
}

