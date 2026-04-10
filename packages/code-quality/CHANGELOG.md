# @infra-x/code-quality

## 0.5.0

### Minor Changes

- 9690788: Promote suspicious category from warn to error in base preset. Suspicious rules now block CI instead of only warning.

## 0.4.1

### Patch Changes

- 0576357: Disable common false positives: react-in-jsx-scope in react/reactVite presets, import/no-unassigned-import in base preset, vitest/require-mock-type-parameters in vitest preset.

## 0.4.0

### Minor Changes

- b4b9db3: Move oxlint and oxfmt to peerDependencies. Consumers must now explicitly install both packages to get CLI binaries under pnpm strict isolation mode. Added documentation for type-aware linting and monorepo nested config setup.

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
