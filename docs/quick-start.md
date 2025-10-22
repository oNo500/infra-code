# 快速开始指南

本指南将帮助你在 5 分钟内创建并测试你的第一个 Claude Code 插件。

## 前置要求

- 已安装 Claude Code
- 熟悉基本的命令行操作
- 了解 JSON 和 Markdown 基础语法

## 创建你的第一个插件

### 1. 创建插件目录结构

```bash
# 进入插件目录
cd plugins

# 创建新插件目录
mkdir my-first-plugin
cd my-first-plugin

# 创建必需的目录
mkdir .claude-plugin
mkdir commands
```

### 2. 创建插件清单

创建 `.claude-plugin/plugin.json`:

```json
{
  "name": "my-first-plugin",
  "version": "1.0.0",
  "description": "我的第一个 Claude Code 插件",
  "author": {
    "name": "你的名字"
  }
}
```

### 3. 添加一个命令

创建 `commands/hello.md`:

```markdown
---
description: 向用户问好
---

# Hello 命令

热情地向用户问好,并询问今天可以如何帮助他们。使用友好和鼓励的语气。
```

### 4. 更新市场配置

编辑项目根目录的 `.claude-plugin/marketplace.json`,添加你的插件:

```json
{
  "name": "code-infra",
  "owner": {
    "name": "你的名字",
    "email": "your@email.com"
  },
  "plugins": [
    {
      "name": "my-first-plugin",
      "source": "./plugins/my-first-plugin",
      "description": "我的第一个测试插件"
    }
  ]
}
```

### 5. 测试插件

```bash
# 启动 Claude Code(在项目根目录)
cd /path/to/code-infra
claude

# 在 Claude Code 中添加本地市场
/plugin marketplace add .

# 安装你的插件
/plugin install my-first-plugin@code-infra

# 重启 Claude Code 后,测试你的命令
/hello
```

## 验证成功

如果一切正常,你应该看到:

1. ✅ 插件安装成功的确认消息
2. ✅ 使用 `/help` 可以看到 `/hello` 命令
3. ✅ 运行 `/hello` 时 Claude 会友好地问候你

## 下一步

恭喜!你已经创建了第一个插件。接下来你可以:

- 📚 查看[插件开发指南](./plugin-development.md)了解更多组件类型
- ⚙️ 阅读[市场配置指南](./marketplace-configuration.md)学习高级配置
- 🧪 参考[测试和发布流程](./testing-and-release.md)了解最佳实践
- 👥 查看[团队协作规范](./team-collaboration.md)了解团队工作流

## 常见问题

**Q: 插件没有出现在列表中?**
A: 检查 `marketplace.json` 和 `plugin.json` 的 JSON 语法是否正确,使用 `cat file.json | jq .` 验证。

**Q: 命令不起作用?**
A: 确保 `commands/` 目录在插件根目录,不在 `.claude-plugin/` 内部。

**Q: 修改后没有生效?**
A: 需要卸载并重新安装插件:`/plugin uninstall` 然后 `/plugin install`。

## 故障排查

```bash
# 验证 JSON 语法
cat .claude-plugin/marketplace.json | jq .
cat plugins/my-first-plugin/.claude-plugin/plugin.json | jq .

# 检查目录结构
ls -la plugins/my-first-plugin/
ls -la plugins/my-first-plugin/.claude-plugin/
ls -la plugins/my-first-plugin/commands/

# 使用 debug 模式启动
claude --debug
```
