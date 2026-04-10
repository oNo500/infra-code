# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install        # install dependencies
pnpm build          # build all packages (turbo)
pnpm lint           # lint all packages
pnpm lint:fix       # auto-fix lint issues
pnpm typecheck      # type-check all packages (depends on build)
pnpm changeset      # create a changeset for version bump
```

## Architecture

Turborepo monorepo with pnpm workspaces:

- `packages/eslint-config` — shared ESLint config presets
- `packages/code-quality` — code quality tooling
- `packages/create-eslint-config` — CLI scaffolding tool
- `packages/typescript-config` — shared TypeScript configs
- `packages/eslint-config-test` — test fixtures for eslint-config

## Git Workflow

- Default branch: `master` (PR target)
- Use `pnpm changeset` for version bumps before merging

## Principles

- **No emoji**: Do not use emoji in code unless explicitly requested
- **Minimal implementation**: Follow MVP — do not extend beyond what is needed
- When the user describes something in casual/colloquial terms, suggest the proper technical terminology or workflow to help them learn and find solutions faster

## Development Stage

This project is in active development — no need to consider backward compatibility. Avoid compatibility shims or redundant code. Full refactors are welcome to achieve the optimal solution.