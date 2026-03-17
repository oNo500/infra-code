---
"@infra-x/eslint-config": patch
---

Remove `import-x/no-unused-modules` rule which is a no-op in ESLint 10 due to the removal of the `FileEnumerator` API. Translate remaining Chinese comments to English.
