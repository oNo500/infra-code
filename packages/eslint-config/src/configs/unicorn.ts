/**
 * Unicorn ESLint 配置,提供 100+ 强大规则改进代码质量和一致性
 */
import { defineConfig } from 'eslint/config'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'

import { GLOB_SRC } from '../utils'

import type { UnicornOptions } from '../types'
import type { Linter } from 'eslint'

export function unicorn(options: UnicornOptions = {}): Linter.Config[] {
  const { files = [GLOB_SRC], overrides = {} } = options

  return defineConfig({
    name: 'unicorn/rules',
    files,
    extends: [eslintPluginUnicorn.configs.recommended],
    rules: {
      'unicorn/no-null': 'off',
      'unicorn/prevent-abbreviations': 'off',
      ...overrides,
    },
  })
}
