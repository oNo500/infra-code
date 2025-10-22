# 测试和发布流程

本指南介绍插件测试、版本发布和质量保证的最佳实践。

## 本地测试工作流

### 开发迭代循环

```bash
# 1. 修改插件代码
# (编辑 commands/, agents/, hooks/ 等)

# 2. 卸载当前版本
claude
/plugin uninstall plugin-name@marketplace-name

# 3. 重新安装更新后的插件
/plugin install plugin-name@marketplace-name

# 4. 测试功能
/command-name              # 测试命令
/agents                    # 验证代理注册
# 执行触发 hooks 的操作    # 测试钩子

# 5. 重复步骤 1-4 直到满意
```

### 快速测试技巧

**使用别名简化流程:**

```bash
# 在 ~/.bashrc 或 ~/.zshrc 中添加
alias plugin-reload='claude -p "/plugin uninstall my-plugin@dev && /plugin install my-plugin@dev"'
```

**使用 debug 模式:**

```bash
# 启动 debug 模式查看详细信息
claude --debug

# 查看:
# - 插件加载状态
# - 配置解析结果
# - 组件注册信息
# - MCP 服务器启动日志
```

## 测试清单

### Commands 测试

- [ ] 命令在 `/help` 中正确显示
- [ ] 命令描述清晰准确
- [ ] 命令执行符合预期
- [ ] `$ARGUMENTS` 参数正确替换
- [ ] 多步骤命令逻辑正确
- [ ] 错误场景处理得当

**测试脚本示例:**

```bash
#!/bin/bash
# test-commands.sh

echo "测试命令可见性..."
claude -p "/help" | grep "my-command" || echo "❌ 命令未找到"

echo "测试命令执行..."
claude -p "/my-command test-arg" > output.txt
# 验证输出内容
grep "expected-result" output.txt && echo "✅ 命令测试通过"
```

### Agents 测试

- [ ] 代理在 `/agents` 中列出
- [ ] 代理描述准确反映功能
- [ ] Claude 能在适当场景自动调用
- [ ] 代理工具权限正确配置
- [ ] 代理输出符合预期

**测试场景:**

```bash
# 测试代理自动调用
claude -p "请审查这段代码的安全性"
# 预期: security-reviewer 代理被调用

# 测试手动调用
claude -p "使用 security-reviewer 代理分析代码"
# 预期: 指定的代理被使用
```

### Skills 测试

- [ ] SKILL.md 格式正确
- [ ] 描述清晰说明使用场景
- [ ] Claude 能自主识别并调用
- [ ] Skills 工具正常工作
- [ ] 辅助文件和脚本可访问

### Hooks 测试

- [ ] hooks.json 语法正确
- [ ] Matcher 模式正确匹配
- [ ] 脚本有执行权限
- [ ] 脚本执行成功
- [ ] Hook 返回值正确处理
- [ ] 错误场景不破坏流程

**测试方法:**

```bash
# 测试 PostToolUse hook
echo "test" > test.txt
# 预期触发格式化或验证脚本

# 检查 hook 脚本权限
ls -la plugins/my-plugin/scripts/
# 预期显示 -rwxr-xr-x

# 手动测试 hook 脚本
./plugins/my-plugin/scripts/format.sh
echo $?  # 预期返回 0 表示成功
```

### MCP Servers 测试

- [ ] .mcp.json 配置正确
- [ ] 服务器启动成功
- [ ] 工具在 Claude 中可用
- [ ] `${CLAUDE_PLUGIN_ROOT}` 正确解析
- [ ] 环境变量正确设置
- [ ] 服务器响应正常

**验证方法:**

```bash
# 检查 MCP 服务器状态
# 在 Claude Code 中:
# 如果配置正确,MCP 工具应该出现在可用工具列表中

# 测试 MCP 工具
claude -p "使用 [MCP工具名称] 完成任务"
```

## 配置验证

### JSON 语法检查

