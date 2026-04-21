---
paths:
  - apps/api-web/**
---

# apps/api-web — Architecture Rules

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack) + React 19
- **UI**: Tailwind CSS v4, `@workspace/ui` (shadcn), `@workspace/icons`
- **Auth**: Better Auth
- **Database**: PostgreSQL + Drizzle ORM
- **Theme**: next-themes
- **Env**: `@t3-oss/env-nextjs` + Zod
- **HTTP**: `@infra-x/fwrap` (fetch wrapper)
- **Testing**: Vitest, `@testing-library/react`, `@testing-library/user-event`

## Architecture Principles

1. **Feature-based organization** — 业务逻辑按 feature 划分，不按技术角色分层
2. **API Route 优先** — 内部 mutation 也通过 API Route，便于未来后端迁移
3. **Route files stay thin** — `page.tsx` 和 `route.ts` 只做编排，业务逻辑下沉到 `features/`
4. **Unidirectional imports** — `app/` → `features/` → `lib/` / `config/` / `db/`
5. **Zod 优先** — 所有输入校验用 Zod，禁止手写校验逻辑

## Naming

- 文件 / 目录：kebab-case（`user-profile.tsx`、`auth-provider/`）
- 组件：PascalCase（`UserProfile`）
- 函数 / 变量：camelCase（`getUserData`）
- 类型 / 接口：PascalCase（`User`、`AuthConfig`）
- 常量：UPPER_SNAKE_CASE（`API_BASE_URL`）

## Directory Structure

```
src/
├── app/                          # Next.js App Router（仅路由编排）
│   ├── (landing)/                # 公开页面分组（共享 Navbar + Footer 布局）
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── (auth)/                   # 认证分组（页面 + API 同组）
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── api/auth/[...all]/route.ts
│   ├── (dashboard)/              # 登录后分组（页面 + API 同组）
│   │   ├── layout.tsx
│   │   ├── posts/page.tsx
│   │   └── api/posts/route.ts
│   ├── layout.tsx                # 根布局
│   ├── provide.tsx               # ThemeProvider + Toaster
│   ├── error.tsx / global-error.tsx / not-found.tsx / sitemap.ts
├── features/                     # 业务模块（按 feature 内聚）
│   ├── auth/
│   │   ├── components/           # 大 feature 用子目录分层
│   │   ├── hooks/
│   │   ├── actions/              # Server Action（薄代理，仅 revalidate）
│   │   ├── queries/              # 服务端读操作
│   │   ├── mutations/            # 业务写操作（被 API Route 调用）
│   │   └── lib/validators.ts     # Zod schema（API + 前端共享）
│   └── landing/
│       └── hero-section.tsx      # 小 feature 保持平铺
├── components/                   # 跨 feature 共享 UI
├── hooks/                        # 跨 feature 共享 hooks
├── lib/
│   ├── auth.ts                   # Better Auth 服务端配置
│   ├── auth-client.ts            # Better Auth 客户端配置
│   ├── fetch-client.ts           # HTTP 客户端
│   └── api/
│       └── with-auth.ts          # Route Handler HOF: auth check + session injection
├── db/
│   ├── index.ts                  # Drizzle 连接实例
│   └── schema.ts                 # 数据库 schema
├── config/
│   ├── env.ts                    # 环境变量集中声明（必须）
│   └── app-paths.ts              # 路由路径集中管理（必须）
└── styles/globals.css
```

## Route Groups

使用路由组 `(group)` 按**业务域**聚合页面和 API，保持 feature 内聚：

- `(landing)/` — 公开营销页面
- `(auth)/` — 登录/注册页面 + 认证 API
- `(dashboard)/` — 登录后功能区域 + 对应 API

> [!NOTE]
> 路由组不产生 URL 段，`(auth)/api/auth/[...all]/route.ts` 的 URL 仍是 `/api/auth/*`。Route Handler 不受 `layout.tsx` 影响，可以放心与页面共处一组。

> [!IMPORTANT]
> 同一层级不能同时存在 `page.tsx` 和 `route.ts`。API 路径必须带 `api/` 前缀与页面路径区分。

## API Route vs Server Action

**默认用 API Route**，承载所有业务逻辑。Server Action 仅作为薄代理，用于触发 `revalidateTag` / `revalidatePath`。

| 场景                                 | 方案                                            |
| ------------------------------------ | ----------------------------------------------- |
| 表单提交、按钮点击等内部 mutation    | API Route（可搭配 Server Action 做 revalidate） |
| Webhook（Stripe、GitHub 等外部系统） | API Route                                       |
| 移动端 / 第三方消费接口              | API Route                                       |
| Better Auth catch-all                | API Route（保持现状）                           |

> [!TIP]
> 这样做的核心价值：业务逻辑集中在 `features/*/mutations` 和 `features/*/queries` 纯函数中，不依赖 Next.js，可独立测试。

## API Route Pattern

`route.ts` 保持薄层：**鉴权 → Zod 校验 → 调用 feature 函数 → 返回响应**。

```ts
// app/(dashboard)/api/posts/route.ts
import { withAuth } from '@/lib/api/with-auth'
import { createPost } from '@/features/post/mutations/create-post'
import { createPostSchema } from '@/features/post/lib/validators'

export const POST = withAuth(async (req, { session }) => {
  const body = createPostSchema.parse(await req.json())
  const post = await createPost(session.user.id, body)
  return Response.json(post, { status: 201 })
})
```

```ts
// features/post/mutations/create-post.ts
import { db } from '@/db'
import { posts } from '@/db/schema'

export function createPost(userId: string, data: CreatePostInput) {
  return db
    .insert(posts)
    .values({ ...data, userId })
    .returning()
}
```

跨路由复用的逻辑（鉴权、日志、错误处理）用 HOF wrapper 组合，放在 `lib/api/`。业务逻辑下沉到 `features/` 纯函数，不和 Next.js 深度耦合。

## Feature Organization

- **小 feature 保持平铺**（文件数 ≤ 5），直接放 `features/<name>/*.tsx`
- **大 feature 按职责分子目录**：`components/` `hooks/` `actions/` `queries/` `mutations/` `lib/`
- **Feature 之间不互相导入** — 共享逻辑下沉到 `lib/` 或 `components/`
- **Zod schema 放 `features/<name>/lib/validators.ts`**，API Route 和前端表单共享

> [!NOTE]
> `features/` 禁用 `index.ts` barrel（见 `constitution.md`）。原因：barrel 会模糊 server/client 边界，可能把 server-only 代码拖进 client bundle；且破坏 IDE 跳转和 tree-shaking。跨包共享（`packages/*`）才使用 barrel。

## Feature Boundaries

一个 feature 通常 1:1 对应一个业务域（含对应的 API 路由组）。

**并入已有 feature** —— 同时满足：

1. **同一业务域**：操作同一组数据模型与 API 路由
2. **共享数据模型**：主数据模型与视图状态都落在当前 feature 内
3. **无独立入口**：不需要新增顶层路由或导航项

**新建 feature** —— 任一条件即触发：

1. **独立业务域**：API 集合与现有 feature 基本不相交
2. **顶层路由**：拥有独立的第一级 URL 段（如 `/posts` vs `/users`）
3. **可独立下线**：移除该 feature 不影响其他功能

### Shared component promotion

当 ≥ 2 个 feature 需要同一组件，提升到 `src/components/`，而不是为其新建 feature。

## `@workspace/ui` Usage

组件基于 `@base-ui/react`，**不**支持 Radix 风格的 `asChild`：

- `DropdownMenuTrigger` 用 `render` prop 传入自定义触发器
- `Button` 通过 style anchor 组合

## Database (Drizzle ORM)

详见 `.claude/rules/db.md`。

## Authentication (Better Auth)

- 服务端：`src/lib/auth.ts` 导出 `auth`
- 客户端：`src/lib/auth-client.ts` 导出 `authClient`
- API 路由：`app/(auth)/api/auth/[...all]/route.ts` 固定，不修改
- 所有 API Route 的鉴权统一通过 `lib/api/with-auth.ts` HOF

## Testing

- 含测试的组件用目录组织
- Vitest 使用 `test.projects` 多 project 配置，`globals: true` 和 `setupFiles` 须在每个 project 内声明
- Mock 原则：`next/link`、`next-themes`、`@/config/env`、`@/lib/auth-client` 必须 mock
- Feature 的 `mutations/` 和 `queries/` 是纯函数，优先写单元测试（mock `db`）

## 禁止行为

- 禁止在 `app/` 路由文件中写业务逻辑或复杂 JSX（下沉到 `features/`）
- 禁止跨 feature 互相导入（共享逻辑下沉到 `lib/` / `components/`）
- 禁止在组件或 route 中直接调用 `db` / `drizzle`（走 feature 的 queries / mutations）
- 禁止手动修改 Better Auth 自动生成的 schema 字段
