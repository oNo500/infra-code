# @infra-x/eslint-config

Composable ESLint flat config factory for infra-x projects.

## Installation

```bash
pnpm add -D @infra-x/eslint-config eslint globals
```

## Usage

```typescript
// eslint.config.mts
import { composeConfig } from '@infra-x/eslint-config'

export default composeConfig({
  typescript: { tsconfigRootDir: import.meta.dirname },
  react: true,
  tailwind: true,
  imports: true,
  prettier: true,
})
```

For multiple config segments (e.g. separate test rules):

> 注意：在多`tsconfig`配置时，`tsc -b`，需要添加 `-b`参数。

```typescript
// eslint.config.mts
import { GLOB_TESTS, composeConfig } from '@infra-x/eslint-config'
import { defineConfig } from 'eslint/config'

const appConfig = defineConfig({
  extends: composeConfig({
    typescript: { tsconfigRootDir: import.meta.dirname },
    imports: true,
    react: true,
    nextjs: true,
  }),
})

const vitestConfig = defineConfig({
  files: GLOB_TESTS,
  extends: composeConfig({
    typescript: { tsconfigRootDir: import.meta.dirname },
    vitest: true,
    unicorn: false,
    stylistic: false,
    depend: false,
  }),
})

export default [...appConfig, ...vitestConfig]
```

Each option accepts `true` (defaults), an options object, or `false` (disable).

## Options

Default-on: `ignores` · `javascript` · `typescript` · `stylistic` · `unicorn` · `depend` · `configFiles`

Opt-in:

| Option | Description |
|---|---|
| `react` | React + react-hooks rules; set `vite: true` for react-refresh |
| `nextjs` | Next.js rules |
| `tailwind` | Tailwind CSS class ordering (`entryPoint` defaults to `src/global.css`) |
| `imports` | Import ordering and resolution |
| `prettier` | Prettier formatting (should be last) |
| `a11y` | Accessibility rules |
| `jsdoc` | JSDoc rules |
| `boundaries` | Module boundary enforcement |
| `packageJson` | `package.json` rules |
| `vitest` | Vitest testing rules |
| `storybook` | Storybook rules |

All options support an `overrides` field for custom rule overrides, and most accept a `files` glob array.

## Roadmap

- **oxlint 集成**：计划引入 oxlint 作为快速检查层，通过 `eslint-plugin-oxlint` 禁用 ESLint 中与 oxlint 重复的规则（core/typescript/unicorn），减少 ESLint 规则数量约 50%，显著提升 CI lint 速度
