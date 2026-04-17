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
> Overrides use deep merge via `defu` — `rules`, `plugins`, `settings` etc. are **merged** (user values take priority). But `files` is **replaced** entirely — if you pass `files`, it overrides the preset default, not appends to it.

### Available presets

#### Core

| Preset        | Description                                                         |
| ------------- | ------------------------------------------------------------------- |
| `base()`      | TypeScript, Import, categories, env, ignores. Always include first. |
| `typeAware()` | 59 type-aware rules via tsgolint (requires TS 7.0+ tsconfig compat) |
| `unicorn()`   | 100+ code quality rules                                             |
| `depend()`    | Flag packages replaceable with native APIs or micro-utilities       |

#### Node.js

| Preset      | Description                       |
| ----------- | --------------------------------- |
| `node()`    | Node.js specific rules            |
| `promise()` | Promise best practices (16 rules) |

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
  boundaries,
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
    boundaries({
      elements: [
        { type: 'feature', pattern: 'src/features/*' },
        { type: 'shared', pattern: 'src/shared/*' },
      ],
      rules: [
        { from: 'shared', allow: ['shared'] },
        { from: 'feature', allow: ['shared', 'feature'] },
      ],
    }),
  ],
})
```

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
