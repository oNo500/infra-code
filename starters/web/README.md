# base-bun-web

Starter template for **quick prototypes** — not for production business front-ends.

## Stack

- Runtime + bundler: Bun (full-stack mode, HTML entry)
- UI: React 19
- Styling: Tailwind CSS v4 (`@import "tailwindcss"`)
- Dev server + fake API: `Bun.serve({ routes })` — one process
- Lint: `oxlint` + `eslint` via `@infra-x/eslint-config`
- Tests: `bun test` + `@testing-library/react` + `@happy-dom`

## Scripts

```bash
bun install
bun run dev        # http://localhost:3000 with HMR
bun run build      # outputs static bundle to dist/
bun run preview    # serve dist/
bun run test
bun run typecheck
bun run lint
```

## Layout

```
index.html          entry — bundler picks up <script type="module" src="./src/main.tsx">
src/main.tsx        mounts <App /> to #root
src/app.tsx         edit this (kebab-case per project lint rules)
src/styles.css      `@import "tailwindcss"`
server.ts           Bun.serve for dev + any mock API routes
tests/              bun test suite with happy-dom DOM preload
```

## Filename convention

All source files use **kebab-case** (`app.tsx`, not `App.tsx`). This is enforced by `unicorn/filename-case` in `@infra-x/eslint-config`. The component export name (`App`) is unaffected — only the filename.

## Intentionally not included

State manager · router · UI component library · fancy test setup. Add them only when a specific prototype needs them.

## When you outgrow this template

If the prototype becomes a real product, migrate to a production-grade stack (Next.js / Vite + React + real backend). This template is for speed, not scale.
