# @infra-x/tsconfig — Roadmap

## Current (0.0.0, walking skeleton)

- `defineTsconfig` core + layer resolution + circular detection
- Merge engine: scalar override, object deep merge, array append + dedupe
- Merge verbs: `$set`, `$remove`, `$prepend`, `$append`
- Provenance tracking for `explain`
- CLI:
  - `tsconfig gen` — unified command; scaffolds `tsconfig.config.ts` on first run (interactive via @clack/prompts, or from flags), regenerates from existing config on subsequent runs
  - `tsconfig sync --check` — CI drift detection
  - `tsconfig explain [layer]` — field-source attribution with `--field`, `--format json`, `--hypothetical`
- Profile: `nextjs()`

## Next (0.1.0, minimal-viable package)

- Profiles: `viteReact()`, `libNode()`, `libReact()`, `appBun()`, `appNestjs()`
- Migrate `starters/cli` to the new package as proof of concept
- CHANGELOG tracking via changesets

## Phase 2 (post-MVP)

### Interactive TUI for `explain`

Replace `tsconfig explain` (no args) with an interactive explorer:

- Arrow keys to browse layers
- Type-to-filter fields
- Toggle hypothetical analysis inline
- Switch between text/JSON views

Keep current non-interactive mode for scripting:

```bash
tsconfig explain app --field types --format json   # existing, for CI / pipes
tsconfig explain                                   # new, interactive TUI
```

Likely stack: `@clack/prompts` or `ink`.

### Personal preference config

Support `~/.tsconfigrc` (or equivalent via `cosmiconfig` / `c12`) for:

- Default color scheme for `explain`
- Default output format
- Layer name conventions

### Other enhancements

- `tsconfig explain --diff <prev-version>` — compare DSL output between two commits / package versions
- Watch mode: `tsconfig sync --watch` — regenerate on DSL changes
- Parameterized profiles: `nextjs({ version: 16, turbopack: true })`
- Edge runtime profiles: `cloudflareWorker()`, `vercelEdge()`, `deno()`
- TS project references support (cross-workspace topology) — still likely deferred to Nx/Turborepo, but reconsider if real use cases surface
- IDE extension for real-time DSL preview

## Deprecation path

- `@infra-x/typescript-config` 2.x frozen at final version
- Package README gets deprecation notice pointing here
- All 4 starters and 2 internal packages migrate to this package
