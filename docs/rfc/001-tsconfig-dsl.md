# RFC 001: `@infra-x/tsconfig` — DSL-Based TypeScript Config Generator

- **Status**: Draft
- **Author**: xiu
- **Date**: 2026-04-17
- **Supersedes**: `@infra-x/typescript-config` (2.x)

## Summary

Replace `@infra-x/typescript-config` with `@infra-x/tsconfig`: a code-generating DSL that produces `tsconfig.json` files from a single TypeScript config. Solves array-field merge limitations of TS native `extends`, adds profile-based defaults, and provides source-traceable output via `--explain`.

## Motivation

### Current pain points with `@infra-x/typescript-config` 2.x

After integrating the `base` project as a new starter, the following structural issues surfaced:

1. **Array fields silently overwrite** across `extends` chains. TS's `extends` is field-level replacement, not deep merge. Stacking `runtime-universal` (`types: ['node']`) + `framework-vitest` (`types: ['vitest/globals']`) silently drops `node` from `types`. Users must manually re-declare the combined value in every leaf tsconfig.
2. **Atom "purity" is a fiction for array fields.** The "atoms are dimension-pure" invariant only holds for scalars (`strict`, `target`). For `types`, `lib`, `plugins`, `paths`, multiple atoms always collide.
3. **`plugins` can't have defaults.** Recipes cannot embed `plugins: [{name: 'next'}]` because user additions would wipe them. Users must re-declare.
4. **`isolatedDeclarations` in `project-lib` is over-strict** for React component libraries. `packages/ui` had to override it manually.
5. **Manual Next plugin repetition.** Every Next.js project re-declares `"plugins": [{"name": "next"}]`.
6. **No edge runtime atom.** Users building for Cloudflare Workers / Deno / Edge Runtime have no preset.

These are **structural**, not documentation gaps. A new design is required.

### Why not patch 2.x?

The root cause is TSC's `extends` semantics. No amount of atom reorganization fixes array merging. Only **code generation** — where the tool controls the merge — can solve it properly.

## Goals

- Eliminate silent array-field overwrites.
- Reduce cognitive load: users declare intent (profile), not inheritance order (atoms).
- Make config output **traceable**: every field answers "where did this come from?"
- Keep `tsconfig.json` as the source of truth for IDE / oxlint / tsc / other consumers (no runtime magic).
- Support multi-layer tsconfigs (app/test/build) without the misuse of `references`.

## Non-goals

- **Not** a monorepo package manager. Cross-package `references` (workspace topology) stays with Nx/Turborepo/user.
- **Not** a runtime config loader. Generated output is plain JSON, consumed by tsc and peers as usual.
- **Not** condition DSL. Conditional logic is handled by users in native TS (`process.env`, `if`).
- **Not** 100% backward-compatible with 2.x. This is a clean replacement; 2.x is frozen.

## Design

### Package identity

- **Name**: `@infra-x/tsconfig`
- **Consumed via**: `bun add -D @infra-x/tsconfig` (or pnpm/npm equivalent)
- **Entry**: exports `defineTsconfig()` + profile functions + CLI `tsconfig`

### DSL shape (Scheme D + functional profile)

User writes one file per package:

```ts
// tsconfig.config.ts
import { defineTsconfig, nextjs } from '@infra-x/tsconfig'

export default defineTsconfig({
  profile: nextjs(),
  compilerOptions: {
    paths: { '@/*': ['./src/*'] },
    plugins: [{ name: 'next' }],
    incremental: true,
  },
})
```

Running `tsconfig gen` produces `tsconfig.json`.

### Merge semantics (default behavior)

When a user-supplied `compilerOptions.X` field meets a profile's default:

| Field type | Default behavior | Example |
|-----------|------------------|---------|
| Scalar (`strict`, `target`) | User value **replaces** profile | User `strict: false` wins |
| Object (`paths`) | User value **deep-merges** with profile | User keys add/replace |
| Array (`types`, `lib`, `plugins`) | User value **appends to** profile, deduped | User types added after profile types |

### Explicit merge verbs (for precise control)

When default behavior is wrong, wrap the value in a verb object:

