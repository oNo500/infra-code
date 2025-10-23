import * as clack from '@clack/prompts'
import { dirname, join } from 'node:path'
import { execa } from 'execa'
import fs from 'fs-extra'
import merge from 'deepmerge'
import type { McpServerConfig, MergeStrategy, Scope, Template } from '../types.js'
import { detect, getTemplateInfo, loadAllTemplates, loadMcpTemplate, paths } from '../utils.js'

const { copy, ensureDirSync, pathExists, readJSON, writeJSON } = fs

/**
 * 安装选项接口
 */
interface InstallOptions {
  scope?: string
  strategy?: string
}

/**
 * 交互式安装模版
 */
export async function installCommand(templateName?: string, options?: InstallOptions): Promise<void> {
  clack.intro('📦 Claude Settings 安装器')

  try {
    // 1. 选择模板
    const template = await selectTemplate(templateName)
    if (!template) {
      clack.outro('✗ 操作取消')
      process.exit(0)
    }

    // 2. 选择 Scope（智能推荐）
    const scope = await selectScope(template, options?.scope)
    if (clack.isCancel(scope)) {
      clack.cancel('操作已取消')
      process.exit(0)
    }

    // 3. 自动判断策略 + 显示预览
    const strategy = await determineStrategy(scope as Scope, options?.strategy)
    if (clack.isCancel(strategy)) {
      clack.cancel('操作已取消')
      process.exit(0)
    }

    await showPreview(template, scope as Scope, strategy as MergeStrategy)

    // 4. 确认并安装
    const confirmed = await clack.confirm({
      message: '确认安装此配置？',
      initialValue: true,
    })

    if (clack.isCancel(confirmed) || !confirmed) {
      clack.cancel('安装已取消')
      process.exit(0)
    }

    // 5. 执行安装
    await performInstall(template, scope as Scope, strategy as MergeStrategy)

    clack.outro('✓ 安装成功!')
  }
  catch (error) {
    clack.log.error('安装失败')
    console.error(error)
    process.exit(1)
  }
}

/**
 * 选择模板
 */
async function selectTemplate(templateName?: string): Promise<Template | null> {
  const templates = await loadAllTemplates()

  if (templates.length === 0) {
    clack.log.warn('暂无可用模板')
    return null
  }

  // 如果指定了模板名称，直接查找
  if (templateName) {
    const template = templates.find(t => t.metadata.name === templateName)
    if (!template) {
      clack.log.error(`模板不存在: ${templateName}`)
      clack.log.info('\n可用模板:')
      templates.forEach(t => console.log(`  - ${t.metadata.name}: ${t.metadata.description}`))
      return null
    }
    return template
  }

  // 交互式选择
  const selectedName = await clack.select({
    message: '选择模板',
    options: templates.map(t => ({
      value: t.metadata.name,
      label: t.metadata.name,
      hint: t.metadata.description,
    })),
  })

  if (clack.isCancel(selectedName)) {
    return null
  }

  return templates.find(t => t.metadata.name === selectedName) || null
}

/**
 * 选择 Scope（智能推荐）
 */
async function selectScope(template: Template, cliScope?: string): Promise<Scope | symbol> {
  // 如果命令行指定了 scope，验证后使用
  if (cliScope) {
    const validScopes: Scope[] = ['user', 'project', 'local']
    if (!validScopes.includes(cliScope as Scope)) {
      throw new Error(`无效的 scope: ${cliScope}`)
    }

    // 检查模板是否支持该 scope
    const supported = template.metadata.supportedScopes || ['user', 'project', 'local']
    if (!supported.includes(cliScope as Scope)) {
      throw new Error(`模板 ${template.metadata.name} 不支持 ${cliScope} scope`)
    }

    return cliScope as Scope
  }

  // 获取推荐的 scope
  const recommended = detect.recommendScope()

  // 获取模板支持的 scope 列表
  const supported = template.metadata.supportedScopes || ['user', 'project', 'local']

  return await clack.select({
    message: '选择安装位置',
    options: supported.map((s) => {
      const isRecommended = s === recommended
      return {
        value: s,
        label: s.charAt(0).toUpperCase() + s.slice(1),
        hint: `${detect.getRecommendReason(s)}${isRecommended ? ' ⭐ 推荐' : ''}`,
      }
    }),
    initialValue: recommended,
  })
}

