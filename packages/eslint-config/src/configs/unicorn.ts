/**
 * Unicorn ESLint 配置,提供 100+ 强大规则改进代码质量和一致性
 */
import defu from 'defu'
import { defineConfig } from 'eslint/config'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'

import { GLOB_SRC } from '../utils'

import type { OptionsFiles, OptionsOverrides } from '../types'
import type { Linter } from 'eslint'

export type UnicornOptions = OptionsFiles & OptionsOverrides

export function unicorn(options: UnicornOptions = {}): Linter.Config[] {
  const { files = [GLOB_SRC], overrides = {} } = options

  return defineConfig({
    name: 'unicorn/rules',
    files,
    extends: [eslintPluginUnicorn.configs.recommended],
    rules: defu(overrides, {
      'unicorn/no-null': 'off',
      'unicorn/prevent-abbreviations': 'off',
    }),
  })
}
