---
description: 创建端到端功能，自动生成前端界面和后端 API
tags: [fullstack, feature, crud]
---

# 创建端到端功能

创建完整的端到端功能，自动生成前端页面/组件和对应的后端 API。

## 使用方式

```bash
/feature <feature-name> [options]
```

## 选项

- `--type <type>`: 功能类型 (crud/form/dashboard/auth，默认: crud)
- `--entity <name>`: 实体名称（如 User、Product）
- `--fields <fields>`: 字段定义
- `--auth`: 需要认证
- `--realtime`: 添加实时更新（WebSocket）

## 示例

```bash
# CRUD 功能
/feature users --type crud --entity User --fields "name:string,email:string,age:number"

# 表单功能
/feature contact-form --type form --fields "name:string,email:string,message:text"

# Dashboard
/feature analytics --type dashboard

# 认证功能
/feature auth --type auth
```

## 执行流程

### 1. 功能类型：CRUD

创建完整的 CRUD 功能（Create, Read, Update, Delete）

#### 后端实现（使用 nodejs 插件）
```typescript
// apps/api/src/models/user.model.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  age: number;
}

// apps/api/src/controllers/user.controller.ts
import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

export class UserController {
  // GET /users
  async findAll(req: Request, res: Response) {
    const { page = 1, limit = 10, search } = req.query;
    const users = await UserService.findAll({ page, limit, search });
    res.json(users);
  }

  // GET /users/:id
  async findOne(req: Request, res: Response) {
    const user = await UserService.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  }

  // POST /users
  async create(req: Request, res: Response) {
    const user = await UserService.create(req.body);
    res.status(201).json(user);
  }

  // PUT /users/:id
  async update(req: Request, res: Response) {
    const user = await UserService.update(req.params.id, req.body);
    res.json(user);
  }

  // DELETE /users/:id
  async delete(req: Request, res: Response) {
    await UserService.delete(req.params.id);
    res.status(204).send();
  }
}

// apps/api/src/routes/user.routes.ts
import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validateUser } from '../validators/user.validator';

const router = Router();
const controller = new UserController();

router.get('/users', controller.findAll);
router.get('/users/:id', controller.findOne);
router.post('/users', validateUser, controller.create);
router.put('/users/:id', validateUser, controller.update);
router.delete('/users/:id', controller.delete);

export default router;
```

#### 前端实现（使用 web-dev 插件）
```typescript
// apps/web/src/api/users.ts
import { api } from './client';
import type { User, CreateUserDto, UpdateUserDto } from '@my-app/types';

export const usersApi = {
  findAll: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<{ data: User[]; total: number }>('/users', { params }),

  findOne: (id: number) =>
    api.get<User>(`/users/${id}`),

  create: (data: CreateUserDto) =>
    api.post<User>('/users', data),

  update: (id: number, data: UpdateUserDto) =>
    api.put<User>(`/users/${id}`, data),

  delete: (id: number) =>
    api.delete(`/users/${id}`)
};

// apps/web/src/pages/Users/UserList.tsx
import React, { useState, useEffect } from 'react';
import { usersApi } from '../../api/users';
import type { User } from '@my-app/types';

export const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadUsers();
  }, [page]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await usersApi.findAll({ page, limit: 10 });
      setUsers(data.data);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除吗？')) return;
    try {
      await usersApi.delete(id);
      loadUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  return (
    <div>
      <h1>用户管理</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>姓名</th>
            <th>邮箱</th>
            <th>年龄</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.age}</td>
              <td>
                <button onClick={() => handleEdit(user.id)}>编辑</button>
                <button onClick={() => handleDelete(user.id)}>删除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* 分页组件 */}
    </div>
  );
};

// apps/web/src/pages/Users/UserForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usersApi } from '../../api/users';

const userSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  email: z.string().email('邮箱格式不正确'),
  age: z.number().min(0).max(150)
});

type UserFormData = z.infer<typeof userSchema>;

export const UserForm: React.FC<{ id?: number }> = ({ id }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<UserFormData>({
    resolver: zodResolver(userSchema)
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      if (id) {
        await usersApi.update(id, data);
      } else {
        await usersApi.create(data);
      }
      // 导航回列表页
    } catch (error) {
      console.error('Failed to save user:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>姓名</label>
        <input {...register('name')} />
        {errors.name && <span>{errors.name.message}</span>}
      </div>
      <div>
        <label>邮箱</label>
        <input {...register('email')} type="email" />
        {errors.email && <span>{errors.email.message}</span>}
      </div>
      <div>
        <label>年龄</label>
        <input {...register('age', { valueAsNumber: true })} type="number" />
        {errors.age && <span>{errors.age.message}</span>}
      </div>
      <button type="submit">保存</button>
    </form>
  );
};
```

