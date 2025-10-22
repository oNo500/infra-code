# 贡献指南

欢迎为 Claude Code 插件市场做出贡献!本指南将帮助你了解如何参与项目开发。

## 行为准则

### 我们的承诺

为了营造开放和友好的环境,我们承诺:

- 使用包容性语言
- 尊重不同观点和经验
- 优雅地接受建设性批评
- 关注对社区最有利的事情
- 对其他社区成员保持同理心

### 我们的标准

**积极行为示例**:
- 友好和耐心
- 欢迎新贡献者
- 专注于对项目最有利的事情
- 尊重不同的意见

**不可接受的行为**:
- 使用性化语言或图像
- 人身攻击或政治攻击
- 公开或私下的骚扰
- 未经许可发布他人的私人信息

## 如何贡献

### 报告 Bug

发现 bug 时,请[创建 Issue](../../issues/new) 并提供以下信息:

**Bug 报告模板**:
```markdown
### Bug 描述
简短清晰地描述 bug

### 重现步骤
1. 执行 '...'
2. 使用 '...'
3. 查看 '...'
4. 看到错误

### 期望行为
描述你期望发生什么

### 实际行为
描述实际发生了什么

### 环境信息
- OS: [e.g., macOS 13.0, Ubuntu 22.04]
- Claude Code 版本: [e.g., 1.2.3]
- 插件名称和版本: [e.g., deploy-tools@1.0.0]

### 配置文件
```json
// 相关的配置(去除敏感信息)
```

### 错误日志
```
粘贴相关的错误消息或日志
```

### 额外信息
任何其他有助于解决问题的信息
```

### 提出功能建议

想要新功能?请[创建功能请求 Issue](../../issues/new):

**功能请求模板**:
```markdown
### 功能描述
清晰简洁地描述你想要的功能

### 问题背景
你想解决什么问题?

### 期望解决方案
描述你期望的实现方式

### 备选方案
描述你考虑过的其他方法

### 使用场景
谁会使用这个功能?如何使用?

### 额外信息
mockups、截图、示例代码等
```

### 提交代码

#### 开发设置

1. **Fork 仓库**
```bash
# 在 GitHub 上 Fork 仓库
# 然后克隆你的 fork
git clone https://github.com/your-username/code-infra.git
cd code-infra
```

2. **添加上游远程**
```bash
git remote add upstream https://github.com/original-org/code-infra.git
git remote -v
```

3. **创建开发分支**
```bash
git checkout -b feature/my-new-feature
# 或
git checkout -b fix/issue-123
```

#### 开发流程

1. **确保最新代码**
```bash
git fetch upstream
git rebase upstream/main
```

2. **进行修改**
```bash
# 编辑文件
# 测试修改
```

3. **遵循代码规范**
   - 使用 kebab-case 命名文件和目录
   - JSON 文件使用 2 空格缩进
   - Markdown 文件使用清晰的标题层级
   - 脚本使用合适的 shebang

4. **测试修改**
```bash
# 验证 JSON 语法
find . -name "*.json" -exec jq empty {} \;

# 测试插件
claude
/plugin marketplace add .
/plugin install plugin-name@local

# 测试组件
/command-name
/agents
# 等等
```

5. **提交修改**
```bash
git add .
git commit -m "type(scope): description"
```

