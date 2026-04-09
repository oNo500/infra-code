# @infra-x/code-quality Roadmap

## Current (v0.1)

- Oxlint presets: base, react, reactVite, nextjs, a11y, jsdoc, vitest, storybook, tailwind(), boundaries()
- Oxfmt preset: format, tailwindFormat()
- Consumer creates `oxlint.config.ts` + `oxfmt.config.ts` separately

## Planned

### CLI init script
- `npx @infra-x/code-quality init` generates both config files automatically
- Detect project features (React, Next.js, Vitest, Tailwind) and generate matching presets

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
