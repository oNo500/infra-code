/**
 * TypeScript ESLint 配置,提供类型感知的代码检查(推荐规则 + 风格规则)
 */
import { defineConfig } from 'eslint/config'
import { configs, parser, plugin } from 'typescript-eslint'

import { GLOB_TS } from '../utils'

import type { TypeScriptOptions } from '../types'
import type { Linter } from 'eslint'

/**
 * TypeScript 规则配置
 */
export function typescript(options: TypeScriptOptions = {}): Linter.Config[] {
  const { files = [GLOB_TS], tsconfigRootDir, allowDefaultProject, defaultProject, overrides = {} } = options

  return defineConfig({
    name: 'typescript/rules',
    files,
    plugins: {
      '@typescript-eslint': plugin,
    },
    extends: [configs.recommendedTypeChecked, configs.stylisticTypeChecked],
    languageOptions: {
      parser,
      parserOptions: {
        projectService: allowDefaultProject
          ? { allowDefaultProject, defaultProject }
          : true,
        tsconfigRootDir: tsconfigRootDir ?? process.cwd(),
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-deprecated': 'warn',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/unbound-method': 'warn',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: {
            attributes: false,
          },
        },
      ],

      ...overrides,
    },
  })
}
