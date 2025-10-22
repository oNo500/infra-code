# 文档目录

欢迎来到 Claude Code 插件市场文档中心!

## 📚 文档结构

### 新手入门

- **[快速开始指南](./quick-start.md)** - 5分钟创建你的第一个插件
  - 基础概念介绍
  - 第一个插件创建
  - 本地测试流程

### 核心指南

- **[插件开发指南](./plugin-development.md)** - 深入了解插件组件开发
  - Commands (斜杠命令)
  - Agents (子代理)
  - Skills (Agent Skills)
  - Hooks (事件钩子)
  - MCP Servers (模型上下文协议)

- **[市场配置指南](./marketplace-configuration.md)** - 配置和管理插件市场
  - marketplace.json 完整配置
  - plugin.json 配置规范
  - 插件源类型
  - 版本管理策略

- **[测试和发布流程](./testing-and-release.md)** - 确保插件质量
  - 本地测试最佳实践
  - 版本发布检查清单
  - 持续集成建议
  - 回滚策略

- **[团队协作规范](./team-collaboration.md)** - 团队级配置管理
  - 项目级配置
  - 权限管理
  - 插件贡献流程
  - 沟通和文档

### 参考文档

- **[API 参考](./api-reference.md)** - 完整的配置 schema
  - marketplace.json schema
  - plugin.json schema
  - hooks.json schema
  - .mcp.json schema
  - 环境变量

- **[常见问题](./faq.md)** - 故障排查和常见问题解答
  - 安装和配置问题
  - 插件组件问题
  - 版本管理
  - 权限和安全
  - 性能和调试

- **[贡献指南](./contributing.md)** - 如何为项目做贡献
  - 报告 Bug
  - 提出功能建议
  - 提交代码
  - 代码规范
  - 审查流程

## 🚀 快速导航

### 我是新手,想要...

- **创建第一个插件** → [快速开始指南](./quick-start.md)
- **了解插件能做什么** → [插件开发指南](./plugin-development.md)

### 我想要...

- **配置插件市场** → [市场配置指南](./marketplace-configuration.md)
- **发布插件** → [测试和发布流程](./testing-and-release.md)
- **设置团队配置** → [团队协作规范](./team-collaboration.md)

### 我遇到了...

- **配置问题** → [API 参考](./api-reference.md)
- **Bug 或错误** → [常见问题](./faq.md)
- **想要贡献代码** → [贡献指南](./contributing.md)

## 📖 推荐阅读路径

### 路径 1: 插件使用者

1. [快速开始](./quick-start.md) - 了解基础
2. [插件开发](./plugin-development.md) - 深入组件
3. [常见问题](./faq.md) - 解决问题

### 路径 2: 插件开发者

1. [快速开始](./quick-start.md) - 基础概念
2. [插件开发](./plugin-development.md) - 组件开发
3. [市场配置](./marketplace-configuration.md) - 配置管理
4. [测试和发布](./testing-and-release.md) - 质量保证
5. [API 参考](./api-reference.md) - 技术细节

### 路径 3: 团队管理者

1. [团队协作](./team-collaboration.md) - 团队配置
2. [市场配置](./marketplace-configuration.md) - 市场管理
3. [测试和发布](./testing-and-release.md) - 发布流程
4. [常见问题](./faq.md) - 故障排查

### 路径 4: 贡献者

1. [贡献指南](./contributing.md) - 贡献流程
2. [API 参考](./api-reference.md) - 技术规范
3. [测试和发布](./testing-and-release.md) - 质量标准

## 🔗 相关资源

### 官方文档

- [Claude Code 官方文档](https://docs.claude.com/en/docs/claude-code/overview)
- [插件系统文档](https://docs.claude.com/en/docs/claude-code/plugins)
- [插件市场文档](https://docs.claude.com/en/docs/claude-code/plugin-marketplaces)
- [插件参考文档](https://docs.claude.com/en/docs/claude-code/plugins-reference)

### 项目文件

- [CLAUDE.md](../CLAUDE.md) - 项目架构和工作流
- [README.md](../README.md) - 项目介绍

## 💡 文档约定

### 代码块

```bash
# Shell 命令示例
claude --debug
```

```json
// JSON 配置示例
{
  "name": "example"
}
```

### 符号说明

- ✅ 推荐做法
- ❌ 避免做法
- ⚠️ 注意事项
- 💡 提示
- 🔧 配置
- 📚 文档链接

### 检查清单

- [ ] 未完成的项目
- [x] 已完成的项目

## 🤝 贡献文档

发现文档有误或需要改进?

1. 查看[贡献指南](./contributing.md)
2. 创建 Issue 或 Pull Request
3. 帮助我们改进文档

## 📝 文档更新日志

### 最近更新

- 2024-01: 初始文档集创建
  - 快速开始指南
  - 插件开发指南
  - 市场配置指南
  - 测试和发布流程
  - 团队协作规范
  - API 参考
  - 常见问题
  - 贡献指南

## ❓ 需要帮助?

- 📖 先查看[常见问题](./faq.md)
- 🐛 报告问题: [创建 Issue](../../issues/new)
- 💬 讨论: [GitHub Discussions](../../discussions)
- 📧 联系维护者: 见项目 README

---

**祝你使用愉快!** 如果这些文档对你有帮助,请考虑为项目点个 ⭐️
