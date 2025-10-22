# Claude Conf

> Claude Code Settings 模版安装器 - 交互式 CLI 工具

## 简介

`claude-conf` 是一个用于管理和安装 Claude Code 配置模版的命令行工具。通过交互式界面，你可以轻松地：

- 📦 安装预定义的配置模版
- 🔍 浏览可用模版列表
- 👀 预览模版内容
- 🎯 支持用户级、项目级和本地级配置
- 🌐 从本地或远程（Git/NPM）加载模版

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

### 交互式安装

最简单的方式是运行交互式安装命令：

```bash
claude-conf install
```

这将启动一个交互式向导，引导你完成以下步骤：

1. 选择配置范围（user/project/local）
2. 选择模版来源（本地/Git/NPM）
3. 选择具体模版
4. 预览配置内容
5. 选择合并策略
6. 确认并安装

### 列出可用模版

查看所有可用模版：

```bash
claude-conf list
```

只查看特定 scope 的模版：

```bash
claude-conf list --scope user
claude-conf list --scope project
claude-conf list --scope local
```

### 预览模版

在安装前预览模版内容：

```bash
claude-conf preview basic --scope user
claude-conf preview web-dev --scope project
```

## 配置范围说明

### User Scope

**路径**: `~/.claude/settings.json`

**用途**: 用户级全局配置，适用于所有项目

**适用场景**:
- 个人开发偏好设置
- 全局 MCP 服务器配置
- 通用工具启用设置

### Project Scope

**路径**: `{项目根目录}/.claude/settings.json`

**用途**: 项目级配置，提交到版本控制，团队共享

**适用场景**:
- 项目特定的权限配置
- 项目相关的 MCP 服务器
- 团队共享的开发设置

### Local Scope

**路径**: `{项目根目录}/.claude/settings.local.json`

**用途**: 本地开发配置，不提交到版本控制

**适用场景**:
- 个人开发调试设置
- 临时测试配置
- 包含敏感信息的配置

## 内置模版

### User Scope 模版

#### basic
基础 Claude Code 配置，适合大多数用户

**包含**:
- 基础权限配置
- 常用工具启用
- 标准文件排除规则

#### full-mcp
完整 MCP 服务器配置

**包含**:
- Serena (代码理解)
- Sequential Thinking (深度推理)
- Brave Search (网络搜索)
- Playwright (浏览器自动化)

#### minimal
最小化配置

**包含**:
- 仅基础工具
- 最小权限配置

### Project Scope 模版

#### web-dev
Web 开发项目配置

**适用**: React, Vue, Angular 等前端项目

**包含**:
- 前端目录权限
- Playwright (E2E 测试)
- Magic (UI 组件生成)
- Web Dev 插件市场

#### nodejs
Node.js 后端项目配置

**适用**: Express, Koa, NestJS 等后端项目

**包含**:
- 后端目录权限
- Serena MCP 服务器
- Node.js 插件市场

#### fullstack
全栈项目配置

**适用**: 前后端一体的全栈项目

**包含**:
- 完整的前后端权限
- Serena + Playwright + Magic
- 全栈插件市场

### Local Scope 模版

#### dev
本地开发环境配置

**包含**:
- 完全开放的权限
- 所有开发工具
- 调试用 MCP 服务器
- Debug 模式启用

## 远程模版

### 从 Git 下载

```bash
claude-conf install
# 选择 "远程 Git 仓库"
# 输入: https://github.com/user/repo
# 或: https://github.com/user/repo#branch
# 或: https://github.com/user/repo#branch:path/to/template
```

Git 仓库应包含 `template.json` 文件。

### 从 NPM 下载

```bash
claude-conf install
# 选择 "NPM 包"
# 输入: @scope/package-name 或 package-name
```

NPM 包应在根目录包含 `template.json` 文件。

## 模版格式

### 模版文件结构

```json
{
  "metadata": {
    "name": "template-name",
    "description": "模版描述",
    "scope": "user|project|local",
    "version": "1.0.0",
    "author": "作者名称",
    "tags": ["tag1", "tag2"]
  },
  "config": {
    "permissions": {
      "allow": ["**/*"],
      "deny": ["node_modules/**"]
    },
    "enabledTools": ["Read", "Write", "Edit"],
    "mcpServers": {
      "server-name": {
        "command": "npx",
        "args": ["-y", "package-name"],
        "env": {}
      }
    }
  }
}
```

## 合并策略

### Merge（合并）

保留现有配置，将新配置项合并进去。对象会深度合并，数组会覆盖。

**适用场景**:
- 添加新的 MCP 服务器
- 扩展权限配置
- 增加工具启用

### Replace（替换）

完全替换现有配置。

**适用场景**:
- 重置配置到初始状态
- 切换到完全不同的配置方案

## 开发

### 项目结构

```
claude-conf/
├── src/
│   ├── types/           # TypeScript 类型定义
│   ├── utils/           # 工具函数
│   ├── core/            # 核心功能
│   ├── commands/        # CLI 命令
│   ├── cli.ts           # CLI 主程序
│   └── index.ts         # 公共 API 入口
├── templates/           # 本地模版库
│   ├── user/           # 用户级模版
│   ├── project/        # 项目级模版
│   └── local/          # 本地级模版
├── tests/              # 单元测试
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

## API 使用

除了 CLI 工具，你也可以将 `claude-conf` 作为库使用：

```typescript
import {
  loadTemplatesByScope,
  installConfig,
  previewConfigChanges
} from '@code-infra/claude-conf'

// 加载模版
const templates = await loadTemplatesByScope('user')

// 预览配置变更
const preview = await previewConfigChanges(
  'user',
  template.config,
  'merge'
)

// 安装配置
const result = await installConfig(
  'user',
  template.config,
  'merge',
  true // 启用备份
)
```

## 贡献

欢迎贡献！请查看 [贡献指南](../../CONTRIBUTING.md)。

### 添加新模版

1. 在 `templates/{scope}/` 目录下创建 JSON 文件
2. 遵循模版格式规范
3. 提交 Pull Request

## 许可证

MIT

## 相关链接

- [Claude Code 文档](https://docs.claude.com/en/docs/claude-code)
- [MCP 服务器](https://github.com/modelcontextprotocol)
- [Code Infra 项目](https://github.com/...)
