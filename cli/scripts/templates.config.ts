/**
 * 模板配置
 * 定义所有可用的 Claude Settings 模板
 */

import type { Scope } from "../src/types.js";

/**
 * 模板元数据
 */
export interface TemplateMetadata {
  name: string;
  description: string;
  version?: string;
  author?: string;
  tags?: string[];
  supportedScopes?: Scope[];
  mcpConfig?: string; // MCP 配置文件名（如果有）
  claudeMd?: string; // Claude.md 文件名（如果有）
}

/**
 * 模板定义
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
 * 所有模板配置
 */
export const templates: Record<string, TemplateDefinition> = {
  // 基础配置 - 核心 MCP 服务器
  basic: {
    metadata: {
      name: "basic",
      description: "基础配置 - 核心 MCP 服务器（搜索、思维、抓取）",
      version: "1.0.0",
      supportedScopes: ["user", "project", "local"],
      mcpConfig: "basic.mcp.json",
      claudeMd: "basic.claude.md",
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

  // 前端开发配置
  fe: {
    metadata: {
      name: "fe",
      description: "前端开发配置 - 包含浏览器自动化和前端开发工具",
      version: "1.0.0",
      supportedScopes: ["user", "project", "local"],
      mcpConfig: "fe.mcp.json",
      claudeMd: "fe.claude.md",
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
