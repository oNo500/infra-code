# @infra-x/typescript-config

Composable TypeScript preset library. Two layers:

- **Atoms** — small, single-responsibility configs across four dimensions
- **Recipes** — pre-composed `extends` chains for high-frequency scenarios

Requires **TypeScript 5.0+** (array `extends`).

## Install

```bash
bun add -D @infra-x/typescript-config typescript
```

## Quick start

Pick one recipe that matches your project.

```jsonc
// Bun HTTP service / CLI
{ "extends": "@infra-x/typescript-config/recipe-app-bun.json" }

// Bun full-stack + React  (see "Known limitations" about DOM lib)
{ "extends": "@infra-x/typescript-config/recipe-app-bun-react.json" }

// Next.js app (add the Next plugin yourself)
{
  "extends": "@infra-x/typescript-config/recipe-app-nextjs.json",
  "compilerOptions": { "plugins": [{ "name": "next" }] }
}

// NestJS app
{ "extends": "@infra-x/typescript-config/recipe-app-nestjs.json" }

// Node library (published to npm)
{ "extends": "@infra-x/typescript-config/recipe-lib-node.json" }

// React component library
{ "extends": "@infra-x/typescript-config/recipe-lib-react.json" }
```

## Dimension model

Every atom belongs to one of four dimensions:

| Dimension     | Owns                                                                                   | Atoms                                                                 |
| ------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **Runtime**   | `types`, `lib`                                                                         | `runtime-node`, `runtime-bun`, `runtime-browser`, `runtime-universal` |
| **Build**     | `module`, `moduleResolution`, `noEmit`, `outDir`                                       | `build-bundler`, `build-tsc-emit`                                     |
| **Project**   | `declaration`, `isolatedDeclarations`, `allowJs`, `noPropertyAccessFromIndexSignature` | `project-lib`                                                         |
| **Framework** | `jsx`, decorator flags, narrow strictness waivers                                      | `framework-react`, `framework-nestjs`, `framework-vitest`             |

Plus `base.json` — universal strictness and module-detection flags.

## Hand-composing atoms

When no recipe fits, compose atoms directly. **Always use this order:**

```
base → runtime → build → project → framework
```

Example — Vitest tsconfig for a Node test suite:

```jsonc
{
  "extends": [
    "@infra-x/typescript-config/base.json",
    "@infra-x/typescript-config/runtime-node.json",
    "@infra-x/typescript-config/build-bundler.json",
    "@infra-x/typescript-config/framework-vitest.json",
  ],
  "include": ["tests/**/*"],
}
```

## Migration from 0.x

| 0.x path                      | 1.0 equivalent                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| `tsconfig.base.json`          | `base.json` (slightly trimmed; see dimension split)                                                     |
| `tsconfig.library.json`       | `recipe-lib-node.json`                                                                                  |
| `tsconfig.react-library.json` | `recipe-lib-react.json`                                                                                 |
| `tsconfig.vite.json`          | `recipe-app-bun-react.json`, or hand-compose `base + runtime-browser + build-bundler + framework-react` |
| `tsconfig.nextjs.json`        | `recipe-app-nextjs.json` + consumer `plugins: [{ name: "next" }]`                                       |
| `tsconfig.nestjs.json`        | `recipe-app-nestjs.json`                                                                                |
| `tsconfig.vitest.json`        | Hand-compose `base + runtime-* + build-bundler + framework-vitest`                                      |
| `tsconfig.config.json`        | Hand-compose `base + runtime-node + build-bundler`                                                      |

## Design invariants

Atoms and recipes follow these rules, enforced by tests (`bun test` in this package):

- **Atoms are dimension-pure.** A `runtime-*` file only touches `types`/`lib`. A `build-*` file only touches `module`/`moduleResolution`/`noEmit`/`outDir`. Framework atoms may waive a few base strictness fields when the framework requires it.
- **Recipes contain only `extends`.** Top-level keys are exactly `$schema`, `display`, `extends`. No `compilerOptions` in recipes — new fields belong in an atom.
- **Fixed inheritance order.** `base → runtime → build → project → framework`, both in recipes and in consumer-written array `extends`.

## Known limitations

- `framework-vitest.json` sets `types: ["vitest/globals"]`. Because `types` is replace-not-merge, stacking `framework-vitest` last wipes the runtime layer's `types`. In a dedicated `tsconfig.test.json` that extends your main tsconfig plus `framework-vitest`, you may need to re-declare `types` in the test tsconfig.
- `runtime-bun.json` does not include DOM lib. A Bun full-stack app that renders React in the browser currently needs a `lib` override to add `DOM` and `DOM.Iterable`. A future `runtime-bun-dom` atom (or expanding `recipe-app-bun-react` semantics) will close this gap.
