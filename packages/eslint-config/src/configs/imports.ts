/**
 * Import 模块导入规则配置,提供导入排序、循环依赖检测和 TypeScript 支持
 */
import { importX } from 'eslint-plugin-import-x'

import { GLOB_SRC } from '../utils'

import type { ImportsOptions } from '../types'
import type { Linter } from 'eslint'

export function imports(options: ImportsOptions = {}): Linter.Config[] {
  const { overrides = {}, stylistic = true, typescript = false, noRelativeParentImports = false } = options

  const files = [GLOB_SRC]

  return [
    {
      name: 'imports/rules',
      files,
      plugins: {
        'import-x': importX as unknown,
      },
      settings: {
        ...(typescript
          ? {
              ...importX.configs['flat/recommended'].settings,
              'import-x/resolver': {
                typescript: {
                  alwaysTryTypes: true,
                },
              },
            }
          : {}),
      },
      rules: {
        ...importX.configs['flat/recommended'].rules,
        ...(typescript ? importX.configs['flat/typescript'].rules : {}),

        ...(typescript
          ? {
              'import-x/named': 'off',
              'import-x/namespace': 'off',
              'import-x/default': 'off',
              'import-x/no-named-as-default-member': 'off',
              'import-x/no-unresolved': 'off',
            }
          : {}),

        ...(stylistic
          ? {
              'import-x/newline-after-import': ['error', { count: 1 }],
              'import-x/order': [
                'error',
                {
                  'groups': [
                    'builtin',
                    'external',
                    'internal',
                    ['parent', 'sibling'],
                    'index',
                    'type',
                  ],
                  'newlines-between': 'always',
                  'alphabetize': {
                    order: 'asc',
                    caseInsensitive: true,
                  },
                  'pathGroups': [
                    {
                      pattern: '@/**',
                      group: 'internal',
                      position: 'before',
                    },
                  ],
                  'pathGroupsExcludedImportTypes': ['type'],
                  'distinctGroup': true,
                },
              ],
            }
          : {}),
        'import-x/consistent-type-specifier-style': 'error',

        'import-x/no-named-as-default': 'warn',
        'import-x/no-cycle': 'error',
        'import-x/no-unused-modules': 'error',
        'import-x/no-deprecated': 'warn',
        'import-x/no-extraneous-dependencies': 'error',

        'import-x/no-relative-parent-imports': noRelativeParentImports ? 'error' : 'off',

        ...overrides,
      },
    } as Linter.Config,
  ]
}
