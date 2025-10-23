/**
 * 最小化类型定义
 */

/** 配置范围 */
export type Scope = 'user' | 'project' | 'local'

/** 合并策略 */
export type MergeStrategy = 'merge' | 'replace'

/** 模板元数据 */
export interface TemplateMetadata {
  name: string
  description: string
  version?: string
  supportedScopes?: Scope[]
  mcpConfig?: string
}

/** 模板定义 */
export interface Template {
  metadata: TemplateMetadata
  config: Record<string, any>
}

/** MCP 服务器配置 */
export interface McpServerConfig {
  command: string
  args?: string[]
  env?: Record<string, string>
}

/** MCP 配置模板 */
export interface McpTemplate {
  mcpServers: Record<string, McpServerConfig>
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
