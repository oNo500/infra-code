/**
 * React ESLint 配置,集成 @eslint-react、react-hooks 和 react-refresh 插件
 */
import reactPlugin from '@eslint-react/eslint-plugin'
import { defineConfig } from 'eslint/config'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

import { GLOB_JSX } from '../utils'

import type { ReactOptions } from '../types'
import type { Linter } from 'eslint'

/**
 * React 规则配置
 */
export function react(options: ReactOptions = {}): Linter.Config[] {
  const { files = [GLOB_JSX], overrides = {} } = options

  return defineConfig({
    name: 'react/rules',
    files,
    extends: [
      reactPlugin.configs['recommended-typescript'],
      reactHooksPlugin.configs.flat['recommended-latest'],
      reactRefresh.configs.recommended,
    ],
    rules: {
      ...overrides,
    },
  })
}
