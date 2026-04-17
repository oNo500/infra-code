# Tech Stack

## Monorepo

- pnpm workspaces + Turborepo

## apps/web

- Next.js 16 (App Router, React Compiler)
- Tailwind CSS v4
- `next-themes`
- `@infra-x/fwrap`

## apps/api-web

- Next.js 16 (App Router, React Compiler)
- Tailwind CSS v4
- `next-themes`
- `@infra-x/fwrap`
- PostgreSQL + Drizzle ORM
- Better Auth

## packages/ui

- shadcn/ui
- Tailwind CSS v4

## Shared Conventions

- ENV: `@t3-oss/env-nextjs` + Zod，每个应用在 `src/config/env.ts` 集中管理
- Routing: `src/config/app-paths.ts` 管理所有路由路径
- Testing: Vitest + Testing Library
