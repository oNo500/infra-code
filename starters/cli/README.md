# base-bun-cli

Bun CLI starter, published as Node-compatible ESM.

## Stack

- **Args**: [citty](https://github.com/unjs/citty)
- **Bundler**: [tsdown](https://tsdown.dev)
- **Lint**: `oxlint` + `oxfmt` via `@infra-x/code-quality`
- **Tests**: `bun test`

## Scripts

```bash
bun install
bun run dev --name Bun
bun run build
bun run typecheck
bun run lint
bun run test
```

## Adding a Command

1. `src/commands/<name>.ts` — handler
2. `src/commands/<name>.test.ts` — co-located test
3. `src/index.ts` — wire it in

## Publishing

```bash
npm publish --access public
```

> [!IMPORTANT]
> No Bun-only APIs (`Bun.file`, `Bun.serve`, `Bun.$`, etc.) — use `node:*` so the build runs on plain Node.
