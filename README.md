# infra-code

Self-contained TypeScript project starters. Shared TypeScript, Oxlint and Oxfmt presets are maintained in the separate `presets` repository.

## Starters

Each starter has its own dependencies, lockfile and toolchain.

| Starter              | For                   | Stack                                                          |
| -------------------- | --------------------- | -------------------------------------------------------------- |
| `starters/cli`       | Publishable CLI tools | Bun dev · Node publish · citty · tsdown                        |
| `starters/server`    | HTTP services         | Bun · Hono · zod · Drizzle · `bun:sqlite`                      |
| `starters/web`       | Quick prototype UIs   | Bun full-stack · React 19 · Tailwind v4                        |
| `starters/fullstack` | Production monorepos  | pnpm · Turborepo · Next.js · Drizzle · Better Auth · shadcn/ui |

Fetch a starter with `giget`:

```sh
bunx giget@latest gh:oNo500/infra-code/starters/cli#master my-cli
bunx giget@latest gh:oNo500/infra-code/starters/server#master my-api
bunx giget@latest gh:oNo500/infra-code/starters/web#master my-ui
bunx giget@latest gh:oNo500/infra-code/starters/fullstack#master my-app
```

See each starter's README for its commands and requirements.

## Development

Root commands maintain repository tooling; starters are independent projects.

```sh
bun install --frozen-lockfile
bun run lint
bun run format:check
```

For `cli`, `server` and `web`, run `bun install --frozen-lockfile` and the relevant checks inside the starter. For `fullstack`, use `pnpm install --frozen-lockfile` and its workspace commands. Root installation does not install starter dependencies.

Oxlint and Oxfmt use separate preset packages. Until those packages are published, each project carries fixed tarball dependencies in `vendor/` so standalone downloads remain installable. Each vendor README describes snapshot updates. TypeScript configurations are committed in each project.

This repository no longer builds or publishes shared configuration packages. Repository CI checks root tooling; starter CI checks the individual projects.

## License

MIT — see `LICENSE`.
