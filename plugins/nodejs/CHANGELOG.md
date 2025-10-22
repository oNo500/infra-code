# Changelog

All notable changes to the Node.js plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.1.0] - 2025-01-15

### Added
- **Commands**:
  - `/api` - 创建 RESTful/GraphQL API 端点
  - `/model` - 创建数据模型（Prisma/TypeORM/Mongoose）
  - `/middleware` - 创建中间件（认证/日志/错误处理）
  - `/test-api` - 生成 API 测试代码

- **Agents**:
  - `api-designer` - API 架构设计和 OpenAPI 规范生成
  - `security-auditor` - 安全漏洞检测和审计

- **Skills**:
  - `error-handler` - 统一错误处理和日志记录
  - `validation-builder` - 输入验证规则生成器

- **Hooks**:
  - PreToolUse hook：数据库检查、测试运行
  - PostToolUse hook：ESLint 修复、文档更新

- **MCP Servers**:
  - Filesystem server：项目文件访问

### Features Highlights
- 🚀 多框架支持（Express/Fastify/Koa/NestJS）
- 🗄️ 多 ORM 支持（Prisma/TypeORM/Mongoose）
- 🔒 全面的安全审计
- 📝 自动化 API 文档生成
- ✅ 完整的测试支持
- 🛡️ 统一错误处理

## [Unreleased]

### Planned
- [ ] WebSocket 支持
- [ ] 微服务架构支持
- [ ] Docker 容器化配置
- [ ] CI/CD 集成
- [ ] 性能监控集成
- [ ] API 版本管理工具

---

**Note**: This is the initial release of the Node.js plugin for Claude Code.
