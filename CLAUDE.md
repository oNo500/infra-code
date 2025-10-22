# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个 Claude Code 插件市场(Plugin Marketplace)项目,用于管理和分发 Claude Code 插件。插件市场允许团队集中管理自定义命令、代理、技能、钩子和 MCP 服务器,并在团队成员之间共享。

## 项目架构

### 目录结构

```
code-infra/
├── .claude-plugin/
│   └── marketplace.json       # 市场清单文件(必需)
├── .claude/
│   └── settings.json          # 项目级配置
├── plugins/                   # 插件目录
│   └── {plugin-name}/         # 单个插件目录
│       ├── .claude-plugin/
│       │   └── plugin.json    # 插件清单(必需)
│       ├── commands/          # 斜杠命令
│       ├── agents/            # 子代理定义
│       ├── skills/            # Agent Skills
│       ├── hooks/             # 事件钩子
│       │   └── hooks.json
│       ├── .mcp.json          # MCP 服务器配置
│       └── scripts/           # 脚本文件
└── docs/                      # 文档目录
```

### 核心文件说明

**marketplace.json** (位于 `.claude-plugin/`)
- 定义市场元数据和包含的插件列表
- 必需字段:`name`, `owner`, `plugins`
- 示例结构见下方"市场配置规范"

**plugin.json** (位于插件的 `.claude-plugin/`)
- 定义单个插件的元数据
- 必需字段:`name`
- 可选字段:`version`, `description`, `author`, `commands`, `agents`, `hooks`, `mcpServers`

## 插件开发工作流

### 创建新插件

1. **创建插件目录结构**
```bash
mkdir -p plugins/{plugin-name}/.claude-plugin
mkdir -p plugins/{plugin-name}/{commands,agents,skills,hooks,scripts}
```

2. **创建 plugin.json**
```json
{
  "name": "plugin-name",
  "version": "1.0.0",
  "description": "插件简短描述",
  "author": {
    "name": "作者名称"
  }
}
```

3. **添加插件组件** (根据需要)
   - **Commands**: 在 `commands/` 创建 `.md` 文件
   - **Agents**: 在 `agents/` 创建 `.md` 文件
   - **Skills**: 在 `skills/{skill-name}/` 创建 `SKILL.md`
   - **Hooks**: 在 `hooks/` 创建 `hooks.json`
   - **MCP Servers**: 创建 `.mcp.json`

4. **更新 marketplace.json**
```json
{
  "plugins": [
    {
      "name": "plugin-name",
      "source": "./plugins/plugin-name",
      "description": "插件描述"
    }
  ]
}
```

### 插件组件类型

**Commands (斜杠命令)**
- 文件位置: `commands/*.md`
- 格式: Markdown 文件,支持 frontmatter
- 示例:
```markdown
---
description: 命令简短描述
---

# 命令名称

命令的详细提示词内容
```

**Agents (子代理)**
- 文件位置: `agents/*.md`
- 格式: Markdown 文件,描述代理的专业领域
- 自动集成到 `/agents` 界面

**Skills (Agent Skills)**
- 文件位置: `skills/{skill-name}/SKILL.md`
- 模型自主调用,基于任务上下文
- 可包含辅助文件和脚本

**Hooks (事件钩子)**
- 文件位置: `hooks/hooks.json`
- 响应工具使用等事件
- 支持事件: PreToolUse, PostToolUse, UserPromptSubmit 等

**MCP Servers**
- 文件位置: `.mcp.json` (插件根目录)
- 连接外部工具和服务
- 使用 `${CLAUDE_PLUGIN_ROOT}` 变量引用插件路径

## 市场配置规范

### marketplace.json 结构

```json
{
  "name": "marketplace-name",
  "version": "0.0.0",
  "owner": {
    "name": "所有者名称",
    "email": "email@example.com"
  },
  "strict": true,
  "plugins": [
    {
      "name": "plugin-name",
      "source": "./plugins/plugin-name",
      "description": "插件描述"
    },
    {
      "name": "remote-plugin",
      "source": {
        "source": "github",
        "repo": "org/repo"
      },
      "description": "远程插件描述"
    }
  ]
}
```

### 插件源类型

- **本地路径**: `"source": "./plugins/plugin-name"`
- **GitHub**: `"source": {"source": "github", "repo": "org/repo"}`
- **Git URL**: `"source": {"source": "git", "url": "https://..."}`

