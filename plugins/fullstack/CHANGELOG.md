# Changelog

All notable changes to the Fullstack plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [0.1.0] - 2025-01-22

### Added

- **Commands**:
  - `/project` - 创建全栈项目（Monorepo/单仓库）
  - `/feature` - 创建端到端功能（CRUD/Form/Dashboard/Auth）
  - `/deploy` - 部署到多平台（Vercel/Railway/AWS/Docker/K8s）
  - `/connect` - 连接前后端 API（OpenAPI/tRPC/GraphQL）

- **Agents**:
  - `fullstack-architect` - 全栈架构设计和优化
  - `deployment-expert` - 部署策略和 CI/CD 配置

- **Skills**:
  - `project-initializer` - 快速初始化项目结构
  - `api-connector` - 自动生成类型安全的 API 客户端

- **Hooks**:
  - PreToolUse hook：部署前测试、Docker 检查、数据库备份
  - PostToolUse hook：API 类型同步、配置格式化、部署通知

- **MCP Servers**:
  - Filesystem server：项目文件访问
  - Docker server：容器管理

### Features Highlights

- 🏗️ **Monorepo 支持**：完整的 pnpm workspace 配置
- 🔗 **端到端类型安全**：前后端类型自动同步
- 🚀 **多平台部署**：支持 6+ 主流部署平台
- 🐳 **容器化**：Docker 和 Kubernetes 完整配置
- 🔄 **CI/CD**：GitHub Actions、GitLab CI 自动配置
- 📦 **技术栈灵活**：支持多种前后端框架组合
- 🔒 **安全第一**：内置认证、授权、安全检查
- 📊 **性能优化**：缓存、索引、代码分割等最佳实践

### Supported Technologies

**Frontend**:
- React (Next.js 14)
- Vue 3 (Nuxt 3)
- Svelte (SvelteKit)

**Backend**:
- Express.js
- Fastify
- Koa
- NestJS

**Database**:
- PostgreSQL
- MySQL
- MongoDB
- SQLite
- Redis

**ORM/ODM**:
- Prisma
- TypeORM
- Sequelize
- Mongoose

**Deployment**:
- Vercel
- Railway
- Netlify
- AWS (EC2/ECS/Lambda)
- Docker
- Kubernetes

### Dependencies

- **web-dev** (^0.1.0): 前端开发工具
- **nodejs** (^0.1.0): 后端开发工具

## [Unreleased]

### Planned

- [ ] GraphQL 订阅支持
- [ ] 微服务架构模板
- [ ] 服务网格（Service Mesh）集成
- [ ] 监控和可观测性工具集成
  - [ ] Prometheus + Grafana
  - [ ] ELK Stack
  - [ ] Sentry
  - [ ] DataDog
- [ ] 性能测试工具
- [ ] 数据库迁移工具增强
- [ ] 多租户支持
- [ ] API 版本管理
- [ ] 自动化 E2E 测试生成
- [ ] 蓝绿部署支持
- [ ] 金丝雀发布策略
- [ ] A/B 测试框架

### Under Consideration

- [ ] Monorepo 优化工具
- [ ] 跨平台移动应用支持（React Native/Flutter）
- [ ] WebAssembly 集成
- [ ] Edge Computing 支持
- [ ] Serverless Framework 集成
- [ ] Infrastructure as Code (Terraform/Pulumi)
- [ ] 安全扫描工具集成
- [ ] 代码质量分析工具

---

**Note**: This is the initial release of the Fullstack plugin for Claude Code.
