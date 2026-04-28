---
'@infra-x/code-quality': minor
---

Remove `boundaries()` lint preset and the `eslint-plugin-boundaries` dependency.

Architectural boundary checks are intentionally no longer part of this package. Use the native `no-restricted-imports` rule for path-based import bans, `import/no-cycle` for cycle detection, and run `dependency-cruiser` in pre-commit or CI for layered isolation, feature mutual-exclusion, transitive reachability, and orphan detection. See `ROADMAP.md` for the rationale and planned `restrictedImports()` follow-up preset.
