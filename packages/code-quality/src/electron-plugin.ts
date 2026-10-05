interface ImportExpression {
  source: {
    type: string
    value?: unknown
    expressions?: unknown[]
    quasis?: { value: { cooked: string | null } }[]
  }
}

interface RuleContext {
  report(diagnostic: { node: ImportExpression['source']; message: string }): void
}

interface ElectronPlugin {
  meta: { name: string }
  rules: {
    'no-electron-runtime': {
      create(context: RuleContext): {
        ImportExpression(node: ImportExpression): void
      }
    }
  }
}

// Oxlint 1.59–1.62 do not check dynamic imports with no-restricted-imports.
// Keep this narrow: computed imports need a separate architecture/runtime review.
const plugin: ElectronPlugin = {
  meta: { name: 'infra-electron' },
  rules: {
    'no-electron-runtime': {
      create(context) {
        return {
          ImportExpression(node) {
            let source = node.source.value
            if (node.source.type === 'TemplateLiteral' && node.source.expressions?.length === 0) {
              source = node.source.quasis?.[0]?.value.cooked
            }
            if (
              typeof source === 'string' &&
              (source === 'electron' || source.startsWith('electron/'))
            ) {
              context.report({
                node: node.source,
                message:
                  'Expose Electron APIs through preload instead of importing them in renderer.',
              })
            }
          },
        }
      },
    },
  },
}

export default plugin
