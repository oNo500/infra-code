---
'@infra-x/code-quality': minor
---

Move oxlint and oxfmt to peerDependencies for pnpm strict isolation compatibility. Promote suspicious category from warn to error. Disable common false positives: react-in-jsx-scope, import/no-unassigned-import, vitest/require-mock-type-parameters. Add type-aware linting and monorepo nested config documentation.
