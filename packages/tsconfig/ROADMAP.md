# @infra-x/tsconfig — Roadmap

## Current (0.0.0)

- `defineTsconfig` core + layer resolution + circular detection
- Merge engine: scalar override, object deep merge, array append + dedupe
- Array merge control: shorthand array, `'none'`, `ArrayControl { merge: 'append'|'replace'|'none', value? }`
- CLI:
  - `tsconfig gen` — unified command; scaffolds `tsconfig.config.ts` on first run (interactive via @clack/prompts, or from flags), regenerates from existing config on subsequent runs
  - `tsconfig sync --check` — **semantic** drift detection (JSONC-tolerant, formatter-safe)
- Profiles: `nextjs()`, `viteReact()`, `libNode()`, `libReact()`, `appBun()`, `appNestjs()`
- `--once` mode for one-shot JSON-only generation
- Self-hosted: the package generates its own `tsconfig.json`

## Next (0.1.0, minimal-viable package)

- Migrate `packages/code-quality` and `starters/cli` / `starters/server` / `starters/web` to dogfood the DSL
- CHANGELOG tracking via changesets
- Parameterized profiles (`nextjs({ version: 16, turbopack: true })`)

## Phase 2 (post-MVP)

- Watch mode: `tsconfig sync --watch` — regenerate on DSL changes
- Edge runtime profiles: `cloudflareWorker()`, `vercelEdge()`, `deno()`
- TS project references support (cross-workspace topology) — still likely deferred to Nx/Turborepo, but reconsider if real use cases surface
- IDE extension for real-time DSL preview

## Deprecation path

- `@infra-x/typescript-config` 2.x frozen at final version
- Package README gets deprecation notice pointing here
- All 4 starters and 2 internal packages migrate to this package
