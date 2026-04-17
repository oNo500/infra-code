export interface TemplateInput {
  /** Profile's camelCase function name, e.g. 'viteReact'. */
  profileFnName: string
  layers: readonly string[]
  paths?: Record<string, readonly string[]>
}

/**
 * Render a tsconfig.config.ts source file based on scaffolding choices.
 * Kept deliberately string-based — one time scaffolding, not a live template.
 *
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
    lines.push('  layers: {')
    for (const name of layers) {
      if (name === 'test') {
        lines.push('    test: {')
        lines.push(`      extends: '${layers[0]!}',`)
        lines.push(`      compilerOptions: {`)
        lines.push(`        types: ['vitest/globals'],`)
        lines.push(`      },`)
        lines.push(`      include: ['**/*.test.ts', '**/*.test.tsx', '__tests__/**'],`)
        lines.push('    },')
      } else {
        lines.push(`    ${name}: {},`)
      }
    }
    lines.push('  },')
  }

  lines.push('} satisfies DefineTsconfigInput')
  return lines.join('\n') + '\n'
}