#### 共享类型定义
```typescript
// packages/types/src/user.ts
export interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  name: string;
  email: string;
  age: number;
}

export interface UpdateUserDto extends Partial<CreateUserDto> {}

export interface UserListQuery {
  page?: number;
  limit?: number;
  search?: string;
}
```

### 2. 功能类型：Form

创建独立表单功能（如联系表单、反馈表单）

生成文件：
- 后端：表单提交 API、邮件通知
- 前端：表单组件、验证、提交处理
- 集成：reCAPTCHA、文件上传

### 3. 功能类型：Dashboard

创建数据看板功能

生成文件：
- 后端：统计 API、数据聚合
- 前端：图表组件（Chart.js/Recharts）、数据可视化
- 实时更新：WebSocket 集成

### 4. 功能类型：Auth

创建认证功能

生成文件：
- 后端：JWT 认证、用户管理、权限控制
- 前端：登录/注册页面、路由守卫、Token 管理
- 集成：OAuth（可选）

## 实时功能（--realtime）

如果添加 `--realtime` 选项：

### 后端 WebSocket
```typescript
// apps/api/src/websocket/users.gateway.ts
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class UsersGateway {
  @WebSocketServer()
  server: Server;

  notifyUserCreated(user: User) {
    this.server.emit('user:created', user);
  }

  notifyUserUpdated(user: User) {
    this.server.emit('user:updated', user);
  }

  notifyUserDeleted(id: number) {
    this.server.emit('user:deleted', { id });
  }
}
```

### 前端 WebSocket 客户端
```typescript
// apps/web/src/hooks/useRealtimeUsers.ts
import { useEffect } from 'react';
import { socket } from '../lib/socket';

export const useRealtimeUsers = (onUpdate: () => void) => {
  useEffect(() => {
    socket.on('user:created', onUpdate);
    socket.on('user:updated', onUpdate);
    socket.on('user:deleted', onUpdate);

    return () => {
      socket.off('user:created');
      socket.off('user:updated');
      socket.off('user:deleted');
    };
  }, [onUpdate]);
};
```

## 生成的路由配置

### 前端路由
```typescript
// apps/web/src/routes/users.tsx
import { UserList } from '../pages/Users/UserList';
import { UserForm } from '../pages/Users/UserForm';
import { UserDetail } from '../pages/Users/UserDetail';

export const userRoutes = [
  {
    path: '/users',
    element: <UserList />
  },
  {
    path: '/users/new',
    element: <UserForm />
  },
  {
    path: '/users/:id',
    element: <UserDetail />
  },
  {
    path: '/users/:id/edit',
    element: <UserForm />
  }
];
```

## 测试文件

自动生成前后端测试：
```typescript
// apps/api/tests/users.test.ts
import request from 'supertest';
import { app } from '../src/app';

describe('User API', () => {
  it('should list users', async () => {
    const res = await request(app).get('/users');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  it('should create user', async () => {
    const res = await request(app)
      .post('/users')
      .send({ name: 'Test', email: 'test@example.com', age: 25 });
    expect(res.status).toBe(201);
    expect(res.body.email).toBe('test@example.com');
  });
});
```

## 最佳实践

### API 契约优先
1. 定义共享类型
2. 生成后端实现
3. 生成前端客户端

### 错误处理
- 后端：统一错误格式
- 前端：错误边界、Toast 通知

### 加载状态
- Skeleton screens
- Loading indicators
- Optimistic updates

### 数据验证
- 后端：使用 Zod/Joi
- 前端：React Hook Form + Zod
- 共享验证规则
