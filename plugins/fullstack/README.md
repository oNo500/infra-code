# Fullstack Plugin

全栈开发工具集，整合前后端开发流程，提供端到端的应用构建、API 集成和统一部署解决方案。

## 🚀 功能特性

### 📝 Commands（斜杠命令）

- **`/project`** - 创建全栈项目
  - Monorepo 结构（pnpm workspace）
  - 前端（React/Vue/Svelte）
  - 后端（Express/Fastify/NestJS）
  - 数据库配置（PostgreSQL/MySQL/MongoDB）
  - 认证系统（JWT）
  - Docker 容器化
  - CI/CD 配置

- **`/feature`** - 创建端到端功能
  - CRUD 功能（前端+后端）
  - 表单功能
  - Dashboard 看板
  - 认证功能
  - 实时更新（WebSocket）

- **`/deploy`** - 部署全栈应用
  - Vercel（前端）
  - Railway（后端）
  - AWS（EC2/ECS/Lambda）
  - Docker 容器化
  - Kubernetes 集群
  - CI/CD 流程

- **`/connect`** - 连接前后端 API
  - OpenAPI/Swagger 生成客户端
  - tRPC 端到端类型安全
  - GraphQL + Codegen
  - 自动类型同步

### 🤖 Agents（智能代理）

- **`fullstack-architect`** - 全栈架构师
  - 系统架构设计
  - 技术栈选型
  - 性能优化方案
  - 安全架构设计
  - 扩展性规划

- **`deployment-expert`** - 部署专家
  - 部署策略规划
  - CI/CD 流程配置
  - Docker/Kubernetes 配置
  - 基础设施代码（IaC）
  - 监控和日志

### ⚡ Skills（技能）

- **`project-initializer`** - 项目初始化器
  - Monorepo 结构生成
  - 配置文件生成
  - 包管理器配置
  - 开发环境设置

- **`api-connector`** - API 连接器
  - 类型安全的 API 客户端
  - OpenAPI 规范生成
  - React Query Hooks
  - 自动类型同步

### 🔗 Hooks（事件钩子）

- **PreToolUse**
  - 部署前运行测试
  - Docker 构建前检查
  - 数据库迁移前备份

- **PostToolUse**
  - API 变更后同步类型
  - 配置文件自动格式化
  - 部署成功发送通知

### 🌐 MCP Servers

- **filesystem** - 项目文件访问
- **docker** - Docker 容器管理

## 📦 安装

```bash
claude
/plugin marketplace add https://github.com/your-org/code-infra
/plugin install fullstack@code-infra
```

**依赖插件**：
- `web-dev` - 前端开发工具
- `nodejs` - 后端开发工具

## 🎯 快速开始

### 创建全栈项目

```bash
/project my-saas --frontend react --backend nestjs --database postgresql --auth --docker --monorepo
```

生成的项目结构：
```
my-saas/
├── apps/
│   ├── web/          # Next.js 前端
│   └── api/          # NestJS 后端
├── packages/
│   ├── types/        # 共享类型
│   ├── ui/           # UI 组件库
│   ├── config/       # 共享配置
│   └── utils/        # 工具函数
├── docker/
├── .github/workflows/
└── pnpm-workspace.yaml
```

### 创建端到端功能

```bash
# 创建用户管理 CRUD
/feature users --type crud --entity User --fields "name:string,email:string,age:number" --auth

# 创建实时 Dashboard
/feature analytics --type dashboard --realtime
```

生成的文件：
- **后端**：
  - `apps/api/src/modules/users/users.controller.ts`
  - `apps/api/src/modules/users/users.service.ts`
  - `apps/api/src/modules/users/dto/`
  - `apps/api/prisma/migrations/`

- **前端**：
  - `apps/web/src/pages/Users/UserList.tsx`
  - `apps/web/src/pages/Users/UserForm.tsx`
  - `apps/web/src/api/users.ts`
  - `apps/web/src/hooks/useUsers.ts`

- **共享**：
  - `packages/types/src/user.ts`

### 连接前后端 API

```bash
/connect openapi --watch
```

自动生成：
- TypeScript 类型定义
- 类型安全的 API 客户端
- React Query Hooks

