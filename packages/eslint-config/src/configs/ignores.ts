import { existsSync } from 'node:fs'
import path from 'node:path'

import { includeIgnoreFile } from '@eslint/compat'

import type { Linter } from 'eslint'

/**
 * 默认忽略的文件和目录
 */
export const DEFAULT_IGNORES: string[] = [
  // 依赖目录
  '**/node_modules/**',
  '**/.pnp.*',

  // 构建产物
  '**/dist/**',
  '**/build/**',
  '**/out/**',
  '**/.next/**',

  // 缓存目录
  '**/.cache/**',
  '**/.turbo/**',
  '**/.eslintcache',

  // 版本控制
  '**/.git/**',
  '**/.svn/**',
  '**/.hg/**',
  '**/public/**',

  // 类型文件
  '**/*.d.ts',
]

/**
 * 忽略文件配置
 *
 * @param userIgnores - 传入数组扩展默认规则，传入 false 禁用默认规则
 * @param gitignorePath - gitignore 文件路径或启用标志
 *   - true: 自动查找项目根目录的 .gitignore (默认)
 *   - string: 使用指定路径的 gitignore 文件
 *   - false: 禁用 gitignore 导入
 * @returns ESLint 配置数组
 */
export function ignores(
  userIgnores?: string[] | false,
  gitignorePath?: string | boolean,
): Linter.Config[] {
  const configs: Linter.Config[] = []

  // 处理 gitignore 导入
  if (gitignorePath !== false) {
    try {
      // 使用三元表达式代替 if-else
      const gitignoreFile
        = typeof gitignorePath === 'string'
          ? path.resolve(gitignorePath) // 使用指定路径
          : path.resolve(process.cwd(), '.gitignore') // 默认查找项目根目录的 .gitignore

      // 仅在文件存在时导入
      if (existsSync(gitignoreFile)) {
        configs.push(includeIgnoreFile(gitignoreFile))
      }
    } catch {
      // 静默跳过错误，确保配置始终有效
    }
  }

  // 处理默认和用户自定义忽略规则
  const finalIgnores
    = userIgnores === false
      ? []
      : (userIgnores
          ? [...DEFAULT_IGNORES, ...userIgnores]
          : DEFAULT_IGNORES)

  if (finalIgnores.length > 0) {
    configs.push({
      name: 'defaults',
      ignores: finalIgnores,
    })
  }

  return configs.map((config) => ({
    ...config,
    name: `ignores/globals/${config.name}`,
  }))
}

/**
 * ignores 配置选项
 */
export interface IgnoresOptions {
  /** 用户自定义忽略规则，传入 false 禁用默认规则 */
  ignores?: string[] | false
  /** gitignore 文件路径或启用标志 */
  gitignore?: string | boolean
}
