# API 参考

本文档提供 marketplace.json、plugin.json 和相关配置文件的完整 schema 参考。

## marketplace.json Schema

### 完整 Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["name", "owner", "plugins"],
  "properties": {
    "name": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$",
      "description": "市场唯一标识符(kebab-case)"
    },
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "description": "语义化版本号"
    },
    "owner": {
      "type": "object",
      "required": ["name"],
      "properties": {
        "name": {"type": "string"},
        "email": {"type": "string", "format": "email"},
        "url": {"type": "string", "format": "uri"}
      }
    },
    "description": {"type": "string"},
    "homepage": {"type": "string", "format": "uri"},
    "repository": {"type": "string", "format": "uri"},
    "license": {"type": "string"},
    "strict": {"type": "boolean"},
    "plugins": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["name", "source"],
        "properties": {
          "name": {"type": "string"},
          "source": {
            "oneOf": [
              {"type": "string"},
              {
                "type": "object",
                "required": ["source"],
                "properties": {
                  "source": {"enum": ["github", "git", "directory"]},
                  "repo": {"type": "string"},
                  "url": {"type": "string"},
                  "path": {"type": "string"},
                  "ref": {"type": "string"}
                }
              }
            ]
          },
          "description": {"type": "string"}
        }
      }
    }
  }
}
```

### 字段详解

#### name (必需)
- **类型**: string
- **格式**: kebab-case (小写字母、数字、连字符)
- **示例**: `"company-plugins"`, `"devops-tools"`
- **说明**: 市场的唯一标识符,用于引用插件时的命名空间

#### version (可选)
- **类型**: string
- **格式**: 语义化版本 (MAJOR.MINOR.PATCH)
- **示例**: `"1.0.0"`, `"2.3.1"`
- **说明**: 市场的版本号

#### owner (必需)
- **类型**: object
- **必需字段**:
  - `name` (string): 所有者名称
- **可选字段**:
  - `email` (string): 邮箱地址
  - `url` (string): 网站 URL
- **示例**:
```json
{
  "name": "DevOps Team",
  "email": "devops@company.com",
  "url": "https://company.com/devops"
}
```

#### plugins (必需)
- **类型**: array
- **项目类型**: Plugin Source Object
- **说明**: 市场包含的插件列表

**Plugin Source Object**:
```json
{
  "name": "plugin-name",
  "source": "本地路径或源对象",
  "description": "插件描述"
}
```

**source 字段类型**:

**1. 本地路径** (string):
```json
"source": "./plugins/my-plugin"
```

**2. GitHub 仓库** (object):
```json
"source": {
  "source": "github",
  "repo": "organization/repository",
  "ref": "main"  // 可选
}
```

**3. Git URL** (object):
```json
"source": {
  "source": "git",
  "url": "https://git.example.com/repo.git",
  "ref": "v1.0.0"  // 可选
}
```

**4. 本地目录** (object, 开发用):
```json
"source": {
  "source": "directory",
  "path": "../local-plugin"
}
```

## plugin.json Schema

### 完整 Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["name"],
  "properties": {
    "name": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$"
    },
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$"
    },
    "description": {"type": "string"},
    "author": {
      "type": "object",
      "properties": {
        "name": {"type": "string"},
        "email": {"type": "string"},
        "url": {"type": "string"}
      }
    },
    "homepage": {"type": "string"},
    "repository": {"type": "string"},
    "license": {"type": "string"},
    "keywords": {
      "type": "array",
      "items": {"type": "string"}
    },
    "commands": {
      "oneOf": [
        {"type": "string"},
        {"type": "array", "items": {"type": "string"}}
      ]
    },
    "agents": {
      "oneOf": [
        {"type": "string"},
        {"type": "array", "items": {"type": "string"}}
      ]
    },
    "hooks": {
      "oneOf": [
        {"type": "string"},
        {"$ref": "#/definitions/hooksConfig"}
      ]
    },
    "mcpServers": {
      "oneOf": [
        {"type": "string"},
        {"$ref": "#/definitions/mcpConfig"}
      ]
    }
  }
}
```

### 字段详解

#### name (必需)
- **类型**: string
- **格式**: kebab-case
- **示例**: `"deployment-tools"`
- **说明**: 插件唯一标识符