使用示例：
```typescript
import { useUsers, useCreateUser } from '@/hooks/useUsers';

function UserList() {
  const { data, isLoading } = useUsers({ page: 1, limit: 10 });
  const createUser = useCreateUser();

  // 完全类型安全！
  const handleCreate = () => {
    createUser.mutate({
      name: 'John',
      email: 'john@example.com',
      age: 30
    });
  };

  return (/* UI */);
}
```

### 部署应用

```bash
# 部署到 Vercel + Railway
/deploy

# 或使用 Docker
/deploy docker --env production

# 或使用 Kubernetes
/deploy kubernetes
```

## 🛠️ 支持的技术栈

### 前端框架
- ✅ React (Next.js 14)
- ✅ Vue 3 (Nuxt 3)
- ✅ Svelte (SvelteKit)

### 后端框架
- ✅ Express.js
- ✅ Fastify
- ✅ Koa
- ✅ NestJS

### 数据库
- ✅ PostgreSQL
- ✅ MySQL
- ✅ MongoDB
- ✅ SQLite
- ✅ Redis

### ORM/ODM
- ✅ Prisma
- ✅ TypeORM
- ✅ Sequelize
- ✅ Mongoose

### 部署平台
- ✅ Vercel
- ✅ Railway
- ✅ Netlify
- ✅ AWS (EC2/ECS/Lambda)
- ✅ Docker
- ✅ Kubernetes

## 📖 使用指南

### 工作流示例

#### 新产品开发

```bash
# 1. 创建项目
/project my-product --frontend react --backend nestjs --database postgresql --auth --docker

# 2. 设计架构
设计一个包含用户、产品、订单的电商系统

# 3. 创建功能
/feature users --type crud
/feature products --type crud
/feature orders --type crud

# 4. 连接 API
/connect openapi --watch

# 5. 部署
/deploy vercel
```

#### 现有项目优化

```bash
# 1. 架构审查
审查我的全栈应用架构，找出性能瓶颈

# 2. 优化建议
# (AI 会分析并提供优化建议)

# 3. 配置 CI/CD
/deploy --ci

# 4. 容器化
/deploy docker
```

## 🔒 安全最佳实践

### 认证和授权
```typescript
// JWT 认证
import { JwtAuthGuard } from '@nestjs/passport';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  // 受保护的路由
}

// 前端路由守卫
import { ProtectedRoute } from '@/components/ProtectedRoute';

<ProtectedRoute>
  <UserDashboard />
</ProtectedRoute>
```

### 环境变量
```bash
# .env.example
DATABASE_URL=postgresql://user:pass@localhost:5432/db
JWT_SECRET=your-secret-key
API_URL=http://localhost:4000

# 不要提交 .env 到 Git！
echo ".env" >> .gitignore
```

### HTTPS/SSL
```yaml
# docker-compose.yml
nginx:
  volumes:
    - ./ssl:/etc/nginx/ssl
  ports:
    - "443:443"
```

## 📊 性能优化

### 前端优化
- Code splitting（按路由）
- Image optimization（Next.js Image）
- 虚拟滚动（大列表）
- React Query 缓存

### 后端优化
- 数据库索引
- N+1 查询优化
- Redis 缓存
- 连接池配置

### 数据库优化
```sql
-- 添加索引
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_order_user ON orders(user_id);
```

## 🐛 故障排查

### 前后端类型不匹配

```bash
# 重新同步类型
/connect openapi

# 或启用监听模式
/connect openapi --watch
```

### 部署失败

```bash
# 检查日志
docker-compose logs -f

# 运行健康检查
curl http://localhost:4000/health
```

### 数据库连接问题

```bash
# 测试连接
psql $DATABASE_URL

# 运行迁移
pnpm db:migrate
```

## 🤝 集成示例

### 与其他插件集成

```bash
# 使用 web-dev 插件创建组件
/component UserCard

# 使用 nodejs 插件创建 API
/api UserController rest

# 使用 fullstack 插件连接它们
/connect
```

## 📚 更多资源

- [架构设计指南](./docs/architecture.md)
- [部署指南](./docs/deployment.md)
- [API 集成最佳实践](./docs/api-integration.md)
- [性能优化指南](./docs/performance.md)

## 🤝 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](../../docs/contributing.md)

## 📄 许可证

MIT License

---

**Happy fullstack development!** 🚀✨
