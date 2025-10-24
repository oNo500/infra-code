#!/usr/bin/env tsx

/**
 * 模板生成脚本
 * 根据配置文件自动生成所有模板文件（.json, .mcp.json, .claude.md）
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import picocolors from 'picocolors'
import { templates } from './templates.config.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const TEMPLATES_DIR = join(__dirname, '../templates')
const FULL_MCP_PATH = join(__dirname, 'full.mcp.json')

// 加载完整的 MCP 服务器配置
let fullMcpConfig: { mcpServers: Record<string, any> }
try {
  fullMcpConfig = JSON.parse(readFileSync(FULL_MCP_PATH, 'utf-8'))
}
catch (error) {
  console.error(
    picocolors.red(
      `✗ 无法读取 full.mcp.json: ${error instanceof Error ? error.message : error}`
    )
  )
  process.exit(1)
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
 * 从 full.mcp.json 中筛选需要的服务器
 */
function generateMcpJson(name: string, definition: any): void {
  // 如果没有 mcpConfig 元数据，跳过
  if (!definition.metadata.mcpConfig) {
    return
  }

  const mcpPath = join(TEMPLATES_DIR, `${name}.mcp.json`)

  // 构建 MCP 服务器配置
  let mcpConfig: Record<string, any> = {}

  // 根据 mcpServers 配置进行筛选
  if (definition.mcpServers === undefined || definition.mcpServers === null) {
    // undefined/null: 包含所有服务器（用于 full 模板）
    mcpConfig = { ...fullMcpConfig.mcpServers }
  }
  else if (Array.isArray(definition.mcpServers)) {
    if (definition.mcpServers.length === 0) {
      // 空数组: 不包含任何服务器（用于 yolo 模板）
      mcpConfig = {}
    }
    else {
      // 筛选指定的服务器
      for (const serverName of definition.mcpServers) {
        const serverConfig = fullMcpConfig.mcpServers[serverName]
        if (!serverConfig) {
          console.warn(
            picocolors.yellow(
              `  ⚠ MCP 服务器 "${serverName}" 未在 full.mcp.json 中找到`
            )
          )
          continue
        }
        mcpConfig[serverName] = serverConfig
      }
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
  console.log(
    picocolors.dim(
      `数据源: ${FULL_MCP_PATH} (${Object.keys(fullMcpConfig.mcpServers).length} 个 MCP 服务器)\n`
    )
  )

  let successCount = 0
  let errorCount = 0

  for (const [name, definition] of Object.entries(templates)) {
    try {
      console.log(picocolors.bold(`[${name}]`))

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
