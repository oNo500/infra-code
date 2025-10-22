# 常见问题

本文档收集了使用 Claude Code 插件市场时的常见问题和解决方案。

## 安装和配置

### Q: 插件安装后没有出现在列表中?

**可能原因**:
1. plugin.json 格式错误
2. 目录结构不正确
3. 插件未启用

**解决方案**:

```bash
# 1. 验证 JSON 语法
jq empty plugins/my-plugin/.claude-plugin/plugin.json

# 2. 检查目录结构
ls -la plugins/my-plugin/
# 应该看到: .claude-plugin/, commands/, agents/ 等

# 3. 检查插件状态
claude
/plugin
# 查看插件是否在列表中

# 4. 使用 debug 模式查看详细信息
claude --debug
```

### Q: marketplace.json 配置后团队成员无法看到插件?

**检查清单**:
- [ ] 确认 `.claude/settings.json` 已提交到版本控制
- [ ] 团队成员已拉取最新代码
- [ ] 团队成员已信任项目文件夹
- [ ] marketplace 路径或 GitHub repo 可访问

**解决方案**:

```bash
# 团队成员操作:
git pull origin main

# 启动 Claude Code
claude

# 如果没有自动提示,手动添加市场
/plugin marketplace add ./path/to/marketplace
# 或
/plugin marketplace add github:org/repo
```

### Q: 私有 GitHub 仓库的插件无法安装?

**原因**: 没有访问权限

**解决方案**:

```bash
# 1. 确认有 GitHub 仓库访问权限
gh repo view org/private-plugins

# 2. 配置 SSH 密钥或 GitHub token
# SSH 方式
git config --global url."git@github.com:".insteadOf "https://github.com/"

# Token 方式
git config --global credential.helper store
```

## 插件组件问题

### Q: 命令在 /help 中找不到?

**常见原因**:
1. commands/ 目录位置错误
2. 文件不是 .md 扩展名
3. 命令文件格式错误

**检查步骤**:

```bash
# 1. 确认 commands/ 在插件根目录
ls -la plugins/my-plugin/
# ✅ 正确: commands/ 在根目录
# ❌ 错误: .claude-plugin/commands/

# 2. 确认文件扩展名
ls plugins/my-plugin/commands/
# ✅ 正确: deploy.md
# ❌ 错误: deploy.txt

# 3. 验证文件格式
cat plugins/my-plugin/commands/deploy.md
# 应该包含 frontmatter 和内容
```

**正确的命令文件格式**:
```markdown
---
description: 简短描述
---

# 命令标题

命令内容
```

### Q: 代理(Agent)未注册到 /agents?

**检查**:

```bash
# 1. 确认文件位置
ls plugins/my-plugin/agents/
# 应该看到 .md 文件

# 2. 检查文件格式
cat plugins/my-plugin/agents/reviewer.md
# 应该包含 frontmatter
```

**正确的代理文件格式**:
```markdown
---
description: 代理用途
capabilities: ["cap1", "cap2"]
---

# Agent 名称

代理详细描述
```

### Q: Hook 没有触发?

**常见问题**:
1. 脚本没有执行权限
2. hooks.json 格式错误
3. Matcher 模式不匹配
4. 脚本路径错误

**解决方案**:

```bash
# 1. 添加执行权限
chmod +x plugins/my-plugin/scripts/*.sh

# 2. 验证 hooks.json
jq empty plugins/my-plugin/hooks/hooks.json

# 3. 手动测试脚本
./plugins/my-plugin/scripts/format.sh
echo $?  # 应该返回 0

# 4. 使用绝对路径(${CLAUDE_PLUGIN_ROOT})
# 正确:
{
  "command": "${CLAUDE_PLUGIN_ROOT}/scripts/format.sh"
}
# 错误:
{
  "command": "./scripts/format.sh"
}
```

**调试 Hook**:

在脚本中添加日志:
```bash
#!/bin/bash
echo "Hook triggered at $(date)" >> /tmp/hook.log
echo "Args: $@" >> /tmp/hook.log
# 你的脚本逻辑
```

### Q: MCP 服务器启动失败?

**检查步骤**:

```bash
# 1. 验证 .mcp.json
jq empty plugins/my-plugin/.mcp.json

# 2. 手动启动服务器测试
cd plugins/my-plugin
./server  # 或 node server.js, python server.py 等

# 3. 检查依赖
npm install  # Node.js
pip install -r requirements.txt  # Python

# 4. 查看日志
claude --debug
# 查找 MCP 相关错误信息
```

**常见错误**:

**缺少 ${CLAUDE_PLUGIN_ROOT}**:
```json
// ❌ 错误
{
  "command": "./server"
}

// ✅ 正确
{
  "command": "${CLAUDE_PLUGIN_ROOT}/server"
}
```

**环境变量未设置**:
```json
{
  "mcpServers": {
    "server": {
      "command": "node",
      "args": ["${CLAUDE_PLUGIN_ROOT}/server.js"],
      "env": {
        "NODE_ENV": "production",
        "CONFIG_PATH": "${CLAUDE_PLUGIN_ROOT}/config.json"
      }
    }
  }
}
```

