---
name: api-connector
description: 自动生成类型安全的 API 客户端和同步前后端类型
version: 0.1.0
---

# API Connector Skill

自动分析后端 API，生成类型安全的前端客户端代码，并保持前后端类型同步。

## 功能

- 从后端代码生成 OpenAPI 规范
- 生成类型安全的 API 客户端
- 同步前后端类型定义
- 自动生成请求/响应类型
- 配置 API 拦截器

## 参数

```json
{
  "strategy": "openapi | trpc | graphql | manual",
  "backend_path": "string",
  "frontend_path": "string",
  "api_base_url": "string",
  "features": {
    "auth": true | false,
    "validation": true | false,
    "caching": true | false
  },
  "output": {
    "types_path": "string",
    "client_path": "string"
  }
}
```

## 使用示例

### OpenAPI 策略

```typescript
import { skillInvoke } from '@claude/skills';

const result = await skillInvoke('api-connector', {
  strategy: 'openapi',
  backend_path: './apps/api',
  frontend_path: './apps/web',
  api_base_url: 'http://localhost:4000',
  features: {
    auth: true,
    validation: true,
    caching: true
  },
  output: {
    types_path: 'src/types/api.ts',
    client_path: 'src/api/client.ts'
  }
});
```

## 工作流程

### 1. 分析后端 API

扫描后端代码，提取 API 端点信息：

```typescript
interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  params?: TypeDefinition;
  query?: TypeDefinition;
  body?: TypeDefinition;
  response: TypeDefinition;
  auth: boolean;
}
```

### 2. 生成 OpenAPI 规范

```yaml
# generated/openapi.json
openapi: 3.0.0
info:
  title: My API
  version: 1.0.0
paths:
  /users:
    get:
      summary: Get users list
      parameters:
        - name: page
          in: query
          schema:
            type: integer
        - name: limit
          in: query
          schema:
            type: integer
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/User'
                  total:
                    type: integer
components:
  schemas:
    User:
      type: object
      required:
        - id
        - email
        - name
      properties:
        id:
          type: integer
        email:
          type: string
          format: email
        name:
          type: string
        age:
          type: integer
```

### 3. 生成 TypeScript 类型

```typescript
// apps/web/src/types/api.ts

// ==================== 基础类型 ====================
export interface User {
  id: number;
  email: string;
  name: string;
  age: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
}

// ==================== DTO 类型 ====================
export interface CreateUserDto {
  email: string;
  name: string;
  age: number;
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
  age?: number;
}

export interface UserListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'name' | 'email' | 'createdAt';
  order?: 'asc' | 'desc';
}

// ==================== 响应类型 ====================
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  details?: unknown;
}

// ==================== API 端点类型 ====================
export interface ApiEndpoints {
  // Users
  'GET /users': {
    query: UserListQuery;
    response: PaginatedResponse<User>;
  };
  'GET /users/:id': {
    params: { id: number };
    response: ApiResponse<User>;
  };
  'POST /users': {
    body: CreateUserDto;
    response: ApiResponse<User>;
  };
  'PUT /users/:id': {
    params: { id: number };
    body: UpdateUserDto;
    response: ApiResponse<User>;
  };
  'DELETE /users/:id': {
    params: { id: number };
    response: void;
  };

  // Products
  'GET /products': {
    query: ProductListQuery;
    response: PaginatedResponse<Product>;
  };
  'POST /products': {
    body: CreateProductDto;
    response: ApiResponse<Product>;
  };
}
```

### 4. 生成 API 客户端

```typescript
// apps/web/src/api/client.ts
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { ApiEndpoints, ApiError } from '../types/api';

// ==================== 客户端配置 ====================
export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  onUnauthorized?: () => void;
}

// ==================== API 客户端类 ====================
export class ApiClient {
  private client: AxiosInstance;

  constructor(config: ApiClientConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      }
    });

    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        // 添加 token
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          config.onUnauthorized?.();
        }
        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  private getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private normalizeError(error: any): ApiError {
    if (error.response) {
      return {
        error: error.response.data.error || 'API Error',
        message: error.response.data.message || error.message,
        statusCode: error.response.status,
        details: error.response.data.details
      };
    }
    return {
      error: 'Network Error',
      message: error.message,
      statusCode: 0
    };
  }

  // ==================== 类型安全的请求方法 ====================
  async get<K extends keyof ApiEndpoints>(
    endpoint: K,
    config?: {
      params?: ApiEndpoints[K] extends { params: infer P } ? P : never;
      query?: ApiEndpoints[K] extends { query: infer Q } ? Q : never;
    }
  ): Promise<ApiEndpoints[K] extends { response: infer R } ? R : never> {
    const url = this.buildUrl(endpoint as string, config?.params);
    const response = await this.client.get(url, {
      params: config?.query
    });
    return response.data;
  }

  async post<K extends keyof ApiEndpoints>(
    endpoint: K,
    config?: {
      params?: ApiEndpoints[K] extends { params: infer P } ? P : never;
      body?: ApiEndpoints[K] extends { body: infer B } ? B : never;
    }
  ): Promise<ApiEndpoints[K] extends { response: infer R } ? R : never> {
    const url = this.buildUrl(endpoint as string, config?.params);
    const response = await this.client.post(url, config?.body);
    return response.data;
  }

  async put<K extends keyof ApiEndpoints>(
    endpoint: K,
    config?: {
      params?: ApiEndpoints[K] extends { params: infer P } ? P : never;
      body?: ApiEndpoints[K] extends { body: infer B } ? B : never;
    }
  ): Promise<ApiEndpoints[K] extends { response: infer R } ? R : never> {
    const url = this.buildUrl(endpoint as string, config?.params);
    const response = await this.client.put(url, config?.body);
    return response.data;
  }

  async delete<K extends keyof ApiEndpoints>(
    endpoint: K,
    config?: {
      params?: ApiEndpoints[K] extends { params: infer P } ? P : never;
    }
  ): Promise<ApiEndpoints[K] extends { response: infer R } ? R : never> {
    const url = this.buildUrl(endpoint as string, config?.params);
    const response = await this.client.delete(url);
    return response.data;
  }

  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    if (!params) return endpoint;

    let url = endpoint;
    for (const [key, value] of Object.entries(params)) {
      url = url.replace(`:${key}`, String(value));
    }
    return url;
  }
}

// ==================== 创建默认客户端实例 ====================
export const api = new ApiClient({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  onUnauthorized: () => {
    window.location.href = '/login';
  }
});
```

