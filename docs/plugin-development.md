# 插件开发指南

本指南详细介绍如何开发 Claude Code 插件的各种组件,包括 Commands、Agents、Skills、Hooks 和 MCP Servers。

## 插件组件概述

一个完整的插件可以包含以下组件:

| 组件 | 用途 | 调用方式 | 位置 |
|------|------|----------|------|
| **Commands** | 自定义斜杠命令 | 用户手动调用 | `commands/*.md` |
| **Agents** | 专业化子代理 | Claude 自动或手动 | `agents/*.md` |
| **Skills** | 扩展 Claude 能力 | 模型自主调用 | `skills/*/SKILL.md` |
| **Hooks** | 事件响应处理 | 事件自动触发 | `hooks/hooks.json` |
| **MCP Servers** | 外部工具集成 | Claude 自动调用 | `.mcp.json` |

## Commands (斜杠命令)

### 基本结构

创建 `commands/command-name.md`:

```markdown
---
description: 命令的简短描述(显示在 /help 中)
---

# 命令标题

这里是命令被调用时发送给 Claude 的提示词内容。
可以包含详细的指令、上下文和期望的输出格式。

## 示例用法

你可以包含使用示例来帮助用户理解命令的用途。

## 注意事项

- 提示词应该清晰明确
- 避免歧义表述
- 可以使用 Markdown 格式
```

### 支持参数的命令

使用 `$ARGUMENTS` 占位符接收用户输入:

```markdown
---
description: 修复指定的 issue
---

# Fix Issue

查找并修复 issue #$ARGUMENTS:

1. 理解 issue 描述
2. 定位相关代码
3. 实现解决方案
4. 添加测试
5. 准备 PR 描述
```

用法: `/fix-issue 123` 会将 `$ARGUMENTS` 替换为 `123`

### 命令命名规范

- 文件名使用 kebab-case: `deploy-app.md`
- 命令名自动从文件名生成: `/deploy-app`
- 子目录作为命名空间: `frontend/component.md` → `/component (project:frontend)`

### 最佳实践

✅ **推荐做法:**
- 提供清晰的任务描述
- 分步骤说明期望的行为
- 包含输出格式要求
- 使用简洁的描述(显示在 /help)

❌ **避免:**
- 过于模糊的指令
- 没有具体目标的开放式问题
- 过长的描述文本

## Agents (子代理)

### 基本结构

创建 `agents/agent-name.md`:

```markdown
---
description: 何时使用此代理的简短说明
capabilities: ["能力1", "能力2", "能力3"]
---

# Agent 名称

详细描述此代理的专业领域、角色和专长。

## 能力

- 具体任务此代理擅长处理
- 另一个专业化能力
- 何时应该调用此代理

## 使用场景

提供具体示例,说明何时 Claude 应该自动调用此代理。

## 工作方式

说明此代理如何处理任务,使用什么工具,遵循什么流程。
```

### Agent 示例

**安全审查代理** (`agents/security-reviewer.md`):

```markdown
---
description: 审查代码的安全漏洞和最佳实践
capabilities: ["security-audit", "vulnerability-scan", "code-review"]
---

# Security Reviewer

专门审查代码中的安全问题,包括常见漏洞、不安全的模式和安全最佳实践。

## 能力

- 识别常见安全漏洞(SQL注入、XSS、CSRF等)
- 检查身份验证和授权实现
- 审查敏感数据处理
- 验证输入验证和清理
- 评估依赖项的安全风险

## 使用场景

当用户请求:
- "审查这段代码的安全性"
- "检查是否有安全漏洞"
- "确保这个 API 端点是安全的"

## 审查清单

1. 输入验证和清理
2. 输出编码
3. 身份验证和授权
4. 敏感数据处理
5. 错误处理和日志
6. 依赖项安全
```

### 最佳实践

- 使用 `description` 字段帮助 Claude 自动选择代理
- `capabilities` 数组定义代理的专业领域
- 提供清晰的使用场景说明
- 描述代理的工作流程和方法

## Skills (Agent Skills)

### 基本结构

创建 `skills/skill-name/SKILL.md`:

```markdown
---
name: skill-name
description: Skill 的简短描述
---

# Skill 名称

详细说明此 Skill 的功能和用途。

## 何时使用

描述 Claude 应该在什么情况下自主调用此 Skill。

## 使用方法

说明 Skill 的输入、输出和使用方式。

## 示例

提供具体的使用示例。
```

### Skill 目录结构

```
skills/
├── pdf-processor/
│   ├── SKILL.md           # 必需
│   ├── reference.md       # 可选:参考文档
│   └── scripts/           # 可选:辅助脚本
│       └── process.py
└── code-reviewer/
    └── SKILL.md
```

### 最佳实践

- Skills 是模型自主调用的,不需要用户明确请求
- 在 `description` 中清楚说明使用场景
- 可以包含辅助文件和脚本
- Skills 会自动集成到 Claude 的工具集

## Hooks (事件钩子)

### 基本结构

创建 `hooks/hooks.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/format-code.sh"
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash(git push:*)",
        "hooks": [
          {
            "type": "command",
            "command": "echo '确认要推送到远程仓库吗?'"
          }
        ]
      }
    ]
  }
}
```

### 支持的事件类型

| 事件 | 触发时机 |
|------|----------|
| `PreToolUse` | 工具使用前 |
| `PostToolUse` | 工具使用后 |
| `UserPromptSubmit` | 用户提交提示词时 |
| `Notification` | 发送通知时 |
| `Stop` | Claude 尝试停止时 |
| `SubagentStop` | 子代理尝试停止时 |
| `SessionStart` | 会话开始时 |
| `SessionEnd` | 会话结束时 |
| `PreCompact` | 压缩对话历史前 |