## 版本管理

### Q: 如何回滚到旧版本的插件?

**方法 1: 使用 Git 标签**

```json
{
  "plugins": [
    {
      "name": "my-plugin",
      "source": {
        "source": "github",
        "repo": "org/plugin",
        "ref": "v1.0.0"  // 指定旧版本标签
      }
    }
  ]
}
```

**方法 2: 使用特定 commit**

```json
{
  "ref": "abc123def456"  // commit SHA
}
```

**方法 3: 本地回滚**

```bash
cd plugins/my-plugin
git checkout v1.0.0
```

### Q: 更新插件后如何让团队成员同步?

**推荐流程**:

```bash
# 1. 更新版本号(plugin.json)
{
  "version": "1.1.0"
}

# 2. 更新 marketplace.json (如果使用标签)
{
  "source": {
    "ref": "v1.1.0"
  }
}

# 3. 提交并推送
git commit -am "chore: bump version to 1.1.0"
git tag v1.1.0
git push origin main v1.1.0

# 4. 通知团队更新
# Slack/Teams: "请运行 git pull && /plugin install plugin-name@marketplace"
```

## 权限和安全

### Q: 如何阻止 Claude 访问敏感文件?

**方法 1: 项目级配置** (`.claude/settings.json`)

```json
{
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)",
      "Read(./**/*secret*)",
      "Read(./**/*password*)",
      "Read(./**/*credential*)"
    ]
  }
}
```

**方法 2: 用户级配置** (`~/.claude/settings.json`)

```json
{
  "permissions": {
    "deny": [
      "Read(~/.aws/**)",
      "Read(~/.ssh/**)",
      "Read(/etc/**)"
    ]
  }
}
```

**方法 3: 企业托管策略** (管理员配置)

```json
// /etc/claude-code/managed-settings.json
{
  "permissions": {
    "deny": [
      "WebFetch",
      "Read(/etc/**)",
      "Bash(curl:*)"
    ],
    "disableBypassPermissionsMode": "disable"
  }
}
```

### Q: Hook 脚本如何保证安全?

**最佳实践**:

```bash
#!/bin/bash
set -euo pipefail  # 严格模式

# 1. 验证输入
if [ -z "$1" ]; then
    echo "Error: Missing argument"
    exit 1
fi

# 2. 使用绝对路径
SCRIPT_DIR="${CLAUDE_PLUGIN_ROOT}/scripts"

# 3. 检查权限
if [ ! -r "$1" ]; then
    echo "Error: Cannot read file"
    exit 1
fi

# 4. 限制操作范围
# 只操作允许的文件类型
case "$1" in
    *.js|*.ts|*.py)
        # 处理
        ;;
    *)
        echo "Error: Unsupported file type"
        exit 1
        ;;
esac

# 5. 记录日志
echo "$(date): Processed $1" >> "${CLAUDE_PLUGIN_ROOT}/logs/hook.log"
```

## 性能和调试

### Q: 插件加载很慢?

**优化建议**:

1. **减少不必要的组件**
```
# 只包含需要的组件
plugins/my-plugin/
├── .claude-plugin/plugin.json
├── commands/  # 仅保留常用命令
└── scripts/   # 轻量级脚本
```

2. **优化 Hook 脚本**
```bash
# ❌ 慢
find . -name "*.js" | while read file; do
    # 处理
done

# ✅ 快
find . -name "*.js" -exec处理工具 {} +
```

3. **异步 MCP 服务器**
```json
{
  "mcpServers": {
    "server": {
      "command": "node",
      "args": ["${CLAUDE_PLUGIN_ROOT}/server.js", "--async"]
    }
  }
}
```

### Q: 如何调试插件问题?

**调试工具**:

```bash
# 1. Debug 模式
claude --debug

# 2. 检查配置加载
claude -p "/config"

# 3. 查看插件列表
claude -p "/plugin"

# 4. 测试特定命令
claude -p "/my-command test"

# 5. 查看权限
claude -p "/allowed-tools"
```

**日志文件**:

```bash
# Claude Code 日志位置
# macOS:
~/Library/Logs/Claude Code/

# Linux:
~/.local/share/claude-code/logs/

# 查看最新日志
tail -f ~/Library/Logs/Claude\ Code/main.log
```

### Q: 如何查看 Claude 使用了哪些工具?

**方法 1: 会话中查看**
- 观察 Claude 的响应
- 工具使用会显示在输出中

**方法 2: 启用详细日志**
```bash
export CLAUDE_CODE_VERBOSE=1
claude
```

**方法 3: Hook 监控**
```json
{
  "PreToolUse": [{
    "hooks": [{
      "type": "command",
      "command": "echo \"Tool used: $TOOL_NAME\" >> /tmp/tool-usage.log"
    }]
  }]
}
```

## 团队协作

### Q: 不同团队成员看到的插件不一致?

**原因**:
- 不同的 settings.local.json 配置
- 未同步最新代码
- 信任设置不同

**解决方案**:

