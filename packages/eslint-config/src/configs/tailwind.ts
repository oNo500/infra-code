/**
 * Tailwind CSS ESLint 配置，使用官方推荐规则集
 */
import { defineConfig } from 'eslint/config'
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss'

import type { OptionsFiles, OptionsOverrides, OptionsTailwind } from '../types'
import type { Linter } from 'eslint'

export type TailwindOptions = OptionsFiles & OptionsOverrides & OptionsTailwind

/**
 * Tailwind CSS 规则配置
 */
export function tailwind(options: TailwindOptions = {}): Linter.Config[] {
  const { files, overrides = {}, entryPoint = 'src/global.css' } = options

  return defineConfig([
    {
      extends: [
        eslintPluginBetterTailwindcss.configs.recommended,
      ],
      ...(files ? { files } : {}),
      rules: {
        'better-tailwindcss/enforce-consistent-line-wrapping': ['error', { printWidth: 0 }],
        ...overrides,
      },
      settings: {
        'better-tailwindcss': {
          entryPoint,
        },
      },
    },
  ])
}
