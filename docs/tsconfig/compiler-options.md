# tsconfig.json Field Behavior Across Toolchain

## Lint tools and tsconfig

`@typescript-eslint` (typed rules) and oxlint (`typeAware: true`) both read tsconfig, but for one purpose only: to build a type graph for lint rule evaluation. They do not run a full type check and play no part in the emit pipeline.

The fields they consume overlap with tsc's type-related fields — `strict`, `module`, `moduleResolution`, `lib`, `types`, `paths`, `include`/`exclude`, etc. All emit control fields (`noEmit`, `outDir`, `declaration`, `isolatedDeclarations`) are ignored.

Throughout this document, `tsc / lint` means tsc + @typescript-eslint + oxlint behave identically for that field.

---

## Field consumption by toolchain

```
compilerOptions
│
├── Type checking
│   ├── strict, alwaysStrict                        tsc / lint
│   │   └── Master switch for all strict checks
│   ├── noUncheckedIndexedAccess                    tsc / lint
│   │   └── Array/object index access returns T | undefined — catches real out-of-bounds bugs
│   ├── noImplicitOverride                          tsc / lint
│   │   └── Requires explicit override keyword, prevents accidental method shadowing
│   ├── noUnusedLocals, noUnusedParameters          tsc / lint
│   │   └── Dead code signal
│   ├── noFallthroughCasesInSwitch                  tsc / lint
│   │   └── Errors on switch cases missing a break
│   ├── noImplicitReturns                           tsc / lint
│   │   └── Errors on functions with missing return branches
│   ├── verbatimModuleSyntax                        tsc / lint
│   │   └── Enforces import type — prevents type-only imports from becoming empty requires after bundler transpilation
│   ├── isolatedModules                             tsc / lint
│   │   └── Each file must be independently transpilable — hard requirement for esbuild / oxc / SWC
│   └── exactOptionalPropertyTypes, ...             tsc / lint
│
├── Module resolution
│   ├── module, moduleResolution                    tsc / lint
│   │   └── Bundlers use their own resolver (oxc-resolver / Vite) and ignore these fields entirely
│   ├── paths                                       tsc / lint / tsdown (oxc-resolver) / Vite (requires vite-tsconfig-paths)
│   │   └── The only field most bundlers actually read at runtime
│   └── baseUrl                                     tsc / lint
│
├── Runtime environment
│   ├── target                                      tsc
│   │   └── tsdown prefers package.json engines; falls back to this only when absent
│   ├── lib                                         tsc / lint
│   │   └── Declares which global APIs are available (DOM, esnext, etc.)
│   └── types                                       tsc / lint
│       └── Limits which @types/* packages contribute globals
│
├── JSX
│   └── jsx                                         tsc / lint
│       └── Vite falls back to this via @vitejs/plugin-react; tsdown ignores it
│
├── Emit control
│   ├── noEmit                                      tsc only
│   │   └── tsdown ignores this and decides emit independently
│   ├── outDir, rootDir                             tsc only
│   │   └── tsdown derives output paths from entry points, ignores these fields
│   ├── declaration                                 tsc only
│   │   └── tsdown controls declaration output via its own dts option
│   ├── declarationMap                              tsc + tsdown
│   │   └── Generates sourcemaps for .d.ts files — both tools read this
│   └── isolatedDeclarations                        tsc + tsdown
│       └── tsdown uses this to switch .d.ts strategy: true → oxc-transform (fast), false → tsc (accurate)
│
├── File scope
│   └── include, exclude, files                     tsc / lint
│       └── tsdown uses its own entry option and ignores these fields
│
├── Interop / compatibility
│   ├── esModuleInterop                             tsc / lint
│   │   └── Allows import fs from 'fs' and other CJS default imports
│   ├── skipLibCheck                                tsc only
│   │   └── Skips type checking of third-party .d.ts files
│   ├── resolveJsonModule                           tsc / lint
│   │   └── Allows import data from './data.json'
│   ├── moduleDetection                             tsc / lint
│   │   └── force mode treats every file as a module, preventing accidental global pollution
│   └── forceConsistentCasingInFileNames            tsc only
│       └── Prevents macOS case-insensitivity from masking path errors in CI (Linux)
│
└── Build cache
    ├── incremental                                 tsc only
    │   └── Enables incremental compilation, speeds up repeated tsc --noEmit
    └── tsBuildInfoFile                             tsc only
        └── Cache file path — keep in node_modules/.cache to avoid polluting the project root
```

