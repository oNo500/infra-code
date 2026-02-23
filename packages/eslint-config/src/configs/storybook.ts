/**
 * Storybook ESLint 配置,使用官方插件检测 Storybook 最佳实践
 */
import { defineConfig } from 'eslint/config'
import storybookPlugin from 'eslint-plugin-storybook'

import type { StorybookOptions } from '../types'
import type { Linter } from 'eslint'

const flatRecommended = storybookPlugin.configs['flat/recommended'] as unknown as Linter.Config

export function storybook(options: StorybookOptions = {}): Linter.Config[] {
  const { overrides = {} } = options

  return defineConfig({
    name: 'storybook/recommended',
    extends: [flatRecommended],
    rules: {
      ...overrides,
    },
  })
}
