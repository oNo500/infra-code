# 团队协作规范

本指南介绍如何在团队环境中有效地使用和管理 Claude Code 插件市场。

## 团队级配置管理

### 项目级配置

**位置**: `.claude/settings.json` (提交到版本控制)

这个文件定义团队共享的配置,所有团队成员都会使用:

```json
{
  "extraKnownMarketplaces": {
    "company-tools": {
      "source": {
        "source": "github",
        "repo": "company/claude-plugins"
      }
    }
  },
  "enabledPlugins": {
    "deployment-tools@company-tools": true,
    "code-formatter@company-tools": true,
    "security-scanner@company-tools": false
  },
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)",
      "WebFetch"
    ],
    "allow": [
      "Bash(npm run test:*)",
      "Bash(npm run lint)"
    ]
  }
}
```

### 个人级配置

**位置**: `.claude/settings.local.json` (不提交到版本控制)

这个文件用于个人偏好设置,会覆盖项目级配置:

```json
{
  "enabledPlugins": {
    "experimental-features@personal": true,
    "security-scanner@company-tools": true  // 覆盖项目设置
  },
  "permissions": {
    "allow": [
      "Read(~/.zshrc)"  // 个人特定权限
    ]
  }
}
```

### 配置自动生效流程

1. **团队成员克隆仓库**
```bash
git clone https://github.com/company/project.git
cd project
```

2. **信任文件夹**
   - Claude Code 会询问是否信任此文件夹
   - 选择"信任"后,会读取 `.claude/settings.json`

3. **安装市场和插件**
   - 自动提示安装 `extraKnownMarketplaces` 中的市场
   - 提示安装 `enabledPlugins` 中的插件
   - 用户可以选择跳过不需要的插件

4. **配置生效**
   - 项目级权限规则自动应用
   - 团队插件自动可用

### Git 忽略配置

**推荐的 `.gitignore` 配置**:

```gitignore
# Claude Code
.claude/settings.local.json
.claude/history/
.claude/cache/

# 不要忽略这些
# .claude/settings.json       # 团队配置
# .claude/agents/             # 项目级代理
# .claude/commands/           # 项目级命令
```

Claude Code 会自动配置 git 忽略 `settings.local.json`。

## 插件市场管理

### 市场组织结构

**推荐的仓库结构**:

```
claude-plugins/
├── .claude-plugin/
│   └── marketplace.json
├── .github/
│   └── workflows/
│       ├── validate.yml
│       └── release.yml
├── plugins/
│   ├── deployment-tools/
│   ├── code-formatter/
│   └── security-scanner/
├── docs/
│   ├── plugin-catalog.md
│   └── usage-guide.md
└── README.md
```

### 市场访问控制

**公开市场** (GitHub public repo):
```json
{
  "extraKnownMarketplaces": {
    "public-tools": {
      "source": {
        "source": "github",
        "repo": "organization/public-plugins"
      }
    }
  }
}
```

**私有市场** (GitHub private repo):
```json
{
  "extraKnownMarketplaces": {
    "internal-tools": {
      "source": {
        "source": "github",
        "repo": "company/internal-plugins"
      }
    }
  }
}
```

团队成员需要有仓库访问权限才能安装私有市场的插件。

**企业 Git 服务器**:
```json
{
  "extraKnownMarketplaces": {
    "enterprise-tools": {
      "source": {
        "source": "git",
        "url": "https://git.company.com/devops/claude-plugins.git"
      }
    }
  }
}
```

### 版本固定策略

**开发环境** (使用最新版):
```json
{
  "plugins": [
    {
      "name": "dev-tools",
      "source": {
        "source": "github",
        "repo": "company/dev-tools",
        "ref": "main"  // 跟踪主分支
      }
    }
  ]
}
```

**生产环境** (使用固定版本):
```json
{
  "plugins": [
    {
      "name": "deployment-tools",
      "source": {
        "source": "github",
        "repo": "company/deployment-tools",
        "ref": "v2.1.0"  // 固定版本标签
      }
    }
  ]
}
```

## 权限管理

### 团队安全策略

**基础安全配置** (`.claude/settings.json`):

