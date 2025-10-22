---
description: 连接前后端，生成类型安全的 API 客户端
tags: [fullstack, api, integration]
---

# 连接前后端 API

自动生成类型安全的 API 客户端，同步前后端类型定义，确保端到端的类型安全。

## 使用方式

```bash
/connect [strategy] [options]
```

## 策略选择

- `openapi` - 使用 OpenAPI/Swagger 生成客户端
- `trpc` - 使用 tRPC 实现端到端类型安全
- `graphql` - 使用 GraphQL + Codegen
- `manual` - 手动创建类型定义和客户端

## 选项

- `--spec <file>`: OpenAPI 规范文件路径
- `--output <dir>`: 输出目录
- `--watch`: 监听后端变化自动重新生成
- `--validate`: 运行时类型验证

## 示例

```bash
# OpenAPI 方式
/connect openapi --spec apps/api/openapi.json --output apps/web/src/api

# tRPC 方式
/connect trpc

# GraphQL 方式
/connect graphql --watch
```

## 策略详解

### 1. OpenAPI/Swagger 方式

适合：RESTful API、已有 OpenAPI 规范

#### 后端：生成 OpenAPI 规范

使用 Express + Swagger
```typescript
// apps/api/src/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'API documentation'
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts']
};

export const setupSwagger = (app: Express) => {
  const specs = swaggerJsdoc(options);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

  // 导出 JSON
  app.get('/openapi.json', (req, res) => {
    res.json(specs);
  });
};
```

使用 JSDoc 注释定义 API
```typescript
// apps/api/src/controllers/user.controller.ts
/**
 * @openapi
 * /users:
 *   get:
 *     summary: 获取用户列表
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 total:
 *                   type: integer
 *
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         age:
 *           type: integer
 */
export class UserController {
  async findAll(req: Request, res: Response) {
    // 实现
  }
}
```

#### 前端：生成类型和客户端

使用 openapi-typescript 和 openapi-fetch
```bash
# 安装依赖
npm install openapi-fetch
npm install -D openapi-typescript

# 生成类型
npx openapi-typescript http://localhost:4000/openapi.json -o apps/web/src/api/schema.d.ts
```

创建 API 客户端
```typescript
// apps/web/src/api/client.ts
import createClient from 'openapi-fetch';
import type { paths } from './schema';

export const api = createClient<paths>({
  baseUrl: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 添加认证拦截器
api.use({
  onRequest: ({ request }) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`);
    }
    return request;
  },
  onResponse: ({ response }) => {
    if (response.status === 401) {
      // 处理认证失败
      window.location.href = '/login';
    }
    return response;
  }
});
```

使用生成的客户端
```typescript
// apps/web/src/hooks/useUsers.ts
import { api } from '../api/client';
import { useQuery } from '@tanstack/react-query';

export const useUsers = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ['users', page, limit],
    queryFn: async () => {
      const { data, error } = await api.GET('/users', {
        params: {
          query: { page, limit }
        }
      });

      if (error) throw error;
      return data;
    }
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: CreateUserDto) => {
      const { data, error } = await api.POST('/users', {
        body: userData
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};
```

### 2. tRPC 方式

适合：TypeScript 全栈、需要完全类型安全

#### 后端：定义 tRPC Router

```typescript
// apps/api/src/trpc/router.ts
import { initTRPC } from '@trpc/server';
import { z } from 'zod';

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

// 定义用户路由
export const userRouter = router({
  list: publicProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(10),
      search: z.string().optional()
    }))
    .query(async ({ input }) => {
      const users = await db.user.findMany({
        skip: (input.page - 1) * input.limit,
        take: input.limit,
        where: input.search ? {
          name: { contains: input.search }
        } : undefined
      });
      const total = await db.user.count();
      return { data: users, total };
    }),

  byId: publicProcedure
    .input(z.number())
    .query(async ({ input }) => {
      return await db.user.findUnique({
        where: { id: input }
      });
    }),

  create: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      email: z.string().email(),
      age: z.number().min(0).max(150)
    }))
    .mutation(async ({ input }) => {
      return await db.user.create({
        data: input
      });
    }),

  update: publicProcedure
    .input(z.object({
      id: z.number(),
      data: z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        age: z.number().optional()
      })
    }))
    .mutation(async ({ input }) => {
      return await db.user.update({
        where: { id: input.id },
        data: input.data
      });
    }),

  delete: publicProcedure
    .input(z.number())
    .mutation(async ({ input }) => {
      await db.user.delete({
        where: { id: input }
      });
    })
});

