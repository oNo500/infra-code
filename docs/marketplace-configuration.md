# 市场配置指南

本指南详细介绍如何配置和管理 Claude Code 插件市场,包括 marketplace.json 和 plugin.json 的完整配置选项。

## Marketplace 配置

### marketplace.json 位置

```
project-root/
└── .claude-plugin/
    └── marketplace.json    # 必需文件
```

### 完整配置示例

```json
{
  "name": "company-plugins",
  "version": "1.0.0",
  "owner": {
    "name": "公司名称",
    "email": "devops@company.com",
    "url": "https://company.com"
  },
  "description": "公司内部 Claude Code 插件集合",
  "homepage": "https://docs.company.com/claude-plugins",
  "repository": "https://github.com/company/claude-plugins",
  "license": "MIT",
  "strict": true,
  "plugins": [
    {
      "name": "deployment-tools",
      "source": "./plugins/deployment-tools",
      "description": "自动化部署工具集"
    },
    {
      "name": "code-formatter",
      "source": {
        "source": "github",
        "repo": "company/formatter-plugin"
      },
      "description": "代码格式化工具"
    }
  ]
}
```

### 字段说明

#### 必需字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 市场唯一标识符(kebab-case) |
| `owner` | object | 市场所有者信息 |
| `plugins` | array | 插件列表 |

#### 可选字段

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `version` | string | 市场版本(语义化版本) | `"1.2.3"` |
| `description` | string | 市场描述 | `"团队插件集合"` |
| `homepage` | string | 文档 URL | `"https://docs.example.com"` |
| `repository` | string | 源代码 URL | `"https://github.com/..."` |
| `license` | string | 许可证标识 | `"MIT"`, `"Apache-2.0"` |
| `strict` | boolean | 严格模式(推荐 true) | `true` |

#### owner 对象

```json
{
  "owner": {
    "name": "所有者名称",           // 必需
    "email": "email@example.com",  // 可选
    "url": "https://example.com"   // 可选
  }
}
```

## 插件源配置

### 本地路径

用于开发和测试:

```json
{
  "name": "my-plugin",
  "source": "./plugins/my-plugin",
  "description": "本地开发插件"
}
```

**特点:**
- 相对于 marketplace.json 的路径
- 适合本地开发和测试
- 支持快速迭代

### GitHub 仓库

```json
{
  "name": "remote-plugin",
  "source": {
    "source": "github",
    "repo": "organization/repository",
    "ref": "main"  // 可选:分支、标签或 commit
  },
  "description": "GitHub 托管的插件"
}
```

**字段说明:**
- `repo`: 必需,格式为 `owner/repo`
- `ref`: 可选,默认为默认分支
  - 分支名: `"main"`, `"develop"`
  - 标签: `"v1.0.0"`
  - Commit SHA: `"abc123..."`

### Git URL

支持任何 Git 仓库:

```json
{
  "name": "private-plugin",
  "source": {
    "source": "git",
    "url": "https://git.company.com/plugins/tool.git",
    "ref": "stable"  // 可选
  },
  "description": "私有 Git 仓库插件"
}
```

**支持的协议:**
- HTTPS: `https://git.example.com/repo.git`
- SSH: `git@git.example.com:repo.git`
- Git: `git://git.example.com/repo.git`

## Plugin 配置

### plugin.json 位置

```
plugin-root/
└── .claude-plugin/
    └── plugin.json    # 必需文件
```

### 完整配置示例

```json
{
  "name": "deployment-tools",
  "version": "2.1.0",
  "description": "企业级部署自动化工具",
  "author": {
    "name": "DevOps Team",
    "email": "devops@company.com",
    "url": "https://company.com/devops"
  },
  "homepage": "https://docs.company.com/deployment-tools",
  "repository": "https://github.com/company/deployment-tools",
  "license": "MIT",
  "keywords": ["deployment", "ci-cd", "automation"],
  "commands": [
    "./custom/deploy.md",
    "./custom/rollback.md"
  ],
  "agents": "./specialized-agents/",
  "hooks": "./config/hooks.json",
  "mcpServers": "./mcp-config.json"
}
```

### 字段说明

#### 必需字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 插件唯一标识符(kebab-case,无空格) |

#### 元数据字段

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `version` | string | 语义化版本 | `"2.1.0"` |
| `description` | string | 简短描述 | `"部署工具"` |
| `author` | object | 作者信息 | 见下方 |
| `homepage` | string | 文档 URL | `"https://..."` |
| `repository` | string | 源码 URL | `"https://github..."` |
| `license` | string | 许可证 | `"MIT"` |
| `keywords` | array | 关键词标签 | `["deploy", "ci"]` |

#### author 对象

```json
{
  "author": {
    "name": "开发者名称",            // 推荐
    "email": "dev@example.com",    // 可选
    "url": "https://example.com"   // 可选
  }
}
```

#### 组件路径字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `commands` | string\|array | 自定义命令文件/目录路径 |
| `agents` | string\|array | 自定义代理文件路径 |
| `hooks` | string\|object | Hook 配置路径或内联配置 |
| `mcpServers` | string\|object | MCP 配置路径或内联配置 |

**路径行为:**
- 自定义路径**补充**默认目录,不替换
- 所有路径必须是相对路径且以 `./` 开头
- 多个路径可以用数组指定

**示例:**

```json
{
  "commands": [
    "./specialized/deploy.md",
    "./utilities/batch.md"
  ],
  "agents": [
    "./custom-agents/reviewer.md",
    "./custom-agents/tester.md"
  ]
}
```

