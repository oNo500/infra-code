/**
 * 模板配置
 * 定义所有可用的 Claude Settings 模板
 */

import type { Scope } from './src/types.js'

/**
 * 模板元数据
 */
export interface TemplateMetadata {
  name: string
  description: string
  version?: string
  author?: string
  tags?: string[]
  supportedScopes?: Scope[]
  mcpConfig?: string // MCP 配置文件名（如果有）
  claudeMd?: string // Claude.md 文件名（如果有）
}

/**
 * 模板定义
 */
export interface TemplateDefinition {
  metadata: TemplateMetadata
  config: Record<string, any>
  mcpServers?: string[] // MCP 服务器名称列表（引用 mcp-servers.config.ts）
  claudeMdContent?: string // Claude.md 的内容（如果不是引用外部文件）
}

/**
 * 所有模板配置
 */
export const templates: Record<string, TemplateDefinition> = {
  // 基础配置 - 核心 MCP 服务器
  basic: {
    metadata: {
      name: 'basic',
      description: '基础配置 - 核心 MCP 服务器（搜索、思维、抓取）',
      version: '1.0.0',
      supportedScopes: ['user', 'project', 'local'],
      mcpConfig: 'basic.mcp.json',
      claudeMd: 'basic.claude.md',
    },
    config: {
      enableAllProjectMcpServers: true,
      enabledMcpjsonServers: [],
      disabledMcpjsonServers: [],
    },
    mcpServers: ['sequential-thinking', 'brave-search', 'context7', 'firecrawl-mcp'],
    claudeMdContent: '待补充',
  },

  // 常用开发配置
  common: {
    metadata: {
      name: 'common',
      description: '常用开发配置，包含合理的权限设置和插件市场',
      version: '2.0.0',
      author: 'Code Infra Team',
      tags: ['recommended', 'general'],
      supportedScopes: ['user', 'project', 'local'],
      mcpConfig: 'common.mcp.json',
      claudeMd: 'common.claude.md',
    },
    config: {
      extraKnownMarketplaces: {
        'code-infra': {
          source: './plugins',
        },
      },
      enabledPlugins: {
        'common@code-infra': true,
      },
      enableAllProjectMcpServers: true,
      enabledMcpjsonServers: [],
      disabledMcpjsonServers: [],
    },
    mcpServers: ['serena', 'sequential-thinking', 'firecrawl'],
    claudeMdContent: '待补充',
  },

  // 前端开发配置
  fe: {
    metadata: {
      name: 'fe',
      description: '前端开发配置 - 包含浏览器自动化和前端开发工具',
      version: '1.0.0',
      supportedScopes: ['user', 'project', 'local'],
      mcpConfig: 'fe.mcp.json',
      claudeMd: 'fe.claude.md',
    },
    config: {
      enableAllProjectMcpServers: true,
      enabledMcpjsonServers: [],
      disabledMcpjsonServers: [],
    },
    mcpServers: [
      'sequential-thinking',
      'brave-search',
      'context7',
      'firecrawl-mcp',
      'playwright',
      'magic',
      'morphllm-fast-apply',
    ],
    claudeMdContent: '待补充',
  },

  // 完整配置
  full: {
    metadata: {
      name: 'full',
      description: '完整配置 - 包含所有 MCP 服务器（搜索、浏览器、AI工具、工作流）',
      version: '1.0.0',
      supportedScopes: ['user', 'project', 'local'],
      mcpConfig: 'full.mcp.json',
      claudeMd: 'full.claude.md',
    },
    config: {
      enableAllProjectMcpServers: true,
      enabledMcpjsonServers: [],
      disabledMcpjsonServers: [],
    },
    mcpServers: [
      'firecrawl-mcp',
      'sequential-thinking',
      'brave-search',
      'context7',
      'magic',
      'playwright',
      'serena-uvx',
      'morphllm-fast-apply',
      'browser-use',
    ],
    claudeMdContent: '# Claude Code 完整配置\n\n待补充',
  },

  // 插件市场配置
  plugins: {
    metadata: {
      name: 'plugins',
      description: '插件市场配置 - 用于团队插件分发和管理',
      version: '1.0.0',
      author: 'Code Infra Team',
      tags: ['plugins', 'team', 'marketplace'],
      supportedScopes: ['user', 'project', 'local'],
      claudeMd: 'plugins.claude.md',
      // 注意：没有 mcpConfig，因为 plugins 模板不包含 MCP 服务器
    },
    config: {
      extraKnownMarketplaces: {
        'infra-code': {
          source: {
            source: 'directory',
            path: '/Users/bytedance/private/infra-code',
          },
        },
      },
      enabledPlugins: {
        'common@infra-code': true,
      },
      enableAllProjectMcpServers: true,
      enabledMcpjsonServers: [],
      disabledMcpjsonServers: [],
    },
    // 不生成 mcp.json 文件
    // claudeMd 将从现有文件复制（因为内容较长）
  },

  // YOLO 配置 - 完全开放权限
  yolo: {
    metadata: {
      name: 'yolo',
      description: '完全开放权限，用于快速实验和开发',
      version: '2.0.0',
      author: 'Code Infra Team',
      tags: ['open', 'development'],
      supportedScopes: ['local'],
      mcpConfig: 'yolo.mcp.json',
      claudeMd: 'yolo.claude.md',
    },
    config: {
      enableAllProjectMcpServers: true,
      enabledMcpjsonServers: [],
      disabledMcpjsonServers: [],
    },
    mcpServers: [], // 空的 MCP 服务器列表
    claudeMdContent: '待补充',
  },
}
