/**
 * JavaScript ESLint 基础配置,提供推荐规则和 ES2021+ 全局变量支持
 */
import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import globals from 'globals'

import { GLOB_SRC } from '../utils'

import type { JavaScriptOptions } from '../types'
import type { Linter } from 'eslint'

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