```bash
#!/bin/bash
# validate-json.sh

echo "验证 marketplace.json..."
jq empty .claude-plugin/marketplace.json 2>&1 && echo "✅ 语法正确" || echo "❌ 语法错误"

echo "验证 plugin.json..."
for file in plugins/*/.claude-plugin/plugin.json; do
    echo "检查: $file"
    jq empty "$file" 2>&1 && echo "✅ 语法正确" || echo "❌ 语法错误"
done

echo "验证 hooks.json..."
for file in plugins/*/hooks/hooks.json; do
    if [ -f "$file" ]; then
        echo "检查: $file"
        jq empty "$file" 2>&1 && echo "✅ 语法正确" || echo "❌ 语法错误"
    fi
done
```

### 目录结构检查

```bash
#!/bin/bash
# validate-structure.sh

check_plugin_structure() {
    local plugin_dir=$1
    local plugin_name=$(basename "$plugin_dir")

    echo "检查插件: $plugin_name"

    # 检查必需文件
    [ -f "$plugin_dir/.claude-plugin/plugin.json" ] && echo "✅ plugin.json 存在" || echo "❌ 缺少 plugin.json"

    # 检查组件目录位置
    if [ -d "$plugin_dir/commands" ]; then
        echo "✅ commands/ 在正确位置"
    fi

    if [ -d "$plugin_dir/.claude-plugin/commands" ]; then
        echo "⚠️  警告: commands/ 不应在 .claude-plugin/ 内"
    fi

    # 检查脚本权限
    if [ -d "$plugin_dir/scripts" ]; then
        for script in "$plugin_dir"/scripts/*; do
            if [ -f "$script" ] && [ ! -x "$script" ]; then
                echo "⚠️  脚本缺少执行权限: $(basename "$script")"
            fi
        done
    fi
}

# 检查所有插件
for plugin in plugins/*/; do
    check_plugin_structure "$plugin"
    echo "---"
done
```

## 版本发布流程

### 发布前检查清单

#### 1. 代码质量

- [ ] 所有功能已完成并测试
- [ ] 代码通过 lint 检查
- [ ] 无已知 bug
- [ ] 文档已更新

#### 2. 版本管理

- [ ] 更新 plugin.json 中的版本号
- [ ] 遵循语义化版本规范
- [ ] 更新 CHANGELOG.md

#### 3. 文档更新

- [ ] README.md 反映最新功能
- [ ] CHANGELOG.md 记录所有变更
- [ ] 示例代码是最新的
- [ ] API 文档已更新

#### 4. 测试验证

- [ ] 所有组件测试通过
- [ ] 在多个环境测试(如果适用)
- [ ] 破坏性变更已记录
- [ ] 迁移指南已提供(主版本升级)

### 版本号更新

**plugin.json:**

```json
{
  "name": "my-plugin",
  "version": "1.2.3"  // 更新此字段
}
```

**决定版本递增:**

```bash
# PATCH (1.2.3 → 1.2.4)
# - Bug 修复
# - 文档更新
# - 小的改进

# MINOR (1.2.4 → 1.3.0)
# - 新功能
# - 向下兼容的改进
# - 新的命令或代理

# MAJOR (1.3.0 → 2.0.0)
# - 破坏性变更
# - API 不兼容修改
# - 移除功能
```

### CHANGELOG.md 维护

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- 新功能描述

### Changed
- 修改的功能

### Deprecated
- 即将废弃的功能

### Removed
- 已移除的功能

### Fixed
- Bug 修复

### Security
- 安全相关修复

## [1.2.0] - 2024-01-15

### Added
- 添加了新的部署命令 `/deploy`
- 新增安全审查代理

### Changed
- 改进了钩子的错误处理
- 优化了 MCP 服务器性能

### Fixed
- 修复了命令参数解析问题
- 修复了路径处理 bug

## [1.1.0] - 2024-01-01

### Added
- 初始发布
- 基础命令集
- 核心代理功能
```

### Git 工作流

```bash
# 1. 创建发布分支
git checkout -b release/v1.2.0

# 2. 更新版本号
# 编辑 plugin.json, CHANGELOG.md

# 3. 提交更改
git add .
git commit -m "chore: bump version to 1.2.0"

# 4. 创建标签
git tag -a v1.2.0 -m "Release version 1.2.0"

# 5. 推送到远程
git push origin release/v1.2.0
git push origin v1.2.0

# 6. 合并到主分支
git checkout main
git merge release/v1.2.0
git push origin main
```

### GitHub Release

```bash
# 使用 GitHub CLI 创建 release
gh release create v1.2.0 \
  --title "v1.2.0: Feature Update" \
  --notes-file CHANGELOG.md \
  --target main