// 主路由
export const appRouter = router({
  user: userRouter,
  // 其他路由...
});

export type AppRouter = typeof appRouter;
```

#### 服务器设置
```typescript
// apps/api/src/server.ts
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { appRouter } from './trpc/router';

const server = createHTTPServer({
  router: appRouter,
  createContext: () => ({})
});

server.listen(4000);
```

#### 前端：配置 tRPC 客户端

```typescript
// apps/web/src/lib/trpc.ts
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../../../api/src/trpc/router';

export const trpc = createTRPCReact<AppRouter>();
```

```typescript
// apps/web/src/App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from './lib/trpc';

const queryClient = new QueryClient();

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: 'http://localhost:4000/trpc',
      headers: () => {
        const token = localStorage.getItem('access_token');
        return token ? { authorization: `Bearer ${token}` } : {};
      }
    })
  ]
});

export const App = () => (
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      {/* 你的应用 */}
    </QueryClientProvider>
  </trpc.Provider>
);
```

#### 使用 tRPC
```typescript
// apps/web/src/components/UserList.tsx
import { trpc } from '../lib/trpc';

export const UserList = () => {
  const { data, isLoading } = trpc.user.list.useQuery({
    page: 1,
    limit: 10
  });

  const createUser = trpc.user.create.useMutation({
    onSuccess: () => {
      // 重新获取列表
      trpc.useContext().user.list.invalidate();
    }
  });

  const handleCreate = () => {
    createUser.mutate({
      name: 'John Doe',
      email: 'john@example.com',
      age: 30
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {data?.data.map(user => (
        <div key={user.id}>
          {user.name} - {user.email}
        </div>
      ))}
      <button onClick={handleCreate}>Create User</button>
    </div>
  );
};
```

### 3. GraphQL 方式

适合：复杂查询需求、灵活的数据获取

#### 后端：定义 GraphQL Schema

```typescript
// apps/api/src/graphql/schema.ts
import { buildSchema } from 'graphql';

export const schema = buildSchema(`
  type User {
    id: Int!
    name: String!
    email: String!
    age: Int!
    posts: [Post!]!
  }

  type Post {
    id: Int!
    title: String!
    content: String!
    author: User!
  }

  input CreateUserInput {
    name: String!
    email: String!
    age: Int!
  }

  type Query {
    users(page: Int, limit: Int, search: String): UserConnection!
    user(id: Int!): User
  }

  type Mutation {
    createUser(input: CreateUserInput!): User!
    updateUser(id: Int!, input: UpdateUserInput!): User!
    deleteUser(id: Int!): Boolean!
  }

  type UserConnection {
    data: [User!]!
    total: Int!
  }
`);
```

#### Resolvers
```typescript
// apps/api/src/graphql/resolvers.ts
export const resolvers = {
  Query: {
    users: async (_: any, { page = 1, limit = 10, search }: any) => {
      const users = await db.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: search ? {
          name: { contains: search }
        } : undefined
      });
      const total = await db.user.count();
      return { data: users, total };
    },
    user: async (_: any, { id }: any) => {
      return await db.user.findUnique({ where: { id } });
    }
  },
  Mutation: {
    createUser: async (_: any, { input }: any) => {
      return await db.user.create({ data: input });
    }
  },
  User: {
    posts: async (parent: any) => {
      return await db.post.findMany({
        where: { authorId: parent.id }
      });
    }
  }
};
```

#### 前端：GraphQL Codegen

```yaml
# codegen.yml
schema: http://localhost:4000/graphql
documents: 'apps/web/src/**/*.graphql'
generates:
  apps/web/src/generated/graphql.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-react-query
    config:
      fetcher: graphql-request
