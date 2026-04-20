# base-bun-cli

Starter template for a command-line tool built with Bun and published to npm as a Node-compatible ESM package.

## Stack

- Runtime (dev): Bun
- Runtime (publish): Node 20+ ESM
- Args: [citty](https://github.com/unjs/citty)
- Bundler: [tsdown](https://tsdown.dev)
- Lint: `oxlint` + `eslint` via `@infra-x/eslint-config`
- Tests: `bun test`

## Scripts

```bash
bun install
bun run dev --name Bun      # run from source
bun run build               # bundle to dist/ for publishing
bun run typecheck
bun run lint
bun run test
```

## Adding a command

1. Add the pure function under `src/commands/<name>.ts`
2. Add a test under `tests/<name>.test.ts`
3. Wire it into `src/index.ts`

## Publishing

```bash
npm publish --access public
```

`prepublishOnly` builds automatically. The resulting package runs on any Node 20+ host — no Bun required by consumers.

## Constraints

Do **not** import Bun-only APIs (`Bun.file`, `Bun.serve`, `Bun.$`, etc.). Use `node:*` modules so the published artifact runs under plain Node.
