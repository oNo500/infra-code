/**
 * Package.json 文件规则配置,检查文件一致性、字段验证和依赖管理
 */
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
      'package-json/valid-local-dependency': 'off',
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