```ts
compilerOptions: {
  types: { $set: ['node'] },       // Replace entire array (ignore profile)
  lib: { $remove: ['DOM'] },       // Remove from profile's default
  plugins: { $prepend: [...] },    // Prepend instead of append
}
```

Supported verbs:

- `$set(value)`: replace entirely, ignore profile default
- `$remove(items[])`: remove specific items from array (for arrays)
- `$prepend(items[])`: prepend (vs default append, rare)

`$` prefix follows MongoDB/JSON Patch convention — familiar to most developers.

### Profiles (functional, typed)

Profiles are **functions** returning a profile object, not strings. This:

- Enables future parameterization: `nextjs({ version: 16 })`
- Gives TS autocomplete and type-safe option validation
- Supports IDE Cmd+Click to jump to profile source

MVP profile list (covers all current starters):

| Profile | Target | Default atoms composed |
|---------|--------|------------------------|
| `nextjs()` | Next.js App Router apps | base + runtime-universal + build-bundler + framework-react + next-hints |
| `viteReact()` | Vite + React prototypes | base + runtime-browser + build-bundler + framework-react |
| `libNode()` | Node.js libraries (published to npm) | base + runtime-node + build-tsc-emit + project-lib |
| `libReact()` | React component libraries | base + runtime-browser + build-bundler + project-lib + framework-react |
| `appBun()` | Bun HTTP services / CLIs | base + runtime-bun + build-bundler |
| `appNestjs()` | NestJS apps | base + runtime-node + build-tsc-emit + framework-nestjs |

Future profiles (not MVP): `edge()`, `cloudflareWorker()`, `deno()`, `appExpo()`.

### Layers (multi-tsconfig within one package)

When a package needs multiple tsconfig files (app/test/build view split), use `layers`:

```ts
export default defineTsconfig({
  profile: nextjs(),
  compilerOptions: {
    paths: { '@/*': ['./src/*'] },
  },
  layers: {
    app: {
      include: ['src/**/*', 'next-env.d.ts'],
      exclude: ['**/*.test.ts', '**/*.test.tsx'],
    },
    test: {
      extends: 'app', // DSL-level extends, not TS extends
      compilerOptions: {
        types: ['vitest/globals'], // Appends to profile's types — no manual node re-declare
      },
      include: ['**/*.test.ts', '**/*.test.tsx'],
    },
  },
})
```

Generates:

- `tsconfig.json` — primary layer (defaults to `app` if named so, or first declared)
- `tsconfig.app.json` — app layer
- `tsconfig.test.json` — test layer

**Layers are independent tsconfigs switched via `tsc -p` or tool flags (`vitest --tsconfig`)**. Layers **do not** generate TS `references` by default — that avoids the "5 layers × composite/buildinfo noise" pitfall.

If a user genuinely needs TS project references (cross-package workspace topology), they declare it explicitly:

```ts
defineTsconfig({
  profile: nextjs(),
  references: [
    { path: '../../packages/ui' },
    { path: '../../packages/icons' },
  ],
})
```

MVP may defer `references` until a real use case appears; users can hand-edit the generated JSON for now.

### Generated output — committed to git

**All generated files are committed**. Rationale:

- IDE (VSCode), oxlint (`typeAware: true`), vite-tsconfig-paths, vitest, Next.js, and every TS tool assumes `tsconfig.json` is on disk at open-time. Gitignoring breaks cold-start UX (red squiggles until postinstall completes).
- Git becomes the single source of truth consumed by CI, Codespaces, etc.

Generated files carry a header comment:

```jsonc
// AUTO-GENERATED by @infra-x/tsconfig. Do not edit directly.
// Edit tsconfig.config.ts and run `tsconfig sync`.
{
  ...
}
```

### Sync mechanism (drift prevention)

Two commands:

- `tsconfig sync` (or `tsconfig gen`): read `tsconfig.config.ts`, regenerate all tsconfig files, write to disk.
- `tsconfig sync --check`: regenerate in memory, compare to disk. If mismatch, exit 1 with diff (CI mode).

Recommended workflows:

