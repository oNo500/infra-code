import { join } from 'node:path'
import type { Scope, Template, TemplateMetadata } from '../types/index.js'
import { CliError } from '../types/index.js'
import { getScopeTemplatesDir } from '../utils/path.js'
import { fileExists, listFiles, readJsonFile } from '../utils/fs.js'

/**
 * 从文件加载模版
 * @param filePath 模版文件路径
 */
export async function loadTemplateFromFile(filePath: string): Promise<Template> {
  try {
    const exists = await fileExists(filePath)
    if (!exists) {
      throw new CliError(
        `模版文件不存在: ${filePath}`,
        'TEMPLATE_NOT_FOUND',
      )
    }

    const template = await readJsonFile<Template>(filePath)

    // 验证模版格式
    validateTemplate(template)

    return template
  }
  catch (error) {
    if (error instanceof CliError) {
      throw error
    }
    throw new CliError(
      `加载模版失败: ${filePath}`,
      'LOAD_TEMPLATE_ERROR',
      error,
    )
  }
}

/**
 * 加载指定 scope 的所有本地模版
 * @param scope 配置范围
 */
export async function loadTemplatesByScope(scope: Scope): Promise<Template[]> {
  try {
    const templatesDir = getScopeTemplatesDir(scope)
    const files = await listFiles(templatesDir, '.json')

    const templates: Template[] = []

    for (const file of files) {
      try {
        const filePath = join(templatesDir, file)
        const template = await loadTemplateFromFile(filePath)
        templates.push(template)
      }
      catch (error) {
        // 跳过无效的模版文件，但记录错误
        console.warn(`警告: 跳过无效模版文件 ${file}:`, error)
      }
    }

    return templates
  }
  catch (error) {
    throw new CliError(
      `加载 ${scope} scope 模版失败`,
      'LOAD_TEMPLATES_ERROR',
      error,
    )
  }
}

/**
 * 加载所有本地模版
 */
export async function loadAllLocalTemplates(): Promise<Map<Scope, Template[]>> {
  const scopes: Scope[] = ['user', 'project', 'local']
  const templatesMap = new Map<Scope, Template[]>()

  for (const scope of scopes) {
    const templates = await loadTemplatesByScope(scope)
    templatesMap.set(scope, templates)
  }

  return templatesMap
}

/**
 * 根据名称和 scope 查找模版
 * @param name 模版名称
 * @param scope 配置范围
 */
export async function findTemplateByName(
  name: string,
  scope: Scope,
): Promise<Template | null> {
  const templates = await loadTemplatesByScope(scope)
  return templates.find(t => t.metadata.name === name) || null
}

/**
 * 验证模版格式
 * @param template 模版对象
 */
export function validateTemplate(template: unknown): asserts template is Template {
  if (!template || typeof template !== 'object') {
    throw new CliError('模版格式无效: 必须是一个对象', 'INVALID_TEMPLATE')
  }

  const t = template as Record<string, unknown>

  // 验证 metadata
  if (!t.metadata || typeof t.metadata !== 'object') {
    throw new CliError(
      '模版格式无效: 缺少 metadata 字段',
      'INVALID_TEMPLATE',
    )
  }

  const metadata = t.metadata as Record<string, unknown>

  if (!metadata.name || typeof metadata.name !== 'string') {
    throw new CliError(
      '模版格式无效: metadata.name 必须是字符串',
      'INVALID_TEMPLATE',
    )
  }

  if (!metadata.description || typeof metadata.description !== 'string') {
    throw new CliError(
      '模版格式无效: metadata.description 必须是字符串',
      'INVALID_TEMPLATE',
    )
  }

  if (!metadata.scope || !['user', 'project', 'local'].includes(metadata.scope as string)) {
    throw new CliError(
      '模版格式无效: metadata.scope 必须是 user, project 或 local',
      'INVALID_TEMPLATE',
    )
  }

  // 验证 config
  if (!t.config || typeof t.config !== 'object') {
    throw new CliError(
      '模版格式无效: 缺少 config 字段',
      'INVALID_TEMPLATE',
    )
  }
}

/**
 * 获取模版的简短描述信息
 * @param template 模版对象
 */
export function getTemplateInfo(template: Template): string {
  const { name, description, version, author } = template.metadata
  let info = `${name} - ${description}`

  if (version) {
    info += ` (v${version})`
  }

  if (author) {
    info += ` by ${author}`
  }

  return info
}

/**
 * 列出模版的配置项摘要
 * @param template 模版对象
 */
export function getTemplateConfigSummary(template: Template): string[] {
  const summary: string[] = []
  const { config } = template

  if (config.permissions) {
    summary.push('✓ 权限配置 (permissions)')
  }

  if (config.enabledTools) {
    summary.push(`✓ 启用工具 (${config.enabledTools.length} 个)`)
  }

  if (config.mcpServers) {
    const serverCount = Object.keys(config.mcpServers).length
    summary.push(`✓ MCP 服务器 (${serverCount} 个)`)
  }

  if (config.extraKnownMarketplaces) {
    const marketCount = Object.keys(config.extraKnownMarketplaces).length
    summary.push(`✓ 插件市场 (${marketCount} 个)`)
  }

  if (config.enabledPlugins) {
    const pluginCount = Object.keys(config.enabledPlugins).length
    summary.push(`✓ 启用插件 (${pluginCount} 个)`)
  }

  return summary
}

/**
 * 格式化模版列表为显示文本
 * @param templates 模版列表
 */
export function formatTemplateList(templates: Template[]): string {
  if (templates.length === 0) {
    return '暂无可用模版'
  }

  return templates
    .map((template) => {
      const info = getTemplateInfo(template)
      const summary = getTemplateConfigSummary(template)
      return `• ${info}\n  ${summary.join('\n  ')}`
    })
    .join('\n\n')
}
