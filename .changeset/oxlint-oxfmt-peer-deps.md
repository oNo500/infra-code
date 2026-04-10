---
'@infra-x/code-quality': minor
---

Move oxlint and oxfmt to peerDependencies. Consumers must now explicitly install both packages to get CLI binaries under pnpm strict isolation mode. Added documentation for type-aware linting and monorepo nested config setup.