- **Pre-commit hook**: `tsconfig sync --check` blocks commits that forget to regenerate after DSL changes.
- **CI step**: same check runs in CI.
- **Local dev**: IDE extension (future) or watch mode `tsconfig sync --watch` auto-regenerates on DSL changes.

### `--explain` command

Debugging tool for "where did this field come from?":

```bash
$ tsconfig explain app

tsconfig.app.json
═════════════════

profile: nextjs()

compilerOptions:
  strict: true                  [profile.nextjs → base]
  target: "esnext"              [profile.nextjs → base]
  module: "esnext"              [profile.nextjs → build-bundler]
  jsx: "preserve"               [profile.nextjs → framework-nextjs]
  types: ["node"]               [profile.nextjs → runtime-universal]
  paths:
    "@/*": ["./src/*"]          [user override at compilerOptions.paths]
  plugins:
    - { name: "next" }          [user append at compilerOptions.plugins]

include: ["src/**/*"]           [user override]
exclude: ["node_modules"]       [profile.nextjs default]

Hypothetical removals:
  - Removing user.compilerOptions.paths → paths would be unset (profile has no default)
  - Removing user.compilerOptions.plugins → plugins would be []
```

Key differentiator from `tsc --showConfig`: traces the **origin layer** of each field, not just resolved values.

### Underlying implementation

Leverage established libraries:

- **`tsconfck`** — parse tsconfig, resolve extends chains (Vite/Astro already use it). Provides `extended` vs `merged` views — useful for `--explain`.
- **`c12` (UnJS)** — config merging with `layers` metadata. Layers become the data source for `--explain`.
- **`defu`** — deep merge utility (dependency of c12).

Custom logic required on top:
- Array field merge with `$set`/`$remove`/`$prepend` verb support
- Profile composition (profile functions return layered configs)
- Layer resolution and output splitting (primary + sub-tsconfigs)
- Diff rendering for `--check`

## Migration plan

### Phase 1: Publish `@infra-x/tsconfig` 0.1.0 (MVP)

- 6 profiles listed above
- `defineTsconfig`, `$set`/`$remove`/`$prepend`
- `layers` (without auto-generated references)
- `tsconfig gen`, `tsconfig sync --check`, `tsconfig explain`
- Tests covering every profile + each merge verb + array field scenarios

### Phase 2: Migrate starters

Order (least → most risk):

1. **`starters/cli`** — single tsconfig, trivial migration
2. **`starters/server`** — single tsconfig, Bun runtime
3. **`starters/web`** — single tsconfig, Bun + React
4. **`starters/fullstack`** — 3 tsconfigs per app × 2 apps × packages/ui + packages/icons, uses `layers` heavily

Each migration:

- Replace `@infra-x/typescript-config` dep with `@infra-x/tsconfig`
- Add `tsconfig.config.ts`
- Run `tsconfig gen`, commit output
- Verify `typecheck`, `lint`, `build`, `test` all pass
- Commit as separate PR per starter

### Phase 3: Freeze `@infra-x/typescript-config` 2.x

- Add deprecation notice to 2.x README pointing to new package
- No new versions; CHANGELOG locked at 2.0.0
- Keep it on npm for old consumers

### Phase 4: Future work (not blocking migration)

- Parameterized profiles (`nextjs({ version: 16 })`)
- Edge/Workers profiles
- `tsconfig explain --diff`: compare two runs (after upgrading `@infra-x/tsconfig`)
- IDE extension for real-time DSL preview

## Testing strategy

Unit tests (MVP minimum):

- Every profile function: default output matches snapshot
- Merge verbs: `$set` / `$remove` / `$prepend` each have 2+ cases (edge cases: empty array, no-op removal, etc.)
- Array default append: `types` / `lib` / `plugins` each tested with 0/1/N items at each layer
- Object merge: `paths` deep merge with key overlap
- Layer resolution: `extends` chain, layer-level overrides don't leak
- `--check` diff: produce useful output when DSL and disk disagree
- `--explain`: every field gets a source label

Integration tests:

- Each starter type builds successfully after migration
- `tsc --noEmit` on generated tsconfig produces no errors
- oxlint `typeAware: true` picks up generated configs

