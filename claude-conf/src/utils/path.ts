import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { existsSync } from 'node:fs'
import type { ConfigPath, Scope } from '../types/index.js'

/**
 * 获取用户主目录路径
 */
export function getUserHome(): string {
  return homedir()
}

/**
 * 获取当前工作目录
 */
export function getCwd(): string {
  return process.cwd()
}

/**
 * 根据 scope 获取配置文件路径
 * @param scope 配置范围
 * @param cwd 当前工作目录（可选，默认为 process.cwd()）
 */
export function getConfigPath(scope: Scope, cwd: string = getCwd()): string {
  switch (scope) {
    case 'user':
      // ~/.claude/settings.json
      return join(getUserHome(), '.claude', 'settings.json')
    case 'project':
      // {cwd}/.claude/settings.json
      return join(cwd, '.claude', 'settings.json')
    case 'local':
      // {cwd}/.claude/settings.local.json
      return join(cwd, '.claude', 'settings.local.json')
    default:
      throw new Error(`未知的 scope: ${scope}`)
  }
}

/**
 * 获取配置文件所在目录
 * @param scope 配置范围
 * @param cwd 当前工作目录（可选）
 */
export function getConfigDir(scope: Scope, cwd: string = getCwd()): string {
  const configPath = getConfigPath(scope, cwd)
  return resolve(configPath, '..')
}

/**
 * 检查配置文件是否存在
 * @param scope 配置范围
 * @param cwd 当前工作目录（可选）
 */
export function configExists(scope: Scope, cwd: string = getCwd()): boolean {
  const configPath = getConfigPath(scope, cwd)
  return existsSync(configPath)
}

/**
 * 获取所有 scope 的配置路径信息
 * @param cwd 当前工作目录（可选）
 */
export function getAllConfigPaths(cwd: string = getCwd()): ConfigPath[] {
  const scopes: Scope[] = ['user', 'project', 'local']

  return scopes.map(scope => ({
    scope,
    path: getConfigPath(scope, cwd),
    exists: configExists(scope, cwd),
  }))
}

/**
 * 获取模版目录路径
 * @returns 模版目录的绝对路径
 */
export function getTemplatesDir(): string {
  // 获取当前模块的目录，然后定位到 templates 目录
  // 在打包后，templates 目录应该在 dist 目录的同级
  const moduleDir = new URL('.', import.meta.url).pathname
  return resolve(moduleDir, '../../templates')
}

/**
 * 获取特定 scope 的模版目录路径
 * @param scope 配置范围
 */
export function getScopeTemplatesDir(scope: Scope): string {
  return join(getTemplatesDir(), scope)
}

/**
 * 规范化路径（将相对路径转为绝对路径）
 * @param path 路径
 * @param cwd 基准目录（可选）
 */
export function normalizePath(path: string, cwd: string = getCwd()): string {
  return resolve(cwd, path)
}

/**
 * 获取备份文件路径
 * @param originalPath 原始文件路径
 * @param timestamp 时间戳（可选）
 */
export function getBackupPath(originalPath: string, timestamp?: string): string {
  const ts = timestamp || new Date().toISOString().replace(/[:.]/g, '-')
  return `${originalPath}.backup.${ts}`
}
