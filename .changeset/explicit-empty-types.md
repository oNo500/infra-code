---
'@infra-x/tsconfig': patch
---

Preserve explicitly cleared `compilerOptions.types` as an empty array. On TypeScript 5, omitting this field automatically includes visible type packages, so callers that use `types: 'none'` or an empty replacement now get the requested restriction. Configurations that omit `types` keep their existing behavior.
