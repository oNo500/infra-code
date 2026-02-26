/**
 * Tailwind CSS ESLint 配置，使用官方推荐规则集
 */
import { defineConfig } from 'eslint/config'
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss'

import { GLOB_JSX } from '../utils'

import type { TailwindOptions } from '../types'
import type { Linter } from 'eslint'

/**
 * Tailwind CSS 规则配置
 */
export function tailwind(options: TailwindOptions = {}): Linter.Config[] {
  const { files = [GLOB_JSX], overrides = {}, entryPoint = 'src/global.css' } = options

  return defineConfig({
    name: 'tailwind/rules',
    files,
    extends: [
      eslintPluginBetterTailwindcss.configs.recommended,
    ],
    rules: {
      'better-tailwindcss/enforce-consistent-line-wrapping': ['error', { printWidth: 0 }],
      ...overrides,
    },
    settings: {
      'better-tailwindcss': {
        entryPoint,
      },
    },
  })
}
