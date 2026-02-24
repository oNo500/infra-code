---
name: setup-eslint-config
description: "Configure @infra-x/eslint-config for projects. Use when a user wants to: (1) set up ESLint for a new project (generate eslint.config.mts, tsconfig.json, tsconfig.config.json), (2) modify or extend an existing eslint.config.mts using composeConfig(), (3) understand what a specific composeConfig option does (typescript, react, imports, prettier, vitest, etc.), (4) working in a monorepo and need to run create-eslint-config CLI, (5) user mentions @infra-x/eslint-config, @infra-x/create-eslint-config, or @infra-x/typescript-config."
---

# setup-eslint-config

## Overview

This skill provides complete knowledge of `@infra-x/eslint-config` and `@infra-x/typescript-config`, enabling Claude to generate accurate configuration files for new projects and explain/modify existing `composeConfig()` setups.

## Scenario Decision

| User Request | Action |
|---|---|
| "帮我配置 ESLint" / "新项目接入" | Load `references/project-presets.md`, ask project type, generate three files |
| "修改 eslint.config.mts" / "加一个选项" | Load `references/config-options.md`, apply targeted change |
| "这个选项是什么意思" | Load `references/config-options.md`, explain the option |
| monorepo 场景 | Run `pnpm dlx @infra-x/create-eslint-config` CLI (see Monorepo section) |

## Default-On Options

These are enabled automatically without specifying them in `composeConfig()`:

- `ignores` - 默认忽略规则 + gitignore 集成
- `javascript` - JS 基础规则
- `typescript` - TypeScript + type-aware 规则（需要 `tsconfigRootDir`）
- `stylistic` - 代码风格规则
- `unicorn` - 最佳实践规则集
- `depend` - 依赖优化建议

To disable any default-on option: pass `false` explicitly, e.g. `depend: false`.

## Key Constraints

1. **`typescript.tsconfigRootDir` is required** for type-aware rules. Always set to `import.meta.dirname`.

2. **`imports.typescript` is auto-injected** by `composeConfig()` based on whether `typescript` is enabled. Use `imports: true`, not `imports: { typescript: true }`.

3. **`prettier` must be last** — `composeConfig()` enforces this internally. Users don't need to worry about ordering.

4. **`tsconfig.config.json`** is the default project for config files (`eslint.config.mts`, `vite.config.ts`, etc.). Always generate this file alongside `tsconfig.json`.

5. **`allowDefaultProject`** is auto-injected as `['*.config.ts', '*.config.mts']` with relaxed unsafe rules for those files.

## New Project Setup Workflow

1. Ask (or infer from context): Vite+React / Next.js / Node.js library / React component library / NestJS?
2. Load `references/project-presets.md` for the exact three-file template.
3. Ask optional addons: vitest? storybook?
4. Generate the files.

## Modifying Existing Config Workflow

1. Read the user's current `eslint.config.mts`.
2. Load `references/config-options.md` for the relevant option details.
3. Apply the minimal change needed.

## Monorepo Workflow

```bash
pnpm dlx @infra-x/create-eslint-config
```

Copies `eslint-config/` into cwd with full source (`src/index.ts` + all configs), `package.json` (`name: @workspace/eslint-config`), exports point to `./src/index.ts` (no build needed).

Add to workspace:
```yaml
# pnpm-workspace.yaml
packages:
  - "packages/*"
  - "eslint-config"
```

Root `eslint.config.ts`:
```typescript
import { composeConfig } from '@workspace/eslint-config'

export default composeConfig({
  typescript: { tsconfigRootDir: import.meta.dirname },
  imports: true,
})
```

Subpackages define their own `eslint.config.ts` with additional options (e.g., `react: true`).

## References

- `references/project-presets.md` — Complete file templates per project type (tsconfig.json, tsconfig.config.json, eslint.config.mts)
- `references/config-options.md` — All `composeConfig()` options with parameters and examples
