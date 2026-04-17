# Quickstart

## Setup

- Node.js 22（`lts/jod`，见 `.nvmrc`）
- pnpm 10.30+
- PostgreSQL（仅 `apps/api-web` 需要）

```bash
pnpm install
```

### 环境变量

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/api-web/.env.example apps/api-web/.env.local  # 按实际环境修改其中的值
```

### DB 初始化（仅 apps/api-web）

```bash
pnpm -F api-web db:push
```

## Dev Server

```bash
pnpm dev              # 同时启动所有应用（turbo）
pnpm -F web dev       # 只启动 apps/web
pnpm -F api-web dev   # 只启动 apps/api-web
```

## CI Commands

```bash
# Lint
pnpm lint

# TypeScript 类型检查
pnpm typecheck

# 运行测试（需指定应用，test 未在 turbo 中配置）
pnpm -F web test                              # 全部
pnpm -F web test -- --project=unit            # 只跑 unit
pnpm -F web test -- --project=e2e             # 只跑 e2e
pnpm -F api-web test                          # api-web 全部
```

CI 在 PR 时自动运行 lint / typecheck / test。