```bash
# 1. 统一项目配置
# 确保 .claude/settings.json 在版本控制中

# 2. 清除本地配置(如果需要)
rm .claude/settings.local.json

# 3. 重新加载配置
claude
/config
# 检查 "enabledPlugins" 部分

# 4. 重新安装插件
/plugin uninstall plugin-name@marketplace
/plugin install plugin-name@marketplace
```

### Q: 如何强制团队使用特定版本的插件?

**方法: 使用固定版本引用**

```json
{
  "extraKnownMarketplaces": {
    "company-tools": {
      "source": {
        "source": "github",
        "repo": "company/plugins",
        "ref": "v2.1.0"  // 固定版本
      }
    }
  }
}
```

**注意**: 需要在项目的 `.claude/settings.json` 中配置,并提交到版本控制。

### Q: 如何禁止团队成员安装未批准的插件?

**企业托管策略**:

```json
// /etc/claude-code/managed-settings.json (管理员配置)
{
  "allowedMarketplaces": [
    "company-approved",
    "official-marketplace"
  ],
  "deniedMarketplaces": [
    "untrusted-source"
  ]
}
```

## 迁移和升级

### Q: 如何从旧的配置迁移到新的市场系统?

**步骤**:

```bash
# 1. 创建市场结构
mkdir -p .claude-plugin
cat > .claude-plugin/marketplace.json << 'EOF'
{
  "name": "project-plugins",
  "owner": {"name": "Team"},
  "plugins": []
}
EOF

# 2. 迁移现有插件
mv old-plugins/ plugins/

# 3. 更新 marketplace.json
# 添加所有插件到 plugins 数组

# 4. 测试
claude
/plugin marketplace add .
/plugin install plugin-name@project-plugins
```

### Q: 升级到主版本后插件不兼容?

**解决方案**:

1. **查看 CHANGELOG**
```bash
cat plugins/my-plugin/CHANGELOG.md
# 查找破坏性变更说明
```

2. **查看迁移指南**
```markdown
# 通常在 MIGRATION.md 或 README.md 中
```

3. **回滚到兼容版本**
```json
{
  "source": {
    "ref": "v1.9.0"  // 上一个主版本
  }
}
```

4. **渐进式升级**
```
v1.9.0 → v2.0.0-beta → v2.0.0
# 先测试 beta 版本
```

## 错误消息

### "Plugin manifest not found"

**原因**: 缺少 `.claude-plugin/plugin.json`

**解决**:
```bash
mkdir -p plugins/my-plugin/.claude-plugin
cat > plugins/my-plugin/.claude-plugin/plugin.json << 'EOF'
{
  "name": "my-plugin"
}
EOF
```

### "Invalid plugin name"

**原因**: 名称包含空格或大写字母

**解决**:
```json
// ❌ 错误
{"name": "My Plugin"}

// ✅ 正确
{"name": "my-plugin"}
```

### "Permission denied"

**原因**: 权限规则阻止操作

**解决**:
```bash
# 检查权限设置
claude -p "/config"
# 查看 permissions.deny 部分

# 临时允许(在 settings.local.json)
{
  "permissions": {
    "allow": ["操作模式"]
  }
}
```

### "Hook script failed"

**原因**: Hook 脚本返回非零退出码

**调试**:
```bash
# 1. 手动运行脚本
./plugins/my-plugin/scripts/format.sh file.js
echo $?  # 检查退出码

# 2. 添加调试输出
#!/bin/bash
set -x  # 显示执行的命令
# 脚本内容
```

## 其他问题

### Q: 插件可以访问网络吗?

**默认**: 取决于权限配置

**控制网络访问**:
```json
{
  "permissions": {
    "deny": [
      "WebFetch",  // 阻止所有网络请求
      "Bash(curl:*)",
      "Bash(wget:*)"
    ]
  }
}
```

### Q: 插件可以修改哪些文件?

**默认**: 工作目录及 Edit 权限允许的路径

**限制写入**:
```json
{
  "permissions": {
    "deny": [
      "Write(./src/critical/**)",
      "Edit(./config/production.*)"
    ]
  }
}
```

### Q: 如何分享插件给其他项目?

**方法 1: GitHub 仓库**
```bash
# 1. 创建独立仓库
git init plugin-repo
# 2. 发布到 GitHub
# 3. 其他项目引用
{
  "source": {
    "source": "github",
    "repo": "your-username/plugin-name"
  }
}
```

**方法 2: 本地路径** (仅开发)
```json
{
  "source": "../shared-plugins/my-plugin"
}
```

## 获取帮助

如果以上都无法解决你的问题:

1. **查看官方文档**
   - [Claude Code 文档](https://docs.claude.com/en/docs/claude-code/plugins)
   - [插件参考](https://docs.claude.com/en/docs/claude-code/plugins-reference)

2. **检查项目文档**
   - [快速开始](./quick-start.md)
   - [插件开发](./plugin-development.md)
   - [API 参考](./api-reference.md)

3. **联系团队**
   - 提交 Issue 到插件市场仓库
   - 联系插件维护者
   - 在团队频道咨询

4. **报告 Bug**
   - 提供完整的错误信息
   - 包含配置文件(去除敏感信息)
   - 说明重现步骤
