---
name: infra-x-config
description: "Guide for configuring ESLint and TypeScript in projects using @infra-x packages. Use this skill when: (1) setting up ESLint in a project that uses @infra-x packages, (2) working in a monorepo and need to run create-eslint-config CLI, (3) configuring eslint.config.mts with composeConfig(), (4) choosing the right @infra-x/typescript-config preset, (5) user mentions @infra-x/eslint-config, @infra-x/create-eslint-config, or @infra-x/typescript-config."
---

# @infra-x Config

## Decision Tree

```
Is this a monorepo?
  YES → Use @infra-x/create-eslint-config CLI → generates local eslint-config/ package
  NO  → Install @infra-x/eslint-config directly → import composeConfig()
```

Both paths support `@infra-x/typescript-config` for tsconfig.

---

## Monorepo Workflow

### Step 1: Run CLI at monorepo root

```bash
pnpm dlx @infra-x/create-eslint-config
```

Copies `eslint-config/` into cwd with:
- Full eslint-config source (`src/index.ts` + all configs)
- `package.json` (`name: @workspace/eslint-config`, all deps included)
- exports point to `./src/index.ts` (no build needed)

### Step 2: Add to workspace

```json
// pnpm-workspace.yaml or root package.json workspaces
packages:
  - "packages/*"
  - "eslint-config"   // add this
```

```bash
// In subpackages that need linting:
pnpm add -D @workspace/eslint-config --workspace
```

### Step 3: Configure root eslint.config.ts

```typescript
// eslint.config.ts (root)
import { composeConfig } from '@workspace/eslint-config'

export default composeConfig({
  typescript: { tsconfigRootDir: import.meta.dirname },
  imports: { typescript: true },
})
```

Subpackages can extend root config or define their own `eslint.config.ts` with additional options (e.g., `react: true` for React packages).

---

## Standalone Project Workflow

### Step 1: Install

```bash
pnpm add -D @infra-x/eslint-config eslint prettier typescript globals jiti
```

### Step 2: Configure eslint.config.mts

```typescript
// eslint.config.mts
import { composeConfig } from '@infra-x/eslint-config'

export default composeConfig({
  typescript: { tsconfigRootDir: import.meta.dirname },
  // add options as needed
})
```

---

## composeConfig Options

**Default ON** (pass `false` to disable):

| Option | Description |
|--------|-------------|
| `ignores` | gitignore + common ignores |
| `javascript` | JS base rules |
| `typescript` | TS rules, pass `{ tsconfigRootDir }` for type-aware rules |
| `stylistic` | Code style (spacing, formatting patterns) |
| `unicorn` | Best practices |
| `depend` | Dependency optimization suggestions |

**Default OFF** (pass `true` or options object to enable):

| Option | Description |
|--------|-------------|
| `react` | React + hooks + refresh rules |
| `nextjs` | Next.js rules |
| `tailwind` | Tailwind CSS class sorting |
| `imports` | Import ordering; auto-inherits typescript when typescript is enabled |
| `prettier` | Prettier formatting (add last) |
| `a11y` | Accessibility rules |
| `jsdoc` | JSDoc documentation rules |
| `boundaries` | Module boundary enforcement |
| `packageJson` | package.json validation |
| `vitest` | Vitest test rules |
| `storybook` | Storybook rules |

**Common config examples:**

```typescript
// React + Vite app
composeConfig({
  typescript: { tsconfigRootDir: import.meta.dirname },
  react: true,
  imports: { typescript: true },
  prettier: true,
})

// Next.js app
composeConfig({
  typescript: { tsconfigRootDir: import.meta.dirname },
  react: true,
  nextjs: true,
  tailwind: true,
  imports: { typescript: true },
  prettier: true,
})

// Node.js library
composeConfig({
  typescript: { tsconfigRootDir: import.meta.dirname },
  imports: { typescript: true },
})

// Disable a default-on rule
composeConfig({
  unicorn: false,
  depend: false,
})
```

---

## typescript-config

Install: `pnpm add -D @infra-x/typescript-config`

```json
// tsconfig.json
{
  "extends": "@infra-x/typescript-config/tsconfig.vite.json"
}
```

| File | Use Case |
|------|----------|
| `tsconfig.library.json` | npm packages / Node.js libraries (bundler, isolatedDeclarations) |
| `tsconfig.react-library.json` | React component libraries (jsx, declaration) |
| `tsconfig.vite.json` | Vite + React apps (jsx, noEmit) |
| `tsconfig.nextjs.json` | Next.js apps (esnext, bundler, Next.js plugin) |
| `tsconfig.nestjs.json` | NestJS backends (node16, decorators) |
| `tsconfig.vitest.json` | Vitest test files (relaxed checks, vitest globals) |

All configs extend `tsconfig.base.json` which enables strict mode + `noUncheckedIndexedAccess`.

For detailed composeConfig option types, see `references/eslint-config-api.md`.
