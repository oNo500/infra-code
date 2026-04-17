export interface TemplateInput {
  profileName: string
  layers: readonly string[]
  paths?: Record<string, readonly string[]>
}

/**
 * Render a tsconfig.config.ts source file based on scaffolding choices.
 * Kept deliberately string-based — one time scaffolding, not a live template.
 */
export function renderConfigTemplate(input: TemplateInput): string {
  const { profileName, layers, paths } = input

  const lines: string[] = []
  lines.push(`import { defineTsconfig, ${profileName} } from '@infra-x/tsconfig'`)
  lines.push('')
  lines.push('export default defineTsconfig({')
  lines.push(`  profile: ${profileName}(),`)

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

  lines.push('})')
  return lines.join('\n') + '\n'
}
