/**
 * Next.js ESLint 配置,使用官方插件检测 Next.js 最佳实践和 Core Web Vitals 性能优化
 */
import nextjsPlugin from '@next/eslint-plugin-next'
import { defineConfig } from 'eslint/config'

import type { NextjsOptions } from '../types'
import type { Linter } from 'eslint'

/**
 * Next.js 规则配置
 */
export function nextjs(options: NextjsOptions = {}): Linter.Config[] {
  const { overrides = {} } = options

  return defineConfig([
    {
      name: 'nextjs/rules',
      extends: [nextjsPlugin.configs.recommended as unknown as Linter.Config, nextjsPlugin.configs['core-web-vitals'] as unknown as Linter.Config],
      rules: overrides,
    },
  ])
}
