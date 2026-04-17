# base-bun-server

Starter template for a Bun-only HTTP service.

## Stack

- Runtime: Bun (no Node fallback)
- Framework: [Hono](https://hono.dev)
- Env validation: [zod](https://zod.dev)
- DB: [Drizzle ORM](https://orm.drizzle.team) on top of `bun:sqlite`
- Lint: `oxlint` + `eslint` via `@infra-x/eslint-config`
- Tests: `bun test`

## Setup

```bash
cp .env.example .env
bun install
bun run db:generate    # generate migrations from src/db/schema.ts
bun run db:migrate     # apply migrations
bun run dev            # starts on $PORT (default 3000)
```

## Scripts

| Script        | Purpose                                  |
| ------------- | ---------------------------------------- |
| `dev`         | `bun --watch` with live reload           |
| `start`       | Production run                           |
| `db:generate` | Generate SQL migrations with drizzle-kit |
| `db:migrate`  | Apply migrations                         |
| `typecheck`   | `tsc --noEmit`                           |
| `lint`        | `oxlint` + `eslint`                      |
| `test`        | `bun test`                               |

## Adding a route

1. Add the handler under `src/routes/<name>.ts`, exporting a `Hono` sub-app
2. Add a test under `tests/<name>.test.ts`
3. Register with `app.route('/', yourRoute)` in `src/index.ts`

## Deploy

Deployment is **not** pre-configured. Choose a target (Railway/Fly/Render/Docker) and add the minimum config needed — don't pre-optimise.
