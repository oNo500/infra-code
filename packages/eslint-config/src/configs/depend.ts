/**
 * 依赖优化规则配置,检测可用原生 API 替代的包和微型工具库
 */
import { fixupPluginRules } from '@eslint/compat'
import dependPlugin from 'eslint-plugin-depend'

import { GLOB_SRC } from '../utils'

import type { DependOptions } from '../types'
import type { ESLint, Linter } from 'eslint'

export function depend(options: DependOptions = {}): Linter.Config[] {
  const { presets = [], modules = [], allowed = [], overrides = {} } = options

  return [
    {
      name: 'depend/rules',
      files: [GLOB_SRC],
      plugins: {
        depend: fixupPluginRules(dependPlugin as unknown as ESLint.Plugin),
      },
      rules: {
        'depend/ban-dependencies': [
          'error',
          {
            presets: ['native', 'microutilities', 'preferred', ...presets],
            modules,
            allowed: [
              'dotenv', // drizzle.config.ts 和工具脚本需要
              ...allowed,
            ],
          },
        ],
        // 用户自定义覆盖
        ...overrides,
      },
    },
  ]
}
