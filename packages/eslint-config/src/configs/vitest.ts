import { fixupPluginRules } from '@eslint/compat'
import vitestPlugin from '@vitest/eslint-plugin'
import { defineConfig } from 'eslint/config'

import { GLOB_TESTS, isInEditorEnv } from '../utils'

import type { OptionsFiles, OptionsOverrides } from '../types'
import type { ESLint, Linter } from 'eslint'

export type VitestOptions = OptionsFiles & OptionsOverrides & {
  /**
   * 是否在编辑器中运行
   * 编辑器中 .skip/.only 显示警告，CI 中报错
   */
  isInEditor?: boolean
}

/**
 * Vitest 测试规则配置
 *
 * 使用 @vitest/eslint-plugin 的推荐规则集
 * 包含测试最佳实践、常见错误检测等规则
 *
 * 测试代码专用配置（基于 Vue、Vite 等主流项目最佳实践）：
 * - 放宽通用规则（no-console、no-undef 等）
 * - 放宽 TypeScript 严格性（允许 @ts-ignore、无需显式类型等）
 * - 强制测试质量（禁止提交 .skip 和 .only 测试）
 *
 * @param options - 配置选项
 * @param options.files - 文件匹配模式,默认匹配所有测试文件
 * @param options.overrides - 自定义规则覆盖
 * @param options.isInEditor - 是否在编辑器中运行,影响 .skip/.only 的严格程度
 * @returns ESLint 配置数组
 */
export function vitest(options: VitestOptions = {}): Linter.Config[] {
  const {
    files = GLOB_TESTS,
    overrides = {},
    isInEditor = isInEditorEnv(),
  } = options

  return defineConfig([
    // TODO: 兼容性问题很多，并且需要实际测试
    {
      name: 'vitest/rules',
      files,
      plugins: {
        vitest: fixupPluginRules(vitestPlugin as unknown as ESLint.Plugin), // 兼容性问题
      },
      rules: {
        ...vitestPlugin.configs.recommended.rules,

        // 测试代码专用规则放宽（基于 Vite 项目最佳实践）
        'no-console': 'off', // 允许测试中使用 console
        'no-restricted-globals': 'off', // 允许访问测试环境全局变量
        'no-restricted-syntax': 'off', // 允许测试中使用特殊语法
        'no-undef': 'off', // TypeScript 已处理类型检查
        '@typescript-eslint/ban-ts-comment': 'off', // 允许 @ts-ignore 等注释
        '@typescript-eslint/explicit-module-boundary-types': 'off', // 测试函数不需要显式返回类型
        '@typescript-eslint/unbound-method': 'off', // 测试中 mock 方法不需要绑定
        'unicorn/no-null': 'off', // 测试中 mock 返回 null 是合理的

        // 测试代码风格统一
        'vitest/consistent-test-it': ['error', { fn: 'it', withinDescribe: 'it' }], // 统一使用 it
        'vitest/no-identical-title': 'error', // 禁止重复测试标题
        'vitest/prefer-hooks-in-order': 'error', // 强制 hooks 顺序
        'vitest/prefer-lowercase-title': 'error', // 统一小写标题

        // 测试质量保证（编辑器中警告，CI 中报错）
        'vitest/no-disabled-tests': isInEditor ? 'warn' : 'error', // 禁止提交 .skip 测试
        'vitest/no-focused-tests': isInEditor ? 'warn' : 'error', // 禁止提交 .only 测试

        ...overrides,
      },
      settings: {
        vitest: {
          typecheck: true,
        },
      },
    },
  ])
}