#### version (推荐)
- **类型**: string
- **格式**: MAJOR.MINOR.PATCH
- **示例**: `"2.1.0"`
- **说明**: 遵循语义化版本规范

#### author (推荐)
- **类型**: object
- **字段**:
  - `name`: 作者名称
  - `email`: 联系邮箱
  - `url`: 个人/团队网站

#### commands (可选)
- **类型**: string | array
- **说明**: 自定义命令文件/目录路径
- **示例**:
```json
"commands": "./custom/deploy.md"
```
或
```json
"commands": [
  "./custom/deploy.md",
  "./custom/rollback.md"
]
```

#### agents (可选)
- **类型**: string | array
- **说明**: 自定义代理文件路径
- **示例**: `"./specialized-agents/"`

#### hooks (可选)
- **类型**: string | object
- **说明**: Hook 配置文件路径或内联配置
- **示例**: 见 Hooks Schema 部分

#### mcpServers (可选)
- **类型**: string | object
- **说明**: MCP 配置文件路径或内联配置
- **示例**: 见 MCP Servers Schema 部分

## hooks.json Schema

### 完整 Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "hooks": {
      "type": "object",
      "properties": {
        "PreToolUse": {"$ref": "#/definitions/hookArray"},
        "PostToolUse": {"$ref": "#/definitions/hookArray"},
        "UserPromptSubmit": {"$ref": "#/definitions/hookArray"},
        "Notification": {"$ref": "#/definitions/hookArray"},
        "Stop": {"$ref": "#/definitions/hookArray"},
        "SubagentStop": {"$ref": "#/definitions/hookArray"},
        "SessionStart": {"$ref": "#/definitions/hookArray"},
        "SessionEnd": {"$ref": "#/definitions/hookArray"},
        "PreCompact": {"$ref": "#/definitions/hookArray"}
      }
    }
  },
  "definitions": {
    "hookArray": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "matcher": {"type": "string"},
          "hooks": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["type"],
              "properties": {
                "type": {"enum": ["command", "validation", "notification"]},
                "command": {"type": "string"},
                "message": {"type": "string"}
              }
            }
          }
        }
      }
    }
  }
}
```

### 事件类型

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

### Matcher 模式

**工具名称匹配**:
- 单个工具: `"Write"`
- 多个工具: `"Write|Edit|Bash"`
- 所有工具: `"*"` 或省略 matcher

**Bash 命令匹配** (前缀匹配):
- `"Bash(git:*)"` - 匹配所有 git 命令
- `"Bash(npm run:*)"` - 匹配 npm run 命令
- `"Bash(git push:*)"` - 匹配 git push

### Hook 类型

#### command
执行 shell 命令:
```json
{
  "type": "command",
  "command": "${CLAUDE_PLUGIN_ROOT}/scripts/format.sh"
}
```

#### validation
验证操作(失败会阻止操作):
```json
{
  "type": "validation",
  "command": "${CLAUDE_PLUGIN_ROOT}/scripts/validate.sh"
}
```

#### notification
发送通知:
```json
{
  "type": "notification",
  "message": "操作完成"
}
```

### 完整示例

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
            "type": "validation",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/pre-push-check.sh"
          }
        ]
      }
    ],
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
}
```

## .mcp.json Schema

