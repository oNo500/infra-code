# @infra-x/tsconfig — Design Decisions

## Problem

TypeScript's `extends` is field-level replacement, not deep merge. Array fields (`types`, `lib`, `plugins`) silently overwrite across inheritance chains:

```
base config:  types: ['node']
test config:  types: ['vitest/globals']  ← overwrites, node is lost
```

Users must manually re-declare the full merged array in every leaf tsconfig. This is a structural problem — no amount of atom reorganization fixes it as long as the design relies on `extends`.

## Goals

- Eliminate silent array field overwrites
- Users declare intent, not inheritance order
- Generated `tsconfig.json` works out of the box for IDE / tsc / oxlint
- Support multi-view tsconfigs (app/test/build)

## Non-goals

- No config file to maintain — generate and done, no intermediate artifacts
- No cross-package topology management (`references` are user-declared)
- No runtime config loader — output is plain JSON
- No backward compatibility with 2.x

## What it is now

Two equal usage modes:

**CLI generator**: interactive prompts or flag mode, writes `tsconfig.json` directly, no config file to maintain.

```bash
tsconfig                                          # interactive
tsconfig --runtime node --module bundler          # flag mode
```

**Atom composition library**: import atoms directly for programmatic control.

```ts
import { composeAtoms, base, runtimeNode, buildBundler } from '@infra-x/tsconfig'

const options = composeAtoms(base(), runtimeNode(), buildBundler())
```

Atoms are single-responsibility `CompilerOptions` fragments. `composeAtoms` merges them — scalars are last-wins, arrays are append+dedupe.

## Why no config file

An earlier design had a `tsconfig.config.ts` DSL file + `sync` command workflow. Abandoned because:

- Added maintenance burden — users had to keep both the DSL file and the generated JSON in sync
- CLI prompts cover the vast majority of use cases; the flexibility of a config file provides limited additional value
- Programmatic control is served directly by the API, no file needed as an intermediate layer

## Why code generation over extends

Only code generation can solve the array merge problem at the root — the tool controls merge logic directly without relying on tsc's `extends` semantics.

Generated files are committed to git, not gitignored: VS Code, oxlint (`typeAware`), vite-tsconfig-paths, vitest, Next.js, and virtually every TS tool assume `tsconfig.json` is on disk when the project opens. Gitignoring breaks cold-start UX (errors until postinstall completes).

## Alternatives rejected

**A. Patch 2.x**
Continue with atom + extends model, add more profiles.
Rejected: the root cause is tsc's extends semantics — atom reorganization cannot fix array merging.

**B. Chained functional DSL**

```ts
tsconfig('node').pipe(withTypes.append(['vitest/globals']))
```

Rejected: tsconfig is a static object with no conditional composition needs. A chained API requires many helpers with no real benefit.

**C. Gitignore generated files + postinstall regeneration**
Rejected: breaks IDE cold-start UX; oxlint `typeAware` requires `tsconfig.json` on disk at first run.

**D. Wait for TypeScript to support array merging natively**
Related issues (#20110, #57486) have been open for years with no acceptance from Microsoft. Not an option.