### Hook 类型

**command**: 执行 shell 命令
```json
{
  "type": "command",
  "command": "${CLAUDE_PLUGIN_ROOT}/scripts/lint.sh"
}
```

**validation**: 验证文件内容或项目状态
```json
{
  "type": "validation",
  "command": "${CLAUDE_PLUGIN_ROOT}/scripts/validate.sh"
}
```

**notification**: 发送提醒或状态更新
```json
{
  "type": "notification",
  "message": "代码格式化完成"
}
```

### Matcher 模式

- 工具名称: `"Write"`, `"Edit"`, `"Bash"`
- 多个工具: `"Write|Edit"` (使用 | 分隔)
- Bash 命令: `"Bash(git push:*)"` (使用前缀匹配)
- 所有工具: 不指定 matcher 或使用 `"*"`

### 实用 Hook 示例

**代码格式化**:
```json
{
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
```

**推送前确认**:
```json
{
  "PreToolUse": [
    {
      "matcher": "Bash(git push:*)",
      "hooks": [
        {
          "type": "validation",
          "command": "${CLAUDE_PLUGIN_ROOT}/scripts/pre-push-check.sh"
        }
      ]
    }
  ]
}
```

**会话开始提醒**:
```json
{
  "SessionStart": [
    {
      "hooks": [
        {
          "type": "command",
          "command": "git status"
        }
      ]
    }
  ]
}
```

### 最佳实践

- 使用 `${CLAUDE_PLUGIN_ROOT}` 引用插件目录
- 确保脚本有执行权限: `chmod +x script.sh`
- 在脚本中使用正确的 shebang: `#!/bin/bash`
- Hook 失败会阻止操作,谨慎使用验证钩子

## MCP Servers (模型上下文协议)

### 基本结构

创建 `.mcp.json` (在插件根目录):

```json
{
  "mcpServers": {
    "plugin-database": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/db-server",
      "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"],
      "env": {
        "DB_PATH": "${CLAUDE_PLUGIN_ROOT}/data"
      }
    },
    "plugin-api-client": {
      "command": "npx",
      "args": ["@company/mcp-server", "--plugin-mode"],
      "cwd": "${CLAUDE_PLUGIN_ROOT}"
    }
  }
}
```

### 配置字段

| 字段 | 说明 | 示例 |
|------|------|------|
| `command` | 服务器可执行文件 | `"node"`, `"python"`, `"./server"` |
| `args` | 命令参数数组 | `["server.js", "--port", "3000"]` |
| `env` | 环境变量 | `{"API_KEY": "xxx"}` |
| `cwd` | 工作目录 | `"${CLAUDE_PLUGIN_ROOT}/server"` |

### 最佳实践

- 始终使用 `${CLAUDE_PLUGIN_ROOT}` 变量
- MCP 服务器在插件启用时自动启动
- 服务器工具会无缝集成到 Claude 的工具集
- 可以连接数据库、API、文件系统等外部服务

## 插件测试

### 本地测试流程

```bash
# 1. 卸载旧版本
/plugin uninstall plugin-name@marketplace-name

# 2. 重新安装
/plugin install plugin-name@marketplace-name

# 3. 测试各个组件
/command-name              # 测试命令
/agents                    # 查看代理是否注册
# 触发 hooks 的操作       # 测试钩子
# 使用涉及 MCP 的功能    # 测试 MCP 服务器
```

### 调试技巧

```bash
# 使用 debug 模式
claude --debug

# 检查插件加载详情
# - 哪些插件正在加载
# - 清单中的错误
# - 命令、代理、钩子注册
# - MCP 服务器初始化
```

### 常见问题排查

| 问题 | 可能原因 | 解决方案 |
|------|----------|----------|
| 插件未加载 | plugin.json 无效 | 验证 JSON 语法 |
| 命令未出现 | 目录结构错误 | 确保 commands/ 在根目录 |
| 钩子未触发 | 脚本无执行权限 | `chmod +x script.sh` |
| MCP 失败 | 路径错误 | 使用 `${CLAUDE_PLUGIN_ROOT}` |

## 代码组织

### 推荐的插件结构

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json
├── commands/              # 所有命令
│   ├── general/
│   │   ├── status.md
│   │   └── help.md
│   └── deploy.md
├── agents/                # 所有代理
│   ├── reviewer.md
│   └── tester.md
├── skills/                # 所有 Skills
│   └── analyzer/
│       ├── SKILL.md
│       └── utils/
├── hooks/                 # Hook 配置
│   └── hooks.json
├── scripts/               # 辅助脚本
│   ├── format.sh
│   └── validate.py
├── .mcp.json             # MCP 配置
├── README.md             # 插件文档
└── CHANGELOG.md          # 变更日志
```

### 文件命名规范

- 使用 kebab-case: `deploy-app.md`
- 命令文件必须是 `.md` 扩展名
- 代理文件必须是 `.md` 扩展名
- Skills 必须包含 `SKILL.md`
- JSON 文件使用小写: `plugin.json`, `hooks.json`

## 下一步

- 📖 查看 [API 参考](./api-reference.md) 了解完整的配置 schema
- 🧪 阅读 [测试和发布流程](./testing-and-release.md) 了解发布最佳实践
- 👥 参考 [团队协作规范](./team-collaboration.md) 了解团队工作流