即使指定了自定义路径,`commands/` 和 `agents/` 目录仍会被加载。

## 内联配置 vs 外部文件

### Hooks 配置

**内联配置:**
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/format.sh"
          }
        ]
      }
    ]
  }
}
```

**外部文件:**
```json
{
  "hooks": "./hooks/hooks.json"
}
```

### MCP Servers 配置

**内联配置:**
```json
{
  "mcpServers": {
    "database": {
      "command": "node",
      "args": ["${CLAUDE_PLUGIN_ROOT}/server.js"]
    }
  }
}
```

**外部文件:**
```json
{
  "mcpServers": "./.mcp.json"
}
```

**推荐:**
- 简单配置使用内联
- 复杂配置使用外部文件
- 团队协作时使用外部文件便于维护

## 环境变量

### ${CLAUDE_PLUGIN_ROOT}

在配置中使用此变量引用插件目录的绝对路径:

```json
{
  "hooks": {
    "PostToolUse": [{
      "hooks": [{
        "type": "command",
        "command": "${CLAUDE_PLUGIN_ROOT}/scripts/process.sh"
      }]
    }]
  },
  "mcpServers": {
    "server": {
      "command": "${CLAUDE_PLUGIN_ROOT}/bin/server",
      "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"],
      "env": {
        "DATA_DIR": "${CLAUDE_PLUGIN_ROOT}/data"
      }
    }
  }
}
```

**重要性:**
- 确保路径在任何安装位置都正确
- 适配不同用户的文件系统
- 支持跨平台兼容性

## 版本管理

### 语义化版本 (Semantic Versioning)

格式: `MAJOR.MINOR.PATCH`

```
主版本号.次版本号.修订号
  |        |       |
  |        |       └── 向下兼容的问题修正
  |        └── 向下兼容的功能新增
  └── 不兼容的 API 修改
```

**示例:**
- `1.0.0` → `1.0.1`: 修复 bug
- `1.0.1` → `1.1.0`: 添加新功能
- `1.1.0` → `2.0.0`: 破坏性变更

### 版本更新指南

| 变更类型 | 版本递增 | 示例 |
|----------|----------|------|
| Bug 修复 | PATCH | 1.0.0 → 1.0.1 |
| 新增功能(兼容) | MINOR | 1.0.1 → 1.1.0 |
| 破坏性变更 | MAJOR | 1.1.0 → 2.0.0 |

### 版本标签

在 Git 仓库中使用标签标记版本:

```bash
# 创建标签
git tag v1.0.0

# 推送标签
git push origin v1.0.0

# 在 marketplace.json 中引用
{
  "source": {
    "source": "github",
    "repo": "org/repo",
    "ref": "v1.0.0"
  }
}
```

## 配置验证

### JSON 语法验证

```bash
# 使用 jq 验证和格式化
cat .claude-plugin/marketplace.json | jq .
cat plugins/*/. claude-plugin/plugin.json | jq .

# 检查特定字段
jq '.plugins[] | .name' .claude-plugin/marketplace.json
```

### 必需字段检查清单

**marketplace.json:**
- ✅ `name` 字段存在且使用 kebab-case
- ✅ `owner.name` 字段存在
- ✅ `plugins` 数组存在且非空
- ✅ 每个插件有 `name` 和 `source`

**plugin.json:**
- ✅ `name` 字段存在且使用 kebab-case
- ✅ 如果有 `version`,符合语义化版本
- ✅ 自定义路径以 `./` 开头

### 常见错误

**❌ 错误的 name 格式:**
```json
{
  "name": "My Plugin"  // 有空格
}
```

**✅ 正确的 name 格式:**
```json
{
  "name": "my-plugin"  // kebab-case
}
```

**❌ 错误的路径:**
```json
{
  "commands": "commands/deploy.md"  // 缺少 ./
}
```

**✅ 正确的路径:**
```json
{
  "commands": "./commands/deploy.md"
}
```

## 配置模板

### 最小市场配置

```json
{
  "name": "my-marketplace",
  "owner": {
    "name": "Your Name"
  },
  "plugins": []
}
```

### 最小插件配置

```json
{
  "name": "my-plugin"
}
```

### 生产环境配置

**marketplace.json:**
```json
{
  "name": "company-plugins",
  "version": "1.0.0",
  "owner": {
    "name": "Company DevOps",
    "email": "devops@company.com"
  },
  "description": "Official company Claude Code plugins",
  "homepage": "https://docs.company.com/claude-plugins",
  "repository": "https://github.com/company/claude-plugins",
  "license": "Apache-2.0",
  "strict": true,
  "plugins": [
    {
      "name": "deployment-tools",
      "source": {
        "source": "github",
        "repo": "company/deployment-tools",
        "ref": "v2.1.0"
      },
      "description": "Deployment automation tools"
    }
  ]
}
```

**plugin.json:**
```json
{
  "name": "deployment-tools",
  "version": "2.1.0",
  "description": "Enterprise deployment automation",
  "author": {
    "name": "DevOps Team",
    "email": "devops@company.com"
  },
  "homepage": "https://docs.company.com/deployment-tools",
  "repository": "https://github.com/company/deployment-tools",
  "license": "Apache-2.0",
  "keywords": ["deployment", "ci-cd", "automation"]
}
```

## 下一步

- 📚 查看 [API 参考](./api-reference.md) 了解完整的 schema
- 🧪 阅读 [测试和发布流程](./testing-and-release.md) 了解发布最佳实践
- 👥 参考 [团队协作规范](./team-collaboration.md) 了解团队配置
