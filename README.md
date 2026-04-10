# infra-code

Personal dev infrastructure monorepo — shared lint, format, and TypeScript configs.

## Packages

- [`@infra-x/code-quality`](./packages/code-quality) — Shared [Oxlint](https://oxc.rs/) + [Oxfmt](https://oxc.rs/docs/guide/usage/formatter) presets (recommended)
- [`@infra-x/typescript-config`](./packages/typescript-config) — Shared TypeScript config presets
- [`@infra-x/eslint-config`](./packages/eslint-config) — Composable ESLint config (legacy, for existing projects)
- [`@infra-x/create-eslint-config`](./packages/create-eslint-config) — CLI tool for scaffolding ESLint config in a monorepo

## Usage

### Lint & Format (Oxlint + Oxfmt)

```bash
pnpm add -D @infra-x/code-quality
```

```ts
// oxlint.config.ts
import { base, unicorn, depend, react, vitest } from '@infra-x/code-quality/lint'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [base(), unicorn(), depend(), react(), vitest()],
})
```

```ts
// oxfmt.config.ts
import { format } from '@infra-x/code-quality/format'
import { defineConfig } from 'oxfmt'

export default defineConfig({ ...format() })
```

See [`@infra-x/code-quality` README](./packages/code-quality/README.md) for all presets and options.

### TypeScript

Extend one of the provided presets in your `tsconfig.json`:

```json
{
  "extends": "@infra-x/typescript-config/tsconfig.vite.json"
}
```

> [!TIP]
> In projects with multiple `tsconfig` files using `references`, use `tsc -b --noEmit` instead of `tsc --noEmit`.

### ESLint (Legacy)

For existing projects still on ESLint, see [`@infra-x/eslint-config` README](./packages/eslint-config/README.md).
