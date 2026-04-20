# @infra-x/tsconfig

Atom-based TypeScript config generator. Successor to `@infra-x/typescript-config`.

> [!NOTE]
> **0.0.0, pre-1.0 development.** API may change.

## Why

TS native `extends` is **field-level replacement**, not deep merge. Array fields (`types`, `lib`, `plugins`) silently overwrite across layers — stacking a base config with `types: ['node']` and a test config with `types: ['vitest/globals']` drops `node`, forcing you to re-declare the combined value manually.

This package generates `tsconfig.json` from composable atoms with:

- **Smart merge** for array fields (`types`, `lib`, `plugins`) — append + dedupe by default, override when needed
- **Atom-based composition** — pick runtime, module system, framework, and extra views
- **No config file to maintain** — generate directly from CLI flags or interactive prompts

## Quick start

```bash
# Interactive — answers questions, then writes tsconfig.json
tsconfig

# Non-interactive (CI / scripts)
tsconfig --runtime node --module bundler --framework react
tsconfig --runtime node,browser --module bundler --framework nextjs \
         --view test:vitest/globals:**/*.test.ts \
         --paths '@/*=./src/*'
```

## Atoms

Each atom is a function returning a partial `CompilerOptions`. Atoms are composed with last-wins for scalars and append+dedupe for arrays.

| Atom                | What it sets                                                                                                    |
| ------------------- | --------------------------------------------------------------------------------------------------------------- |
| `base()`            | Strict mode, incremental, all quality flags                                                                     |
| `runtimeNode()`     | `types: ['node']`, `lib: ['esnext']`                                                                            |
| `runtimeBun()`      | `types: ['bun']`, `lib: ['esnext']`                                                                             |
| `runtimeBrowser()`  | `types: []`, `lib: ['esnext', 'DOM', 'DOM.Iterable']`                                                           |
| `runtimeEdge()`     | `types: []`, `lib: ['esnext']`                                                                                  |
| `buildBundler()`    | `module: preserve`, `moduleResolution: bundler`, `noEmit: true`                                                 |
| `buildTscEmit()`    | `module: nodenext`, `moduleResolution: nodenext`, `noEmit: false`, `outDir: dist`                               |
| `projectLib()`      | `declaration: true`, `isolatedDeclarations: true`, `allowJs: false`, `noPropertyAccessFromIndexSignature: true` |
| `frameworkReact()`  | `jsx: react-jsx`                                                                                                |
| `frameworkNextjs()` | `jsx: react-jsx`, `module: preserve`, `moduleResolution: bundler`                                               |
| `frameworkNestjs()` | `experimentalDecorators`, `emitDecoratorMetadata`, relax `strictPropertyInitialization`                         |

Compose them directly in code:

```ts
import { base, runtimeNode, buildBundler, composeAtoms } from '@infra-x/tsconfig'

const compilerOptions = composeAtoms(base(), runtimeNode(), buildBundler())
```

## Merge semantics

| Field kind                        | Default behavior | Override           |
| --------------------------------- | ---------------- | ------------------ |
| Scalar (`strict`, `target`)       | Last atom wins   | —                  |
| Object (`paths`)                  | Deep merge       | —                  |
| Array (`types`, `lib`, `plugins`) | Append + dedupe  | Use `ArrayControl` |

When the default is wrong, use an `ArrayControl` object in `compilerOptions`:

```ts
const opts = composeAtoms(base(), runtimeNode(), buildBundler())

// replace entirely — clear any accumulated types and set only ['node']
opts.types = { merge: 'replace', value: ['node'] }

// clear to empty
opts.lib = 'none'

// explicit append (same as writing the array directly)
opts.plugins = { merge: 'append', value: [{ name: 'my-plugin' }] }
```

`ArrayField<T>` accepts three forms:

| Form                                                      | Meaning                      |
| --------------------------------------------------------- | ---------------------------- |
| `T[]`                                                     | Append to base value, dedupe |
| `'none'`                                                  | Clear to `[]`                |
| `{ merge: 'append' \| 'replace' \| 'none', value?: T[] }` | Full control                 |

## CLI

### `tsconfig`

Generates `tsconfig.json` (plus one file per view). Two modes:

**Interactive** (TTY, no flags) — asks questions:

1. Framework? `none / react / nextjs / nestjs`
2. Runtime(s)? multi-select `node / bun / browser / edge`
3. Module system? `bundler / nodenext`
4. Library mode? (enables declaration output)
5. Extra views? (additional tsconfig files)
6. Path aliases?

After interactive mode, prints the equivalent command so you can repeat it without prompts.

**Flag mode** — `--runtime` and `--module` are required:

```bash
# Node + bundler (Vite, tsdown)
tsconfig --runtime node --module bundler

# Bun app
tsconfig --runtime bun --module nodenext

# Next.js (universal runtime)
tsconfig --runtime node,browser --module bundler --framework nextjs

# NestJS
tsconfig --runtime node --module nodenext --framework nestjs

# React library
tsconfig --runtime browser --module bundler --framework react --lib

# With extra tsconfig views (e.g. for vitest)
tsconfig --runtime node --module bundler \
  --view test:vitest/globals:**/*.test.ts \
  --view build::src/**

# With path aliases and cross-package references
tsconfig --runtime node --module bundler \
  --paths '@/*=./src/*' \
  --references ../shared,../ui
```

### Flags

| Flag           | Type                  | Description                                     |
| -------------- | --------------------- | ----------------------------------------------- |
| `--runtime`    | `string`              | Comma-separated: `node,bun,browser,edge`        |
| `--module`     | `string`              | `bundler` or `nodenext`                         |
| `--framework`  | `string`              | `none`, `react`, `nextjs`, `nestjs`             |
| `--lib`        | `boolean`             | Enable `declaration` + `isolatedDeclarations`   |
| `--view`       | `string` (repeatable) | `name:types:include` — each flag adds one file  |
| `--references` | `string`              | Comma-separated paths for TS project references |
| `--paths`      | `string`              | `@/*=./src/*,@ui/*=../ui/src/*`                 |
| `--cwd`        | `string`              | Working directory (default: `.`)                |

### Views

Each `--view` flag adds a `tsconfig.<name>.json` that extends the base config:

```bash
--view test:vitest/globals:**/*.test.ts
# produces tsconfig.test.json with:
#   compilerOptions.types += ['vitest/globals']
#   include: ['**/*.test.ts']
```

Format: `name:types:include` where `types` and `include` are comma-separated. Either segment can be empty: `build::src/**` (no extra types, restrict include to src).

## Workflow

### First-time setup

```bash
bun add -D @infra-x/tsconfig
tsconfig              # interactive
```

Commit the generated `tsconfig.json`. The file carries a `// AUTO-GENERATED` header; don't hand-edit it.

### CI integration

Re-generate to verify no drift:

```bash
tsconfig --runtime node --module bundler --framework nextjs
git diff --exit-code tsconfig.json
```

### Upgrading

```bash
bun update @infra-x/tsconfig
tsconfig --runtime <same-as-before> --module <same-as-before>
git diff tsconfig.json   # review what changed
```

## Status

- Atoms: `base`, `runtimeNode/Bun/Browser/Edge`, `buildBundler/TscEmit`, `projectLib`, `frameworkReact/Nextjs/Nestjs`
- Array merge control: shorthand array, `'none'`, `ArrayControl { merge, value }`
- CLI: interactive + flags, views, references, paths

## Roadmap

See [ROADMAP.md](./ROADMAP.md).
