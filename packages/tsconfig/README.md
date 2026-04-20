# @infra-x/tsconfig

DSL-based TypeScript config generator. Successor to `@infra-x/typescript-config`.

> [!NOTE]
> **0.0.0, pre-1.0 development.** API may change. This package already generates its own `tsconfig.json` — see [`tsconfig.config.ts`](./tsconfig.config.ts).

See [RFC 001](../../docs/rfc/001-tsconfig-dsl.md) for the full design rationale.

## Why

TS native `extends` is **field-level replacement**, not deep merge. Array fields (`types`, `lib`, `plugins`) silently overwrite across layers — stacking a profile with `types: ['node']` and a test layer with `types: ['vitest/globals']` drops `node`, forcing users to re-declare the combined value manually.

This package generates `tsconfig.json` from a TypeScript DSL with:

- **Smart merge** for array fields (`types`, `lib`, `plugins`) — append + dedupe by default, override when needed
- **Profile-based defaults** — `nextjs()` / `viteReact()` / `libNode()` / etc.
- **Semantic drift detection** — `tsconfig sync --check` ignores formatter-only diffs

## Quick start

```bash
# Interactive scaffold — pick profile, layers, paths
tsconfig gen

# Non-interactive (CI / scripts)
tsconfig gen --profile nextjs --layers app,test --paths '@/*=./src/*'

# One-shot: just tsconfig.*.json, no DSL file to maintain
tsconfig gen --once --profile nextjs --layers app,test
```

After scaffolding, `tsconfig.config.ts` is the source of truth. Re-run `tsconfig gen` to regenerate `tsconfig.json` after upgrades.

## Profiles

| Profile       | Target                  | Runtime                | Key defaults                                                        |
| ------------- | ----------------------- | ---------------------- | ------------------------------------------------------------------- |
| `nextjs()`    | Next.js 16 App Router   | Universal (Node + DOM) | `jsx: preserve`, Next plugin injected, `allowImportingTsExtensions` |
| `viteReact()` | Vite + React SPA        | Browser                | `jsx: react-jsx`, no node types, DOM libs                           |
| `libNode()`   | Node library (npm)      | Node                   | `declaration: true`, `isolatedDeclarations: true`                   |
| `libReact()`  | React component library | Browser                | `declaration: true`, `jsx: react-jsx`, DOM libs                     |
| `appBun()`    | Bun HTTP service / CLI  | Bun                    | `types: ['bun']`, bundler build                                     |
| `appNestjs()` | NestJS application      | Node                   | decorator metadata, `strictPropertyInitialization: false`           |

## DSL

Write `tsconfig.config.ts` in your project root:

```ts
import { nextjs } from '@infra-x/tsconfig'
import type { DefineTsconfigInput } from '@infra-x/tsconfig'

export default {
  profile: nextjs(),
  compilerOptions: {
    paths: { '@/*': ['./src/*'] },
  },
  layers: {
    app: {},
    test: {
      extends: 'app',
      compilerOptions: { types: ['vitest/globals'] },
      include: ['**/*.test.ts'],
    },
  },
} satisfies DefineTsconfigInput
```

Then `tsconfig gen` produces:

- `tsconfig.json` — the `app` layer (or first declared layer) becomes the primary
- `tsconfig.test.json` — for `vitest --tsconfig tsconfig.test.json` etc.

### Merge semantics

| Field kind                        | Default behavior                | Example                   |
| --------------------------------- | ------------------------------- | ------------------------- |
| Scalar (`strict`, `target`)       | User value replaces profile     | User `strict: false` wins |
| Object (`paths`)                  | User deep-merges with profile   | User keys add             |
| Array (`types`, `lib`, `plugins`) | User appends to profile, dedupe | User adds after profile   |

When the default is wrong, use an `ArrayControl` object:

```ts
compilerOptions: {
  // replace entirely — ignore profile's types
  types: { merge: 'replace', value: ['node'] },

  // clear to empty
  lib: 'none',

  // explicit append (same as writing the array directly)
  plugins: { merge: 'append', value: [{ name: 'my-plugin' }] },
}
```

`ArrayField<T>` accepts three forms:

| Form | Meaning |
| ---- | ------- |
| `T[]` | Append to profile value, dedupe |
| `'none'` | Clear to `[]` |
| `{ merge: 'append' \| 'replace' \| 'none', value?: T[] }` | Full control |

### Layers

Each layer becomes an independent tsconfig file you switch with `tsc -p tsconfig.<layer>.json` or tool flags (`vitest --tsconfig`).

- **No auto-`references`** — layers are views over the same source tree, not a build graph
- **`extends: '<layer>'`** inside a layer is DSL-level inheritance (resolved before output)
- The `app` layer (or first declared) becomes `tsconfig.json`; override with `primary: '<name>'`

For real TS project references (cross-package type dependencies), declare them explicitly in the top-level `references` field — we leave workspace topology to Nx / Turborepo / you.

### Conditional config

The config file is plain TS. Use `process.env` / `if` directly:

```ts
const isCI = process.env.CI === 'true'

export default {
  profile: libNode(),
  compilerOptions: {
    declarationMap: isCI,
    sourceMap: !isCI,
  },
} satisfies DefineTsconfigInput
```

## Commands

### `tsconfig gen`

One command, multiple modes. Resolves input in priority order: **flags → existing `tsconfig.config.ts` → interactive prompts**.

```bash
tsconfig gen                                                     # uses existing DSL, or prompts if TTY
tsconfig gen --profile nextjs --layers app,test                  # first-time scaffolding
tsconfig gen --once --profile nextjs --layers app,test           # one-shot: JSON only, no DSL
tsconfig gen --profile vite-react --force                        # overwrite existing DSL
```

Refuses to silently overwrite an existing DSL + flags combo unless `--force` is passed.

### `tsconfig sync`

Regenerate (or check) `tsconfig.*.json` against `tsconfig.config.ts`.

```bash
tsconfig sync                       # same as gen with no flags
tsconfig sync --check               # CI: exit 1 if disk drifts from DSL
```

`--check` is **semantic**, not byte-wise. It parses the disk JSON (JSONC-tolerant — comments and trailing commas OK), then deep-compares with the DSL output. Formatter passes, whitespace changes, and key reordering don't trigger drift — only actual value changes do.

## Workflow

### First-time setup

```bash
bun add -D @infra-x/tsconfig
tsconfig gen                    # interactive
# or: tsconfig gen --profile <your-profile>
```

Commit both `tsconfig.config.ts` and the generated `tsconfig.json` (plus any layer files). The generated files carry a `// AUTO-GENERATED` header; don't hand-edit them.

### CI integration

```yaml
# GitHub Actions example
- run: bun install
- run: bunx tsconfig sync --check # fails if someone edited tsconfig.json without updating DSL
```

### Upgrading

```bash
bun update @infra-x/tsconfig
tsconfig gen                         # regenerates with new profile defaults
git diff tsconfig.json               # review what changed
```

Your overrides in `tsconfig.config.ts` stay — only the profile-provided defaults shift.

## Status

- Profiles: `nextjs()`, `viteReact()`, `libNode()`, `libReact()`, `appBun()`, `appNestjs()`
- Array merge control: shorthand array, `'none'`, `ArrayControl { merge, value }`
- CLI: `gen` (unified scaffold + regen), `sync --check`
- Interactive + non-interactive (auto-detects TTY)
- Semantic drift detection (JSONC-tolerant)
- Self-hosted — this package generates its own tsconfig

## Roadmap

See [ROADMAP.md](./ROADMAP.md). Planned: watch mode, parameterized profiles (`nextjs({ version: 16 })`), edge runtime profiles.
