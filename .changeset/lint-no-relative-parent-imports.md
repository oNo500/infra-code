---
'@infra-x/code-quality': minor
---

feat(code-quality): enforce `import/no-relative-parent-imports` in `base()` preset

Source files (matching `GLOB_SRC`, including tests) can no longer use `../foo` style imports that traverse to a parent directory. Configure a path alias (e.g. `@/*` → `./src/*`) and import via the alias instead. Existing relative imports within the same directory (e.g. `./foo`) are unaffected.