/**
 * 判断合并策略
 */
async function determineStrategy(scope: Scope, cliStrategy?: string): Promise<MergeStrategy | symbol> {
  // 如果命令行指定了策略，验证后使用
  if (cliStrategy) {
    const validStrategies: MergeStrategy[] = ['merge', 'replace']
    if (!validStrategies.includes(cliStrategy as MergeStrategy)) {
      throw new Error(`无效的策略: ${cliStrategy}`)
    }
    return cliStrategy as MergeStrategy
  }

  // 检查是否已存在配置
  const configPath = paths.config(scope)
  const exists = await pathExists(configPath)

  if (!exists) {
    // 如果不存在配置，直接使用 replace 策略
    return 'replace'
  }

  // 如果存在配置，让用户选择
  return await clack.select({
    message: '检测到已有配置，选择合并策略',
    options: [
      { value: 'merge', label: '合并配置', hint: '保留现有配置，添加新配置项' },
      { value: 'replace', label: '替换配置', hint: '完全覆盖现有配置' },
    ],
  })
}

/**
 * 显示预览
 */
async function showPreview(
  template: Template,
  scope: Scope,
  strategy: MergeStrategy,
): Promise<void> {
  clack.log.info('\n📦 模板信息:\n')
  console.log(`  ${getTemplateInfo(template)}`)

  // 预览配置变更
  const configPath = paths.config(scope)
  const exists = await pathExists(configPath)
  const existing = exists ? await readJSON(configPath) : {}

  const final = strategy === 'merge'
    ? merge(existing, template.config)
    : template.config

  clack.log.info('\n📋 配置预览:\n')

  if (!exists) {
    clack.log.success('这是一个新配置文件')
  }
  else {
    clack.log.warn('将更新现有配置文件')
  }

  clack.log.info(`\n配置路径: ${configPath}`)
  clack.log.info(`策略: ${strategy === 'merge' ? '合并' : '替换'}`)
}

/**
 * 执行安装
 */
async function performInstall(
  template: Template,
  scope: Scope,
  strategy: MergeStrategy,
): Promise<void> {
  const spinner = clack.spinner()

  try {
    spinner.start('正在安装 Settings 配置...')

    // 1. 安装 Settings 配置
    const configPath = paths.config(scope)
    const exists = await pathExists(configPath)

    // 备份现有配置
    if (exists) {
      const backupPath = `${configPath}.backup-${Date.now()}`
      await copy(configPath, backupPath)
      clack.log.info(`📦 原配置已备份: ${backupPath}`)
    }

    // 读取现有配置
    const existing = exists ? await readJSON(configPath) : {}

    // 合并或替换
    const final = strategy === 'merge'
      ? merge(existing, template.config)
      : template.config

    // 写入配置
    ensureDirSync(dirname(configPath))
    await writeJSON(configPath, final, { spaces: 2 })

    spinner.stop('Settings 配置安装成功！')
    clack.log.success(`✓ Settings: ${configPath}`)

    // 2. 安装 MCP 配置（如果有）
    if (template.metadata.mcpConfig) {
      spinner.start('正在安装 MCP 配置...')

      const mcpTemplate = await loadMcpTemplate(template.metadata.mcpConfig)

      if (mcpTemplate && Object.keys(mcpTemplate.mcpServers).length > 0) {
        const mcpPath = await installMcpConfig(scope, mcpTemplate)
        spinner.stop('MCP 配置安装成功！')
        clack.log.success(`✓ MCP: ${mcpPath}`)
      }
      else {
        spinner.stop('跳过 MCP 配置（无服务器）')
      }
    }

    // 3. 安装 claude.md（如果有）
    if (template.metadata.claudeMd) {
      spinner.start('正在安装 Memory 配置...')

      const claudeMdTemplatePath = join(paths.templates(), template.metadata.claudeMd)

      if (await pathExists(claudeMdTemplatePath)) {
        // 根据 scope 确定目标路径
        let claudeMdPath: string
        if (scope === 'user') {
          claudeMdPath = join(paths.home(), '.claude', 'claude.md')
        }
        else {
          // project 或 local scope
          claudeMdPath = join(paths.cwd(), 'CLAUDE.md')
        }

        // 确保目录存在并复制文件
        ensureDirSync(dirname(claudeMdPath))
        await copy(claudeMdTemplatePath, claudeMdPath)

        spinner.stop('Memory 配置安装成功！')
        clack.log.success(`✓ Memory: ${claudeMdPath}`)
      }
      else {
        spinner.stop('跳过 Memory 配置（模板文件不存在）')
      }
    }
  }
  catch (error) {
    spinner.stop('安装失败')
    throw error
  }
}

