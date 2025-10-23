import * as clack from '@clack/prompts'
import type { Scope, Template } from '../types/index.js'
import { findTemplateByName, getTemplateConfigSummary } from '../core/template.js'
import { formatConfigInfo } from '../core/config.js'

/**
 * 预览模版
 * @param name 模版名称
 * @param scope 模版 scope
 */
export async function previewCommand(name: string, scope: Scope): Promise<void> {
  clack.intro('👀 模版预览')

  try {
    // 查找模版
    const template = await findTemplateByName(name, scope)

    if (!template) {
      clack.log.error(`模版不存在: ${name} (${scope} scope)`)
      clack.outro('✗ 失败')
      process.exit(1)
    }

    // 显示模版信息
    displayTemplatePreview(template)

    clack.outro('✓ 完成')
  }
  catch (error) {
    clack.log.error('预览模版失败')
    console.error(error)
    process.exit(1)
  }
}

/**
 * 显示模版预览
 * @param template 模版对象
 */
function displayTemplatePreview(template: Template): void {
  const { metadata, config } = template

  // 基本信息
  clack.log.info('\n📦 模版信息:\n')
  console.log(`  名称: ${metadata.name}`)
  console.log(`  描述: ${metadata.description}`)
  console.log(`  范围: ${metadata.scope}`)

  if (metadata.version) {
    console.log(`  版本: ${metadata.version}`)
  }

  if (metadata.author) {
    console.log(`  作者: ${metadata.author}`)
  }

  if (metadata.tags && metadata.tags.length > 0) {
    console.log(`  标签: ${metadata.tags.join(', ')}`)
  }

  // 配置摘要
  clack.log.info('\n⚙️  配置项:\n')
  const summary = getTemplateConfigSummary(template)
  if (summary.length > 0) {
    summary.forEach(item => console.log(`  ${item}`))
  }
  else {
    console.log('  暂无配置项')
  }

  // 详细配置
  clack.log.info('\n📝 详细配置:\n')
  const configInfo = formatConfigInfo(config, 1)
  if (configInfo.length > 0) {
    configInfo.forEach(line => console.log(line))
  }
  else {
    console.log('  暂无详细配置')
  }

  // JSON 预览
  clack.log.info('\n📄 完整配置 (JSON):\n')
  console.log(JSON.stringify(config, null, 2))
}
