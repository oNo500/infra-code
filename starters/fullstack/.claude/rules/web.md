---
paths:
  - apps/web/**
---

# apps/web — Architecture Rules

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack) + React 19
- **UI**: Tailwind CSS v4、`@workspace/ui` (shadcn)、`@workspace/icons`
- **Theme**: next-themes
- **Env**: `@t3-oss/env-nextjs` + Zod
- **HTTP**: `@infra-x/fwrap`
- **Testing**: Vitest、`@testing-library/react`、`@testing-library/user-event`

## Architecture: Feature-Based

```
src/
├── app/                    # Next.js App Router（仅路由编排，无业务逻辑）
│   ├── (landing)/          # 路由分组
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── provide.tsx         # 全局 Provider 组件
│   ├── error.tsx / global-error.tsx / not-found.tsx
│   └── sitemap.ts
├── features/               # 按功能划分的业务模块
│   └── <name>/
│       └── <entry>.tsx     # feature 入口组件（子目录按需创建）
├── components/             # 跨 feature 共享组件
├── hooks/                  # 跨 feature 共享 hooks
├── lib/                    # 第三方库封装（fetch-client 等）
├── config/
│   ├── env.ts              # 环境变量集中声明（必须）
│   └── app-paths.ts        # 路由路径集中管理（必须）
├── styles/
│   └── globals.css
└── types/                  # 全局类型声明
```

## Feature Boundaries

**并入已有 feature** —— 同时满足：

1. **共享数据模型**：主数据模型与视图状态都落在当前 feature 内
2. **无独立入口**：不需要新增顶层路由或导航项
3. **同一交互域**：属于现有 feature 的同一组交互流程

**新建 feature** —— 任一条件即触发：

1. **顶层路由**：拥有独立的第一级 URL 段
2. **可独立下线**：移除该 feature 不影响其他功能
3. **独立数据来源**：消费的数据与现有 feature 基本不相交

### Shared component promotion

当 ≥ 2 个 feature 需要同一组件，提升到 `src/components/`，而不是为其新建 feature。

## Naming

- 文件 / 目录：kebab-case（`user-profile.tsx`、`auth-provider/`）
- 组件：PascalCase（`UserProfile`）
- 函数 / 变量：camelCase（`getUserData`）
- 类型 / 接口：PascalCase（`User`、`ApiResponse`）
- 常量：UPPER_SNAKE_CASE（`MAX_RETRIES`）

## `@workspace/ui` Usage

组件基于 `@base-ui/react`，**不**支持 Radix 风格的 `asChild`：

- `DropdownMenuTrigger` 用 `render` prop 传入自定义触发器
- `Button` 通过 style anchor 组合

## Testing

- 含测试的组件用目录组织：`components/foo/index.tsx` + `components/foo/foo.test.tsx`
- 跨模块 e2e 场景放在 `__tests__/e2e/`
- vitest 使用 `test.projects` 多 project 配置，`globals: true` 和 `setupFiles` 须在每个 project 内声明
- Mock 原则：`next/link`、`next-themes`、`@/config/env` 必须 mock；`@workspace/ui`、`@workspace/icons` 不需要 mock

## 禁止行为

- 禁止在 `app/` 路由文件中写业务逻辑或复杂 JSX（下沉到 `features/`）
- 禁止跨 feature 互相导入（共享逻辑下沉到 `lib/` / `components/`）—— 由 `pnpm lint:deps` 的 `no-cross-feature` 规则强制
- 禁止预建空目录；只按需创建
