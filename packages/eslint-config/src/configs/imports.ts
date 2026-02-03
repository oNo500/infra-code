import { importX } from 'eslint-plugin-import-x'

import { GLOB_SRC } from '../utils'

import type { OptionsOverrides, OptionsStylistic } from '../types'
import type { Linter } from 'eslint'

/**
 * Import 配置选项
 *
 * 当启用 typescript 时:
 * - 自动禁用与 TypeScript 编译器重复检查的规则,提升性能
 * - 启用 eslint-import-resolver-typescript 解析器
 * - 支持 tsconfig paths、@types 等 TypeScript 特性
 */
export interface ImportsOptions extends OptionsOverrides, OptionsStylistic {
  /**
   * 是否启用 TypeScript 支持
   * @default false
   */
  typescript?: boolean
}

/**
 * Import 相关规则配置
 *
 * @param options - 配置选项
 * @param options.typescript - 是否启用 TypeScript 支持（需要 eslint-import-resolver-typescript）
 * @param options.stylistic - 是否启用风格化规则（如 newline-after-import）
 * @param options.overrides - 自定义规则覆盖
 * @returns ESLint 配置数组
 *
 * TODO: 如果需要支持 react-native 、electron 等的解析规则,需要重新研究
 */
export function imports(options: ImportsOptions = {}): Linter.Config[] {
  const { overrides = {}, stylistic = true, typescript = false } = options

  const files = [GLOB_SRC]

  return [
    {
      name: 'imports/rules',
      files,
      plugins: {
        'import-x': importX as unknown,
      },
      // 条件性添加 TypeScript 支持
      settings: {
        ...(typescript
          ? {
              ...importX.configs['flat/recommended'].settings,
              // 覆盖 resolver 配置,默认启用 Bun 支持
              'import-x/resolver': {
                typescript: {
                  alwaysTryTypes: true, // 尝试寻找 `<root>@types` 目录
                },
              },
            }
          : {}),
      },
      rules: {
        ...importX.configs['flat/recommended'].rules,
        ...(typescript ? importX.configs['flat/typescript'].rules : {}),

        // TypeScript 项目优化:禁用与 tsc 重复检查的规则
        // 参考: https://github.com/un-ts/eslint-plugin-import-x#typescript
        ...(typescript
          ? {
              'import-x/named': 'off', // TS 已检查导出成员
              'import-x/namespace': 'off', // TS 已检查命名空间
              'import-x/default': 'off', // TS 已检查默认导出
              'import-x/no-named-as-default-member': 'off', // TS 已检查成员访问
              'import-x/no-unresolved': 'off', // TS 已检查模块解析(使用 import 时)
            }
          : {}),

        // 风格化规则（可选）
        ...(stylistic
          ? {
              'import-x/newline-after-import': ['error', { count: 1 }],
              'import-x/order': [
                'error',
                {
                  'groups': [
                    'builtin', // Node.js 内置模块 (fs, path, etc.)
                    'external', // npm 包
                    'internal', // 内部模块 (@/ 别名)
                    ['parent', 'sibling'], // 相对导入 (../, ./)
                    'index', // index 文件 (./)
                    'type', // 类型导入
                  ],
                  'newlines-between': 'always', // 组间空行
                  'alphabetize': {
                    order: 'asc', // 字母升序
                    caseInsensitive: true, // 忽略大小写
                  },
                  'pathGroups': [
                    {
                      pattern: '@/**', // @ 别名路径
                      group: 'internal',
                      position: 'before',
                    },
                  ],
                  'pathGroupsExcludedImportTypes': ['type'], // 类型导入不受 pathGroups 影响
                  'distinctGroup': true, // 将类型导入与其他导入分组
                },
              ],
            }
          : {}),
        'import-x/consistent-type-specifier-style': 'error',

        // 以下规则 TS 无等效检查,但性能开销较大,建议仅 CI 运行:
        'import-x/no-named-as-default': 'warn', // 检查默认导入与命名导出冲突
        'import-x/no-cycle': 'error', // 检查循环依赖
        'import-x/no-unused-modules': 'error', // 检查未使用的模块
        'import-x/no-deprecated': 'warn', // 检查废弃的导入
        'import-x/no-extraneous-dependencies': 'error', // 检查未声明的依赖（替代 eslint-plugin-n 的 no-extraneous-import）

        // TODO: 垂直切片架构可能需要开启
        'import-x/no-relative-parent-imports': 'off',
        'import-x/no-internal-modules': 'off',

        // 用户自定义覆盖(最后应用,优先级最高)
        ...overrides,
      },
    } as Linter.Config,
  ]
}