```

```graphql
# apps/web/src/queries/users.graphql
query GetUsers($page: Int, $limit: Int) {
  users(page: $page, limit: $limit) {
    data {
      id
      name
      email
      age
    }
    total
  }
}

mutation CreateUser($input: CreateUserInput!) {
  createUser(input: $input) {
    id
    name
    email
  }
}
```

生成并使用
```typescript
// 生成
npm run codegen

// 使用
import { useGetUsersQuery, useCreateUserMutation } from '../generated/graphql';

export const UserList = () => {
  const { data } = useGetUsersQuery({ page: 1, limit: 10 });
  const [createUser] = useCreateUserMutation();

  // 使用...
};
```

## 类型共享最佳实践

### 方案 1：Shared Package
```typescript
// packages/types/src/user.ts
export interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

export interface CreateUserDto {
  name: string;
  email: string;
  age: number;
}
```

### 方案 2：类型生成
```typescript
// apps/api/src/types/generate.ts
import { writeFileSync } from 'fs';
import { compile } from 'json-schema-to-typescript';

// 从 Prisma schema 生成
import { DMMF } from '@prisma/generator-helper';

async function generateTypes(dmmf: DMMF.Document) {
  // 生成类型定义
  const types = generateFromDMMF(dmmf);
  writeFileSync('../web/src/types/api.ts', types);
}
```

## 运行时验证

使用 Zod 进行运行时验证
```typescript
// packages/validation/src/user.ts
import { z } from 'zod';

export const userSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().min(0).max(150)
});

export const createUserSchema = userSchema.omit({ id: true });

export type User = z.infer<typeof userSchema>;
export type CreateUserDto = z.infer<typeof createUserSchema>;
```

后端使用
```typescript
import { userSchema } from '@my-app/validation';

app.post('/users', (req, res) => {
  const result = createUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error });
  }
  // 处理请求
});
```

前端使用
```typescript
import { createUserSchema } from '@my-app/validation';

const handleSubmit = (data: unknown) => {
  const result = createUserSchema.safeParse(data);
  if (!result.success) {
    // 显示错误
  }
  // 提交
};
```

## 自动同步脚本

```bash
#!/bin/bash
# scripts/sync-types.sh

# 从后端生成 OpenAPI 规范
cd apps/api
npm run build
npm run generate:openapi

# 生成前端类型
cd ../web
npx openapi-typescript ../../api/openapi.json -o src/api/schema.d.ts

# 提示
echo "✅ Types synchronized successfully"
```

配置 package.json
```json
{
  "scripts": {
    "sync:types": "./scripts/sync-types.sh",
    "dev": "npm run sync:types && concurrently \"npm:dev:*\"",
    "dev:api": "cd apps/api && npm run dev",
    "dev:web": "cd apps/web && npm run dev"
  }
}
```

## 监听模式

使用 chokidar 监听变化
```typescript
// scripts/watch-types.ts
import chokidar from 'chokidar';
import { execSync } from 'child_process';

const watcher = chokidar.watch('apps/api/src/**/*.ts', {
  ignored: /node_modules/,
  persistent: true
});

watcher.on('change', (path) => {
  console.log(`File ${path} changed, regenerating types...`);
  try {
    execSync('npm run sync:types', { stdio: 'inherit' });
    console.log('✅ Types regenerated');
  } catch (error) {
    console.error('❌ Failed to regenerate types');
  }
});

console.log('👀 Watching for changes...');
```
