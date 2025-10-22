import dayjs from 'dayjs'
import type { ClaudeSettings, ConfigPath, MergeStrategy, Scope } from '../types/index.js'
import { CliError } from '../types/index.js'
import { configExists, getBackupPath, getConfigDir, getConfigPath } from '../utils/path.js'
import {
  createBackup,
  deepMerge,
  ensureDir,
  fileExists,
  readClaudeSettings,
  writeClaudeSettings,
} from '../utils/fs.js'

/**
 * 读取配置文件
 * @param scope 配置范围
 * @param cwd 当前工作目录（可选）
 */
export async function readConfig(
  scope: Scope,
  cwd?: string,
): Promise<ClaudeSettings | null> {
  try {
    const configPath = getConfigPath(scope, cwd)
    const exists = await fileExists(configPath)

    if (!exists) {
      return null
    }

    return await readClaudeSettings(configPath)
  }
  catch (error) {
    throw new CliError(
      `读取配置文件失败 (${scope})`,
      'READ_CONFIG_ERROR',
      error,
    )
  }
}

/**
 * 写入配置文件
 * @param scope 配置范围
 * @param settings 配置内容
 * @param cwd 当前工作目录（可选）
 */
export async function writeConfig(
  scope: Scope,
  settings: ClaudeSettings,
  cwd?: string,
): Promise<void> {
  try {
    const configPath = getConfigPath(scope, cwd)
    const configDir = getConfigDir(scope, cwd)

    // 确保配置目录存在
    await ensureDir(configDir)

    // 写入配置
    await writeClaudeSettings(configPath, settings)
  }
  catch (error) {
    throw new CliError(
      `写入配置文件失败 (${scope})`,
      'WRITE_CONFIG_ERROR',
      error,
    )
  }
}

/**
 * 合并配置
 * @param existing 现有配置
 * @param newConfig 新配置
 * @param strategy 合并策略
 */
export function mergeConfigs(
  existing: ClaudeSettings | null,
  newConfig: ClaudeSettings,
  strategy: MergeStrategy,
): ClaudeSettings {
  if (strategy === 'replace' || !existing) {
    return { ...newConfig }
  }

  // merge 策略：深度合并
  return deepMerge(existing, newConfig)
}

/**
 * 备份配置文件
 * @param scope 配置范围
 * @param cwd 当前工作目录（可选）
 */
export async function backupConfig(
  scope: Scope,
  cwd?: string,
): Promise<string | null> {
  try {
    const configPath = getConfigPath(scope, cwd)
    const exists = await fileExists(configPath)

    if (!exists) {
      return null
    }

    const timestamp = dayjs().format('YYYY-MM-DD-HH-mm-ss')
    const backupPath = getBackupPath(configPath, timestamp)

    await createBackup(configPath, backupPath)

    return backupPath
  }
  catch (error) {
    throw new CliError(
      `备份配置文件失败 (${scope})`,
      'BACKUP_CONFIG_ERROR',
      error,
    )
  }
}

/**
 * 安装配置
 * @param scope 配置范围
 * @param newConfig 新配置
 * @param strategy 合并策略
 * @param backup 是否备份现有配置
 * @param cwd 当前工作目录（可选）
 */
export async function installConfig(
  scope: Scope,
  newConfig: ClaudeSettings,
  strategy: MergeStrategy,
  backup: boolean = true,
  cwd?: string,
): Promise<{
  success: boolean
  backupPath?: string
  configPath: string
}> {
  try {
    const configPath = getConfigPath(scope, cwd)

    // 读取现有配置
    const existing = await readConfig(scope, cwd)

    // 备份现有配置（如果存在且需要备份）
    let backupPath: string | undefined
    if (existing && backup) {
      const path = await backupConfig(scope, cwd)
      if (path) {
        backupPath = path
      }
    }

    // 合并配置
    const finalConfig = mergeConfigs(existing, newConfig, strategy)

    // 写入配置
    await writeConfig(scope, finalConfig, cwd)

    return {
      success: true,
      backupPath,
      configPath,
    }
  }
  catch (error) {
    throw new CliError(
      `安装配置失败 (${scope})`,
      'INSTALL_CONFIG_ERROR',
      error,
    )
  }
}

/**
 * 获取配置文件信息
 * @param scope 配置范围
 * @param cwd 当前工作目录（可选）
 */
export async function getConfigInfo(
  scope: Scope,
  cwd?: string,
): Promise<ConfigPath> {
  const path = getConfigPath(scope, cwd)
  const exists = configExists(scope, cwd)

  return {
    scope,
    path,
    exists,
  }
}

/**
 * 预览配置差异
 * @param scope 配置范围
 * @param newConfig 新配置
 * @param strategy 合并策略
 * @param cwd 当前工作目录（可选）
 */
export async function previewConfigChanges(
  scope: Scope,
  newConfig: ClaudeSettings,
  strategy: MergeStrategy,
  cwd?: string,
): Promise<{
  existing: ClaudeSettings | null
  final: ClaudeSettings
  isNew: boolean
}> {
  const existing = await readConfig(scope, cwd)
  const final = mergeConfigs(existing, newConfig, strategy)

  return {
    existing,
    final,
    isNew: !existing,
  }
}

/**
 * 格式化配置信息为显示文本
 * @param config 配置对象
 * @param indent 缩进级别
 */
export function formatConfigInfo(config: ClaudeSettings, indent: number = 0): string[] {
  const lines: string[] = []
  const prefix = '  '.repeat(indent)

  if (config.permissions) {
    lines.push(`${prefix}• 权限配置`)
    if (config.permissions.allow) {
      lines.push(`${prefix}  - 允许: ${config.permissions.allow.length} 项`)
    }
    if (config.permissions.deny) {
      lines.push(`${prefix}  - 拒绝: ${config.permissions.deny.length} 项`)
    }
  }

  if (config.enabledTools) {
    lines.push(`${prefix}• 启用工具: ${config.enabledTools.join(', ')}`)
  }

  if (config.mcpServers) {
    const servers = Object.keys(config.mcpServers)
    lines.push(`${prefix}• MCP 服务器: ${servers.join(', ')}`)
  }

  if (config.extraKnownMarketplaces) {
    const markets = Object.keys(config.extraKnownMarketplaces)
    lines.push(`${prefix}• 插件市场: ${markets.join(', ')}`)
  }

  if (config.enabledPlugins) {
    const plugins = Object.keys(config.enabledPlugins).filter(
      k => config.enabledPlugins![k],
    )
    lines.push(`${prefix}• 启用插件: ${plugins.join(', ')}`)
  }

  return lines
}
