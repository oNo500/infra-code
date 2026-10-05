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

# Electron + Vite: main/preload and renderer type environments
tsconfig --preset electron-vite --framework react
```

Bundler mode and the Electron preset use `module: preserve`, which requires TypeScript 5.4+. The basic NodeNext mode keeps its existing TypeScript 5.0+ support; optional atoms and application dependencies can require newer versions. [1]

## Atoms

Each atom is a function returning a partial `CompilerOptions`. Atoms are composed with last-wins for scalars and append+dedupe for arrays.

| Atom                | What it sets                                                                                                    |
| ------------------- | --------------------------------------------------------------------------------------------------------------- |
| `base()`            | Strict mode, incremental, all quality flags                                                                     |
| `runtimeNode()`     | `types: ['node']`, `lib: ['esnext']`                                                                            |
| `runtimeBun()`      | `types: ['bun']`, `lib: ['esnext']`                                                                             |
| `runtimeBrowser()`  | `lib: ['esnext', 'DOM', 'DOM.Iterable']`                                                                        |
| `runtimeEdge()`     | `lib: ['esnext']`                                                                                               |
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

**Flag mode** — choose `--preset electron-vite`, or provide both `--runtime` and `--module`:

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

| Flag           | Type                  | Description                                                               |
| -------------- | --------------------- | ------------------------------------------------------------------------- |
| `--preset`     | `string`              | `electron-vite`; replaces runtime/module selection                        |
| `--runtime`    | `string`              | Comma-separated: `node,bun,browser,edge`                                  |
| `--module`     | `string`              | `bundler` or `nodenext`                                                   |
| `--framework`  | `string`              | `none`, `react`, `nextjs`, `nestjs`; preset accepts only `none` / `react` |
| `--lib`        | `boolean`             | Enable `declaration` + `isolatedDeclarations`                             |
| `--view`       | `string` (repeatable) | `name:types:include` — each flag adds one file                            |
| `--references` | `string`              | Comma-separated paths for TS project references                           |
| `--paths`      | `string`              | `@/*=./src/*,@ui/*=../ui/src/*`                                           |
| `--cwd`        | `string`              | Working directory (default: `.`)                                          |

### Views

Each `--view` flag adds a `tsconfig.<name>.json` that extends the base config:

```bash
--view test:vitest/globals:**/*.test.ts
# produces tsconfig.test.json with:
#   compilerOptions.types += ['vitest/globals']
#   include: ['**/*.test.ts']
```

Format: `name:types:include` where `types` and `include` are comma-separated. Either segment can be empty: `build::src/**` (no extra types, restrict include to src).

### Electron + Vite preset

For an electron-vite 5 project with TypeScript 5.4+, run from the project root:

```bash
tsconfig --preset electron-vite --framework react
# Omit --framework, or use --framework none, for a plain TypeScript renderer.
```

Install the application's Electron, electron-vite, Vite, and `@types/node` dependencies first; React projects also need React and its type declarations. The preset follows electron-vite's `src/main`, `src/preload`, and `src/renderer` layout and adds its Node asset declarations. [2][3]

| File                     | Source files                                                              | Libraries / automatic types                                   |
| ------------------------ | ------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `tsconfig.json`          | `files: []`; references `tsconfig.node.json` and `tsconfig.renderer.json` | Empty `compilerOptions`; organizes references only            |
| `tsconfig.node.json`     | `src/main/**/*`, `src/preload/**/*`, `electron.vite.config.ts`            | `esnext`, `DOM`, `DOM.Iterable`; `node`, `electron-vite/node` |
| `tsconfig.renderer.json` | `src/renderer/**/*`                                                       | `esnext`, `DOM`, `DOM.Iterable`; `vite/client`                |

Both child configurations independently define `strict: true`, `composite: true`, `module: preserve`, `moduleResolution: bundler`, `noEmit: true`, and separate cache files in `node_modules/.cache`. React's `jsx: react-jsx` applies only to renderer. The preset defines no global path aliases.

After creating source files, check both environments from the project root. A successful run exits without diagnostics; electron-vite handles JavaScript output:

```bash
tsc -b
```

To check either environment separately, use `tsc -p tsconfig.node.json` or `tsc -p tsconfig.renderer.json`. The root has no source files, so `tsc -p tsconfig.json` alone does not check the application.

`--preset` cannot be combined with `--runtime`, `--module`, `--view`, `--lib`, `--testing`, `--erasable`, `--references`, or `--paths`. Existing atom commands keep their behavior. On a new project, the preset writes all three files; repeating the same command leaves them unchanged. If any target file already needs changes, generation refuses the entire write set, including compiler-option changes. It never automatically migrates an existing project. Generate into another directory to review a proposed configuration.

The API supports the same generation and a read-only plan:

```ts
import { electronViteConfig, generate, planGenerate } from '@infra-x/tsconfig'

