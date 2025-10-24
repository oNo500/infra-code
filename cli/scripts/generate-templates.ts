#!/usr/bin/env tsx

/**
 * 模板生成脚本
 * 根据配置文件自动生成所有模板文件（.json, .mcp.json, .claude.md）
 */

import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import picocolors from 'picocolors'
import { templates } from './templates.config.js'
import { mcpServers } from './mcp-servers.config.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATES_DIR = join(__dirname, '../templates')

/**
 * MCP 服务器名称映射
 * 将配置中的内部名称映射到输出文件中的名称
 */
const MCP_SERVER_NAME_MAPPING: Record<string, string> = {
  'serena-uvx': 'serena',  // full 模板中的 serena-uvx 输出为 serena
}

/**
 * 生成模板定义文件 (.json)
 */
function generateTemplateJson(name: string, definition: any): void {
  const templatePath = join(TEMPLATES_DIR, `${name}.json`)

  const templateJson = {
    metadata: definition.metadata,
    config: definition.config,
  }

  writeFileSync(templatePath, JSON.stringify(templateJson, null, 2) + '\n')
  console.log(picocolors.green(`  ✓ ${name}.json`))
}

/**
 * 生成 MCP 配置文件 (.mcp.json)
 */
function generateMcpJson(name: string, definition: any): void {
  // 如果没有 mcpConfig 元数据，跳过
  if (!definition.metadata.mcpConfig) {
    return
  }

  const mcpPath = join(TEMPLATES_DIR, `${name}.mcp.json`)

  // 构建 MCP 服务器配置
  const mcpConfig: Record<string, any> = {}

  if (definition.mcpServers && definition.mcpServers.length > 0) {
    for (const serverName of definition.mcpServers) {
      const serverConfig = mcpServers[serverName]
      if (!serverConfig) {
        console.warn(
          picocolors.yellow(
            `  ⚠ MCP 服务器 "${serverName}" 未在 mcp-servers.config.ts 中定义`
          )
        )
        continue
      }
      // 使用映射后的名称（如果存在）
      const outputName = MCP_SERVER_NAME_MAPPING[serverName] || serverName
      mcpConfig[outputName] = serverConfig
    }
  }

  const mcpJson = {
    mcpServers: mcpConfig,
  }

  writeFileSync(mcpPath, JSON.stringify(mcpJson, null, 2) + '\n')
  console.log(picocolors.green(`  ✓ ${name}.mcp.json`))
}

/**
 * 生成或复制 Claude.md 文件
 */
function generateClaudeMd(name: string, definition: any): void {
  // 如果没有 claudeMd 元数据，跳过
  if (!definition.metadata.claudeMd) {
    return
  }

  const claudeMdPath = join(TEMPLATES_DIR, `${name}.claude.md`)

  // 对于 plugins 模板，从现有文件复制（因为内容较长且已存在）
  if (name === 'plugins') {
    // 检查现有文件是否存在
    if (existsSync(claudeMdPath)) {
      console.log(
        picocolors.blue(`  → ${name}.claude.md (保持现有文件)`)
      )
      return
    }
  }

  // 使用配置中的内容
  const content = definition.claudeMdContent || '待补充'
  writeFileSync(claudeMdPath, content + '\n')
  console.log(picocolors.green(`  ✓ ${name}.claude.md`))
}

/**
 * 主函数
 */
function main(): void {
  console.log(picocolors.cyan('\n📦 开始生成模板文件...\n'))

  let successCount = 0
  let errorCount = 0

  for (const [name, definition] of Object.entries(templates)) {
    try {
      console.log(picocolors.bold(`\n[${name}]`))

      // 生成三个文件
      generateTemplateJson(name, definition)
      generateMcpJson(name, definition)
      generateClaudeMd(name, definition)

      successCount++
    }
    catch (error) {
      console.error(
        picocolors.red(`  ✗ 生成失败: ${error instanceof Error ? error.message : error}`)
      )
      errorCount++
    }
  }

  // 总结
  console.log(
    picocolors.cyan(
      `\n✨ 生成完成！成功: ${successCount} 个模板, 失败: ${errorCount} 个模板\n`
    )
  )

  if (errorCount > 0) {
    process.exit(1)
  }
}

// 运行
main()
