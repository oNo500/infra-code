# infra-code

Personal infrastructure for TypeScript + Bun projects: shared lint/format/TS presets (published to npm under `@infra-x/*`) and Bun project starters.

## Packages

Published to npm.

| Package                                                      | Purpose                           |
| ------------------------------------------------------------ | --------------------------------- |
| [`@infra-x/code-quality`](./packages/code-quality)           | Composable oxlint + oxfmt presets |
| [`@infra-x/typescript-config`](./packages/typescript-config) | Shared `tsconfig.*.json` presets  |

```bash
npm install -D @infra-x/code-quality @infra-x/typescript-config
```

Both packages run on Node 20+ and Bun.

## Starters

Fetched via [`giget`](https://github.com/unjs/giget). Each starter is a self-contained Bun project.

| Starter                       | For                   | Stack                                   |
| ----------------------------- | --------------------- | --------------------------------------- |
| [`cli`](./starters/cli)       | Publishable CLI tools | Bun dev · Node publish · citty · tsdown |
| [`server`](./starters/server) | HTTP services on Bun  | Hono · zod · Drizzle · `bun:sqlite`     |
| [`web`](./starters/web)       | Quick prototype UIs   | Bun full-stack · React 19 · Tailwind v4 |

```bash
bunx giget@latest gh:oNo500/infra-code/starters/cli my-cli
bunx giget@latest gh:oNo500/infra-code/starters/server my-api
bunx giget@latest gh:oNo500/infra-code/starters/web my-ui
```

See each starter's own README for specific scripts and constraints.

## Development

This repository is Bun-driven end to end.

```bash
bun install                           # install packages/* deps at the root
bun run build                         # bun --filter='*' run build
bun run typecheck
bun run lint
bun run format
```

- **Packages** live under `packages/*` and are part of the root Bun workspace. They must stay Node-compatible — source code imports `node:*` only; `tsconfig.json` uses `"types": ["node"]` to block `Bun.*` usage at compile time.
- **Starters** live under `starters/*` and are **not** part of the workspace. Each has its own `bun.lock`. Run `cd starters/<name> && bun install` to work on one.
- **Releases** use [changesets](https://github.com/changesets/changesets):
  ```bash
  bunx changeset          # create a changeset
  bunx changeset version  # bump versions + update changelogs
  # master push → publish.yml publishes to npm
  ```

## History

- The `@infra-x/eslint-config`, `@infra-x/eslint-config-test`, and `@infra-x/create-eslint-config` packages were retired in favour of `@infra-x/code-quality`. Their last working source is archived at git tag `archive/eslint-config-v0.1.13`; published versions remain available on npm.
- The starters were previously hosted at [`oNo500/base-bun`](https://github.com/oNo500/base-bun) under `templates/*`. That repository was absorbed into this one on 2026-04-17.

## License

MIT — see [`LICENSE`](./LICENSE).