---

## Two independent pipelines

In a tsdown project, the same `tsconfig.json` is read by two separate processes:

```
tsconfig.json
├── tsc --noEmit     reads everything — type checking only
└── tsdown build     reads only: paths / isolatedDeclarations / declarationMap
                     everything else comes from tsdown.config.ts
```

Atom presets must satisfy both pipelines. `noEmit: true` in app profiles is correct — tsc respects it and produces no JS output, while tsdown ignores it and handles emit itself.

---

## Atom design — base() philosophy

`base()` selection criteria: **safe and meaningful for every project, and not misread by bundlers.**

**Included in base():**

```
base()
│
├── Type checking          Beneficial for all projects, no side effects
│   ├── strict: true
│   │   └── Master switch for all strict checks — industry baseline
│   ├── noUncheckedIndexedAccess: true
│   │   └── Array/object index access returns T | undefined
│   ├── noImplicitOverride: true
│   │   └── Requires explicit override, prevents accidental shadowing
│   ├── noUnusedLocals: true
│   ├── noUnusedParameters: true
│   │   └── Dead code signal
│   ├── noFallthroughCasesInSwitch: true
│   ├── noImplicitReturns: true
│   ├── forceConsistentCasingInFileNames: true
│   │   └── macOS/Linux CI path casing mismatch
│   ├── verbatimModuleSyntax: true
│   │   └── Enforces import type, prevents type imports leaking into runtime
│   └── isolatedModules: true
│       └── Each file independently transpilable — hard requirement for all bundlers
│
├── Interop / compatibility    Universally safe, required by most ecosystems
│   ├── esModuleInterop: true
│   │   └── CJS default imports (import fs from 'fs')
│   ├── skipLibCheck: true
│   │   └── Suppresses errors from uncontrollable third-party .d.ts files
│   ├── resolveJsonModule: true
│   │   └── JSON imports are pervasive, no downside
│   └── moduleDetection: 'force'
│       └── Every file is a module, prevents accidental global pollution
│
├── Runtime environment
│   └── target: 'esnext'
│       └── Preserve modern syntax for bundlers to downlevel — avoids double transpilation
│
└── Build cache
    ├── incremental: true
    └── tsBuildInfoFile: './node_modules/.cache/tsconfig.tsbuildinfo'
        └── Cache stays out of the project root
```

**Excluded from base():**

```
Excluded from base()
│
├── Module resolution
│   └── module, moduleResolution
│       └── Depend on runtime and build approach → buildBundler() / buildTscEmit()
│
├── Runtime environment
│   ├── lib
│   │   └── Depends on runtime (DOM / esnext / bun) → runtime*()
│   └── types
│       └── Depends on runtime (node / bun / none) → runtime*()
│
├── JSX
│   └── jsx
│       └── React projects only → frameworkReact() / frameworkNextjs()
│
└── Emit control
    ├── noEmit
    │   └── Depends on who owns emit → buildBundler() sets true, buildTscEmit() sets false
    ├── outDir, rootDir
    │   └── Only meaningful when tsc emits → buildTscEmit()
    └── declaration, isolatedDeclarations
        └── Library projects only → projectLib()
```

---

## Interop fields explained

These fields exist because of the historical split between CJS and ESM.

### Background: CJS and ESM default export incompatibility

CommonJS exports with `module.exports = value` — the whole module is one value, there is no concept of a "default export". ES Modules introduced `export default` as the primary export.

