import { defineConfig } from 'eslint/config'
import prettierConfig from 'eslint-plugin-prettier/recommended'

import { GLOB_SRC } from '../utils'

import type { OptionsOverrides } from '../types'
import type { Linter } from 'eslint'

export type PrettierOptions = OptionsOverrides

/**
 * Prettier 代码格式化配置
 *
 * @param options - 配置选项
 * @param options.overrides - 自定义规则覆盖
 * @returns ESLint 配置数组
 */
export function prettier(options: PrettierOptions = {}): Linter.Config[] {
  const { overrides = {} } = options

  const files = [GLOB_SRC]

  return defineConfig([
    {
      name: 'prettier/rules',
      files,
      extends: [prettierConfig],
      rules: overrides,
    },
  ])
}