/**
 * 安装 MCP 配置
 */
async function installMcpConfig(scope: Scope, mcpTemplate: { mcpServers: Record<string, any> }): Promise<string> {
  let mcpPath: string

  if (scope === 'project') {
    // Project scope: 写入 .mcp.json 文件到项目根目录
    const mcpFilePath = join(paths.cwd(), '.mcp.json')

    // 写入 MCP 配置
    await writeJSON(mcpFilePath, mcpTemplate, { spaces: 2 })

    mcpPath = mcpFilePath
  }
  else {
    // User/Local scope: 询问是否自动安装
    const scopeName = scope === 'user' ? 'User' : 'Local'

    const autoInstall = await clack.confirm({
      message: `是否自动安装 ${scopeName} scope 的 MCP 服务器？`,
      initialValue: true,
    })

    if (!clack.isCancel(autoInstall) && autoInstall) {
      // 自动安装
      try {
        await installMcpServersViaCli(scope, mcpTemplate.mcpServers)
        mcpPath = '(已通过 CLI 安装)'
      }
      catch (error) {
        clack.log.error('自动安装失败，请手动执行以下命令:')
        displayMcpCommands(scope, mcpTemplate.mcpServers)
        mcpPath = '(需手动添加)'
      }
    }
    else {
      // 显示手动命令
      displayMcpCommands(scope, mcpTemplate.mcpServers)
      mcpPath = '(需手动添加)'
    }
  }

  return mcpPath
}

/**
 * 通过 CLI 自动安装 MCP 服务器
 */
async function installMcpServersViaCli(
  scope: Scope,
  servers: Record<string, McpServerConfig>,
): Promise<void> {
  const spinner = clack.spinner()
  spinner.start('正在安装 MCP 服务器...')

  let successCount = 0
  let failedServers: string[] = []

  for (const [name, server] of Object.entries(servers)) {
    try {
      // 构造 JSON 配置
      const config: any = {
        type: 'stdio',
        command: server.command,
        args: server.args || [],
      }

      // 只有当 env 存在且不为空时才添加
      if (server.env && Object.keys(server.env).length > 0) {
        config.env = server.env
      }

      // 执行 claude mcp add-json 命令
      await execa('claude', [
        'mcp',
        'add-json',
        name,
        JSON.stringify(config),
        '--scope',
        scope,
      ])

      successCount++
    }
    catch (error) {
      failedServers.push(name)
    }
  }

  spinner.stop()

  if (failedServers.length === 0) {
    clack.log.success(`成功安装 ${successCount} 个 MCP 服务器`)
  }
  else if (successCount > 0) {
    clack.log.warn(`部分安装成功: ${successCount} 成功, ${failedServers.length} 失败`)
    clack.log.info(`失败的服务器: ${failedServers.join(', ')}`)
  }
  else {
    throw new Error('所有 MCP 服务器安装失败')
  }
}

/**
 * 显示 MCP 安装命令
 */
function displayMcpCommands(
  scope: Scope,
  servers: Record<string, McpServerConfig>,
): void {
  console.log('\n  使用以下命令添加 MCP 服务器:\n')

  for (const [name, server] of Object.entries(servers)) {
    // 构造 JSON 配置
    const config: any = {
      type: 'stdio',
      command: server.command,
      args: server.args || [],
    }

    // 只有当 env 存在且不为空时才添加
    if (server.env && Object.keys(server.env).length > 0) {
      config.env = server.env
    }

    // 转义双引号以便在 shell 中使用
    const json = JSON.stringify(config).replace(/"/g, '\\"')
    console.log(`  $ claude mcp add-json ${name} "${json}" --scope ${scope}`)
  }
}