const config = electronViteConfig('react') // RenderedConfig; no filesystem writes
const plans = await planGenerate({ cwd: '.', preset: 'electron-vite', framework: 'react' })
await generate({ cwd: '.', preset: 'electron-vite', framework: 'react' })
```

### Electron type and runtime boundaries

Main and preload share the Node configuration, so main also receives DOM types. TypeScript can therefore accept browser globals in main. Use the Electron lint preset's main override (`browser: false` and `no-undef`) to catch those globals.

Preload's Node types describe APIs; they do not grant sandbox permissions. A sandboxed preload has only Electron's allowed Node subset. For electron-vite 5, configure preload output as a single CommonJS bundle and set `preload.build.externalizeDeps: false` so ordinary dependencies are bundled. Keep Electron itself external. This generator only writes tsconfig files: it does not change build files, `BrowserWindow` preferences, or IPC code. [4][5][6]

Renderer's `types: ['vite/client']` limits automatically included global types. It does not prohibit importing Node modules, Electron, or declarations that bring Node types into the program; enforce those imports with renderer-specific lint rules. [7]

Place shared bridge interfaces and DTO declarations in a pure `src/shared/bridge.d.ts`, then import its types from preload and renderer. Do not derive renderer types by importing `electron` or the preload implementation, even with `import type`: Electron's declaration header references Node types, which can enter the renderer through declaration dependencies. [7][9] For example:

```ts
// src/shared/bridge.d.ts
export interface BridgeApi {
  ping(): Promise<string>
}

// src/renderer/bridge.d.ts
// oxlint-disable-next-line import/no-relative-parent-imports -- Shared declaration has no runtime imports.
import type { BridgeApi } from '../shared/bridge'
declare global {
  interface Window {
    bridge: BridgeApi
  }
}
```

When using `base()` from `@infra-x/code-quality/lint`, parent-relative imports are forbidden by default. The comment above allows just this pure type import; use the same exception for a preload type import, or configure a project-specific alias instead. It does not allow importing Electron or Node types in renderer. The Electron lint preset includes renderer and shared bridge declarations when its `ignorePatterns` are applied at the root config.

The default recipe includes main and preload source files in the Node project, and renderer source files in the renderer project. If shared code uses `.ts` rather than `.d.ts`, explicitly include those files in every composite project that imports them; otherwise TypeScript reports TS6307. [8]

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
- CLI: interactive + flags, views, references, paths, `electron-vite` preset
- Electron + Vite: three files; root references the Node (main/preload) and renderer projects

## Roadmap

See [ROADMAP.md](./ROADMAP.md).

## Sources

1. [TypeScript 5.4: module preserve](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html)
2. [electron-vite: project structure](https://electron-vite.org/guide/dev)
3. [electron-vite: TypeScript declarations](https://electron-vite.org/guide/typescript)
4. [Electron: process sandboxing](https://www.electronjs.org/docs/latest/tutorial/sandbox)
5. [Electron: sandboxed preload and ESM](https://www.electronjs.org/docs/latest/tutorial/esm)
6. [electron-vite 5: dependency handling](https://electron-vite.org/guide/dependency-handling)
7. [TypeScript: types controls global visibility, not imports](https://www.typescriptlang.org/tsconfig/types.html)
8. [TypeScript: composite input requirements](https://www.typescriptlang.org/tsconfig/composite.html)
9. [Electron: declaration header references Node types](https://github.com/electron/typescript-definitions/blob/main/base/base_header.ts)
