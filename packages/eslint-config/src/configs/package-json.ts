import { defineConfig } from 'eslint/config'
import plugin from 'eslint-plugin-package-json'

import type { OptionsOverrides } from '../types'
import type { Linter } from 'eslint'

/**
 * Package.json 配置选项
 */
export interface PackageJsonOptions extends OptionsOverrides {
  /**
   * 是否启用风格化规则
   * @default true
   */
  stylistic?: boolean

  /**
   * 是否对私有包强制执行规则
   * @default false - name 和 version 不强制,其他字段强制
   */
  enforceForPrivate?: boolean
}

/**
 * Package.json 规则配置
 *
 * @description
 * 检查 package.json 文件的一致性、可读性和有效性,包括:
 * - 必需字段验证 (name, version, description, license 等)
 * - 字段格式验证 (名称规范、版本格式、许可证等)
 * - 依赖验证 (重复依赖、版本范围等)
 * - 属性排序和集合排序
 *
 * @param options - 配置选项
 * @param options.stylistic - 是否启用风格化规则 (属性排序、命名规范等)
 * @param options.enforceForPrivate - 私有包（"private": true）是否强制执行 require-* 规则
 * @param options.overrides - 自定义规则覆盖
 * @returns ESLint 配置数组
 *
 * @see https://github.com/JoshuaKGoldberg/eslint-plugin-package-json
 *
 * @example
 * ```ts
 * // 使用默认配置 (recommended + stylistic)
 * export default await composeConfig({
 *   packageJson: true,
 * });
 *
 * // 仅启用推荐规则
 * export default await composeConfig({
 *   packageJson: {
 *     stylistic: false,
 *   },
 * });
 *
 * // 自定义配置
 * export default await composeConfig({
 *   packageJson: {
 *     stylistic: true,
 *     enforceForPrivate: false,
 *     overrides: {
 *       'package-json/require-keywords': 'off', // 不强制要求 keywords
 *     },
 *   },
 * });
 * ```
 */
export function packageJson(options: PackageJsonOptions = {}): Linter.Config[] {
  const { stylistic = true, enforceForPrivate, overrides = {} } = options

  return defineConfig({
    name: 'package-json/rules',
    plugins: {
      'package-json': plugin,
    },
    extends: [plugin.configs.recommended],
    rules: {
      ...(stylistic ? plugin.configs.stylistic.rules : {}),
      'package-json/valid-local-dependency': 'off', // 允许使用 link: 本地依赖
      ...overrides,
    },
    ...(enforceForPrivate !== undefined && {
      settings: {
        packageJson: {
          enforceForPrivate,
        },
      },
    }),
  })
}
