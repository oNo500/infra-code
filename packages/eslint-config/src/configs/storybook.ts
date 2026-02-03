import { defineConfig } from 'eslint/config'
import storybookPlugin from 'eslint-plugin-storybook'

import type { OptionsOverrides } from '../types'
import type { Linter } from 'eslint'

export type StorybookOptions = OptionsOverrides

/**
 * Storybook 规则配置
 *
 * 继承 eslint-plugin-storybook 的 flat/recommended 配置
 *
 * @see https://github.com/storybookjs/eslint-plugin-storybook
 *
 * @param options - 配置选项
 * @param options.overrides - 自定义规则覆盖
 * @returns ESLint 配置数组
 */
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
