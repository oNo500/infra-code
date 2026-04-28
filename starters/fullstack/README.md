# fullstack

Next.js monorepo starter — feature-based architecture, Drizzle ORM + PostgreSQL, Better Auth, shadcn/ui.

Part of [`infra-code`](../..). Fetched via `giget`:

```bash
bunx giget@latest gh:oNo500/infra-code/starters/fullstack my-app
```

## Workspace

- `apps/web` (:3000) — Next.js frontend, no database
- `apps/api-web` (:3001) — Next.js full-stack, PostgreSQL + Better Auth
- `packages/ui` — shared component library, shadcn/ui
- `packages/icons` — shared icon set
- `packages/cli` — internal CLI tools (`pnpm theme`, …)

## Philosophy

- **Feature-based** — business logic organized by domain, not technical role
- **API Route over Server Action** — mutations go through API routes for portability; Server Actions only for cache revalidation
- **Library-first** — no reinventing wheels; every choice has a best-in-class library behind it
- **TDD** — tests written before implementation, co-located with source

## Tech Choices

- **Next.js 16 App Router** — full-stack in one repo, RSC for free
- **Better Auth** — typesafe, extensible, no vendor lock-in
- **Drizzle ORM + PostgreSQL** — typesafe SQL, zero magic
- **@t3-oss/env-nextjs + Zod** — env validated at build time, not runtime
- **shadcn/ui via @workspace/ui** — owned components, not a black-box library
- **Vitest + Testing Library** — fast, co-located, browser-like
- **oxlint + oxfmt via `@infra-x/code-quality`** — 10-100x faster than ESLint/Prettier
- **TypeScript presets via `@infra-x/typescript-config`** — composable recipes + atoms

## Quick Start

> [!NOTE]
> PostgreSQL must be running before starting `api-web`.

```bash
pnpm install
cp apps/api-web/.env.example apps/api-web/.env
pnpm --filter api-web db:push
pnpm dev
```

## Common Commands

```bash
pnpm dev          # start all apps
pnpm build        # build all
pnpm check        # lint:fix + format + typecheck + lint:deps + test
pnpm test         # run all tests
pnpm typecheck    # type check
pnpm lint:fix     # lint + auto-fix
pnpm lint:deps    # dependency-cruiser: cycles, orphans, feature isolation
pnpm format       # format all files
```

### Dependency rules

- `oxlint` (`pnpm lint`) covers per-file checks, including `import/no-cycle` for editor-time feedback on circular imports.
- `dependency-cruiser` (`pnpm lint:deps`) runs at the graph level. Each app owns a `.dependency-cruiser.mjs` enforcing:
  - `no-cross-feature` — `src/features/<a>/**` cannot import `src/features/<b>/**`. Promote shared code to `src/lib`, `src/components` or `src/hooks` (see `.claude/rules/web.md` and `.claude/rules/api-web.md`).
  - `no-feature-to-route` (api-web only) — `features/` cannot depend on `app/`; the direction is `app/ -> features/`.

## Theming

The `packages/cli` provides a `theme` command to switch the shadcn theme across the entire monorepo — style, accent color, base color, radius, fonts, and more.

```bash
# interactive picker
pnpm theme

# apply a saved preset code directly
pnpm theme --preset <code>
```

The command:

1. Fetches CSS variables (including accent color) from the shadcn `/init` API
2. Writes `:root` / `.dark` blocks in `packages/ui/src/styles/shadcn-theme.css`
3. Updates `style` and `tailwind.baseColor` in all `components.json` files
4. Re-runs `shadcn add` to regenerate component files matching the new style

> [!NOTE]
> `theme` and `chartColor` are stored in `packages/ui/.theme-config.json` — they are not valid fields in `components.json` and must live separately.
