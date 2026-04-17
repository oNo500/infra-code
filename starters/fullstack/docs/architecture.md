# Architecture

## System Overview

pnpm workspaces + Turborepo monorepo。`apps/` 下是可部署的应用，`packages/` 下是跨应用共享的包。

## Components（模块划分）

| 路径 | 说明 |
|---|---|
| `apps/web` | 纯前端 Next.js 应用，无数据库 |
| `apps/api-web` | 全栈 Next.js 应用，含 PostgreSQL + Better Auth |
| `packages/ui` | 基于 shadcn/ui 的内部共享组件库 |
| `packages/icons` | 项目专用图标集合 |
| `packages/eslint-config` | monorepo 统一 ESLint 配置 |

## Project Structure

```
.
├── apps/
│   ├── web/          # 纯前端 Next.js 应用
│   └── api-web/      # 全栈 Next.js 应用
├── packages/
│   ├── ui/           # 共享 UI 组件库
│   ├── icons/        # 图标包
│   └── eslint-config/# 共享 ESLint 配置
├── docs/             # 项目文档
└── package.json      # monorepo 根配置
```

## Feature-Based Architecture

所有应用代码必须遵循 Feature-Based Architecture（参考 bulletproof-react 模式）。

### 规则

- 路由路径必须集中管理在 `src/config/app-paths.ts` 中；组件中禁止使用字符串字面量路径。
- 不同 feature 禁止直接互相引用；共享逻辑必须提升到：
  - `components/`
  - `hooks/`
  - `lib/`
  - `config/`
- feature 目录中禁止使用 `index.ts` barrel 文件；使用者必须直接从源文件导入。
- 依赖方向必须单向：`app/ → features/ → components/, hooks/, lib/, config/`
- `app/` 目录下的 page 文件只负责路由；业务逻辑和 JSX 必须放在 `features/` 中。

### Feature 内部结构

```
src/features/<name>/
  components/   # 该 feature 的子组件（可选）
  hooks/        # 该 feature 的 hooks（可选）
  utils/        # 该 feature 的工具函数（可选）
  api/          # 数据获取与 API 调用（可选）
  types.ts      # 该 feature 的类型定义（可选）
  <entry>.tsx   # feature 入口组件，直接导出，不用 barrel
```

只按需创建子目录，不预建空目录。

### 理由

单向依赖可以防止模块耦合逐渐恶化；barrel 文件会形成隐藏的 re-export 链，增加 tree-shaking 和重构的复杂度。
