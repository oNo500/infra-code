# Changelog

All notable changes to the Obsidian plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.1.0] - 2025-01-15

### Added
- **Commands**:
  - `/note-create` - 创建新笔记，支持多种模板
  - `/note-search` - 全文搜索笔记，支持标签和时间过滤
  - `/note-link` - 管理笔记链接，查找双向链接和断链
  - `/note-sync` - Git 集成，同步和备份 vault

- **Agents**:
  - `knowledge-organizer` - 分析 vault 结构，优化知识组织
  - `note-summarizer` - 生成笔记摘要和定期总结

- **Skills**:
  - `markdown-formatter` - 自动格式化 Markdown 文件
  - `note-linker` - 智能链接建议和维护

- **Hooks**:
  - PostToolUse hook：编辑后自动格式化
  - PreToolUse hook：Git 操作前验证

- **MCP Servers**:
  - Filesystem server：访问 Obsidian vault

- **Documentation**:
  - 完整的 README 和使用指南
  - 详细的 Commands 和 Agents 文档
  - Skills 参考文档

### Features Highlights
- 🚀 完整的笔记生命周期管理
- 🔗 智能链接发现和维护
- 📊 知识图谱可视化
- 🤖 AI 驱动的知识组织
- 📝 自动化的笔记格式化
- 🔄 Git 集成和版本控制

## [Unreleased]

### Planned
- [ ] 高级搜索语法支持
- [ ] 笔记模板自定义
- [ ] 批量操作功能
- [ ] 性能优化（大型 vault）
- [ ] 多语言支持
- [ ] 插件配置界面
- [ ] 更多可视化选项
- [ ] 与其他工具集成

### Ideas
- 自动生成知识图谱
- AI 辅助笔记内容建议
- 笔记质量评分系统
- 协作笔记功能
- 笔记导出为多种格式

---

**Note**: This is the initial release of the Obsidian plugin for Claude Code. Feedback and contributions are welcome!