## Risks & open questions

### Risks

1. **User forgets `tsconfig sync` after editing DSL** → disk tsconfig stale.
   - Mitigation: pre-commit hook, CI `--check`, IDE warning (future).

2. **Profile evolution breaks downstream starters silently.**
   - Mitigation: profile defaults versioned internally; major bumps document breaking changes; `--diff` tool (Phase 4).

3. **Users expect full tsconfig.json edit freedom.**
   - Generated files carry header warning, but nothing prevents edits.
   - Mitigation: `--check` detects any drift from DSL-rendered output.

4. **Dependency on `c12` / `tsconfck` — if either stops maintenance.**
   - Both are well-established (c12 in Nuxt ecosystem, tsconfck in Vite ecosystem). Risk is low but real.

### Open questions

- **Should the primary layer be explicit or inferred?** MVP inference rule: if a layer named `app` exists, it becomes `tsconfig.json`; else the first declared layer. Alternative: require explicit `primary: 'app'`.
- **Should we support `.json` output in addition to committing?** Some users may prefer a single tsconfig.config.ts + runtime resolution (no `.json` on disk). Not MVP; revisit if demand appears.
- **Verb syntax `$set` vs other conventions.** Alternatives considered: `{__set: [...]}`, `{set: [...], value: [...]}` (struct), top-level `overrides:` block. `$`-prefix chosen for familiarity. Open to feedback.

## Appendix: Prior art summary

From research (internal audit):

- **`merge-tsconfigs`** (yowainwright): code-gen product, but no profile or DSL. Fragment we build on.
- **`@topoconfig/extends`** (antongolub): 5 merge strategies (populate/merge/override/rebase/ignore). Semantic inspiration for `$set`/etc.
- **`tsconfig.guide`** (blakewilson): web UI generating tsconfig from 4-question decision tree. Validates "profile + generate" approach; we extend to long-term maintenance.
- **`antfu/eslint-config` + `eslint-flat-config-utils`**: chainable composer with `append`/`prepend`/`override` verbs. Fits ESLint's array-based config; **rejected** for tsconfig (see Alternatives).
- **`c12`** (UnJS): config merge engine with `layers` — directly used for our `--explain` source attribution.
- **TS native `tsc --showConfig`**: prints resolved config. Does **not** attribute field origins — our `--explain` is a superset.
- **`tsconfig/bases`, `@total-typescript/tsconfig`, `@sindresorhus/tsconfig`, `@vercel/style-guide`, `@epic-web/config`, Turborepo, Nx**: all pure `extends`-chain (except Nx's `sync` for `references`). All face the array-merge limitation, none solves it. Confirms the niche we are filling.

## Alternatives considered

### A. Incremental fix of `@infra-x/typescript-config` 2.x (Scheme B in design discussion)

Keep atom model, add more profiles, document limits better. **Rejected**: root cause (TSC extends semantics) unreachable by any extends-based design.

### B. Chained functional DSL (antfu-style)

```ts
tsconfig('nextjs-app')
  .pipe(withPlugins([...]))
  .pipe(withTypes.append([...]))
```

**Rejected**: tsconfig is a static object with ~50 fields and no conditional composition need. Chained API adds ceremony without leveraging its advantages (order-sensitivity, runtime composition). Would require ~50 `withX` helpers or a generic `with(key, value)` that regresses to object literals.

### C. Scaffold-and-forget (generate once, hand-maintain)

Run generator once at project init, never again. **Rejected**: user explicitly wants to track upstream TS/framework upgrades and re-run. Scaffold mode breaks the upgrade loop.

### D. Gitignore generated output + postinstall regenerate

**Rejected**: breaks IDE cold-start UX and oxlint `typeAware` first-run workflows. `tsconfig.json` must be on disk before any tool opens the project.

### E. Native TS merge proposals (TS issues #20110, #57486)

Microsoft has not accepted array-merge proposals after multiple years. Waiting is not an option.

---

**Next step after RFC approval**: scaffold `packages/tsconfig/`, implement `nextjs()` profile + `defineTsconfig` + `tsconfig gen` as a walking skeleton before filling in other profiles.
