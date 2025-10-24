# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.0.4] - 2025-10-22

### Fixed
- 修复 context7 MCP 服务器包名错误（`@context7/mcp-server` → `@upstash/context7-mcp`）

## [0.0.3] - 2025-10-22

### Changed
- 重命名插件：从 `x` 改为 `common`
- 更新插件定位：通用工具集
- 更新描述：提供常用的便捷命令和个人定制功能

### Added
- 创建 README.md 文档
- 添加 context7 MCP 服务器（库文档查询）
- 规范化 MCP 配置格式（使用 mcpServers）

## [0.0.2] - 2025-10-22

### Changed
- 替换 MCP 配置:将 sequential-thinking 服务器更换为 filesystem 服务器
- 配置 filesystem 服务器允许访问项目根目录

### Added
- 文件系统访问能力,支持通过 MCP 读取和操作项目文件

## [0.0.1] - 初始版本

### Added
- 初始插件结构
- hello 命令
- sequential-thinking MCP 服务器