### 完整 Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "mcpServers": {
      "type": "object",
      "additionalProperties": {
        "type": "object",
        "required": ["command"],
        "properties": {
          "command": {"type": "string"},
          "args": {
            "type": "array",
            "items": {"type": "string"}
          },
          "env": {
            "type": "object",
            "additionalProperties": {"type": "string"}
          },
          "cwd": {"type": "string"}
        }
      }
    }
  }
}
```

### 字段说明

#### mcpServers
- **类型**: object
- **键**: 服务器名称
- **值**: 服务器配置对象

#### Server Configuration Object

**command** (必需):
- **类型**: string
- **说明**: 可执行文件路径或命令
- **示例**: `"node"`, `"python"`, `"${CLAUDE_PLUGIN_ROOT}/server"`

**args** (可选):
- **类型**: array of strings
- **说明**: 命令行参数
- **示例**: `["server.js", "--port", "3000"]`

**env** (可选):
- **类型**: object
- **说明**: 环境变量键值对
- **示例**:
```json
{
  "API_KEY": "xxx",
  "DB_PATH": "${CLAUDE_PLUGIN_ROOT}/data"
}
```

**cwd** (可选):
- **类型**: string
- **说明**: 工作目录
- **示例**: `"${CLAUDE_PLUGIN_ROOT}/server"`

### 示例

```json
{
  "mcpServers": {
    "database-server": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/db-server",
      "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"],
      "env": {
        "DB_PATH": "${CLAUDE_PLUGIN_ROOT}/data",
        "LOG_LEVEL": "info"
      }
    },
    "api-client": {
      "command": "npx",
      "args": ["@company/mcp-server", "--plugin-mode"],
      "cwd": "${CLAUDE_PLUGIN_ROOT}"
    },
    "python-service": {
      "command": "python",
      "args": ["${CLAUDE_PLUGIN_ROOT}/server.py"],
      "env": {
        "PYTHONPATH": "${CLAUDE_PLUGIN_ROOT}/lib"
      }
    }
  }
}
```

## Command Frontmatter Schema

### Markdown 命令格式

```markdown
---
description: 命令的简短描述
---

# 命令标题

命令提示词内容
```

### Frontmatter 字段

#### description (推荐)
- **类型**: string
- **说明**: 在 `/help` 中显示的命令描述
- **示例**: `"部署应用到生产环境"`
- **建议长度**: < 80 字符

### 完整示例

```markdown
---
description: 部署应用到指定环境
---

# Deploy Application

部署应用到 $ARGUMENTS 环境:

1. 验证构建版本
2. 运行预部署检查
3. 执行部署
4. 验证部署成功
5. 通知相关人员

使用方法: `/deploy production`
```

## Agent Frontmatter Schema

### Markdown 代理格式

```markdown
---
description: 代理的用途说明
capabilities: ["capability1", "capability2"]
---

# Agent 名称

代理详细描述
```

### Frontmatter 字段

#### description (推荐)
- **类型**: string
- **说明**: 代理的简短说明,帮助 Claude 选择合适的代理
- **示例**: `"审查代码安全性并识别漏洞"`

#### capabilities (可选)
- **类型**: array of strings
- **说明**: 代理的专业能力列表
- **示例**: `["security-audit", "code-review", "vulnerability-scan"]`

### 完整示例

```markdown
---
description: 专业的安全审查代理,识别代码中的安全漏洞
capabilities: ["security-audit", "vulnerability-detection", "compliance-check"]
---

# Security Reviewer

专门审查代码中的安全问题,包括:

## 能力范围
- SQL 注入检测
- XSS 漏洞识别
- 身份验证问题
- 敏感数据暴露
- 依赖项安全

## 工作流程
1. 分析代码结构
2. 识别潜在风险点
3. 评估严重程度
4. 提供修复建议
```

## 环境变量

### ${CLAUDE_PLUGIN_ROOT}

**说明**: 插件根目录的绝对路径

**使用场景**:
- Hook 脚本路径
- MCP 服务器路径
- 配置文件路径
- 数据目录路径

**示例**:
```json
{
  "command": "${CLAUDE_PLUGIN_ROOT}/scripts/deploy.sh",
  "env": {
    "CONFIG": "${CLAUDE_PLUGIN_ROOT}/config.json",
    "DATA_DIR": "${CLAUDE_PLUGIN_ROOT}/data"
  }
}
```

**解析时机**: 插件加载时自动替换为实际路径

## 验证工具

### JSON Schema 验证

使用 `ajv-cli` 验证配置:

```bash
npm install -g ajv-cli

# 验证 marketplace.json
ajv validate -s marketplace-schema.json -d .claude-plugin/marketplace.json

# 验证 plugin.json
ajv validate -s plugin-schema.json -d plugins/*/.claude-plugin/plugin.json
```

### jq 快速验证

```bash
# 验证语法
jq empty file.json

# 检查必需字段
jq '.name, .owner.name, .plugins' .claude-plugin/marketplace.json

# 格式化输出
jq . file.json
```

## 下一步

- 📚 查看 [插件开发指南](./plugin-development.md) 了解组件开发
- ⚙️ 阅读 [市场配置指南](./marketplace-configuration.md) 了解配置详情
- ❓ 参考 [常见问题](./faq.md) 解决配置问题
