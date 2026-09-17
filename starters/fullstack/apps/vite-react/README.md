# Vite + React

React + TypeScript 应用，使用 React Router Data Mode、Tailwind CSS v4、共享 shadcn/ui 组件和 Oxlint 配置。

## 开发

在 `starters/fullstack` 工作区根目录执行：

```sh
pnpm install
pnpm --filter vite-react dev
pnpm --filter vite-react lint
pnpm --filter vite-react build
```

依赖统一由工作区根目录的 `pnpm-lock.yaml` 管理。

## Tailwind 与 shadcn/ui

- `vite.config.ts` 注册 `@tailwindcss/vite` 插件和 `@/` 源码别名。
- `src/styles/globals.css` 引入 `@workspace/ui/globals.css`，并显式扫描应用源码。
- `components.json` 沿用共享 UI 包的 `base-nova`、neutral 主题，关闭 RSC。
- 组件、工具和主题来自 `packages/ui`；功能组件放在对应的 `src/features/<feature>`；只有跨功能通用组件放在 `src/components`。
- `src/features/home/home-page.tsx` 的计数按钮使用共享 `Button` 和 Tailwind 类名。

```tsx
import { Button } from '@workspace/ui/components/button'
import { cn } from '@workspace/ui/lib/utils'
```

在本应用目录添加组件：

```sh
pnpm exec shadcn add <component>
```

CLI 会根据别名将共享组件写入 `packages/ui`。共享组件及主题的修改会影响其他使用该包的应用。

## 路由

- `src/app/routes.ts` 定义路由树；在 `children` 中添加页面路由。
- `src/app/router.ts` 创建浏览器路由实例，`src/main.tsx` 挂载 `RouterProvider`。
- `src/app/root-layout.tsx` 提供公共导航和 `Outlet` 页面出口。
- `/` 显示现有首页，`/about` 显示示例页，其他路径显示 404 页面。
- `src/app/route-error.tsx` 处理路由渲染、loader 和 action 的错误。
- 应用内跳转使用 `Link`、`NavLink` 或 `useNavigate`。

路由采用浏览器 History URL。生产环境静态托管需要将未匹配的页面路径回退到 `index.html`，才能直接访问或刷新 `/about` 等子路由。Vite 开发和预览服务器已提供 SPA 回退。

参考 [React Router Data Mode](https://reactrouter.com/start/data/installation)。

## Lint

`oxlint.config.ts` 继承工作区根配置，并启用 React 和 Vitest 规则。

## 文件组织

按功能组织代码，参考 `web/src/features/landing` 和 `api-web/src/features`：

```text
src/
  app/                     # 应用组装：路由、根布局、404 和路由错误页
  features/
    home/                  # 首页组件、样式、图片和单元测试
    about/                 # 关于页面
    navigation/            # 侧栏、导航菜单、团队切换与用户菜单
  styles/globals.css       # 全局样式和共享主题入口
  main.tsx                 # React 挂载入口
__tests__/
  setup.ts                 # DOM matcher、清理和浏览器 API 适配
  e2e/navigation.test.tsx   # 跨功能路由与布局交互测试
```

功能专属组件、资源、请求逻辑和测试放在同一 feature 中。`app` 负责组合 feature；feature 不反向依赖 `app`。跨应用 UI 基础组件继续由 `packages/ui` 提供。

shadcn CLI 默认将应用级组件生成到 `src/components`，安装后应将功能专属组件移动到所属 feature，并更新导入路径。

## 测试

沿用 `web`、`api-web` 的 Vitest 4 + jsdom + Testing Library 配置与分组：

- `unit`：`src/**/*.test.{ts,tsx}`，测试与功能代码同目录。
- `e2e`：`__tests__/e2e/**/*.test.{ts,tsx}`，跨功能集成测试；在 jsdom 中运行，不是真实浏览器 E2E，不验证 CSS 布局和移动端媒体查询。
- 测试复用 `vite.config.ts` 的路径别名与 React 去重配置。

在工作区根目录执行：

```sh
pnpm --filter vite-react test
pnpm --filter vite-react test --project unit
pnpm --filter vite-react test --project e2e
pnpm --filter vite-react test:watch
pnpm --filter vite-react typecheck
```

工作区根目录的 `pnpm test` 也会通过 Turbo 执行本应用测试。
