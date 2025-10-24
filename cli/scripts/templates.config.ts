/**
 * 模板配置
 * 定义所有可用的 Claude Settings 模板
 */

import type { Scope } from "../src/types.js";

/**
 * 模板元数据（简化版，不包含文件名）
 */
export interface TemplateMetadata {
  description: string;
  version?: string;
  author?: string;
  tags?: string[];
  supportedScopes?: Scope[];
}

/**
 * 模板定义（简化版，name 自动从 key 推导）
 */
export interface TemplateDefinition {
  metadata: TemplateMetadata;
  config: Record<string, any>;
  /**
   * MCP 服务器名称列表
   * - undefined 或 null: 包含所有服务器（从 full.mcp.json）
   * - 字符串数组: 只包含指定的服务器（从 full.mcp.json 中筛选）
   * - 空数组: 不包含任何服务器
   */
  mcpServers?: string[];
  claudeMdContent?: string; // Claude.md 的内容（如果不是引用外部文件）
}

/**
 * 完整的模板定义（内部使用，包含自动推导的 name）
 */
export interface FullTemplateDefinition extends TemplateDefinition {
  metadata: TemplateMetadata & {
    name: string;
    mcpConfig?: string;
    claudeMd?: string;
  };
}

/**
 * 所有模板配置（简化版）
 * key 会自动作为模板名称和文件名前缀
 */
const templatesConfig: Record<string, TemplateDefinition> = {
  // 基础配置 - 核心 MCP 服务器
  basic: {
    metadata: {
      description: "基础配置 - 核心 MCP 服务器（搜索、思维、抓取）",
      version: "1.0.0",
      supportedScopes: ["user", "project", "local"],
    },
    config: {
      enableAllProjectMcpServers: true,
      enabledMcpjsonServers: [],
      disabledMcpjsonServers: [],
    },
    mcpServers: [
      "sequential-thinking",
      "brave-search",
      "context7",
      "firecrawl-mcp",
    ],
    claudeMdContent: "待补充",
  },

  // 设置模板 - 仅配置，不含 MCP 服务器
  settings: {
    metadata: {
      description: "基础设置模板 - 仅包含配置项",
      version: "1.0.0",
      supportedScopes: ["user", "project", "local"],
    },
    config: {
      enableAllProjectMcpServers: true,
      enabledMcpjsonServers: [],
      disabledMcpjsonServers: [],
    },
    // 不配置 mcpServers 和 claudeMdContent，不会生成对应文件
  },

  // 前端开发配置
  fe: {
    metadata: {
      description: "前端开发配置 - 包含浏览器自动化和前端开发工具",
      version: "1.0.0",
      supportedScopes: ["user", "project", "local"],
    },
    config: {
      enableAllProjectMcpServers: true,
      enabledMcpjsonServers: [],
      disabledMcpjsonServers: [],
    },
    mcpServers: [
      "sequential-thinking",
      "brave-search",
      "context7",
      "firecrawl-mcp",
      "playwright",
      "magic",
      "morphllm-fast-apply",
    ],
    claudeMdContent: "待补充",
  },
};

/**
 * 将简化的模板配置转换为完整配置
 * 自动从 key 推导 name 和文件名
 * 根据内容自动决定是否生成文件：
 * - 如果有 mcpServers 配置，生成 {name}.mcp.json
 * - 如果有 claudeMdContent 配置，生成 {name}.claude.md
 */
function normalizeTemplates(
  configs: Record<string, TemplateDefinition>
): Record<string, FullTemplateDefinition> {
  const normalized: Record<string, FullTemplateDefinition> = {};

  for (const [key, definition] of Object.entries(configs)) {
    // 根据内容自动决定是否生成文件
    const hasMcpServers = definition.mcpServers !== undefined;
    const hasClaudeMd = definition.claudeMdContent !== undefined;

    normalized[key] = {
      ...definition,
      metadata: {
        ...definition.metadata,
        name: key,
        mcpConfig: hasMcpServers ? `${key}.mcp.json` : undefined,
        claudeMd: hasClaudeMd ? `${key}.claude.md` : undefined,
      },
    };
  }

  return normalized;
}

/**
 * 导出完整的模板配置
 */
export const templates = normalizeTemplates(templatesConfig);
