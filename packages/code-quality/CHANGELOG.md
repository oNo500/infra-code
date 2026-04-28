# @infra-x/code-quality

## 0.6.0

### Minor Changes

- 589acac: feat(code-quality): enforce `import/no-relative-parent-imports` in `base()` preset

  Source files (matching `GLOB_SRC`, including tests) can no longer use `../foo` style imports that traverse to a parent directory. Configure a path alias (e.g. `@/*` → `./src/*`) and import via the alias instead. Existing relative imports within the same directory (e.g. `./foo`) are unaffected.

## 0.5.0

### Minor Changes

- a70c728: Remove `boundaries()` lint preset and the `eslint-plugin-boundaries` dependency.

  Architectural boundary checks are intentionally no longer part of this package. Use the native `no-restricted-imports` rule for path-based import bans, `import/no-cycle` for cycle detection, and run `dependency-cruiser` in pre-commit or CI for layered isolation, feature mutual-exclusion, transitive reachability, and orphan detection. See `ROADMAP.md` for the rationale and planned `restrictedImports()` follow-up preset.

## 0.4.1

### Patch Changes

- e0507b0: Internal: migrate the repository from pnpm + Turborepo to Bun
  workspaces. No runtime behaviour or API changes. Published artifacts
  remain Node 20+ ESM.

## 0.4.0

### Minor Changes

- 6563131: Move oxlint and oxfmt to peerDependencies for pnpm strict isolation compatibility. Promote suspicious category from warn to error. Disable common false positives: react-in-jsx-scope, import/no-unassigned-import, vitest/require-mock-type-parameters. Add type-aware linting and monorepo nested config documentation.

## 0.2.0

### Minor Changes

- 716ae72: Add @infra-x/code-quality — shared Oxlint + Oxfmt presets

  Lint presets: base, unicorn, node, promise, react, reactVite, nextjs, a11y, jsdoc, vitest, storybook, nestjs, drizzle, tailwind(), boundaries()
  Format preset: no semi, single quote, import sorting, package.json sorting, tailwindFormat()

  Features:

  - Type-aware linting via tsgolint (59 rules)
  - Oxfmt handles formatting + import sorting (replaces ESLint stylistic + import-x/order)
  - NestJS DI/Swagger validation (19 AST rules via jsPlugin)
  - Drizzle ORM safety rules via jsPlugin
