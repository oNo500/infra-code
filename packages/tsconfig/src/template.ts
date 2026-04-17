import { buildLayer } from './layer-presets'

export interface TemplateInput {
  /** Profile's camelCase function name, e.g. 'viteReact'. */
  profileFnName: string
  layers: readonly string[]
  paths?: Record<string, readonly string[]>
}

/**
 * Render a tsconfig.config.ts source file based on scaffolding choices.
 * Exports a plain DefineTsconfigInput (not a pre-resolved RenderedConfig) so
 * that both `tsconfig gen` (which renders) and `tsconfig explain` (which needs
 * the unresolved source) can consume it.
 */
export function renderConfigTemplate(input: TemplateInput): string {
  const { profileFnName, layers, paths } = input

  const lines: string[] = []
  lines.push(`import { ${profileFnName} } from '@infra-x/tsconfig'`)
  lines.push(`import type { DefineTsconfigInput } from '@infra-x/tsconfig'`)
  lines.push('')
  lines.push('export default {')
  lines.push(`  profile: ${profileFnName}(),`)

  if (paths && Object.keys(paths).length > 0) {
    lines.push('  compilerOptions: {')
    lines.push('    paths: {')
    for (const [key, value] of Object.entries(paths)) {
      lines.push(`      '${key}': ${JSON.stringify(value)},`)
    }
    lines.push('    },')
    lines.push('  },')
  }

  if (layers.length > 0) {
    const base = layers[0]!
    lines.push('  layers: {')
    for (const name of layers) {
      const layer = buildLayer(name, base)
      if (Object.keys(layer).length === 0) {
        lines.push(`    ${name}: {},`)
      } else {
        lines.push(`    ${name}: ${serializeLayer(layer, '    ')},`)
      }
    }
    lines.push('  },')
  }

  lines.push('} satisfies DefineTsconfigInput')
  return lines.join('\n') + '\n'
}

/**
 * Serialize a LayerInput to TS source, matching the style used elsewhere in
 * the generated template (single quotes for strings, 2-space indent).
 */
function serializeLayer(layer: object, indent: string): string {
  const entries = Object.entries(layer)
  const inner = indent + '  '
  const lines = ['{']
  for (const [key, value] of entries) {
    lines.push(`${inner}${key}: ${serializeValue(value, inner)},`)
  }
  lines.push(`${indent}}`)
  return lines.join('\n')
}

function serializeValue(value: unknown, indent: string): string {
  if (value === null || value === undefined) return String(value)
  if (typeof value === 'string') return `'${value}'`
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) {
    const items = value.map((v) => serializeValue(v, indent))
    return `[${items.join(', ')}]`
  }
  if (typeof value === 'object') {
    const inner = indent + '  '
    const lines = ['{']
    for (const [k, v] of Object.entries(value as object)) {
      lines.push(`${inner}${k}: ${serializeValue(v, inner)},`)
    }
    lines.push(`${indent}}`)
    return lines.join('\n')
  }
  return JSON.stringify(value)
}
