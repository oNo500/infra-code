# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Run from the repo root (operates on `packages/*` workspace):

```bash
bun install          # install workspace deps (packages/* only — see Architecture)
bun run build        # build workspace packages (fans out via bun --filter='*')
bun run typecheck    # type-check workspace packages
bun run lint         # oxlint with root config (--disable-nested-config)
bun run lint:fix     # oxlint --fix
bun run format       # oxfmt --write .
bun run format:check # oxfmt --check . (CI uses this)
bunx changeset       # record an intent-to-bump; commit the generated .changeset/*.md
```

> [!NOTE]
> `typescript-config` has no `build`/`typecheck` script (it ships raw JSON); `bun --filter` simply skips packages without the target script.

Root also exposes `"release": "bunx changeset publish"` — **this is for CI only**, never run it locally.

## Architecture

Bun workspaces monorepo (no Turborepo). Two areas with different semantics:

- `packages/*` — **in** the root workspace (`workspaces: ["packages/*"]`), published to npm under `@infra-x/*`
  - `packages/code-quality` — composable oxlint + oxfmt presets (built with `tsdown`)
  - `packages/typescript-config` — shared `tsconfig.*.json` presets (no build step)
- `starters/*` — **not** in the workspace. Each starter has its own `bun.lock` and is fetched standalone via `giget`
  - `starters/cli` — publishable CLI tools (citty + tsdown)
  - `starters/server` — Bun HTTP services (Hono + Drizzle + `bun:sqlite`)
  - `starters/web` — Bun full-stack UI prototypes (React 19 + Tailwind v4)

> [!IMPORTANT]
> Root `bun install` does **not** touch `starters/*`. To work on a starter, `cd starters/<name> && bun install` and use that starter's own scripts (see its README).

## Tooling

- Root `oxlint.config.ts` / `oxfmt.config.ts` apply to `packages/*`. Each starter carries its own config files.
- Packages must stay **Node-compatible**: source imports `node:*` only, and `tsconfig.json` uses `"types": ["node"]` to block `Bun.*` at compile time. Starters are free to use `Bun.*`.
- oxlint runs with `--disable-nested-config` at the root; `typeAware: true` is set, so each package's `tsconfig.json` is auto-detected.

## Git Workflow

- Default branch: `master` (PR target)
- Create a changeset alongside code changes when a version bump is needed

### Release flow (changesets)

`publish.yml` uses `changesets/action@v1` with only a `publish:` command (no `version:`), which means the action runs in its default two-phase mode:

1. Create a changeset: `bunx changeset` (or write `.changeset/<name>.md` manually)
2. Commit the changeset file with your code changes and push to `master`
3. `changesets/action` sees the pending changeset and opens (or updates) a **"Version Packages" PR** from branch `changeset-release/master` — this PR bumps versions and updates CHANGELOG
4. Merge that PR → the next run has no pending changesets, so the action executes `bunx changeset publish --provenance --access public` to npm

> [!IMPORTANT]
> Do **not** run `bunx changeset version` or `bun run release` locally. Both are CI-owned steps; running them locally will produce commits that conflict with the "Version Packages" PR.

## Principles

- **No emoji**: Do not use emoji in code unless explicitly requested
- **Minimal implementation**: Follow MVP — do not extend beyond what is needed
- When the user describes something in casual/colloquial terms, suggest the proper technical terminology or workflow to help them learn and find solutions faster

## Development Stage

This project is in active development — no need to consider backward compatibility. Avoid compatibility shims or redundant code. Full refactors are welcome to achieve the optimal solution.
