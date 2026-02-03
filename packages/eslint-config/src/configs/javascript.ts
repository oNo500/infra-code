import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import globals from 'globals'

import { GLOB_SRC } from '../utils'

import type { OptionsFiles, OptionsOverrides } from '../types'
import type { Linter } from 'eslint'

export type JavaScriptOptions = OptionsFiles & OptionsOverrides

/**
 * JavaScript 基础配置
 *
 * @param options - 配置选项
 * @param options.files - 文件匹配模式
 * @param options.overrides - 规则覆盖
 * @returns ESLint 配置数组
 */
export function javascript(options: JavaScriptOptions = {}): Linter.Config[] {
  const { files = [GLOB_SRC], overrides = {} } = options

  return defineConfig({
    name: 'javascript/rules',
    files,
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.es2021,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      sourceType: 'module',
    },
    rules: {
      ...overrides,
    },
  })
}
