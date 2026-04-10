# @infra-x/code-quality Roadmap

## Current (v0.3)

- Oxlint presets: base, typeAware, unicorn, depend, node, promise, react, reactVite, nextjs, a11y, jsdoc, vitest, storybook, nestjs, drizzle, tailwind(), boundaries()
- Oxfmt preset: format(), tailwindFormat()
- All presets are functions with defu-based overrides
- jsPlugin paths resolved via require.resolve() for pnpm compatibility

## Rule coverage gaps

### Recoverable — oxlint has the rules, just not enabled in base

Enable individually in base preset or via `pedantic` category:

- `typescript/no-misused-promises` — prevent passing promise to void callback
- `typescript/no-unsafe-assignment` — block `any` escaping to typed variables
- `typescript/no-unsafe-call` / `no-unsafe-return` / `no-unsafe-argument` — `any` type safety
- `typescript/require-await` — async function must contain await
- `typescript/ban-ts-comment` — restrict @ts-ignore usage
- `typescript/prefer-nullish-coalescing` — `a || b` -> `a ?? b`
- `import/no-cycle` — circular dependency detection (in restriction category)

### Not supported — oxlint has no implementation

**High priority:**
- `import/no-extraneous-dependencies` — catches imports of undeclared packages, only fails at runtime without this
- `prefer-optional-chain` — `a && a.b && a.b.c` -> `a?.b?.c`, fundamental code quality rule
- `consistent-type-imports` — blocked for NestJS without typeAware (see below)
- `@typescript-eslint/no-deprecated` — flag deprecated API usage

**Medium priority:**
- `no-inferrable-types` — strip redundant type annotations
- `consistent-type-assertions` — unify `as` vs `<>` style
- `dot-notation` — `obj['prop']` -> `obj.prop`
- `prefer-for-of` — `for (let i = 0; ...)` -> `for (const x of ...)`
- `prefer-function-type` — `{ (): void }` -> `() => void`

**Low priority (~100 unicorn rules):**
- Oxlint implements ~35 of ~144 unicorn recommended rules
- Most impactful missing: `catch-error-name`, `error-message`, `filename-case`, `throw-new-error`, `better-regex`, `numeric-separators-style`
- Track oxlint unicorn plugin progress for gradual coverage improvement

### Package.json linting — dropped
- `eslint-plugin-package-json` cannot run in oxlint (no JSON file linting support)
- Oxfmt `sortPackageJson` partially compensates (key ordering only)
- Monitor oxlint for JSON file support

## Planned features

### Enable pedantic rules selectively
- Add high-value pedantic rules to base preset individually (not the whole category)
- Avoids over-strict rules while recovering type safety checks

### CLI init script
- `npx @infra-x/code-quality init` generates both config files automatically
- Detect project features (React, Next.js, NestJS, Vitest, Tailwind) and generate matching presets

### Vite+ integration
- When Vite+ reaches stable, export a `/vite` preset that unifies lint + format + test into a single `vite.config.ts`
- Target: Vite+ Beta/RC

### Oxfmt `extends` support
- Oxfmt currently has no `extends` mechanism (must spread manually)
- Track upstream progress; switch to `extends` when available for cleaner consumer DX

### NestJS: re-enable consistent-type-imports with typeAware
- `typescript/consistent-type-imports` is currently disabled for NestJS projects
- Reason: without type-aware linting, the rule incorrectly converts NestJS DI constructor params to `import type`, breaking dependency injection at runtime
- When `typeAware` preset is usable (requires TS 7.0+), oxlint can distinguish DI class references from pure type usage — re-enable the rule then

### Native rule coverage
- Monitor oxlint native plugin additions to replace remaining jsPlugins:
  - eslint-plugin-depend
  - eslint-plugin-better-tailwindcss
  - eslint-plugin-boundaries
  - eslint-plugin-storybook
  - eslint-plugin-react-refresh
  - eslint-plugin-drizzle
  - @darraghor/eslint-plugin-nestjs-typed
