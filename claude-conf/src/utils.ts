import { homedir } from 'node:os'
import { cwd } from 'node:process'
import { dirname, join } from 'node:path'
import { existsSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import fs from 'fs-extra'
import { fileURLToPath } from 'node:url'
import type { McpTemplate, Scope, Template } from './types.js'

const { readJSON } = fs

// 获取模块目录
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * 路径工具
 */
export const paths = {
  /** 用户主目录 */
  home: () => homedir(),

  /** 当前工作目录 */
  cwd: () => cwd(),

  /** 根据 scope 获取配置文件路径 */
  config: (scope: Scope, workingDir?: string): string => {
    const dir = workingDir || cwd()
    switch (scope) {
      case 'user':
        return join(homedir(), '.claude', 'settings.json')
      case 'project':
        return join(dir, '.claude', 'settings.json')
      case 'local':
        return join(dir, '.claude', 'settings.local.json')
    }
  },

  /** 模板目录 */
  templates: (): string => {
    return join(__dirname, '..', 'templates')
  },
}

/**
 * 环境检测工具
 */
export const detect = {
  /** 检测是否在项目目录中 */
  inProject: (dir?: string): boolean => {
    const workingDir = dir || cwd()
    return (
      existsSync(join(workingDir, 'package.json'))
      || existsSync(join(workingDir, '.git'))
      || existsSync(join(workingDir, '.claude'))
    )
  },

  /** 检测是否有 Git 仓库 */
  hasGit: (dir?: string): boolean => {
    const workingDir = dir || cwd()
    return existsSync(join(workingDir, '.git'))
  },

  /** 推荐 scope */
  recommendScope: (dir?: string): Scope => {
    if (!detect.inProject(dir))
      return 'user'
    if (detect.hasGit(dir))
      return 'project'
    return 'local'
  },

  /** 获取推荐理由 */
  getRecommendReason: (scope: Scope, dir?: string): string => {
    switch (scope) {
      case 'user':
        return detect.inProject(dir)
          ? '用户级全局配置（跨项目共享）'
          : '用户级全局配置'
      case 'project':
        return detect.hasGit(dir)
          ? '项目级配置（团队共享，提交到版本控制）'
          : '项目级配置'
      case 'local':
        return '本地配置（不提交到版本控制）'
    }
  },
}

/**
 * 加载所有模板
 */
export async function loadAllTemplates(): Promise<Template[]> {
  const templatesDir = paths.templates()
  const files = await readdir(templatesDir)

  // 过滤出模板文件（排除 .mcp.json）
  const templateFiles = files.filter(
    f => f.endsWith('.json') && !f.includes('.mcp.'),
  )

  // 并行读取所有模板
  const templates = await Promise.all(
    templateFiles.map(async (file) => {
      const filePath = join(templatesDir, file)
      return await readJSON(filePath) as Template
    }),
  )

  return templates
}

/**
 * 加载 MCP 配置模板
 */
export async function loadMcpTemplate(
  mcpConfigFilename: string,
): Promise<McpTemplate | null> {
  try {
    const mcpFilePath = join(paths.templates(), mcpConfigFilename)
    if (!existsSync(mcpFilePath)) {
      return null
    }
    return await readJSON(mcpFilePath) as McpTemplate
  }
  catch {
    return null
  }
}

/**
 * 格式化模板信息
 */
export function getTemplateInfo(template: Template): string {
  const { name, version, description } = template.metadata
  return `📦 ${name}${version ? ` (v${version})` : ''}\n   ${description}`
}

/**
 * 格式化模板列表
 */
export function formatTemplateList(templates: Template[]): string {
  return templates
    .map((t) => {
      const scopes = t.metadata.supportedScopes || ['user', 'project', 'local']
      return `  ${getTemplateInfo(t)}\n     支持: ${scopes.join(', ')}`
    })
    .join('\n\n')
}