# 或手动在 GitHub 网页创建
# 1. 访问 repository → Releases
# 2. 点击 "Create a new release"
# 3. 选择标签 v1.2.0
# 4. 填写 release notes
# 5. 发布
```

## 持续集成 (CI)

### GitHub Actions 示例

创建 `.github/workflows/validate-plugin.yml`:

```yaml
name: Validate Plugin

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  validate:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Validate JSON syntax
        run: |
          # 安装 jq
          sudo apt-get update && sudo apt-get install -y jq

          # 验证所有 JSON 文件
          find . -name "*.json" -type f | while read file; do
            echo "Validating: $file"
            jq empty "$file" || exit 1
          done

      - name: Check directory structure
        run: |
          # 检查插件结构
          for plugin in plugins/*/; do
            if [ ! -f "$plugin/.claude-plugin/plugin.json" ]; then
              echo "Missing plugin.json in $plugin"
              exit 1
            fi
          done

      - name: Check script permissions
        run: |
          # 检查脚本执行权限
          find plugins/*/scripts -type f -name "*.sh" | while read script; do
            if [ ! -x "$script" ]; then
              echo "Script not executable: $script"
              exit 1
            fi
          done

      - name: Lint Markdown
        run: |
          npm install -g markdownlint-cli
          markdownlint 'docs/**/*.md' 'plugins/**/README.md'
```

### 自动化测试

```yaml
# .github/workflows/test-plugin.yml
name: Test Plugin

on: [pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Install Claude Code
        run: |
          # 安装 Claude Code (示例)
          curl -fsSL https://claude.ai/install.sh | sh

      - name: Test plugin installation
        run: |
          # 测试插件安装
          claude -p "/plugin marketplace add ."
          claude -p "/plugin install test-plugin@local"

      - name: Test commands
        run: |
          # 测试命令执行
          claude -p "/help" | grep "test-command"
```

## 回滚策略

### Git 标签回滚

```bash
# 查看历史版本
git tag -l

# 回滚到特定版本
git checkout v1.1.0

# 创建回滚分支
git checkout -b hotfix/rollback-v1.2.0

# 更新版本号到 1.2.1 (修复版本)
# 编辑 plugin.json

# 提交并发布
git commit -am "fix: rollback breaking changes from v1.2.0"
git tag v1.2.1
git push origin hotfix/rollback-v1.2.0
git push origin v1.2.1
```

### 市场配置回滚

```json
{
  "plugins": [
    {
      "name": "my-plugin",
      "source": {
        "source": "github",
        "repo": "org/plugin",
        "ref": "v1.1.0"  // 指向稳定版本
      }
    }
  ]
}
```

## 质量保证

### Code Review 要点

- [ ] 代码符合团队规范
- [ ] 命令描述清晰
- [ ] 没有硬编码路径(使用 `${CLAUDE_PLUGIN_ROOT}`)
- [ ] 脚本有适当的错误处理
- [ ] 文档完整且准确
- [ ] CHANGELOG 已更新

### 测试覆盖

建议测试:
1. **功能测试**: 所有组件正常工作
2. **集成测试**: 组件间交互正确
3. **回归测试**: 新变更未破坏现有功能
4. **兼容性测试**: 在不同环境下工作

### 性能考虑

- 钩子脚本执行时间 < 5 秒
- MCP 服务器启动时间 < 10 秒
- 命令响应及时
- 避免阻塞操作

## 最佳实践总结

### 开发阶段
1. 频繁测试小改动
2. 使用 debug 模式调试
3. 保持 JSON 文件格式化
4. 及时更新文档

### 发布阶段
1. 遵循语义化版本
2. 完整的 CHANGELOG
3. 充分的测试覆盖
4. 清晰的发布说明

### 维护阶段
1. 快速响应 bug 报告
2. 定期更新依赖
3. 保持向下兼容
4. 提供迁移指南

## 下一步

- 👥 查看 [团队协作规范](./team-collaboration.md) 了解团队工作流
- ❓ 参考 [常见问题](./faq.md) 解决常见问题
- 🤝 阅读 [贡献指南](./contributing.md) 了解如何贡献