When ESM code runs `import fs from 'fs'` against a CJS module, the runtime must decide: does `module.exports` count as `default`? Node.js says yes, but early tsc said no — it required `import * as fs from 'fs'`. This is why `esModuleInterop` exists.

### esModuleInterop

**What changes:**

```
// off (original tsc behavior)
import fs from 'fs'       // error: fs has no default export
import * as fs from 'fs'  // correct

// on
import fs from 'fs'       // valid — tsc treats module.exports as default
```

When enabled, tsc injects a `__importDefault` helper on emit to ensure runtime behavior matches the types.

**Why it's in base():** The modern ecosystem (React, Node.js standard library, most npm packages) ships as CJS. Without this, valid `import x from 'y'` statements produce type errors, or the runtime value is wrapped in `{ default: ... }` instead of the actual value.

**Note:** With `verbatimModuleSyntax: true`, tsc no longer emits the helper — interop is handled entirely by the bundler. The two options do not conflict: `esModuleInterop` governs type-level validity, `verbatimModuleSyntax` governs emit behavior.

### verbatimModuleSyntax and isolatedModules

Both address the same problem at different levels: **when a bundler transpiles files individually, tsc's implicit import elision can cause runtime errors.**

**Root cause:**

```typescript
import { SomeType } from './types' // type-only import
export { SomeType } // re-export
```

tsc knows `SomeType` is a type and deletes the whole line on emit. But esbuild / oxc process files one at a time without cross-file type analysis — they cannot tell this line is safe to delete, so they keep it, producing a runtime import of something that does not exist.

**How they relate:**

```
isolatedModules: true
└── Requires every file to be independently transpilable
    └── Detects the dangerous pattern above and errors at tsc stage
    └── Does not change emit behavior — check only

verbatimModuleSyntax: true
└── Requires all type-only imports to be written as import type
    └── Eliminates the problem at the source: type imports are syntactically visible,
        so bundlers can identify and remove them directly
    └── A superset of isolatedModules — covers all its scenarios
```

Both are in `base()`: `isolatedModules` is the minimum requirement for bundler compatibility, `verbatimModuleSyntax` is the stronger constraint that makes intent explicit.

### moduleDetection

tsc determines whether a file is a module or a script by the presence of `import`/`export`. Script files have global top-level declarations; module files have local ones.

`moduleDetection: 'force'` treats every file as a module because:

- Modern projects have virtually no script files — the default behavior exists only for historical compatibility
- In `auto` mode, a utility file with no imports/exports silently becomes a script, polluting the global type space and causing hard-to-trace type conflicts

### resolveJsonModule

Allows `import data from './config.json'` with full type inference from the JSON structure. No runtime side effects; all bundlers support it. One caveat: under `moduleResolution: 'nodenext'`, JSON imports require an explicit `.json` extension — this is a Node.js ESM spec requirement, not a tsc limitation.

### skipLibCheck

Skips type checking of all `.d.ts` files, including third-party types in `node_modules`.

This is an explicit trade-off: **give up awareness of upstream type errors in exchange for build speed and stability.** It belongs in `base()` because third-party `.d.ts` errors are almost never actionable (version mismatches, upstream bugs) and only produce noise. Type errors that matter should come from your own code.

---

## module and moduleResolution explained

`module` controls how tsc handles module syntax; `moduleResolution` controls how tsc finds files when resolving an `import`. The two must be paired. The core question is **who owns emit**.

### Scenario 1: bundler owns emit (Vite / Next.js / tsdown app)

```
├── module: 'preserve'
│   └── Source import/export is passed through unchanged — tsc does not transform it
│       Allows mixing import and require(), tsc does not enforce module spec compliance
│       The bundler receives raw syntax and decides whether to output ESM or CJS
│
├── moduleResolution: 'bundler'
│   └── Mimics bundler resolution behavior
│       Extensions can be omitted (import './foo' instead of './foo.js')
│       .ts extensions allowed directly (import './foo.ts')
│       Supports package.json exports field
│       Does not enforce Node.js ESM strict extension requirements
│
└── noEmit: true
    └── tsc performs type checking only, produces no output files
```

