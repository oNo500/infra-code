# boilerplate

pnpm monorepo。包含前端（apps/web）、全栈 API 应用（apps/api-web）及共享组件库（packages/ui）。

> [!IMPORTANT]
> 工具链：**oxlint**（非 ESLint）+ **oxfmt**（非 Prettier）+ **turbo**（任务编排）。配置文件 `oxlint.config.ts` / `oxfmt.config.ts` / `turbo.json`。

## 快速命令

```bash
pnpm dev        # 启动所有服务
pnpm build      # 全量构建
pnpm lint       # 代码检查
pnpm lint:fix   # 自动修复 lint 问题
pnpm format     # 代码格式化
pnpm test       # 运行所有测试
pnpm typecheck  # 类型检查
pnpm check      # lint:fix + format + typecheck + test（变更验证用）
```

## 包结构

- `apps/web` — Next.js 前端（无后端/DB）
- `apps/api-web` — Next.js 全栈（PostgreSQL + Drizzle ORM + Better Auth）
- `packages/ui` — shadcn 组件库（CLI 管理）
- `packages/icons` — SVG 图标库（svgr 生成）

## 单包启动

```bash
pnpm --filter web dev
pnpm --filter api-web dev
```

## 工作流规范

### 变更验证

每次代码变更后执行：

```bash
pnpm check  # lint:fix → format → typecheck → test
```

### Schema 变更后

```bash
cd apps/api-web && pnpm db:push
```

> [!WARNING]
> `db:push` 检测到数据变更时会弹出交互确认，需在终端执行。每个项目必须使用独立数据库，避免误删其他项目的表。

## 规则文件

详细规范见 `.claude/rules/`，按工作路径触发：

- `constitution.md` — 核心原则，始终加载
- `web.md` — 改 `apps/web/**` 时加载
- `api-web.md` — 改 `apps/api-web/**` 时加载
- `db.md` — 改 `apps/api-web/src/db/**` 时加载
- `ui.md` — 改 `packages/ui/**` 时加载
