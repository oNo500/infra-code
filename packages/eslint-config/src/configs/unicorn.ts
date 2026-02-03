import defu from 'defu'
import { defineConfig } from 'eslint/config'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'

import { GLOB_SRC } from '../utils'

import type { OptionsFiles, OptionsOverrides } from '../types'
import type { Linter } from 'eslint'

/**
 * Unicorn 最佳实践配置
 *
 * 提供超过 100 条强大的 ESLint 规则，用于改进代码质量和一致性
 *
 * @param options - 配置选项
 * @param options.files - 应用此配置的文件模式
 * @param options.overrides - 自定义规则覆盖
 * @returns ESLint 配置数组
 *
 * @example
 * ```ts
 * import { unicorn } from 'infra-es';
 *
 * export default [
 *   ...unicorn({
 *     overrides: {
 *       'unicorn/prevent-abbreviations': 'off',
 *     },
 *   }),
 * ];
 * ```
 */
export type UnicornOptions = OptionsFiles & OptionsOverrides

export function unicorn(options: UnicornOptions = {}): Linter.Config[] {
  const { files = [GLOB_SRC], overrides = {} } = options

  return defineConfig({
    name: 'unicorn/rules',
    files,
    extends: [eslintPluginUnicorn.configs.recommended],
    rules: defu(overrides, {
      // drizzle、react-query 等现代工具库默认使用 null，在数据操作场景不兼容
      'unicorn/no-null': 'off',
      'unicorn/prevent-abbreviations': 'off',
    }),
  })
}
