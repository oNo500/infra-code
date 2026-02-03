import stylisticPlugin from '@stylistic/eslint-plugin'
import { defineConfig } from 'eslint/config'

import { GLOB_SRC } from '../utils'

import type { OptionsOverrides } from '../types'
import type { Linter } from 'eslint'

export type StylisticOptions = OptionsOverrides

/**
 * Stylistic 代码风格配置
 *
 * 提供代码风格规则（缩进、引号、逗号等）
 *
 * 配置哲学：
 * - 极简：TypeScript 不需要分号，单引号更轻盈，2 空格足够
 * - 一致：多行时统一加逗号，箭头函数始终加括号，使用主流 1tbs 大括号风格
 * - 美学：对象内留白，JSX 延续 HTML 双引号传统
 *
 * @param options - 配置选项
 * @param options.overrides - 自定义规则覆盖
 * @returns ESLint 配置数组
 */
export function stylistic(options: StylisticOptions = {}): Linter.Config[] {
  const { overrides = {} } = options

  const files = [GLOB_SRC]

  return defineConfig([
    {
      name: 'stylistic/rules',
      files,
      extends: [
        stylisticPlugin.configs.customize({
          // === 基础格式 ===
          indent: 2, // 极简：2 空格足够
          semi: false, // 极简：TypeScript 不需要分号

          // === 引号策略 ===
          quotes: 'single', // 美学：JS 用单引号，更轻盈
          quoteProps: 'consistent-as-needed', // 极简：仅必要时加引号，但保持一致

          // === 逗号策略 ===
          commaDangle: 'always-multiline', // 一致：多行时统一加逗号

          // === 括号策略 ===
          arrowParens: true, // 一致：箭头函数始终加括号
          blockSpacing: true, // 美学：单行块内留白 { return true }

          // === 代码块风格 ===
          braceStyle: '1tbs', // 一致：主流的 One True Brace Style

          // === JSX 支持 ===
          jsx: true, // 启用 JSX 相关规则
        }),
      ],
      rules: overrides,
    },
  ])
}
