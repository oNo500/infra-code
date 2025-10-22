# Node.js Plugin

Node.js 后端开发工具集，为 Claude Code 提供全面的后端开发支持，包括 API 设计、数据模型、中间件和安全审计。

## 🚀 功能特性

### 📝 Commands（斜杠命令）

- **`/api`** - 创建 API 端点
  - RESTful API 支持
  - GraphQL Resolver 生成
  - 自动生成路由配置
  - OpenAPI/Swagger 文档
  - 请求验证
  - 错误处理

- **`/model`** - 创建数据模型
  - Prisma Schema
  - TypeORM Entity
  - Mongoose Schema
  - Sequelize Model
  - 关系定义
  - 迁移脚本

- **`/middleware`** - 创建中间件
  - 认证中间件（JWT/Session）
  - 授权中间件
  - 日志记录
  - 错误处理
  - 速率限制
  - CORS 配置

- **`/test-api`** - API 测试
  - Jest + Supertest
  - 单元测试
  - 集成测试
  - Mock 数据
  - 测试覆盖率

### 🤖 Agents（智能代理）

- **`api-designer`** - API 设计专家
  - 需求分析
  - API 架构设计
  - OpenAPI 规范生成
  - 版本管理建议
  - 最佳实践指导

- **`security-auditor`** - 安全审计专家
  - SQL/NoSQL 注入检测
  - XSS 漏洞识别
  - 认证授权审查
  - 依赖漏洞扫描
  - 配置安全检查

### ⚡ Skills（技能）

- **`error-handler`** - 错误处理器
  - 统一错误格式（RFC 7807）
  - 错误日志记录
  - 堆栈追踪
  - 错误恢复策略

- **`validation-builder`** - 验证构建器
  - 从 TypeScript 生成验证规则
  - 支持 Zod/Joi/Yup
  - 自定义验证规则
  - 错误消息本地化

### 🔗 Hooks（事件钩子）

- **PreToolUse**
  - 数据库操作前验证连接
  - 部署前运行测试

- **PostToolUse**
  - ESLint 自动修复
  - API 文档自动更新

### 🌐 MCP Servers

- **filesystem** - 项目文件访问

## 📦 安装

```bash
claude
/plugin marketplace add https://github.com/your-org/code-infra
/plugin install nodejs@code-infra
```

## 🎯 快速开始

### 创建 RESTful API

```bash
/api UserController rest
```

生成的文件：
- `routes/users.ts` - 路由定义
- `controllers/UserController.ts` - 控制器
- `validators/user.validator.ts` - 验证规则
- `tests/users.test.ts` - 测试文件

### 创建数据模型

```bash
/model User --orm prisma --with-relations
```

### 创建中间件

```bash
/middleware auth
/middleware logger
/middleware rate-limit
```

### 运行安全审计

```bash
审查项目的安全漏洞
检查 API 的 SQL 注入风险
扫描依赖包的已知漏洞
```

## 🛠️ 支持的技术栈

### Web 框架
- ✅ Express.js
- ✅ Fastify
- ✅ Koa
- ✅ NestJS

### ORM/ODM
- ✅ Prisma
- ✅ TypeORM
- ✅ Sequelize
- ✅ Mongoose

### 验证库
- ✅ Zod
- ✅ Joi
- ✅ Yup
- ✅ class-validator

### 测试框架
- ✅ Jest
- ✅ Vitest
- ✅ Supertest
- ✅ Mocha/Chai

### 数据库
- ✅ PostgreSQL
- ✅ MySQL
- ✅ MongoDB
- ✅ SQLite
- ✅ Redis

## 📖 使用指南

### 工作流示例

#### 新 API 开发
```bash
# 1. 设计 API
设计一个用户管理 API

# 2. 创建模型
/model User --orm prisma

# 3. 创建 API 端点
/api UserController rest

# 4. 添加中间件
/middleware auth

# 5. 编写测试
/test-api UserController

# 6. 安全审查
审查 UserController 的安全性
```

#### 性能优化
```bash
# 1. 分析性能瓶颈
分析 API 的性能问题

# 2. 优化数据库查询
# ... 根据建议优化

# 3. 添加缓存
/middleware cache

# 4. 验证效果
运行性能测试
```

## 🔒 安全最佳实践

### 必做清单
- ✅ 使用环境变量存储敏感信息
- ✅ 实施输入验证和净化
- ✅ 使用参数化查询防止 SQL 注入
- ✅ 密码哈希（bcrypt/argon2）
- ✅ 实施 JWT 最佳实践
- ✅ 启用 Rate limiting
- ✅ 使用 Helmet.js 设置安全头部
- ✅ 实施 CORS 策略
- ✅ 日志记录（不记录敏感信息）
- ✅ 定期更新依赖

### Helmet.js 配置
```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true
  }
}));
```

### Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100 // 限制 100 次请求
});

app.use('/api/', limiter);
```

## 🐛 故障排查

### 问题：数据库连接失败

**解决方案**：
```bash
# 检查环境变量
echo $DATABASE_URL

# 测试数据库连接
npx prisma db pull
```

### 问题：API 测试失败

**解决方案**：
```bash
# 检查测试配置
cat jest.config.js

# 运行单个测试
npm test -- UserController.test.ts

# 查看详细输出
npm test -- --verbose
```

## 📊 性能优化建议

### 数据库查询优化
- 使用索引
- 避免 N+1 查询
- 使用连接池
- 实施查询缓存

### API 响应优化
- 实施分页
- 使用字段过滤
- 启用压缩（gzip）
- 使用 CDN

### 缓存策略
- Redis 缓存
- HTTP 缓存头
- 查询结果缓存
- API 响应缓存

## 🤝 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](../../docs/contributing.md)

## 📄 许可证

MIT License

---

**Happy backend development with Node.js!** 🚀✨
