---
'@infra-x/code-quality': patch
---

feat(code-quality): expand `base()` categories and add curated style rules

Enable `perf: 'error'` and `pedantic: 'warn'` on top of the existing `correctness` + `suspicious` categories. Disable a small set of high-noise rules (`no-await-in-loop`, `prefer-readonly-parameter-types`, `strict-boolean-expressions`, `max-lines`, `max-lines-per-function`) where the cost outweighs the signal.

Add curated style rules to `base()`, `unicorn()`, `react()`, and `reactVite()`, grouped by intent:

- TypeScript: type expression consistency, redundancy removal, modern API preference (10 rules)
- Import: ordering, dedup, type-only syntax, export safety (5 rules)
- Unicorn: file naming (kebab-case), error handling, literal formatting, modern API preference (16 rules)
- React: JSX naming (PascalCase), simplification, hook conventions (6 rules)
