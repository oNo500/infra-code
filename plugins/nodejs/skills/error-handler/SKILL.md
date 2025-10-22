---
name: error-handler
description: 统一错误处理和日志记录
---

# Error Handler Skill

统一错误处理技能，提供一致的错误格式、错误日志记录和错误恢复策略。

## 功能
- 统一错误格式（RFC 7807）
- 错误分类和优先级
- 错误日志记录
- 堆栈追踪（开发环境）
- 错误恢复策略

## 输入参数
```json
{
  "error": "Error",
  "context": {
    "request": "Request",
    "user": "User"
  },
  "options": {
    "log_level": "error|warn|info",
    "include_stack": true,
    "notify": false
  }
}
```

## 返回值
```json
{
  "statusCode": 500,
  "error": {
    "type": "https://api.example.com/errors/internal-error",
    "title": "Internal Server Error",
    "detail": "An unexpected error occurred",
    "instance": "/api/users/123"
  }
}
```

## 错误类型
- ValidationError: 400
- UnauthorizedError: 401
- ForbiddenError: 403
- NotFoundError: 404
- ConflictError: 409
- InternalError: 500
