/**
 * ESLint 忽略文件配置,支持默认忽略规则和 .gitignore 导入
 */
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

export function ignores(
  userIgnores?: string[] | false,
  gitignorePath?: string | boolean,
): Linter.Config[] {
  const configs: Linter.Config[] = []

  if (gitignorePath !== false) {
    try {
      const gitignoreFile
        = typeof gitignorePath === 'string'
          ? path.resolve(gitignorePath)
          : path.resolve(process.cwd(), '.gitignore')

      if (existsSync(gitignoreFile)) {
        configs.push(includeIgnoreFile(gitignoreFile))
      }
    } catch {
      //
    }
  }

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
