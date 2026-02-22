/**
 * 依赖优化规则配置,检测可用原生 API 替代的包和微型工具库
 */
import { fixupPluginRules } from '@eslint/compat'
import dependPlugin from 'eslint-plugin-depend'

import { GLOB_SRC } from '../utils'

import type { OptionsOverrides } from '../types'
import type { ESLint, Linter } from 'eslint'

/**
 * Depend 配置选项
 */
export interface DependOptions extends OptionsOverrides {
  /**
   * 预设列表
   *
   * - `native`: 检测可用原生 JavaScript API 替代的包(如 `is-nan` → `Number.isNaN()`)
   * - `microutilities`: 检测微型工具库(一行代码可实现的包)
   * - `preferred`: 推荐更轻量、维护更好的替代方案
   *
   * @default ['native', 'microutilities', 'preferred']
   */
  presets?: ('native' | 'microutilities' | 'preferred')[]

  /**
   * 自定义禁用的模块列表
   * @default []
   */
  modules?: string[]

  /**
   * 允许使用的模块列表(即使在 presets 中)
   * @default []
   */
  allowed?: string[]
}

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
