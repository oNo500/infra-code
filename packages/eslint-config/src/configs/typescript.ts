import { defineConfig } from 'eslint/config'
import { configs, parser, plugin } from 'typescript-eslint'

import { GLOB_TS } from '../utils'

import type { OptionsFiles, OptionsOverrides, OptionsTypeScript } from '../types'
import type { Linter } from 'eslint'

export type TypeScriptOptions = OptionsFiles & OptionsOverrides & OptionsTypeScript

export function typescript(options: TypeScriptOptions = {}): Linter.Config[] {
  const { files = [GLOB_TS], tsconfigRootDir, overrides = {} } = options

  return defineConfig({
    name: 'typescript/rules',
    files,
    plugins: {
      '@typescript-eslint': plugin,
    },
    extends: [configs.recommendedTypeChecked, configs.stylisticTypeChecked],
    // 关于 Globals 变量，在ts中，关闭eslint的 `no-undef` 规则
    // 参考：https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
    languageOptions: {
      parser: parser,
      parserOptions: {
        projectService: true,
        // 默认使用 process.cwd() 可能导致行为不一致（依赖执行目录）
        // 强烈建议显式传入: typescript({ tsconfigRootDir: import.meta.dirname })
        tsconfigRootDir: tsconfigRootDir ?? process.cwd(),
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      // 风格类
      '@typescript-eslint/no-unused-vars': 'off', // 配合 tsconfig.verbatimModuleSyntax，示例： `import type {ReactNode} from 'react'`
      // 废弃 API 检测（替代 eslint-plugin-n 的 no-deprecated-api）
      '@typescript-eslint/no-deprecated': 'warn',
      // 禁用 no-inferrable-types，因为项目启用了 isolatedDeclarations
      // TypeScript 的 isolatedDeclarations 要求导出项必须有显式类型注释
      // 参考: https://typescript-eslint.io/rules/no-inferrable-types/#when-not-to-use-it
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/unbound-method': 'warn',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: {
            attributes: false, // 允许在 JSX 属性中返回 Promise
          },
        },
      ],

      ...overrides,
    },
  })
}
