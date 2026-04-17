# @infra-x/tsconfig

DSL-based TypeScript config generator. Successor to `@infra-x/typescript-config`.

> [!WARNING]
> **0.0.0 — walking skeleton.** `nextjs()` profile only; other profiles and `--explain` pending.

See [RFC 001](../../docs/rfc/001-tsconfig-dsl.md) for full design.

## Why

`@infra-x/typescript-config` relied on TS native `extends`, which is field-level replacement. Array fields (`types`, `lib`, `plugins`) silently overwrite across layers — stacking `runtime-universal` (`types: ['node']`) and `framework-vitest` (`types: ['vitest/globals']`) drops `node`.

This package generates `tsconfig.json` files from a TypeScript DSL, with deep-merge semantics for arrays and objects.

## Usage

Write `tsconfig.config.ts` in your project:

```ts
import { defineTsconfig, nextjs } from '@infra-x/tsconfig'

export default defineTsconfig({
  profile: nextjs(),
  compilerOptions: {
    paths: { '@/*': ['./src/*'] },
  },
  layers: {
    app: { include: ['src/**/*'], exclude: ['**/*.test.ts'] },
    test: {
      extends: 'app',
      compilerOptions: { types: ['vitest/globals'] },
      include: ['**/*.test.ts'],
    },
  },
})
```

Run:

```bash
tsconfig gen              # write tsconfig.json + tsconfig.test.json
tsconfig sync --check     # CI: fail if disk differs from DSL output
```

## Merge verbs

Default behavior: scalar override, object merge, array append+dedupe. Use verbs for precise control:

```ts
compilerOptions: {
  types: { $set: ['node'] },       // replace entirely
  lib: { $remove: ['DOM'] },       // remove items
  plugins: { $prepend: [...] },    // head insert
}
```

## Commands

### `tsconfig gen` — one command, multiple modes

`gen` resolves input in this priority: **flags → tsconfig.config.ts → interactive prompts**.

```bash
# 1. Flags only — first-time scaffolding, zero config, CI-friendly
tsconfig gen --profile nextjs --layers app,test --paths '@/*=./src/*'

# 2. No flags, config exists — regenerate from tsconfig.config.ts
tsconfig gen

# 3. No flags, no config, TTY — interactive prompts (profile / layers / paths)
tsconfig gen

# 4. One-shot: generate tsconfig.*.json only (skip tsconfig.config.ts)
#    Useful for throwaway/one-time setups. Safe even if a DSL file already exists.
tsconfig gen --once --profile nextjs --layers app,test

# Refuses to silently overwrite an existing config + flags combo; pass --force if intentional
tsconfig gen --profile vite-react --force
```

### `tsconfig sync` — CI drift detection

```bash
tsconfig sync           # regenerate from tsconfig.config.ts (same as `gen` with no flags)
tsconfig sync --check   # CI: exit 1 if disk differs from DSL output
```

### `tsconfig explain` — field-source attribution

```bash
tsconfig explain                    # show all fields with sources
tsconfig explain app                # only the app layer
tsconfig explain app --field types  # only one field
tsconfig explain app --format json  # machine-readable output
tsconfig explain app --hypothetical # also show "if this source were removed, value would be..."
```

See [ROADMAP.md](./ROADMAP.md) for planned features (interactive TUI, more profiles, watch mode, etc.).

## Status

- ✅ `defineTsconfig` + layer resolution
- ✅ Merge verbs (`$set` / `$remove` / `$prepend` / `$append`)
- ✅ CLI: `tsconfig gen` (unified scaffold + regen), `tsconfig sync --check`, `tsconfig explain`
- ✅ Interactive + non-interactive (auto-detects TTY)
- ✅ `nextjs()` profile
- ⬜ More profiles (`viteReact`, `libNode`, `libReact`, `appBun`, `appNestjs`)
- ⬜ Interactive TUI for `explain` (see ROADMAP)
- ⬜ Watch mode
