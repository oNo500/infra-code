# @infra-x/tsconfig — Roadmap

## Current (0.0.0)

- `defineTsconfig` core + layer resolution + circular detection
- Merge engine: scalar override, object deep merge, array append + dedupe
- Array merge control: shorthand array, `'none'`, `ArrayControl { merge: 'append'|'replace'|'none', value? }`
- Atoms: `base`, `runtimeNode/Bun/Browser/Edge`, `buildBundler/TscEmit`, `projectLib`, `frameworkReact/Nextjs/Nestjs`
- CLI:
  - `tsconfig` — interactive or flag-based
  - Flags: `--runtime`, `--module`, `--framework`, `--lib`, `--view`, `--references`, `--paths`
  - Prints equivalent command after interactive session
- Views: extra tsconfig files extending the base (`--view name:types:include`)

## Next (0.1.0, minimal-viable package)

- Migrate `packages/code-quality` and starters to dogfood the new CLI
- CHANGELOG tracking via changesets
- Validation: warn on invalid `--runtime`/`--module` enum values in flag mode

## Phase 2 (post-MVP)

- Watch mode: regenerate on config changes
- Edge runtime presets: Cloudflare Workers, Vercel Edge, Deno
- TS project references support (cross-workspace topology)
- `references` question in interactive mode

## Deprecation path

- `@infra-x/typescript-config` 2.x frozen at final version
- Package README gets deprecation notice pointing here
- All starters and internal packages migrate to this package
