# @infra-x/code-quality

Shared [Oxlint](https://oxc.rs/) + [Oxfmt](https://oxc.rs/docs/guide/usage/formatter) presets for infra-x projects. One install, lint and format ready.

## Install

```bash
pnpm add -D @infra-x/code-quality
```

> [!TIP]
> Works with pnpm strict mode out of the box — jsPlugin paths are resolved internally via `require.resolve()`, no hoisting hacks needed.

## Lint (Oxlint)

Create `oxlint.config.ts`:

```ts
import { base, unicorn, depend, react, vitest } from '@infra-x/code-quality/lint'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [base(), unicorn(), depend(), react(), vitest()],
})
```

Every preset is a function. Call without arguments for defaults, or pass overrides:

```ts
export default defineConfig({
  extends: [
    base({ rules: { 'no-console': 'off' } }),
    unicorn({ rules: { 'unicorn/no-array-for-each': 'off' } }),
    vitest({ files: ['**/*.e2e-spec.ts', '**/*.spec.ts'] }),
  ],
})
```

> [!IMPORTANT]
> Most presets use deep merge via `defu` — user values take priority. File scope options **replace** their defaults. `electron()` replaces each rule by rule name and appends user `overrides` after its process defaults, so later file overrides win.

### Available presets

#### Core

| Preset        | Description                                                         |
| ------------- | ------------------------------------------------------------------- |
| `base()`      | TypeScript, Import, categories, env, ignores. Always include first. |
| `typeAware()` | 59 type-aware rules via tsgolint (requires TS 7.0+ tsconfig compat) |
| `unicorn()`   | 100+ code quality rules                                             |
| `depend()`    | Flag packages replaceable with native APIs or micro-utilities       |

#### Node.js

| Preset       | Description                                    |
| ------------ | ---------------------------------------------- |
| `node()`     | Node.js specific rules                         |
| `electron()` | Main, preload, and renderer process boundaries |
| `promise()`  | Promise best practices (16 rules)              |

#### Frameworks

| Preset        | Description                                    |
| ------------- | ---------------------------------------------- |
| `react()`     | React + React Hooks                            |
| `reactVite()` | React + React Hooks + React Refresh (for Vite) |
| `nextjs()`    | Next.js rules + Core Web Vitals                |

#### Backend / ORM

| Preset      | Description                                                            |
| ----------- | ---------------------------------------------------------------------- |
| `nestjs()`  | NestJS DI validation, Swagger consistency, decorator checks (19 rules) |
| `drizzle()` | Drizzle ORM — enforce where clause on delete/update                    |

#### Quality

| Preset    | Description              |
| --------- | ------------------------ |
| `a11y()`  | JSX accessibility (WCAG) |
| `jsdoc()` | JSDoc validation         |

#### Testing

| Preset        | Description                              |
| ------------- | ---------------------------------------- |
| `vitest()`    | Vitest best practices, environment-aware |
| `storybook()` | Storybook best practices                 |

#### Full example

```ts
import {
  base,
  unicorn,
  depend,
  node,
  promise,
  nestjs,
  drizzle,
  vitest,
  tailwind,
} from '@infra-x/code-quality/lint'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [
    base(),
    unicorn(),
    depend(),
    node(),
    promise(),
    nestjs(),
    drizzle({
      rules: { 'drizzle/enforce-delete-with-where': ['error', { drizzleObjectName: 'db' }] },
    }),
    vitest({ files: ['**/*.spec.ts', '**/*.e2e-spec.ts'] }),
    tailwind({ entryPoint: 'src/styles/globals.css', rootFontSize: 16 }),
  ],
})
```

> [!NOTE]
> General layer and module architecture checks are outside this package; `electron()` only supplies process boundaries. For path-based import bans use the native `no-restricted-imports` rule; for cycle detection use `import/no-cycle`; for layer/feature isolation, traversal reachability, or orphan detection run [`dependency-cruiser`](https://github.com/sverweij/dependency-cruiser) in pre-commit or CI instead of inside lint.

> [!WARNING]
> **NestJS projects** must disable `typescript/consistent-type-imports` — NestJS DI uses runtime class references in constructor params, and without type-aware linting this rule incorrectly converts them to `import type`, breaking DI at runtime.
>
> ```ts
> export default defineConfig({
>   extends: [base(), nestjs()],
>   overrides: [
>     {
>       files: ['**/*.{ts,mts,cts,tsx}'],
>       rules: {
>         'typescript/consistent-type-imports': 'off',
>         'typescript/no-extraneous-class': ['error', { allowWithDecorator: true }],
>       },
>     },
>   ],
> })
> ```

### Electron

Use `base()` followed by `electron()`, and copy its ignore patterns to the root config. Files outside the process and shared declaration scopes keep the base environment.

```ts
import { base, electron } from '@infra-x/code-quality/lint'
import { defineConfig } from 'oxlint'

const processConfig = electron()

export default defineConfig({
  extends: [base(), processConfig],
  ignorePatterns: processConfig.ignorePatterns,
})
```

| Scope option    | Default                                       | Environment and boundaries                                                                                                           |
| --------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `mainFiles`     | `['src/main/**']`                             | Node enabled, browser disabled; TypeScript, Import, and Node plugins.                                                                |
| `preloadFiles`  | `['src/preload/**']`                          | Browser enabled, Node disabled; only `require`, `process`, and `global` added as globals; all Node builtins restricted.              |
| `rendererFiles` | `['src/renderer/**', 'src/shared/**/*.d.ts']` | Browser enabled, Node disabled; Node globals, Node builtins, and Electron imports restricted. Shared runtime source is not included. |

Each file option replaces its default array. For example, `electron({ mainFiles: ['electron/main/**'] })` stops matching `src/main/**`.

Oxlint does not inherit `ignorePatterns` through `extends`. The root field above retains generated-file ignores while including renderer and shared bridge declarations. Copying `base().ignorePatterns` instead would skip all `.d.ts` files. Custom `rendererFiles` also replace the shared declaration scope; include your bridge declarations explicitly.

Preload is a conservative baseline, not an Electron module whitelist. Its `require` and `process` globals do not imply full Node APIs. Available modules and additional globals vary with the Electron version and sandbox configuration [1]. A project with confirmed full Node access can explicitly customize preload:

```ts
electron({
  overrides: [
    {
      files: ['src/preload/**'],
      env: { browser: true, node: true },
      rules: {
        'import/no-nodejs-modules': 'off',
        'no-restricted-globals': 'off',
      },
    },
  ],
})
```

Renderer checks cover static imports and re-exports, `require`, literal dynamic imports, and template imports without substitutions, including `electron/*`. The small bundled JS plugin fills the dynamic Electron import gap in Oxlint 1.59–1.62 [2]. Computed module names and API aliases require a separate review. Electron type-only imports are also restricted: its declarations reference Node types, so use an independent bridge interface in renderer. Projects that need Electron types can explicitly replace `no-restricted-imports` in a later renderer override.

The base preset also bans relative parent imports. Use a project alias for shared bridge types, or a precise exception on a type-only declaration import:

```ts
// src/renderer/bridge.d.ts
// oxlint-disable-next-line import/no-relative-parent-imports -- Shared bridge declaration has no runtime imports.
import type { AppBridge } from '../shared/bridge'

declare global {
  interface Window {
    bridge: AppBridge
  }
}
```

The same base policy applies when preload imports shared bridge types; use its alias or its own type-only exception.

`electron({ rules: { ... } })` replaces matching rules across all three scopes; rule option arrays are replaced in full. Put process-specific exceptions in `overrides`, which run after the defaults.

For React, scope the existing `react()` or `reactVite()` preset to renderer and include the complete native plugin list:

```ts
import { base, electron, reactVite } from '@infra-x/code-quality/lint'
import { defineConfig } from 'oxlint'

const rendererFiles = ['src/renderer/**']
const rendererReact = reactVite()
const processConfig = electron({
  rendererFiles: [...rendererFiles, 'src/shared/**/*.d.ts'],
  overrides: [
    {
      files: rendererFiles,
      plugins: ['typescript', 'import', ...(rendererReact.plugins ?? [])],
      jsPlugins: rendererReact.jsPlugins,
      rules: rendererReact.rules,
    },
  ],
})

export default defineConfig({
  extends: [base(), processConfig],
  ignorePatterns: processConfig.ignorePatterns,
})
```

Copy only override-compatible fields (`plugins`, `jsPlugins`, `rules`, `env`, `globals`); do not spread a whole preset into an override. `extends`, `categories`, and `settings` belong at the root.

This preset does not configure `BrowserWindow`, validate IPC payloads, or guarantee Electron runtime security. Review sandboxing, context isolation, and the bridge API separately [3].

### Type-aware linting

The `typeAware()` preset enables two options on oxlint:

- **`typeAware`** — turns on ~59 lint rules that need type information, implemented via [`oxlint-tsgolint`](https://www.npmjs.com/package/oxlint-tsgolint) (e.g. `no-floating-promises`, `no-misused-promises`, `consistent-type-imports`)
- **`typeCheck`** — pipes the TypeScript compiler's own diagnostics (`TS2322`, `TS6133`, `TS2307`, ...) through oxlint, so `oxlint` reports type errors alongside lint violations

```ts
import { base, typeAware, unicorn } from '@infra-x/code-quality/lint'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [base(), typeAware(), unicorn()],
})
```

> [!IMPORTANT]
> `typeAware` and `typeCheck` are [**root-config-only** options](https://oxc.rs/docs/guide/usage/linter/nested-config.html). Oxlint will report an error if either is set in a nested (per-package) config file. Always place `typeAware()` in the root config only.

Each package's own `tsconfig.json` is auto-detected by oxlint — no extra configuration needed. See [type-aware linting](https://oxc.rs/docs/guide/usage/linter/type-aware.html) for details.

#### Do I still need a separate `tsc --noEmit` step?

Short answer: **yes, keep it.** With `typeCheck` enabled, `oxlint` already surfaces tsc diagnostics for the files it lints, so during local development you'll usually catch type errors from `lint` alone. But a dedicated `typecheck` script is still worth keeping because:

- **Different file scope.** `tsc --noEmit` honors the tsconfig's `include` / `exclude`. `oxlint` walks the filesystem by its own rules and honors `ignorePatterns`. The two sets overlap but are not identical — a file covered by tsconfig but excluded from lint (or vice versa) will only be checked by one of them.
- **Project-level diagnostics.** tsc catches errors that aren't attached to a single source file: `tsconfig.json` misconfiguration (`TS5xxx`), broken project `references`, `paths` alias typos. Per-file type-aware linting can't see these.
- **Clearer CI failures.** Running `typecheck` and `lint` as separate steps makes it obvious whether a red build is a type error or a lint rule violation.

### Monorepo (nested configs)

Oxlint supports [nested configuration](https://oxc.rs/docs/guide/usage/linter/nested-config.html) for monorepos. Each package can have its own `oxlint.config.ts` that extends the root config and adds package-specific presets.

#### How it works

For each file being linted, oxlint uses the **nearest** config file relative to that file. Configs are **not** automatically merged — a package config must explicitly `extends` the root to inherit shared rules.

```
my-monorepo/
├── oxlint.config.ts          # root config (shared baseline + typeAware)
├── packages/
│   ├── web/
│   │   ├── oxlint.config.ts  # extends root, adds react + nextjs
│   │   └── src/
│   ├── api/
│   │   ├── oxlint.config.ts  # extends root, adds nestjs + drizzle
│   │   └── src/
│   └── shared/               # no config — inherits root directly
│       └── src/
```

#### Root config

Keep shared baseline and `typeAware()` at the root:

```ts
// oxlint.config.ts (root)
import { base, typeAware, unicorn, depend } from '@infra-x/code-quality/lint'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [base(), typeAware(), unicorn(), depend()],
})
```

#### Package configs

Each package extends the root and adds its own presets. Only `rules`, `plugins`, and `overrides` are [inherited via `extends`](https://oxc.rs/docs/guide/usage/linter/nested-config.html#extending-configuration-files) — `options` (including `typeAware`) are **not** inherited, which is the correct behavior.

```ts
// packages/web/oxlint.config.ts
import rootConfig from '../../oxlint.config.ts'
import { react, nextjs, vitest, tailwind } from '@infra-x/code-quality/lint'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [rootConfig, react(), nextjs(), vitest(), tailwind()],
})
```

```ts
// packages/api/oxlint.config.ts
import rootConfig from '../../oxlint.config.ts'
import { node, nestjs, drizzle, vitest } from '@infra-x/code-quality/lint'
import { defineConfig } from 'oxlint'

export default defineConfig({
  extends: [rootConfig, node(), nestjs(), drizzle(), vitest()],
})
```

> [!WARNING]
> Passing `-c` or `--config` explicitly on the CLI [**disables** nested config lookup](https://oxc.rs/docs/guide/usage/linter/nested-config.html#what-to-expect). Let oxlint auto-detect configs by running without `-c`.

> [!TIP]
> Packages without their own `oxlint.config.ts` automatically use the root config — no setup needed for packages that only need the shared baseline.

## Format (Oxfmt)

Create `oxfmt.config.ts`:

```ts
import { format } from '@infra-x/code-quality/format'
import { defineConfig } from 'oxfmt'

export default defineConfig({ ...format() })
```

### Defaults

| Option               | Value                 |
| -------------------- | --------------------- |
| `semi`               | `false`               |
| `singleQuote`        | `true`                |
| `trailingComma`      | `all`                 |
| `printWidth`         | `100`                 |
| `tabWidth`           | `2`                   |
| Import sorting       | Grouped with newlines |
| Package.json sorting | Enabled               |

### Override

```ts
export default defineConfig({
  ...format({ printWidth: 120, semi: true }),
})
```

### Tailwind class sorting

```ts
import { format, tailwindFormat } from '@infra-x/code-quality/format'

export default defineConfig({
  ...format(),
  ...tailwindFormat({ stylesheet: 'src/styles/globals.css' }),
})
```

## Scripts

```json
{
  "scripts": {
    "lint": "oxlint",
    "lint:fix": "oxlint --fix",
    "format": "oxfmt --write .",
    "format:check": "oxfmt --check ."
  }
}
```

## License

MIT

## Sources

1. [Electron: Process Sandboxing](https://www.electronjs.org/docs/latest/tutorial/sandbox)
2. [Oxlint: Writing JS Plugins](https://oxc.rs/docs/guide/usage/linter/writing-js-plugins.html)
3. [Electron: Security](https://www.electronjs.org/docs/latest/tutorial/security)
