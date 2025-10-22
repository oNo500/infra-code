---
description: 创建 API 端点（RESTful/GraphQL）
---

# 创建 API 端点

帮助用户快速创建 API 端点，支持 RESTful 和 GraphQL 两种风格，自动生成路由配置、请求验证和文档。

## 参数
- 端点名称：$ARGUMENTS 的第一个参数
- API 类型：$ARGUMENTS 的第二个参数（rest/graphql，可选）
- HTTP 方法：$ARGUMENTS 的第三个参数（GET/POST/PUT/DELETE，可选）

## 功能特性

### 1. RESTful API

#### Express 路由示例
```typescript
import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

const router = Router();

/**
 * @route   GET /api/users/:id
 * @desc    获取用户信息
 * @access  Public
 */
router.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ data: user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @route   POST /api/users
 * @desc    创建新用户
 * @access  Private
 */
router.post('/users', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.create(req.body);
    res.status(201).json({ data: user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
```

#### Fastify 路由示例
```typescript
import { FastifyPluginAsync } from 'fastify';

const userRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /users/:id
  fastify.get<{ Params: { id: string } }>(
    '/users/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' }
          }
        }
      }
    },
    async (request, reply) => {
      const user = await User.findById(request.params.id);
      return { data: user };
    }
  );

  // POST /users
  fastify.post<{ Body: CreateUserDto }>(
    '/users',
    {
      schema: {
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 }
          }
        }
      }
    },
    async (request, reply) => {
      const user = await User.create(request.body);
      reply.code(201).send({ data: user });
    }
  );
};

export default userRoutes;
```

### 2. GraphQL API

#### Type Definitions
```graphql
type User {
  id: ID!
  email: String!
  name: String
  createdAt: DateTime!
}

type Query {
  user(id: ID!): User
  users(limit: Int, offset: Int): [User!]!
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!
}

input CreateUserInput {
  email: String!
  password: String!
  name: String
}

input UpdateUserInput {
  email: String
  name: String
}
```

#### Resolvers
```typescript
import { IResolvers } from '@graphql-tools/utils';

const resolvers: IResolvers = {
  Query: {
    user: async (_, { id }, context) => {
      return context.dataSources.userAPI.getUserById(id);
    },
    users: async (_, { limit = 10, offset = 0 }, context) => {
      return context.dataSources.userAPI.getUsers(limit, offset);
    }
  },

  Mutation: {
    createUser: async (_, { input }, context) => {
      return context.dataSources.userAPI.createUser(input);
    },
    updateUser: async (_, { id, input }, context) => {
      return context.dataSources.userAPI.updateUser(id, input);
    },
    deleteUser: async (_, { id }, context) => {
      return context.dataSources.userAPI.deleteUser(id);
    }
  }
};

export default resolvers;
```

### 3. 自动生成功能

#### OpenAPI/Swagger 文档
```typescript
/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: 创建新用户
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       201:
 *         description: 用户创建成功
 *       400:
 *         description: 请求参数错误
 */
```

#### 请求验证
- 使用 Joi/Yup/Zod 进行验证
- 自动生成验证 schema
- 错误信息本地化

#### 错误处理
```typescript
class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errors?: any[]
  ) {
    super(message);
  }
}

// 全局错误处理中间件
app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: err.message,
      errors: err.errors
    });
  }

  res.status(500).json({ error: 'Internal server error' });
});
```

### 4. 认证和授权

```typescript
import jwt from 'jsonwebtoken';

// JWT 中间件
export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new ApiError(401, 'No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    next(new ApiError(401, 'Invalid token'));
  }
};

// 权限检查
export const authorize = (...roles: string[]) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Insufficient permissions'));
    }
    next();
  };
};

// 使用示例
router.get('/admin/users',
  authenticate,
  authorize('admin'),
  async (req, res) => {
    // Admin only endpoint
  }
);
```

## 最佳实践

1. **RESTful 设计原则**：
   - 使用名词而非动词（`/users` 而非 `/getUsers`）
   - 使用正确的 HTTP 方法
   - 返回适当的状态码
   - 实现 HATEOAS

2. **错误处理**：
   - 统一的错误响应格式
   - 详细的错误信息（开发环境）
   - 安全的错误信息（生产环境）

3. **性能优化**：
   - 实现分页
   - 使用缓存
   - 数据库查询优化
   - 压缩响应

4. **安全性**：
   - 输入验证
   - SQL 注入防护
   - XSS 防护
   - CSRF 保护
   - Rate limiting

## 示例用法

```bash
# 创建 RESTful API
/api UserController rest

# 创建 GraphQL resolver
/api UserResolver graphql

# 创建特定方法的端点
/api GetUser GET

# 完整配置
/api CreateUser POST --with-validation --with-auth --with-docs
```

## 生成的文件

- `routes/users.ts` - 路由定义
- `controllers/UserController.ts` - 控制器
- `validators/user.validator.ts` - 验证规则
- `docs/users.yaml` - API 文档
- `tests/users.test.ts` - 测试文件

## 注意事项
- 遵循 RESTful 或 GraphQL 最佳实践
- 始终验证输入数据
- 实现适当的错误处理
- 编写 API 文档
- 添加单元测试和集成测试
