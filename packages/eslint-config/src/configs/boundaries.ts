/**
 * eslint-plugin-boundaries 配置，用于强制执行架构边界规则
 */
import { defineConfig } from 'eslint/config'
import boundariesPlugin from 'eslint-plugin-boundaries'

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
        'boundaries/element-types': [
          'error',
          {
            default: 'disallow',
            rules: rules.map((rule) => ({
              from: Array.isArray(rule.from) ? rule.from : [rule.from],
              allow: rule.allow
                ? (Array.isArray(rule.allow) ? rule.allow : [rule.allow])
                : undefined,
              message: rule.message,
            })),
          },
        ],
        ...overrides,
      },
    },
  ])
}
