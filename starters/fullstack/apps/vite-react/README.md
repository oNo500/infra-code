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

- `src/config/app-paths.ts` 集中维护页面路径，路由树、侧栏、面包屑和返回链接共同引用。
- `src/app/routes.ts` 定义路由树；在 `children` 中添加页面路由。
- `src/app/router.ts` 创建浏览器路由实例，`src/main.tsx` 挂载 `RouterProvider`。
- `src/app/root-layout.tsx` 提供公共导航和 `Outlet` 页面出口。
- `/` 显示现有首页，`/about` 显示示例页，其他路径显示 404 页面。
- `src/app/route-error.tsx` 处理路由渲染、loader 和 action 的错误。
- 应用内跳转使用 `Link`、`NavLink` 或 `useNavigate`。

路由采用浏览器 History URL。生产环境静态托管需要将未匹配的页面路径回退到 `index.html`，才能直接访问或刷新 `/about` 等子路由。Vite 开发和预览服务器已提供 SPA 回退。

参考 [React Router Data Mode](https://reactrouter.com/start/data/installation)。

## 环境变量

将 `.env.example` 复制为本应用目录下的 `.env.local`，修改后重启开发服务器。

- `VITE_APP_NAME`：应用名称，默认 `Vite React`，显示在页头面包屑中。
- `VITE_API_URL`：可选的绝对 HTTP(S) API 地址，例如 `https://api.example.com/v1`。留空时请求发送到当前页面的 origin。

`src/config/env.ts` 使用 `@t3-oss/env-core` 和 Zod 校验 `import.meta.env`；空字符串按未配置处理。应用启动时发现非法配置会报错。Vite 在构建时替换这些值，修改部署配置后需要重新构建；`vite build` 本身不执行浏览器中的运行时校验。`VITE_` 变量会进入浏览器代码，只放公开配置。

```ts
import { env } from '@/config/env'
```

## HTTP 请求

`src/lib/fetch-client.ts` 基于 `@infra-x/fwrap`，提供可调用的 `fetchClient` 和 `.get()`、`.post()`、`.put()`、`.patch()`、`.delete()`、`.head()` 方法。

```ts
import { fetchClient } from '@/lib/fetch-client'

const { data, error } = await fetchClient.get<{ id: string; title: string }[]>('/items')
if (error) throw error // 交给路由错误页，或在功能代码中显示通知。
return data
```

- 默认超时为 30 秒。GET、PUT、HEAD、DELETE、OPTIONS、TRACE 在收到 408、413、429、500、502、503、504 时最多重试两次；POST/PATCH、超时和普通网络错误默认不重试。
- 请求返回 `{ data, response, error }`，必须检查 `error`。这层封装不会自动弹 Toast 或跳转登录页。
- API 地址包含 `/v1` 时，`get('/items')` 请求 `/v1/items`。未配置 API 地址时，`get('/api/items')` 请求当前站点的 `/api/items`；后端或部署代理需要实际提供该接口。
- JSON 写入使用 `fetchClient.post('/items', { body: { title: 'Example' } })`。可按次传入 `timeout`、`retry`、`signal`、`headers` 等选项。
- 数字 `retry` 只调整默认允许方法的重试次数（`0` 禁用重试）；对象形式按其 `methods` 决定是否重试，方法名不区分大小写。只有显式将 POST/PATCH 加入该列表才会重试写入。
- 默认使用浏览器的同源凭据策略；跨域 Cookie 认证需在确定后端后显式配置 `credentials: 'include'` 及服务端 CORS。
- 每次请求独立创建 fwrap 实例，隔离 0.1.1 的重试计数；默认重试按方法在此封装选择。此封装不提供 `.extend()`，也不包含 Next.js 服务端 Cookie 转发与缓存选项。

功能专属请求放在 `features/<feature>` 内，通用传输配置放在 `lib/fetch-client.ts`。

## Lint

`oxlint.config.ts` 继承工作区根配置，并启用 React 和 Vitest 规则。

## 文件组织

按功能组织代码，参考 `web/src/features/landing` 和 `api-web/src/features`：

```text
src/
  app/                     # 应用组装：路由、根布局、404 和路由错误页
  config/
    app-paths.ts           # 页面路径常量
    env.ts                 # 浏览器环境变量校验
  lib/fetch-client.ts      # HTTP 请求入口
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

## 主题与通知

- `src/app/providers.tsx` 统一挂载主题、Tooltip 和 Toast；应用入口与集成测试复用这一层。
- `src/features/theme` 提供主题 Provider 和页头切换按钮。首次访问跟随系统，手动切换后保存到 `localStorage`。
- 按 `D` 切换亮暗主题；输入框、可编辑区域、输入法组合输入和组合快捷键不会触发切换。
- Toast 复用 `@workspace/ui/components/sonner`，跟随主题并支持关闭。首页的 `Show notification` 按钮提供示例。

在功能代码中发送通知：

```tsx
import { toast } from 'sonner'

toast.success('Saved')
toast.error('Unable to save')
const notification = toast.loading('Saving…')
// 请求完成后更新同一条通知。
toast.success('Saved', { id: notification })
```

## 工程检查与依赖边界

在工作区根目录执行：

```sh
pnpm --filter vite-react lint:fix
pnpm --filter vite-react format
pnpm --filter vite-react format:check
pnpm --filter vite-react lint:deps
pnpm --filter vite-react check
```

`check` 顺序执行格式检查、lint、依赖边界检查、类型检查和测试，不自动修改文件。生产构建单独执行 `pnpm --filter vite-react build`。

`.dependency-cruiser.mjs` 沿用 `api-web` 的规则：feature 之间不能直接引用，feature 不能反向引用 `app`。跨功能组合放在 `app`，可复用能力放在 `lib`、`components`、`hooks` 或共享包中。

测试环境使用 jsdom 的 `localStorage`，避免 Node 原生 Storage 干扰；指针捕获采用最小适配，仅支持点击测试，不覆盖拖拽手势。
