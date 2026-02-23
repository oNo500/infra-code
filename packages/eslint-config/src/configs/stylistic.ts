/**
 * Stylistic 代码风格配置,提供缩进、引号、逗号等格式化规则
 */
import stylisticPlugin from '@stylistic/eslint-plugin'
import { defineConfig } from 'eslint/config'

import { GLOB_SRC } from '../utils'

import type { StylisticOptions } from '../types'
import type { Linter } from 'eslint'

export function stylistic(options: StylisticOptions = {}): Linter.Config[] {
  const { overrides = {} } = options

  const files = [GLOB_SRC]

  return defineConfig([
    {
      name: 'stylistic/rules',
      files,
      extends: [
        stylisticPlugin.configs.customize({
          indent: 2,
          semi: false,
          quotes: 'single',
          quoteProps: 'consistent-as-needed',
          commaDangle: 'always-multiline',
          arrowParens: true,
          blockSpacing: true,
          braceStyle: '1tbs',
          jsx: true,
        }),
      ],
      rules: overrides,
    },
  ])
}
