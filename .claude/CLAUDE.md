# Repository guidance

## Layout

This repository contains self-contained project starters and root maintenance tooling. Shared presets are maintained in the separate `presets` repository. There is no root workspace or shared-package publishing workflow.

- `starters/cli`: Node-compatible CLI tools, developed with Bun.
- `starters/server`: Bun HTTP services with Hono, Drizzle and SQLite.
- `starters/web`: Bun full-stack React prototypes.
- `starters/fullstack`: pnpm and Turborepo applications and shared UI packages.

Root installation does not install starter dependencies. Each starter has its own manifest, lockfile and tool configuration.

## Commands

At the root:

```sh
bun install --frozen-lockfile
bun run lint
bun run lint:fix
bun run format
bun run format:check
```

Use Bun inside `cli`, `server` and `web`; use pnpm inside `fullstack`. Run typecheck, lint, tests and build for affected starters. Root lint skips starters because they have independent configurations.

## Presets

Lint and format configurations consume separate preset packages through fixed `vendor/` tarballs until registry releases are available. Update archives, content-hashed paths and lockfiles together. Preserve standalone starter installation. TypeScript configurations live directly in each project.

## Workflow

Use a feature branch and PR targeting `master`. Do not publish shared packages from this repository. Do not modify unrelated files or regenerate lockfiles for unrelated upgrades. Preserve existing untracked files.

## Principles

- No emoji in code unless requested.
- Keep implementations minimal.
- No unnecessary compatibility shims.
- CLI starter output must run on Node; use `node:*` rather than Bun-only APIs there.