```json
{
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./config/secrets.json)",
      "Read(./build/credentials/**)",
      "WebFetch",
      "Bash(curl:*)",
      "Bash(wget:*)",
      "Bash(rm -rf:*)"
    ],
    "ask": [
      "Bash(git push:*)",
      "Bash(npm publish:*)",
      "Write(./src/**/*.ts)"
    ],
    "allow": [
      "Bash(npm run test:*)",
      "Bash(npm run lint)",
      "Bash(git status)",
      "Bash(git diff:*)",
      "Read(**/*.{ts,js,json,md})"
    ]
  }
}
```

### 分层权限策略

**1. 企业级策略** (管理员配置):

位置: `/etc/claude-code/managed-settings.json` (Linux/WSL)

```json
{
  "permissions": {
    "deny": [
      "WebFetch",
      "Bash(curl:*)",
      "Read(/etc/**)",
      "Read(~/.ssh/**)"
    ],
    "disableBypassPermissionsMode": "disable"
  }
}
```

**2. 项目级策略** (团队配置):

位置: `.claude/settings.json`

```json
{
  "permissions": {
    "deny": [
      "Read(./.env*)",
      "Read(./secrets/**)"
    ],
    "allow": [
      "Bash(npm run test:*)"
    ]
  }
}
```

**3. 个人级策略** (开发者配置):

位置: `.claude/settings.local.json`

```json
{
  "permissions": {
    "allow": [
      "Read(~/.bashrc)"
    ]
  }
}
```

优先级: 企业级 > 项目级 > 个人级

### 敏感文件保护

**统一配置**:

```json
{
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./config/production.json)",
      "Read(./build/credentials/**)",
      "Read(./**/secrets/**)",
      "Read(./**/*secret*)",
      "Read(./**/*credential*)",
      "Read(./**/*password*)",
      "Read(.aws/**)",
      "Read(.ssh/**)"
    ]
  }
}
```

## 插件贡献流程

### 提议新插件

1. **创建 Issue**
```markdown
## 插件提议

**插件名称**: deployment-automation

**用途**: 自动化应用部署流程

**包含组件**:
- Commands: /deploy, /rollback
- Agents: deployment-agent
- Hooks: pre-deploy validation

**受益团队**: DevOps, Backend

**优先级**: High
```

2. **讨论和批准**
   - 团队成员评论和讨论
   - 技术负责人审批
   - 分配开发人员

### 开发工作流

```bash
# 1. 创建功能分支
git checkout -b feature/deployment-automation

# 2. 创建插件目录
mkdir -p plugins/deployment-automation/.claude-plugin
mkdir -p plugins/deployment-automation/{commands,agents,scripts}

# 3. 开发插件
# (创建必要的文件)

# 4. 本地测试
claude
/plugin marketplace add .
/plugin install deployment-automation@local

# 5. 提交代码
git add plugins/deployment-automation/
git commit -m "feat: add deployment automation plugin"

# 6. 创建 Pull Request
git push origin feature/deployment-automation
gh pr create --title "Add deployment automation plugin"
```

### Code Review 清单

**审查者检查**:

- [ ] **配置文件**
  - [ ] plugin.json 格式正确
  - [ ] 版本号符合语义化版本
  - [ ] 描述清晰准确

- [ ] **代码质量**
  - [ ] 命令描述清晰
  - [ ] 代理定义明确
  - [ ] 脚本有错误处理
  - [ ] 使用 `${CLAUDE_PLUGIN_ROOT}`

- [ ] **文档**
  - [ ] README.md 完整
  - [ ] 使用示例清晰
  - [ ] CHANGELOG.md 已更新

- [ ] **测试**
  - [ ] 本地测试通过
  - [ ] 无冲突或破坏性变更
  - [ ] 性能可接受

- [ ] **安全**
  - [ ] 无硬编码密钥或凭证
  - [ ] 权限范围合理
  - [ ] 脚本安全审查

### 批准和合并

```bash
# 审查者批准后
git checkout main
git merge feature/deployment-automation

# 更新 marketplace.json
# 编辑 .claude-plugin/marketplace.json

git add .claude-plugin/marketplace.json
git commit -m "chore: add deployment-automation to marketplace"

# 打标签发布
git tag v1.1.0
git push origin main
git push origin v1.1.0
```

## 插件维护

### 责任分配

**推荐的 CODEOWNERS 文件**:

```
# .github/CODEOWNERS

# 默认所有者
* @devops-team

# 特定插件所有者
/plugins/deployment-tools/ @alice @bob
/plugins/security-scanner/ @security-team
/plugins/code-formatter/ @frontend-team

# 市场配置
/.claude-plugin/ @tech-lead
```

