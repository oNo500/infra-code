# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install        # install dependencies
pnpm build          # build all packages (turbo)
pnpm lint           # lint all packages (oxlint, root config)
pnpm lint:fix       # auto-fix lint issues (oxlint)
pnpm format         # format all files (oxfmt)
pnpm format:check   # check formatting without writing
pnpm typecheck      # type-check all packages (depends on build)
pnpm changeset      # create a changeset for version bump
```

## Architecture

Turborepo monorepo with pnpm workspaces:

- `packages/code-quality` — shared Oxlint + Oxfmt presets (recommended)
- `packages/eslint-config` — ESLint config presets (legacy)
- `packages/create-eslint-config` — CLI scaffolding tool
- `packages/typescript-config` — shared TypeScript configs
- `packages/eslint-config-test` — test fixtures for eslint-config

## Tooling

- Lint/format config lives at monorepo root (`oxlint.config.ts`, `oxfmt.config.ts`)
- `code-quality` is the primary lint/format package; `eslint-config` is legacy
- oxlint `typeAware: true` is set globally; each package's own `tsconfig.json` is auto-detected
- `eslint-config` and `eslint-config-test` are excluded from oxlint

## Git Workflow

- Default branch: `master` (PR target)
- Use `pnpm changeset` for version bumps before merging

### Release flow (changesets)

1. Create a changeset file: `pnpm changeset` (or write `.changeset/<name>.md` manually)
2. Commit the changeset file along with code changes and push to `master`
3. `changesets/action` in CI detects the changeset and **automatically creates a "Version Packages" PR** (bumps version, updates CHANGELOG)
4. Merge that PR to trigger the actual npm publish

> **Do NOT** run `pnpm changeset version` locally — let CI handle version bumps and publishing via the PR flow.

## Principles

- **No emoji**: Do not use emoji in code unless explicitly requested
- **Minimal implementation**: Follow MVP — do not extend beyond what is needed
- When the user describes something in casual/colloquial terms, suggest the proper technical terminology or workflow to help them learn and find solutions faster

## Development Stage

This project is in active development — no need to consider backward compatibility. Avoid compatibility shims or redundant code. Full refactors are welcome to achieve the optimal solution.
