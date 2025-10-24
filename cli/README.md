# Claude Conf

> Claude Code Settings 模版安装器 - 交互式 CLI 工具

## 简介

`claude-conf` 是一个用于管理和安装 Claude Code 配置模版的命令行工具。通过简洁的交互式界面,你可以轻松地：

- 📦 安装预定义的配置模版
- 🔍 浏览可用模版列表
- 🎯 智能推荐安装位置
- 🚀 一键安装 Settings + MCP 配置

## 特点

✨ **极简主义** - 默认行为最智能，减少必填参数
🤖 **智能推荐** - 自动检测环境并推荐合适的 scope
⚡ **快速安装** - 3 步完成配置安装
🔧 **灵活配置** - 支持 user/project/local 三种范围

## 安装

### 本地开发

```bash
# 安装依赖
pnpm install

# 构建项目
pnpm run build

# 链接到全局（用于本地测试）
pnpm link --global
```

### NPM 安装（发布后）

```bash
npm install -g @code-infra/claude-conf
```

## 使用方法

### 快速开始

最简单的方式：

```bash
# 直接运行（等同于 claude-conf install）
claude-conf
```

### 指定模板安装

```bash
# 安装 common 模板
claude-conf common

# 安装 yolo 模板到 local scope
claude-conf yolo --scope local
```

### 列出可用模板

```bash
claude-conf list
```

### 查看帮助

```bash
claude-conf --help
claude-conf --version
```

## 配置范围说明

### User Scope

**路径**: `~/.claude/settings.json`

**用途**: 用户级全局配置，适用于所有项目

**适用场景**:
- 个人开发偏好设置
- 全局插件市场配置
- 跨项目通用设置

**MCP 配置**: 需要手动使用 `claude mcp add --scope user` 命令添加

### Project Scope

**路径**: `{项目根目录}/.claude/settings.json`
**MCP 配置**: `{项目根目录}/.claude/.mcp.json`

**用途**: 项目级配置，提交到版本控制，团队共享

**适用场景**:
- 项目特定的权限配置
- 团队共享的开发设置
- 项目级 MCP 服务器

### Local Scope

**路径**: `{项目根目录}/.claude/settings.local.json`
**MCP 配置**: 通过 CLI 命令管理（不是文件）

**用途**: 本地开发配置，不提交到版本控制

**适用场景**:
- 个人开发调试设置
- 临时测试配置
- 包含敏感信息的配置

## 内置模板

### common (推荐)

**描述**: 常用开发配置，包含合理的权限设置和插件市场

**支持 Scope**: user, project, local

**包含**:
- 合理的文件访问权限（排除 node_modules, .git 等）
- Code Infra 插件市场配置
- 常用 MCP 服务器：
  - Serena（代码理解）
  - Sequential Thinking（深度推理）
  - Firecrawl（网页抓取）

### yolo

**描述**: 完全开放权限，用于快速实验和开发

**支持 Scope**: local（仅本地）

**包含**:
- 完全开放的文件访问权限
- 无任何限制

## 安装流程

新的简化流程只需 3-4 步：

```
1. 选择模板（common / yolo）
2. 选择 Scope（智能推荐 ⭐）
3. 确认安装
```

相比旧版本，移除了：
- ❌ 选择来源（默认本地）
- ❌ 单独的预览步骤（自动显示）
- ❌ 手动选择策略（自动判断）

## 智能推荐

CLI 会根据当前环境自动推荐最合适的 scope：

- **不在项目中** → `user`
- **在 Git 项目中** → `project` ⭐（团队共享）
- **在项目中但无 Git** → `local`

## MCP 配置

MCP 服务器配置会根据 scope 自动处理：

- **project scope**: 自动创建 `.mcp.json` 文件（提交到版本控制）
- **user scope**: 提示使用 `claude mcp add --scope user` 命令手动添加
- **local scope**: 提示使用 `claude mcp add --scope local` 命令手动添加

**说明**: 根据 Claude Code 官方文档，只有 project scope 的 MCP 配置通过 `.mcp.json` 文件管理，user 和 local scope 通过 CLI 命令管理。

## CLI 选项

```bash
claude-conf [template] [options]

参数:
  [template]              模板名称（可选）

选项:
  --scope <scope>         指定 scope: user/project/local
  --strategy <strategy>   指定合并策略: merge/replace
  -h, --help             显示帮助信息
  -v, --version          显示版本号
```

## 开发

### 项目结构

```
claude-conf/
├── templates/              # 模板目录
│   ├── common.json        # 常用配置
│   ├── common.mcp.json    # 常用 MCP
│   ├── yolo.json          # YOLO 配置
│   └── yolo.mcp.json      # YOLO MCP
├── src/
│   ├── commands/          # CLI 命令
│   │   ├── install.ts     # 安装命令
│   │   └── list.ts        # 列表命令
│   ├── core/
│   │   ├── template.ts    # 模板加载
│   │   ├── config.ts      # 配置管理
│   │   └── detector.ts    # 环境检测
│   ├── utils/             # 工具函数
│   ├── types/             # TypeScript 类型
│   └── cli.ts             # CLI 入口
└── package.json
```

### 运行测试

```bash
pnpm test
```

### 类型检查

```bash
pnpm typecheck
```

### 构建

```bash
pnpm build
```

## 模板格式

### 模板文件结构

```json
{
  "metadata": {
    "name": "template-name",
    "description": "模板描述",
    "version": "2.0.0",
    "author": "作者名称",
    "tags": ["tag1", "tag2"],
    "supportedScopes": ["user", "project", "local"],
    "mcpConfig": "template-name.mcp.json"
  },
  "config": {
    "permissions": {
      "allow": ["**/*"],
      "deny": ["node_modules/**"]
    },
    "extraKnownMarketplaces": {
      "marketplace-name": {
        "source": "./plugins"
      }
    },
    "enabledPlugins": {
      "plugin-name@marketplace-name": true
    }
  }
}
```

### MCP 配置文件结构

```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "package-name"],
      "env": {
        "ENV_VAR": "value"
      }
    }
  }
}
```

## 贡献

欢迎贡献！请查看 [贡献指南](../../CONTRIBUTING.md)。

### 添加新模板

1. 在 `templates/` 目录创建 JSON 文件
2. 如有 MCP 配置，创建对应的 `.mcp.json` 文件
3. 遵循模板格式规范
4. 提交 Pull Request

## 许可证

MIT

## 相关链接

- [Claude Code 文档](https://docs.claude.com/en/docs/claude-code)
- [Claude Code Settings 文档](https://docs.claude.com/en/docs/claude-code/settings)
- [MCP 服务器](https://github.com/modelcontextprotocol)
