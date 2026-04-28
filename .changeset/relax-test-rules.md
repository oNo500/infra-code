---
'@infra-x/code-quality': patch
---

feat(code-quality): relax pedantic rules in test files and disable global `require-await`

Add a `GLOB_TESTS` overrides block to `base()` that disables 17 rules commonly violated by legitimate test patterns (vitest mock setup, explicit mock signatures, fixture data, type-unsafe mocks). Tests no longer need to fight the linter on:

- import ordering (vi.mock before imports, vi.hoisted)
- mock signature requirements (explicit `undefined`, occasional `as any`)
- modernization hints (`prefer-string-replace-all`, `prefer-spread` etc.)
- test-deliberate violations (non-null assertions, magic numbers, array index keys)

Globally disable `require-await` — misfires on Next.js Server Actions and placeholder async functions where the async signature is contractual, not behavioral.
