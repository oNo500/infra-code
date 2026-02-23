# infra-code

个人开发基础设施 monorepo，提供共享的 TypeScript 和 ESLint 配置。

## Packages

| 包 | 说明 |
|----|------|
| [`@infra-x/typescript-config`](./packages/typescript-config) | 共享 TypeScript 配置文件集合 |
| [`@infra-x/eslint-config`](./packages/eslint-config) | 共享 ESLint flat config 配置工厂 |
| [`@infra-x/create-eslint-config`](./packages/create-eslint-config) | CLI 工具，将 ESLint 配置复制到 monorepo |

## 快速上手

### TypeScript 配置

```json
{
  "extends": "@infra-x/typescript-config/tsconfig.vite.json"
}
```

可用配置：`tsconfig.base.json` / `tsconfig.library.json` / `tsconfig.react-library.json` / `tsconfig.vite.json` / `tsconfig.nextjs.json` / `tsconfig.nestjs.json` / `tsconfig.vitest.json`

### ESLint 配置

```typescript
// eslint.config.ts
import { composeConfig } from '@infra-x/eslint-config'

export default composeConfig({
  typescript: { tsconfigRootDir: import.meta.dirname },
  react: true,
  imports: true,
  prettier: true,
})
```

默认开启：`javascript` / `typescript` / `stylistic` / `unicorn` / `depend` / `ignores`

按需开启：`react` / `nextjs` / `tailwind` / `imports` / `prettier` / `a11y` / `jsdoc` / `boundaries` / `packageJson` / `vitest` / `storybook`

## 开发

```bash
pnpm install
pnpm -F @infra-x/eslint-config build
pnpm -F eslint-config-test test
```
