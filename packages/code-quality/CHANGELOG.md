# @infra-x/code-quality

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
