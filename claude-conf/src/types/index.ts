/**
 * Claude Code Settings 类型定义
 */

/** 配置范围 */
export type Scope = 'user' | 'project' | 'local'

/** 模版来源类型 */
export type TemplateSourceType = 'local' | 'git' | 'npm'

/** 合并策略 */
export type MergeStrategy = 'merge' | 'replace'

/** 模版元数据 */
export interface TemplateMetadata {
  /** 模版名称 */
  name: string
  /** 模版描述 */
  description: string
  /** 适用范围 */
  scope: Scope
  /** 作者信息 */
  author?: string
  /** 版本号 */
  version?: string
  /** 标签 */
  tags?: string[]
  /** 创建时间 */
  createdAt?: string
  /** 更新时间 */
  updatedAt?: string
}

/** Claude Code 权限配置 */
export interface PermissionsConfig {
  allow?: string[]
  deny?: string[]
}

/** MCP 服务器配置 */
export interface McpServerConfig {
  command: string
  args?: string[]
  env?: Record<string, string>
  disabled?: boolean
}

/** 插件市场配置 */
export interface MarketplaceConfig {
  source: string | {
    source: 'github' | 'git'
    repo?: string
    url?: string
    ref?: string
  }
}

/** Claude Code Settings 完整配置 */
export interface ClaudeSettings {
  /** 权限配置 */
  permissions?: PermissionsConfig
  /** 启用的工具列表 */
  enabledTools?: string[]
  /** 工作目录 */
  workingDirectory?: string
  /** MCP 服务器配置 */
  mcpServers?: Record<string, McpServerConfig>
  /** 已知的插件市场 */
  extraKnownMarketplaces?: Record<string, MarketplaceConfig>
  /** 启用的插件 */
  enabledPlugins?: Record<string, boolean>
  /** Git 配置 */
  git?: {
    autoCommit?: boolean
    commitMessage?: string
  }
  /** 其他自定义配置 */
  [key: string]: unknown
}

/** 完整模版定义 */
export interface Template {
  /** 模版元数据 */
  metadata: TemplateMetadata
  /** 配置内容 */
  config: ClaudeSettings
}

/** 本地模版来源 */
export interface LocalTemplateSource {
  type: 'local'
  /** 模版名称 */
  name: string
}

/** Git 仓库模版来源 */
export interface GitTemplateSource {
  type: 'git'
  /** Git 仓库 URL */
  url: string
  /** 分支或标签 */
  ref?: string
  /** 子目录路径 */
  path?: string
}

/** NPM 包模版来源 */
export interface NpmTemplateSource {
  type: 'npm'
  /** NPM 包名 */
  packageName: string
  /** 版本 */
  version?: string
}

/** 模版来源联合类型 */
export type TemplateSource = LocalTemplateSource | GitTemplateSource | NpmTemplateSource

/** 安装选项 */
export interface InstallOptions {
  /** 配置范围 */
  scope: Scope
  /** 模版来源 */
  source: TemplateSource
  /** 合并策略 */
  mergeStrategy: MergeStrategy
  /** 是否备份现有配置 */
  backup?: boolean
  /** 是否静默模式（不提示确认） */
  silent?: boolean
}

/** 配置文件路径信息 */
export interface ConfigPath {
  /** 配置范围 */
  scope: Scope
  /** 完整路径 */
  path: string
  /** 是否存在 */
  exists: boolean
}

/** CLI 错误类型 */
export class CliError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown,
  ) {
    super(message)
    this.name = 'CliError'
  }
}
