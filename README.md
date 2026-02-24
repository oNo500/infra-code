# infra-code

个人开发基础设施 monorepo，提供共享的 TypeScript 和 ESLint 配置。

## 快速上手

### 方式一：通过 CLI 初始化（推荐）

`@infra-x/create-eslint-config` 会将完整的 ESLint 配置模板（含规则定义、`composeConfig` 工厂函数）
复制到 monorepo 根目录的 `eslint-config/` 目录，让你完全掌控配置内容。

```bash
pnpm dlx @infra-x/create-eslint-config
```

执行后在 monorepo 根目录会生成 `eslint-config/` 目录，按提示将其作为 workspace 包引用即可。

### 方式二：手动配置

安装依赖：

```bash
pnpm add -D @infra-x/typescript-config @infra-x/eslint-config eslint prettier typescript
```

**`tsconfig.json`**（项目源码）：

```json
{
  "extends": "@infra-x/typescript-config/tsconfig.vite.json",
  "include": ["src"]
}
```

**`tsconfig.config.json`**（工具配置文件）：

```json
{
  "extends": "@infra-x/typescript-config/tsconfig.config.json",
  "include": ["*.config.ts", "*.config.mts"]
}
```

**`eslint.config.mts`**：

```typescript
import { composeConfig } from '@infra-x/eslint-config'

export default composeConfig({
  typescript: { tsconfigRootDir: import.meta.dirname },
  react: true,
  imports: true,
  prettier: true,
})
```

**`package.json` scripts**（同时检查两份 tsconfig）：

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit && tsc -p tsconfig.config.json --noEmit"
  }
}
```

## TypeScript 配置说明

| 配置 | 适用场景 | 关键特性 |
|-----|---------|---------|
| `base` | 所有项目的基础 | strict, noUncheckedIndexedAccess, 质量检查 |
| `library` | bundler 工具库/npm 包 | preserve, bundler, isolatedDeclarations, noEmit |
| `react-library` | React 组件库 | preserve, bundler, jsx, declaration, isolatedDeclarations, DOM |
| `vite` | Vite + React 应用 | preserve, bundler, jsx, noEmit, DOM |
| `nextjs` | Next.js 应用 | esnext, bundler, jsx, noEmit, next 插件 |
| `nestjs` | NestJS 后端服务 | bundler, 装饰器支持 |
| `vitest` | Vitest 测试文件 | 宽松检查, vitest/globals |
| `config` | 工具配置文件（*.config.ts）| esnext, bundler, noEmit |

## ESLint 配置说明

### 默认开启

- `ignores` - 忽略文件配置
- `javascript` - JavaScript 基础规则
- `typescript` - TypeScript 规则
- `stylistic` - 代码风格规则
- `unicorn` - 最佳实践
- `depend` - 依赖优化建议

### 可选配置

- `react` - React 规则
- `nextjs` - Next.js 规则
- `tailwind` - Tailwind CSS 规则
- `imports` - Import 排序和规则
- `prettier` - Prettier 格式化
- `a11y` - 无障碍访问规则
- `jsdoc` - JSDoc 文档规则
- `boundaries` - 模块边界规则
- `packageJson` - package.json 规则
- `vitest` - Vitest 测试规则
- `storybook` - Storybook 规则

每个配置项支持：
- `true` - 使用默认配置
- `{ ...options }` - 自定义配置
- `false` - 禁用（仅限默认开启的配置）

## 开发

```bash
pnpm install
pnpm -F @infra-x/eslint-config build
pnpm -F eslint-config-test test
```
