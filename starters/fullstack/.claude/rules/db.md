---
paths:
  - apps/api-web/src/db/**
---

# Database (Drizzle ORM)

## Schema

- Schema 统一在 `src/db/schema.ts`
- **所有 `timestamp` 字段必须加 `{ withTimezone: true }`** — Better Auth 传入 UTC ISO 字符串，`timestamp without time zone` 不做转换会导致时区偏移，OAuth 的 `expires_at` 会早于 `created_at` 触发数据库约束错误
- 字段命名：数据库 snake_case，TypeScript camelCase（Drizzle 自动映射）
- Better Auth 相关表（`user` / `session` / `account` / `verification`）由 `pnpm auth:generate` 维护，禁止手动修改

## Migrations

- 开发环境用 `db:push` 同步 schema
- 生产环境用 `db:generate` 生成迁移文件，再 `db:migrate` 执行

## Access Pattern

- **禁止在 `app/` 或 components 中直接调用 `db`** — 统一通过 `features/*/queries` 或 `features/*/mutations`
- `queries/` 放只读操作，`mutations/` 放写操作，均为纯函数，便于独立测试
