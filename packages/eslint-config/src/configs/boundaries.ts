import boundariesPlugin from 'eslint-plugin-boundaries'
/**
 * eslint-plugin-boundaries configuration for enforcing architectural boundary rules
 */
import { defineConfig } from 'eslint/config'

import { GLOB_SRC } from '../utils'

import type { BoundariesOptions } from '../types'
import type { Linter } from 'eslint'

export function boundaries(options: BoundariesOptions = {}): Linter.Config[] {
  const { elements, rules, files = [GLOB_SRC], overrides = {} } = options

  if (!elements?.length || !rules?.length) return []

  return defineConfig([
    {
      name: 'boundaries/rules',
      files,
      plugins: {
        boundaries: boundariesPlugin,
      },
      settings: {
        'boundaries/elements': elements,
      },
      rules: {
        'boundaries/dependencies': [
          'error',
          {
            default: 'disallow',
            rules: rules.map((rule) => ({
              from: Array.isArray(rule.from) ? rule.from : [rule.from],
              allow: rule.allow,
              message: rule.message,
            })),
          },
        ],
        ...overrides,
      },
    },
  ])
}
