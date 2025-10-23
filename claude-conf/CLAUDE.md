# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个 Claude Code 配置模板安装器 CLI 工具,名为 `claude-conf`。该工具提供交互式界面,帮助用户快速安装和管理 Claude Code 的 Settings 和 MCP 配置模板。

## 核心架构

### 模板系统

模板存储在 `templates/` 目录,每个模板由两个文件组成:
- `{name}.json`: Settings 配置模板,包含 metadata 和 config 两部分
- `{name}.mcp.json`: MCP 服务器配置模板(可选)

模板结构:
```typescript
{
  metadata: {
    name: string
    description: string
    version?: string
    supportedScopes?: Scope[]  // ['user', 'project', 'local']
    mcpConfig?: string         // MCP 配置文件名
  },
  config: Record<string, any>  // 实际的 Claude Settings 配置
}
```

### Scope 系统

配置有三种安装范围:
- **user**: `~/.claude/settings.json` - 用户级全局配置
- **project**: `{项目根}/.claude/settings.json` + `.mcp.json` - 项目级配置(提交到版本控制)
- **local**: `{项目根}/.claude/settings.local.json` - 本地配置(不提交)

MCP 配置处理逻辑:
- project scope: 直接写入 `.mcp.json` 文件
- user/local scope: 通过 `claude mcp add-json` CLI 命令添加

### 智能推荐系统

`detect` 工具根据当前目录环境推荐合适的 scope:
- 不在项目中 → `user`
- 在 Git 项目中 → `project` (优先推荐,便于团队共享)
- 在项目中但无 Git → `local`

检测逻辑位于 `src/utils.ts:65-72`:
```typescript
detect.recommendScope(): Scope
detect.inProject()  // 检查是否有 package.json/.git/.claude
detect.hasGit()     // 检查是否有 .git 目录
```

### 配置合并策略

- **merge**: 使用 `deepmerge` 合并现有配置和模板配置
- **replace**: 完全覆盖现有配置
- 如果目标位置不存在配置文件,自动使用 replace 策略

## 常用开发命令

```bash
# 安装依赖
pnpm install

# 构建项目
pnpm build

# 开发模式(监听文件变化)
pnpm dev

# 运行测试
pnpm test

# 类型检查
pnpm typecheck

# 本地测试 CLI
pnpm link --global
claude-conf --help
```

## CLI 命令结构

入口文件: `src/cli.ts`

命令定义:
```bash
# 默认命令(安装)
claude-conf [template] [--scope user|project|local] [--strategy merge|replace]

# 列出可用模板
claude-conf list
```

### 安装流程 (src/commands/install.ts)

1. **selectTemplate()** - 选择模板(CLI 参数或交互式选择)
2. **selectScope()** - 选择 scope(优先使用 CLI 参数,否则显示智能推荐)
3. **determineStrategy()** - 判断合并策略(检查是否存在配置文件)
4. **showPreview()** - 显示配置预览
5. **performInstall()** - 执行安装
   - 安装 Settings 配置(备份 → 合并/替换 → 写入)
   - 安装 MCP 配置(project scope 写文件,user/local scope 调用 CLI)

### MCP 自动安装

对于 user/local scope,工具会尝试通过 `execa` 调用 `claude mcp add-json` 命令自动安装 MCP 服务器:

```typescript
// src/commands/install.ts:327-380
await execa('claude', [
  'mcp',
  'add-json',
  name,
  JSON.stringify(config),
  '--scope',
  scope,
])
```

如果自动安装失败,会显示手动安装命令供用户执行。

## 添加新模板

1. 在 `templates/` 目录创建 `{name}.json`:
```json
{
  "metadata": {
    "name": "my-template",
    "description": "模板描述",
    "version": "1.0.0",
    "supportedScopes": ["user", "project", "local"],
    "mcpConfig": "my-template.mcp.json"
  },
  "config": {
    "permissions": { ... },
    "extraKnownMarketplaces": { ... }
  }
}
```

2. 如需 MCP 配置,创建 `{name}.mcp.json`:
```json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "package-name"],
      "env": { "KEY": "value" }
    }
  }
}
```

3. 模板会自动被 `loadAllTemplates()` 加载(通过读取 templates 目录下所有非 `.mcp.` 的 `.json` 文件)

## 构建配置

- 使用 `tsdown` 进行构建
- 输出到 `dist/` 目录
- ESM 模块格式(`"type": "module"`)
- 打包文件: `dist/` 和 `templates/` (见 package.json files 字段)
- CLI 入口: `dist/cli.js` (shebang: `#!/usr/bin/env node`)

## 依赖说明

核心依赖:
- `@clack/prompts`: 交互式 CLI 界面
- `cac`: CLI 参数解析
- `deepmerge`: 深度合并配置对象
- `execa`: 执行外部命令(用于调用 claude CLI)
- `fs-extra`: 文件系统操作增强

## TypeScript 配置

- 目标: ESNext
- 模块系统: preserve (由 bundler 处理)
- 严格模式: 开启
- 仅生成类型声明文件 (`emitDeclarationOnly: true`)
- 实际代码由 tsdown 打包
