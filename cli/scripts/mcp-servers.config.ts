/**
 * MCP 服务器库配置
 * 定义所有可用的 MCP 服务器配置，供模板引用
 */

export interface McpServerConfig {
  command: string
  args: string[]
  env?: Record<string, string>
  type?: string
}

/**
 * MCP 服务器库
 * 每个服务器配置可以被多个模板复用
 */
export const mcpServers: Record<string, McpServerConfig> = {
  // 序列思考服务器
  'sequential-thinking': {
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-sequential-thinking'],
  },

  // Brave 搜索服务器
  'brave-search': {
    command: 'npx',
    args: ['-y', '@brave/brave-search-mcp-server', '--transport', 'stdio'],
    env: {
      BRAVE_API_KEY: 'BSAkJSUIFg8aP7PW6Eit25qHymn8mmW',
    },
  },

  // Context7 文档服务器
  context7: {
    command: 'npx',
    args: ['-y', '@upstash/context7-mcp@latest'],
  },

  // Firecrawl 抓取服务器 (firecrawl-mcp 包)
  'firecrawl-mcp': {
    command: 'npx',
    args: ['-y', 'firecrawl-mcp'],
    env: {
      FIRECRAWL_API_KEY: 'fc-31789fc0dcf74604b6f27b6a1b8ee832',
    },
  },

  // Firecrawl 抓取服务器 (@mendable 包)
  firecrawl: {
    command: 'npx',
    args: ['-y', '@mendable/firecrawl-mcp'],
  },

  // Playwright 浏览器自动化
  playwright: {
    command: 'npx',
    args: ['@playwright/mcp@latest'],
  },

  // Magic AI 工具
  magic: {
    type: 'stdio',
    command: 'npx',
    args: ['@21st-dev/magic'],
    env: {
      TWENTYFIRST_API_KEY:
        '894f8affe842b5535846b25ab352cdd4835103e943eeba0494a24d3a48450c9f',
    },
  },

  // Morph Fast Apply
  'morphllm-fast-apply': {
    command: 'npx',
    args: ['@morph-llm/morph-fast-apply', '/home/'],
    env: {
      MORPH_API_KEY:
        'sk-Wy0Vc2zl7wA-I-Qad2wYimVNXnPZMTJsXbTA_HfySpl-4hyu',
      ALL_TOOLS: 'true',
    },
  },

  // Serena 交互式编辑器 (npx 版本)
  serena: {
    command: 'npx',
    args: ['-y', '@infrasoftbe/serena'],
    env: {
      SERENA_MODE: 'interactive,editing',
    },
  },

  // Serena (uvx 版本 - 用于 full 模板)
  'serena-uvx': {
    command: 'uvx',
    args: [
      '--from',
      'git+https://github.com/oraios/serena',
      'serena',
      'start-mcp-server',
    ],
  },

  // Browser Use
  'browser-use': {
    command: 'uvx',
    args: ['--from', 'browser-use[cli]', 'browser-use', '--mcp'],
    env: {
      OPENAI_API_KEY: 'bu_HVUQcfOYQ_hXWzw3rAD9XriJQsxa7CzEw2ZXF8dcpms',
      PYTHONWARNINGS: 'ignore',
      BROWSER_USE_HEADLESS: 'true',
    },
  },
}

/**
 * MCP 服务器组
 * 预定义的服务器组合，供模板快速引用
 */
export const mcpServerGroups = {
  // 核心服务器组
  core: ['sequential-thinking', 'brave-search', 'context7', 'firecrawl-mcp'],

  // 浏览器自动化组
  browser: ['playwright', 'browser-use'],

  // AI 工具组
  ai: ['magic', 'morphllm-fast-apply'],

  // 编辑器组
  editor: ['serena'],
}