## 常用开发命令

### 本地测试插件

```bash
# 启动 Claude Code
claude

# 添加本地市场(在 Claude Code 中)
/plugin marketplace add ./path/to/marketplace

# 安装插件
/plugin install plugin-name@marketplace-name

# 浏览已安装的插件
/plugin

# 卸载插件(用于重新测试)
/plugin uninstall plugin-name@marketplace-name

# 重新安装(迭代开发时)
/plugin install plugin-name@marketplace-name
```

### 验证配置

```bash
# 检查 JSON 语法
cat .claude-plugin/marketplace.json | jq .
cat plugins/*/. claude-plugin/plugin.json | jq .

# 验证目录结构
ls -la .claude-plugin/
ls -la plugins/*/
```

## 团队协作规范

### 插件发布流程

1. **更新版本号** (plugin.json)
   - 遵循语义化版本: MAJOR.MINOR.PATCH
   - 主版本号:不兼容的 API 修改
   - 次版本号:向下兼容的功能新增
   - 修订号:向下兼容的问题修正

2. **更新 CHANGELOG.md**
   - 记录所有变更
   - 包含版本号和日期

3. **测试插件**
   - 在本地市场测试所有功能
   - 验证命令、代理、钩子正常工作

4. **提交和推送**
   - 提交所有更改到版本控制
   - 推送到远程仓库

### 团队级配置

在 `.claude/settings.json` 配置团队使用的插件:

```json
{
  "extraKnownMarketplaces": {
    "code-infra": {
      "source": "./path/to/marketplace"
    }
  },
  "enabledPlugins": {
    "plugin-name@code-infra": true
  }
}
```

团队成员在信任项目文件夹后,会自动提示安装市场和插件。

## 关键架构概念

### 插件命名空间

插件通过 `plugin-name@marketplace-name` 格式引用,确保来自不同市场的同名插件不冲突。

### 配置优先级

从高到低:
1. 企业托管策略 (managed-settings.json)
2. 命令行参数
3. 本地项目配置 (.claude/settings.local.json) - 不提交
4. 共享项目配置 (.claude/settings.json) - 提交到版本控制
5. 用户配置 (~/.claude/settings.json)

### 环境变量

在插件配置中使用 `${CLAUDE_PLUGIN_ROOT}` 引用插件目录的绝对路径:

```json
{
  "hooks": {
    "PostToolUse": [{
      "hooks": [{
        "type": "command",
        "command": "${CLAUDE_PLUGIN_ROOT}/scripts/process.sh"
      }]
    }]
  }
}
```

## 最佳实践

1. **目录组织**
   - 所有组件目录(commands/, agents/, skills/, hooks/)必须在插件根目录
   - 不要放在 `.claude-plugin/` 内部

2. **版本管理**
   - 使用语义化版本
   - 在 CHANGELOG.md 中记录变更

3. **文档维护**
   - 为每个插件提供 README.md
   - 在命令的 frontmatter 中提供清晰的 description

4. **权限设置**
   - 使用 `.claude/settings.json` 配置权限规则
   - 通过 `permissions.deny` 排除敏感文件

5. **测试**
   - 使用本地市场进行迭代测试
   - 测试所有插件组件的功能

## 调试技巧

```bash
# 使用 debug 模式查看插件加载详情
claude --debug

# 检查插件是否正确注册
/help  # 查看命令是否出现
/agents  # 查看代理是否注册
```

## 常见问题

**插件未加载**
- 检查 plugin.json 语法是否正确
- 确认目录结构正确(组件目录在插件根,不在 .claude-plugin/ 内)

**命令未出现**
- 确认 commands/ 目录在插件根目录
- 检查 .md 文件格式

**钩子未触发**
- 确认脚本有执行权限: `chmod +x script.sh`
- 检查 hooks.json 配置

**MCP 服务器失败**
- 确保使用 `${CLAUDE_PLUGIN_ROOT}` 变量
- 检查服务器路径和参数

## 相关资源

- [Claude Code 插件官方文档](https://docs.claude.com/en/docs/claude-code/plugins)
- [插件市场文档](https://docs.claude.com/en/docs/claude-code/plugin-marketplaces)
- [插件参考文档](https://docs.claude.com/en/docs/claude-code/plugins-reference)
