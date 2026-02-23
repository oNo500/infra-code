/**
 * Package.json 文件规则配置,检查文件一致性、字段验证和依赖管理
 */
import { defineConfig } from 'eslint/config'
import plugin from 'eslint-plugin-package-json'

import type { PackageJsonOptions } from '../types'
import type { Linter } from 'eslint'

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
