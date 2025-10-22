# Changelog

All notable changes to the Web-Dev plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.1.0] - 2025-01-15

### Added
- **Commands**:
  - `/component` - 创建 React/Vue/Svelte 组件
  - `/page` - 创建页面并配置路由
  - `/style` - 样式和主题管理
  - `/build` - 构建优化和性能分析

- **Agents**:
  - `ui-reviewer` - UI 代码审查和可访问性检查
  - `performance-optimizer` - 性能优化建议

- **Skills**:
  - `component-generator` - 从设计生成组件代码
  - `css-optimizer` - CSS 优化和清理

- **Hooks**:
  - PostToolUse hook：Prettier 和 ESLint 自动格式化
  - PreToolUse hook：构建前依赖检查

- **MCP Servers**:
  - Filesystem server：项目文件访问

### Features Highlights
- 🚀 多框架支持（React/Vue/Svelte）
- 🎨 灵活的样式方案
- ⚡ 自动化代码格式化
- 📊 性能分析和优化
- ♿ 可访问性检查
- 🔧 构建优化工具

## [Unreleased]

### Planned
- [ ] Storybook 集成
- [ ] 组件库生成
- [ ] E2E 测试支持
- [ ] 设计系统集成
- [ ] 自动化 CI/CD 配置

---

**Note**: This is the initial release of the Web-Dev plugin for Claude Code.