### 5. 生成 React Query Hooks

```typescript
// apps/web/src/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import type { User, CreateUserDto, UpdateUserDto, UserListQuery } from '../types/api';

// ==================== Query Keys ====================
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (query: UserListQuery) => [...userKeys.lists(), query] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const
};

// ==================== Queries ====================
export function useUsers(query: UserListQuery = {}) {
  return useQuery({
    queryKey: userKeys.list(query),
    queryFn: () => api.get('GET /users', { query }),
    staleTime: 30000 // 30 seconds
  });
}

export function useUser(id: number) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => api.get('GET /users/:id', { params: { id } }),
    enabled: !!id
  });
}

// ==================== Mutations ====================
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserDto) =>
      api.post('POST /users', { body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    }
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserDto }) =>
      api.put('PUT /users/:id', { params: { id }, body: data }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    }
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) =>
      api.delete('DELETE /users/:id', { params: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    }
  });
}
```

### 6. 使用示例

```typescript
// apps/web/src/components/UserList.tsx
import React from 'react';
import { useUsers, useDeleteUser } from '../hooks/useUsers';

export function UserList() {
  const { data, isLoading, error } = useUsers({
    page: 1,
    limit: 10,
    sortBy: 'name',
    order: 'asc'
  });

  const deleteUser = useDeleteUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Users ({data.total})</h1>
      <ul>
        {data.data.map((user) => (
          <li key={user.id}>
            {user.name} ({user.email})
            <button
              onClick={() => deleteUser.mutate(user.id)}
              disabled={deleteUser.isPending}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## 配置文件

### API 同步配置

```typescript
// api-sync.config.ts
import type { ApiSyncConfig } from '@my-app/api-sync';

export default {
  backend: {
    path: './apps/api',
    framework: 'nestjs',
    swagger: {
      endpoint: '/api-docs-json'
    }
  },
  frontend: {
    path: './apps/web',
    output: {
      types: 'src/types/api.ts',
      client: 'src/api/client.ts',
      hooks: 'src/hooks'
    }
  },
  generation: {
    strategy: 'openapi',
    includeAuth: true,
    includeValidation: true,
    caching: {
      enabled: true,
      defaultStaleTime: 30000
    }
  }
} satisfies ApiSyncConfig;
```

### package.json 脚本

```json
{
  "scripts": {
    "api:sync": "api-connector sync",
    "api:watch": "api-connector watch",
    "api:validate": "api-connector validate"
  }
}
```

## 监听模式

启用监听模式，自动检测后端变化并重新生成：

```bash
# 启动监听
pnpm api:watch

# 输出
👀 Watching for API changes...
✅ API types generated: src/types/api.ts
✅ API client generated: src/api/client.ts
✅ React Query hooks generated: src/hooks/
```

## 返回值

```typescript
interface SyncResult {
  success: boolean;
  files_generated: {
    types: string;
    client: string;
    hooks: string[];
  };
  endpoints_count: number;
  types_count: number;
  warnings: string[];
}
```

### 成功示例

```json
{
  "success": true,
  "files_generated": {
    "types": "apps/web/src/types/api.ts",
    "client": "apps/web/src/api/client.ts",
    "hooks": [
      "apps/web/src/hooks/useUsers.ts",
      "apps/web/src/hooks/useProducts.ts"
    ]
  },
  "endpoints_count": 15,
  "types_count": 28,
  "warnings": []
}
```

## 错误处理

### TypeScript 类型检查

生成的代码自动包含类型检查：

```typescript
// ✅ 正确
api.get('GET /users', {
  query: { page: 1, limit: 10 }
});

// ❌ 错误：缺少必需参数
api.get('GET /users/:id', {
  // TypeScript Error: Property 'params' is missing
});

// ❌ 错误：参数类型不匹配
api.post('POST /users', {
  body: {
    email: 'invalid-email', // 运行时验证会失败
    age: '25' // TypeScript Error: Type 'string' is not assignable to type 'number'
  }
});
```

## 最佳实践

1. **定期同步**：使用 watch 模式或在 CI/CD 中自动同步
2. **类型验证**：启用运行时类型验证（Zod）
3. **错误处理**：统一的错误处理和提示
4. **缓存策略**：合理配置 React Query 缓存时间
5. **版本控制**：生成的文件提交到 Git
6. **文档**：自动生成 API 文档（Swagger UI）
