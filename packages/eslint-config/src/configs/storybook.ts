/**
 * Storybook ESLint 配置,使用官方插件检测 Storybook 最佳实践
 */
import { defineConfig } from 'eslint/config'
import storybookPlugin from 'eslint-plugin-storybook'

import type { OptionsOverrides } from '../types'
import type { Linter } from 'eslint'

export type StorybookOptions = OptionsOverrides

export function storybook(options: StorybookOptions = {}): Linter.Config[] {
  const { overrides = {} } = options

  return defineConfig([
    {
      name: 'storybook/recommended',
      extends: [storybookPlugin.configs['flat/recommended'] as unknown as Linter.Config],
      rules: {
        ...overrides,
      },
    },
  ])
}