### 更新策略

**定期维护**:
- 每月审查过时插件
- 季度性能评估
- 及时更新依赖

**沟通渠道**:
```markdown
## 插件更新通知

**日期**: 2024-01-15
**插件**: deployment-tools
**版本**: v2.0.0 → v2.1.0

**变更**:
- 新增 /deploy-canary 命令
- 改进错误处理
- 性能优化

**行动**:
请更新到最新版本: `/plugin install deployment-tools@company`

**文档**: https://docs.company.com/deployment-tools/v2.1.0
```

### 弃用流程

1. **公告弃用** (提前 1 个月)
```json
{
  "name": "old-plugin",
  "version": "3.0.0",
  "description": "⚠️ DEPRECATED: 请迁移到 new-plugin",
  "deprecated": true,
  "replacedBy": "new-plugin"
}
```

2. **提供迁移指南**
```markdown
# 迁移指南: old-plugin → new-plugin

## 命令映射
- `/old-command` → `/new-command`
- `/old-deploy` → `/deploy --mode=legacy`

## 配置变更
旧配置:
```json
{"option": "value"}
```

新配置:
```json
{"newOption": "value"}
```

## 时间表
- 2024-01-15: 弃用公告
- 2024-02-15: 移除支持
```

3. **最终移除**
```bash
# 从市场移除
# 编辑 marketplace.json,删除插件条目

git commit -m "chore: remove deprecated old-plugin"
git tag v2.0.0
git push origin main v2.0.0
```

## 沟通和文档

### 内部文档

**必需文档**:
1. **插件目录** (catalog.md)
   - 所有可用插件列表
   - 每个插件的用途和所有者
   - 安装和使用说明

2. **使用指南** (usage-guide.md)
   - 快速开始教程
   - 常用工作流示例
   - 故障排查

3. **贡献指南** (contributing.md)
   - 如何提议新插件
   - 开发规范
   - 审查流程

### 团队培训

**新成员入职**:
```markdown
# Claude Code 插件使用指南

## 第一次设置 (5分钟)

1. 克隆项目仓库
2. 启动 Claude Code: `claude`
3. 信任文件夹(接受提示)
4. 安装团队插件(接受提示)

## 常用命令

- `/help` - 查看所有可用命令
- `/deploy` - 部署应用
- `/security-scan` - 运行安全扫描

## 获取帮助

- 文档: https://docs.company.com/claude-plugins
- Slack: #claude-code-help
- 负责人: @tech-lead
```

### 变更通知

**Slack/Teams 通知模板**:
```markdown
📢 **Claude Code 插件更新**

🔧 **插件**: deployment-tools
📦 **版本**: v2.1.0
📅 **日期**: 2024-01-15

✨ **新功能**:
- 新增金丝雀部署支持
- 添加自动回滚功能

🐛 **Bug 修复**:
- 修复部署超时问题

📚 **文档**: [查看详情](https://docs.company.com/...)

⚡ **行动**: 运行 `/plugin install deployment-tools@company` 更新
```

## 最佳实践

### 团队规范

1. **统一配置管理**
   - 使用 `.claude/settings.json` 定义团队标准
   - 个人偏好使用 `.claude/settings.local.json`
   - 记录配置变更原因

2. **版本控制**
   - 所有插件使用语义化版本
   - 生产环境固定版本号
   - 开发环境可跟踪最新版

3. **权限管理**
   - 最小权限原则
   - 定期审查权限配置
   - 文档化敏感操作

4. **文档维护**
   - 保持文档与代码同步
   - 提供清晰的示例
   - 及时更新变更日志

5. **沟通协作**
   - 使用 Issue 跟踪需求
   - PR 审查确保质量
   - 及时通知重大变更

### 常见陷阱

❌ **避免**:
- 硬编码路径和凭证
- 跳过测试直接发布
- 没有文档的变更
- 长期功能分支
- 未通知的破坏性变更

✅ **推荐**:
- 使用环境变量和配置
- 完整的测试和审查
- 详细的变更文档
- 频繁小量提交
- 提前沟通重大变更

## 下一步

- 📚 查看 [API 参考](./api-reference.md) 了解配置 schema
- ❓ 参考 [常见问题](./faq.md) 解决团队问题
- 🤝 阅读 [贡献指南](./contributing.md) 了解贡献流程