**提交消息规范** (遵循 [Conventional Commits](https://www.conventionalcommits.org/)):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type**:
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档变更
- `style`: 格式调整(不影响代码含义)
- `refactor`: 重构(不是新功能或 bug 修复)
- `test`: 添加或修改测试
- `chore`: 构建过程或辅助工具的变动

**示例**:
```
feat(deployment): add canary deployment command

Add /deploy-canary command for gradual rollout deployments.
Includes validation and rollback support.

Closes #123
```

#### Pull Request 流程

1. **推送分支**
```bash
git push origin feature/my-new-feature
```

2. **创建 Pull Request**
   - 访问 GitHub 仓库
   - 点击 "New Pull Request"
   - 选择你的分支
   - 填写 PR 模板

**Pull Request 模板**:
```markdown
## 变更描述
简要描述此 PR 的目的

## 变更类型
- [ ] Bug 修复
- [ ] 新功能
- [ ] 文档更新
- [ ] 重构
- [ ] 其他(请说明):

## 测试完成
- [ ] 本地测试通过
- [ ] 添加了新的测试(如适用)
- [ ] 所有测试通过
- [ ] 文档已更新

## 相关 Issue
Fixes #123
Related to #456

## 截图(如适用)
添加相关截图

## 检查清单
- [ ] 代码遵循项目规范
- [ ] 自审代码
- [ ] 添加了必要的注释
- [ ] 更新了文档
- [ ] 没有新的警告
- [ ] 添加了测试证明修复有效或功能正常
- [ ] 新旧测试都通过
- [ ] 任何依赖变更已被合并和发布
```

3. **等待审查**
   - 维护者会审查你的代码
   - 可能会要求修改
   - 讨论和解决反馈

4. **合并**
   - 审查通过后会合并到主分支
   - 你的贡献会出现在下一个版本中

## 代码规范

### 目录结构

```
plugins/plugin-name/
├── .claude-plugin/
│   └── plugin.json          # 使用 2 空格缩进
├── commands/                 # kebab-case 命名
│   └── command-name.md
├── agents/
│   └── agent-name.md
├── skills/
│   └── skill-name/
│       └── SKILL.md
├── hooks/
│   └── hooks.json
├── scripts/                  # 使用合适的扩展名
│   ├── deploy.sh
│   └── validate.py
├── .mcp.json
├── README.md
└── CHANGELOG.md
```

### JSON 格式

```json
{
  "name": "plugin-name",
  "version": "1.0.0",
  "description": "简短描述",
  "author": {
    "name": "Author Name"
  }
}
```

**规则**:
- 2 空格缩进
- 双引号
- 最后一个属性后无逗号
- 使用 kebab-case 命名

### Markdown 格式

```markdown
# 主标题(H1) - 每个文件只有一个

简短介绍段落。

## 二级标题(H2)

内容...

### 三级标题(H3)

内容...

## 代码块

使用语法高亮:

```bash
echo "示例"
```

## 列表

- 项目 1
- 项目 2
  - 子项目
```

### 脚本规范

**Bash 脚本**:
```bash
#!/bin/bash
set -euo pipefail

# 函数说明
function main() {
    local arg1="$1"

    # 验证输入
    if [ -z "$arg1" ]; then
        echo "Error: Missing argument" >&2
        return 1
    fi

    # 主逻辑
    echo "Processing: $arg1"
}

main "$@"
```

**Python 脚本**:
```python
#!/usr/bin/env python3
"""
脚本简短描述
"""

import sys
from pathlib import Path


def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("Error: Missing argument", file=sys.stderr)
        return 1

    # 主逻辑
    print(f"Processing: {sys.argv[1]}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
```

## 文档规范

### README.md 结构

每个插件应该包含 README.md:

```markdown
# 插件名称

简短描述(1-2 句话)

## 功能

- 功能 1
- 功能 2
- 功能 3

## 安装

```bash
/plugin marketplace add source
/plugin install plugin-name@marketplace
```

## 使用

### 命令

**`/command-name`**
命令描述和用法示例

### 代理

**`agent-name`**
代理描述和使用场景

### Hooks

描述插件提供的 hooks

## 配置

```json
{
  "示例配置": "值"
}
```

## 示例

提供实际使用示例

## 故障排查

常见问题和解决方案

## 贡献

链接到贡献指南

## 许可证

许可证信息
```

### CHANGELOG.md 格式

遵循 [Keep a Changelog](https://keepachangelog.com/):

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- 计划中的新功能

## [1.1.0] - 2024-01-15

### Added
- 新功能描述

### Changed
- 修改描述

### Deprecated
- 即将废弃的功能

### Removed
- 移除的功能

### Fixed
- Bug 修复

### Security
- 安全修复

## [1.0.0] - 2024-01-01

### Added
- 初始发布
```

## 发布流程

### 版本号规范

遵循[语义化版本](https://semver.org/):

- **MAJOR** (主版本): 不兼容的 API 修改
- **MINOR** (次版本): 向下兼容的功能新增
- **PATCH** (修订版本): 向下兼容的 bug 修复

### 发布检查清单

发布前确保:

- [ ] 所有测试通过
- [ ] 文档已更新
- [ ] CHANGELOG.md 已更新
- [ ] 版本号已更新
- [ ] 破坏性变更已记录
- [ ] 迁移指南已提供(如适用)
- [ ] 已在多个环境测试

### 发布步骤

```bash
# 1. 确保在最新的 main 分支
git checkout main
git pull upstream main

# 2. 创建发布分支
git checkout -b release/v1.1.0

# 3. 更新版本号
# 编辑 plugin.json
{
  "version": "1.1.0"
}

# 4. 更新 CHANGELOG.md
# 将 [Unreleased] 内容移到新版本下

# 5. 提交
git add .
git commit -m "chore: bump version to 1.1.0"

# 6. 创建标签
git tag -a v1.1.0 -m "Release version 1.1.0"

# 7. 推送
git push origin release/v1.1.0
git push origin v1.1.0

# 8. 创建 Pull Request 到 main

# 9. 合并后,创建 GitHub Release
gh release create v1.1.0 \
  --title "v1.1.0: Feature Update" \
  --notes-file CHANGELOG.md
```

## 审查流程

### 成为审查者

审查者应该:
- 熟悉项目代码和规范
- 有时间及时审查 PR
- 能够提供建设性反馈
- 尊重贡献者

### 审查清单

**代码质量**:
- [ ] 代码清晰易读
- [ ] 遵循项目规范
- [ ] 没有明显的 bug
- [ ] 错误处理恰当

**功能**:
- [ ] 实现了预期功能
- [ ] 没有破坏现有功能
- [ ] 边界情况已处理

**测试**:
- [ ] 有适当的测试
- [ ] 测试覆盖关键路径
- [ ] 测试可以重复运行

**文档**:
- [ ] README 已更新
- [ ] CHANGELOG 已更新
- [ ] 代码注释充分

**安全**:
- [ ] 没有硬编码密钥
- [ ] 输入验证充分
- [ ] 权限范围合理

### 审查反馈

**好的反馈**:
```markdown
建议: 这里可以使用 ${CLAUDE_PLUGIN_ROOT} 变量来使路径更灵活

原因: 这样插件可以在不同位置安装时仍然正常工作

示例:
```json
{
  "command": "${CLAUDE_PLUGIN_ROOT}/scripts/deploy.sh"
}
```
```

**避免的反馈**:
```markdown
❌ 这个代码写得不好
✅ 建议重构这段代码以提高可读性,例如提取为单独的函数
```

## 社区

### 沟通渠道

- **GitHub Issues**: Bug 报告和功能请求
- **GitHub Discussions**: 一般讨论和问题
- **Pull Requests**: 代码审查和讨论
- **Slack/Teams**: 实时沟通(如果有)

### 获取帮助

需要帮助?可以:
1. 查看[常见问题](./faq.md)
2. 搜索现有的 Issues
3. 创建新的 Issue
4. 在讨论区提问

## 致谢

感谢所有贡献者对项目的贡献!

贡献者列表会在 README.md 中维护。

## 许可证

通过贡献代码,你同意你的贡献将使用与项目相同的许可证。

## 问题?

有任何问题,请随时:
- 创建 Issue
- 联系维护者
- 在讨论区提问

感谢你的贡献! 🎉
