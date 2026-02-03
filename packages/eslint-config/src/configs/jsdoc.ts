import { defineConfig } from 'eslint/config'
import jsdocPlugin from 'eslint-plugin-jsdoc'

import type { OptionsOverrides } from '../types'
import type { Linter } from 'eslint'

export type JsdocOptions = OptionsOverrides

/**
 * JSDoc 注释规范配置
 *
 * 使用 TypeScript 优化的推荐规则，验证 JSDoc 注释的正确性和一致性
 *
 * @param options - 配置选项
 * @param options.overrides - 自定义规则覆盖
 * @returns ESLint 配置数组
 */
export function jsdoc(options: JsdocOptions = {}): Linter.Config[] {
  const { overrides = {} } = options

  return defineConfig([
    {
      name: 'jsdoc/rules',
      extends: [jsdocPlugin.configs['flat/contents-typescript']],
      rules: {
        // 禁用描述格式检查，因为该规则主要针对英文注释设计，不适用于中文项目
        'jsdoc/match-description': 'off',
        // 禁用信息性文档检查，因为该规则对中文注释的语义分析不准确
        'jsdoc/informative-docs': 'off',
        ...overrides,
      },
    },
  ])
}
