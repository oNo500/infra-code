---
description: API 测试（Jest/Supertest）
---

# API 测试

生成 API 测试代码，支持单元测试和集成测试，使用 Jest 和 Supertest。

## 测试示例

### 集成测试
```typescript
import request from 'supertest';
import app from '../app';

describe('User API', () => {
  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.email).toBe('test@example.com');
    });

    it('should return 400 for invalid email', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({
          email: 'invalid-email',
          password: 'password123'
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user by id', async () => {
      const res = await request(app).get('/api/users/1');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('id', 1);
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app).get('/api/users/9999');
      expect(res.status).toBe(404);
    });
  });
});
```

### Mock 数据
```typescript
import { prismaMock } from '../test/prisma-mock';

describe('UserService', () => {
  it('should create a user', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User'
    };

    prismaMock.user.create.mockResolvedValue(mockUser);

    const user = await userService.createUser({
      email: 'test@example.com',
      password: 'password123'
    });

    expect(user).toEqual(mockUser);
  });
});
```

## 示例用法
```bash
/test-api UserController
/test-api /api/users --integration
/test-api UserService --unit
```
