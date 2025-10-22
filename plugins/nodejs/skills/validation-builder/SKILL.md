---
name: validation-builder
description: 输入验证规则生成器
---

# Validation Builder Skill

自动生成输入验证规则，支持 Joi、Yup、Zod 等验证库。

## 功能
- 从 TypeScript 接口生成验证 schema
- 自定义验证规则
- 错误消息本地化
- 嵌套对象验证
- 数组验证

## 支持的验证库

### Zod
```typescript
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  age: z.number().int().positive().optional()
});
```

### Joi
```typescript
import Joi from 'joi';

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  age: Joi.number().integer().positive()
});
```

### Yup
```typescript
import * as yup from 'yup';

const userSchema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
  age: yup.number().positive().integer()
});
```

## 输入参数
```json
{
  "interface": "TypeScript interface",
  "library": "zod|joi|yup",
  "options": {
    "strict": true,
    "custom_messages": {}
  }
}
```

## 返回值
```json
{
  "schema": "string",
  "validator_function": "string"
}
```
