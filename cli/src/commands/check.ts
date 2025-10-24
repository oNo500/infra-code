import { join } from 'node:path'
import pc from 'picocolors'
import fs from 'fs-extra'
import { execa } from 'execa'
import { paths, detect } from '../utils.js'

const { pathExists, readJSON } = fs

/**
 * 渲染文件状态
 */
function renderFileStatus(exists: boolean): string {
  return exists ? pc.green('✔') : pc.red('✘')
}

/**
 * 获取 Claude Code 版本（多重回退策略）
 */
async function getClaudeVersion(): Promise<string> {
  // 策略 1: 读取 package.json（最可靠，最快）
  try {
    const pkgPath = join(paths.home(), '.claude', 'local', 'package.json')
    const pkg = await readJSON(pkgPath)
    const version = pkg.dependencies?.['@anthropic-ai/claude-code']
    if (version) {
      // 去掉版本号前缀（^, ~, >=, 等）
      return version.replace(/^[\^~>=<]+/, '')
    }
  } catch {}

  // 策略 2: 执行实际的可执行文件
  try {
    const claudePath = join(
      paths.home(),
      '.claude',
      'local',
      'node_modules',
      '.bin',
      'claude',
    )
    const { stdout } = await execa(claudePath, ['--version'])
    return stdout.trim()
  } catch {}

  // 策略 3: 通过 shell 执行（支持 alias）
  try {
    const { stdout } = await execa('bash', ['-c', 'claude --version'])
    return stdout.trim()
  } catch {}

  // 全部失败则返回 unknown
  return 'unknown'
}

/**
 * 渲染系统信息
 */
async function renderSystemInfo(): Promise<void> {
  const cwd = paths.cwd()
  const inProject = detect.inProject()

  // 0. Claude Code 版本
  const version = await getClaudeVersion()
  console.log(`\n  Claude Code: ${pc.cyan(version)}`)

  // 1. 配置来源
  console.log('\n  Setting sources:')
  const userSettings = paths.config('user')
  const userSettingsExists = await pathExists(userSettings)
  console.log(
    `    User settings (~/.claude/settings.json): ${renderFileStatus(userSettingsExists)}`,
  )

  if (inProject) {
    const projectSettings = paths.config('project')
    const projectSettingsExists = await pathExists(projectSettings)
    console.log(
      `    Project settings (.claude/settings.json): ${renderFileStatus(projectSettingsExists)}`,
    )

    const localSettings = paths.config('local')
    const localSettingsExists = await pathExists(localSettings)
    console.log(
      `    Local settings (.claude/settings.local.json): ${renderFileStatus(localSettingsExists)}`,
    )
  }

  // 2. Memory 文件
  console.log('\n  Memory:')
  const userClaudeMd = join(paths.home(), '.claude', 'claude.md')
  const userClaudeMdExists = await pathExists(userClaudeMd)
  console.log(
    `    user (~/.claude/claude.md): ${renderFileStatus(userClaudeMdExists)}`,
  )

  if (inProject) {
    const projectClaudeMd = join(cwd, 'CLAUDE.md')
    const projectClaudeMdExists = await pathExists(projectClaudeMd)
    console.log(
      `    project (CLAUDE.md): ${renderFileStatus(projectClaudeMdExists)}`,
    )
  }

  // 3. MCP 服务器
  console.log('\n  MCP servers:')
  const userClaudeJson = join(paths.home(), '.claude.json')
  const userClaudeJsonExists = await pathExists(userClaudeJson)
  let userMcpServers: string[] = []
  if (userClaudeJsonExists) {
    try {
      const data = await readJSON(userClaudeJson)
      userMcpServers = Object.keys(data.mcpServers || {})
    } catch {}
  }
  const userMcpStatus = userMcpServers.length > 0
    ? `${pc.green('✔')} ${userMcpServers.join(', ')}`
    : pc.red('✘')
  console.log(`    User (~/.claude.json): ${userMcpStatus}`)

  if (inProject) {
    const projectMcp = join(cwd, '.mcp.json')
    const projectMcpExists = await pathExists(projectMcp)
    let projectMcpServers: string[] = []
    if (projectMcpExists) {
      try {
        const data = await readJSON(projectMcp)
        projectMcpServers = Object.keys(data.mcpServers || {})
      } catch {}
    }
    const projectMcpStatus = projectMcpServers.length > 0
      ? `${pc.green('✔')} ${projectMcpServers.join(', ')}`
      : renderFileStatus(projectMcpExists)
    console.log(`    Project (.mcp.json): ${projectMcpStatus}`)
  }

  // 4. Plugins（插件）
  console.log('\n  Plugins:')

  // 用户级插件
  let userPlugins: string[] = []
  if (userSettingsExists) {
    try {
      const data = await readJSON(userSettings)
      const enabledPlugins = data.enabledPlugins || {}
      userPlugins = Object.entries(enabledPlugins)
        .filter(([_, enabled]) => enabled === true)
        .map(([name]) => name)
    } catch {}
  }
  const userPluginStatus = userPlugins.length > 0
    ? `${pc.green('✔')} ${userPlugins.join(', ')}`
    : pc.red('✘')
  console.log(`    User (~/.claude/settings.json): ${userPluginStatus}`)

  if (inProject) {
    // 项目级插件
    const projectSettings = paths.config('project')
    const projectSettingsExists = await pathExists(projectSettings)
    let projectPlugins: string[] = []
    if (projectSettingsExists) {
      try {
        const data = await readJSON(projectSettings)
        const enabledPlugins = data.enabledPlugins || {}
        projectPlugins = Object.entries(enabledPlugins)
          .filter(([_, enabled]) => enabled === true)
          .map(([name]) => name)
      } catch {}
    }
    const projectPluginStatus = projectPlugins.length > 0
      ? `${pc.green('✔')} ${projectPlugins.join(', ')}`
      : pc.red('✘')
    console.log(`    Project (.claude/settings.json): ${projectPluginStatus}`)

    // 本地级插件
    const localSettings = paths.config('local')
    const localSettingsExists = await pathExists(localSettings)
    let localPlugins: string[] = []
    if (localSettingsExists) {
      try {
        const data = await readJSON(localSettings)
        const enabledPlugins = data.enabledPlugins || {}
        localPlugins = Object.entries(enabledPlugins)
          .filter(([_, enabled]) => enabled === true)
          .map(([name]) => name)
      } catch {}
    }
    const localPluginStatus = localPlugins.length > 0
      ? `${pc.green('✔')} ${localPlugins.join(', ')}`
      : pc.red('✘')
    console.log(`    Local (.claude/settings.local.json): ${localPluginStatus}`)
  }

  console.log('')
}

/**
 * check 命令 - 检查配置状态
 */
export async function check() {
  await renderSystemInfo()

  // 直接调用安装命令
  const { installCommand } = await import('./install.js')
  await installCommand()
}
