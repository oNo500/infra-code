---
description: 创建全栈项目，自动配置前后端架构和集成
tags: [fullstack, project, init]
---

# 创建全栈项目

创建完整的全栈应用项目，自动配置前端、后端、数据库和部署流程。

## 使用方式

```bash
/project <project-name> [options]
```

## 选项

- `--frontend <framework>`: 前端框架 (react/vue/svelte，默认: react)
- `--backend <framework>`: 后端框架 (express/fastify/nestjs，默认: express)
- `--database <db>`: 数据库 (postgresql/mysql/mongodb，默认: postgresql)
- `--orm <orm>`: ORM 工具 (prisma/typeorm/mongoose，默认: prisma)
- `--auth`: 添加认证系统
- `--docker`: 添加 Docker 配置
- `--monorepo`: 使用 Monorepo 结构（pnpm workspace）

## 示例

```bash
# 基础项目
/project my-app

# 完整配置
/project my-saas --frontend react --backend nestjs --database postgresql --orm prisma --auth --docker --monorepo
```

## 执行流程

当你使用 `/project` 命令时，我会：

### 1. 项目结构规划
询问或使用默认配置：
- 项目名称和描述
- 前端技术栈选择
- 后端技术栈选择
- 数据库选择
- 是否需要认证系统
- 部署平台（Vercel/Railway/AWS）

### 2. Monorepo 结构（如果选择）
```
my-app/
├── apps/
│   ├── web/          # 前端应用
│   └── api/          # 后端 API
├── packages/
│   ├── ui/           # 共享 UI 组件
│   ├── types/        # 共享类型定义
│   ├── config/       # 共享配置
│   └── utils/        # 共享工具函数
├── pnpm-workspace.yaml
├── package.json
└── turbo.json
```

### 3. 前端应用创建
使用 web-dev 插件的功能：
- 创建 React/Vue/Svelte 项目
- 配置 TypeScript
- 添加路由系统
- 设置状态管理
- 配置 API 客户端
- 添加 UI 组件库

### 4. 后端 API 创建
使用 nodejs 插件的功能：
- 创建 Express/Fastify/NestJS 项目
- 配置 TypeScript
- 设置数据库连接
- 创建基础 API 路由
- 配置中间件（CORS、日志等）
- 设置环境变量

### 5. 数据库配置
- 创建 Prisma/TypeORM 配置
- 生成初始 Schema
- 创建迁移脚本
- 配置种子数据

### 6. 认证系统（可选）
如果选择 `--auth`：
- 后端：JWT 中间件、用户模型、认证 API
- 前端：登录页面、认证 Context、路由守卫
- 密码哈希（bcrypt）
- Token 刷新机制

### 7. API 集成
- 生成 TypeScript 类型定义（共享）
- 创建 API 客户端（axios/fetch）
- 配置 API 代理（开发环境）
- 添加请求拦截器

### 8. Docker 配置（可选）
如果选择 `--docker`：
```yaml
# docker-compose.yml
version: '3.8'
services:
  web:
    build: ./apps/web
    ports: ["3000:3000"]
  api:
    build: ./apps/api
    ports: ["4000:4000"]
    environment:
      DATABASE_URL: postgresql://...
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: myapp
```

### 9. 开发脚本
创建 `package.json` 脚本：
```json
{
  "scripts": {
    "dev": "turbo run dev",
    "dev:web": "pnpm --filter web dev",
    "dev:api": "pnpm --filter api dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "db:migrate": "pnpm --filter api db:migrate",
    "db:seed": "pnpm --filter api db:seed"
  }
}
```

### 10. 环境变量模板
创建 `.env.example`：
```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/myapp"

# API
API_PORT=4000
API_URL=http://localhost:4000

# Frontend
VITE_API_URL=http://localhost:4000/api

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

### 11. README 文档
生成项目 README：
- 项目介绍
- 技术栈列表
- 安装步骤
- 开发指南
- 部署说明
- API 文档链接

## 生成的文件

### Monorepo 结构
```
my-app/
├── apps/
│   ├── web/
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── api/
│       ├── src/
│       ├── prisma/
│       └── package.json
├── packages/
│   ├── types/
│   │   └── src/index.ts
│   ├── config/
│   │   └── eslint-config/
│   └── ui/
│       └── src/components/
├── .env.example
├── docker-compose.yml
├── pnpm-workspace.yaml
├── turbo.json
├── package.json
└── README.md
```

## 最佳实践

### 类型共享
使用 `packages/types` 共享类型：
```typescript
// packages/types/src/user.ts
export interface User {
  id: number;
  email: string;
  name: string;
}

// 前端使用
import type { User } from '@my-app/types';

// 后端使用
import type { User } from '@my-app/types';
```

### API 契约
使用 OpenAPI/tRPC 确保前后端契约：
```typescript
// packages/api-contract/src/index.ts
export const apiContract = {
  users: {
    list: { method: 'GET', path: '/users' },
    create: { method: 'POST', path: '/users' }
  }
};
```

### 统一配置
```typescript
// packages/config/src/index.ts
export const config = {
  api: {
    baseUrl: process.env.API_URL,
    timeout: 10000
  },
  auth: {
    tokenKey: 'access_token'
  }
};
```

## 快速开始

创建项目后：
```bash
cd my-app

# 安装依赖
pnpm install

# 设置环境变量
cp .env.example .env
# 编辑 .env 文件

# 运行数据库迁移
pnpm db:migrate

# 启动开发服务器
pnpm dev
```

访问：
- 前端：http://localhost:3000
- 后端：http://localhost:4000
- API 文档：http://localhost:4000/docs

## 故障排查

### 端口冲突
```bash
# 检查端口占用
lsof -i :3000
lsof -i :4000

# 修改端口
# 编辑 apps/web/.env 和 apps/api/.env
```

### 数据库连接失败
```bash
# 检查数据库是否运行
docker ps | grep postgres

# 测试连接
psql $DATABASE_URL
```

### Monorepo 依赖问题
```bash
# 清理并重新安装
pnpm clean
pnpm install

# 重新构建
pnpm build
```
