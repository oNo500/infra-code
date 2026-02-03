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

/**
 * 依赖优化规则配置
 *
 * @description
 * 检测并建议优化依赖选择,包括:
 * - 检测可用原生 API 替代的包
 * - 检测微型工具库(一行代码可实现的包)
 * - 推荐更好维护的替代方案
 *
 * @param options - 配置选项
 * @param options.presets - 预设规则集
 * @param options.modules - 自定义禁用模块
 * @param options.allowed - 允许使用的模块白名单
 * @param options.overrides - 自定义规则覆盖
 * @returns ESLint 配置数组
 *
 * @see https://github.com/es-tooling/eslint-plugin-depend
 *
 * @example
 * ```ts
 * // 使用默认配置(所有 presets)
 * export default await composeConfig({
 *   depend: true,
 * });
 *
 * // 自定义配置
 * export default await composeConfig({
 *   depend: {
 *     presets: ['native', 'preferred'], // 只启用部分 preset
 *     modules: ['lodash'], // 额外禁用 lodash
 *     allowed: ['moment'], // 允许使用 moment(即使在 preset 中)
 *   },
 * });
 *
 * // 渐进式启用(推荐)
 * export default await composeConfig({
 *   depend: {
 *     presets: ['native'], // 先只启用原生替代检测
 *     allowed: ['some-legacy-package'], // 暂时允许某些遗留依赖
 *   },
 * });
 * ```
 */
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
