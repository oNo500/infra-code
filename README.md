# infra-code

Personal dev infrastructure monorepo, primarily focused on ESLint configuration.

Inspired by [antfu/eslint-config](https://github.com/antfu/eslint-config), with less abstraction and more flexibility.

## Packages

- [`@infra-x/eslint-config`](./packages/eslint-config) — Composable ESLint config with sensible presets
- [`@infra-x/typescript-config`](./packages/typescript-config) — Shared TypeScript config presets
- [`@infra-x/create-eslint-config`](./packages/create-eslint-config) — CLI tool for scaffolding ESLint config in a monorepo

## Usage

### Monorepo

Use `@infra-x/create-eslint-config` to copy the config into your `packages/` directory, so you can adjust it freely:

```bash
pnpm dlx @infra-x/create-eslint-config
```

### Polyrepo

Use `composeConfig` from `@infra-x/eslint-config` to enable presets with optional overrides:

```ts
import { composeConfig } from '@infra-x/eslint-config'

export default composeConfig({
  typescript: { tsconfigRootDir: import.meta.dirname },
  react: true,
  prettier: true,
})
```

For multiple config segments (e.g. separate test rules):

```ts
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

For TypeScript, extend one of the provided presets in your `tsconfig.json`:

```json
{
  "extends": "@infra-x/typescript-config/tsconfig.vite.json"
}
```

> [!TIP]
> In projects with multiple `tsconfig` files using `references`, use `tsc -b --noEmit` instead of `tsc --noEmit`.