### Scenario 2: tsc owns emit (Node.js library / CLI)

```
├── module: 'nodenext'
│   └── Strict Node.js ESM/CJS dual mode
│       File type determined by extension (.mts/.cts) or package.json "type" field
│       Generated .d.ts has unambiguous module syntax that consumer tools can parse correctly
│
├── moduleResolution: 'nodenext'
│   └── Strict Node.js ESM resolution rules
│       Full extensions required (import './foo.js')
│       Supports package.json exports/imports fields
│       Distinguishes .mts/.cts files
│
└── noEmit: false
    └── tsc outputs JS + .d.ts; declaration: true is set in buildTscEmit()
```

**Why library projects cannot use `module: 'preserve'`:** tsc does not know the final output format, so the generated `.d.ts` has indeterminate module syntax that consumer tools may fail to parse correctly. Library projects must use `module: 'nodenext'` for unambiguous declaration files.

**Exception: library + tsdown + `isolatedDeclarations: true`**

tsdown has two independent paths when building a library:

```
tsdown library build
├── JS emit      tsdown handles this — reads format config, outputs ESM/CJS, ignores tsconfig module
└── .d.ts emit
    ├── isolatedDeclarations: true  → oxc-transform generates per-file, does not depend on tsc module semantics
    │   └── module: 'preserve' is safe here
    │       moduleResolution: 'bundler' is still required for tsc type checking to resolve imports correctly
    └── isolatedDeclarations: false → falls back to tsc for .d.ts generation
        └── tsc depends on module semantics — must use module: 'nodenext'
```

This is one reason `projectLib()` sets `isolatedDeclarations: true` — it routes `.d.ts` generation through oxc-transform, bypassing tsc's dependency on `module` semantics, so library projects can share `module: 'preserve'` with bundler scenarios.

### Scenario 3: NestJS (tsc emit + decorator metadata)

```
├── module: 'commonjs'
│   └── Outputs require/module.exports — traditional Node.js CJS
│       NestJS ecosystem relies heavily on CJS; ESM support is incomplete
│
├── moduleResolution: 'node'
│   └── Traditional Node.js CJS resolution — looks up index.js / main field
│       Does not support package.json exports field
│
├── experimentalDecorators: true
│   └── Enables Stage 2 decorator syntax — foundation for NestJS DI and metadata
│
└── emitDecoratorMetadata: true
    └── tsc uses type information to generate runtime metadata on emit
        NestJS DI reads parameter types via Reflect.metadata to complete injection
        This field depends on tsc's cross-file type analysis — SWC cannot do this independently:
        ├── tsc emit  → works directly; metadata contains full type information
        └── SWC emit  → this tsconfig field has no effect; must be enabled in SWC config:
                        jsc.transform.decoratorMetadata: true
                        However, SWC-generated metadata does not include complete type information —
                        scenarios that rely on precise type metadata may behave incorrectly
```

---

## Deviation policy

A profile may override a `base()` field only when a framework **structurally requires** it. Currently one case:

- `frameworkNestjs()` sets `strictPropertyInitialization: false` — NestJS DI injects properties at runtime; tsc cannot see the injection, so the check produces false positives on every service class.

Lowering a correctness flag to reduce noise is not acceptable. Fix the types instead.

---

## VS Code intellisense source

VS Code's bundled `tsconfig.schema.json` is nearly empty (only `title` and `default`). Completions and validation come from `tsserver` inside the `typescript` package, via its internal `optionDeclarations` array (129 entries in TS 6.0), which describes each option's name, type, allowed enum values, and default. VS Code uses the project-local `typescript` package when present.

`@infra-x/tsconfig`'s `validateCompilerOptions()` reads the same `optionDeclarations` from the user's installed `typescript` (optional peer dependency), so validation stays accurate for whichever TS version the project uses. SchemaStore (`https://json.schemastore.org/tsconfig`) is for non-VS Code editors (neovim, IntelliJ) and is not involved here.
