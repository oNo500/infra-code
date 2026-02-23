/**
 * eslint-plugin-jsx-a11y 配置,用于检测 JSX 中的无障碍问题(WCAG 标准)
 */
import { defineConfig } from 'eslint/config'
import jsxA11y from 'eslint-plugin-jsx-a11y'

import { GLOB_JSX } from '../utils'

import type { OptionsFiles, OptionsOverrides } from '../types'
import type { Linter } from 'eslint'

export type A11yOptions = OptionsFiles & OptionsOverrides

/**
 * 可访问性规则配置
 */
export function a11y(options: A11yOptions = {}): Linter.Config[] {
  const { files = [GLOB_JSX], overrides = {} } = options

  return defineConfig({
    name: 'a11y/rules',
    files,
    extends: [jsxA11y.flatConfigs.recommended],
    rules: {
      ...overrides,
    },
  })
}
